// backend/services/memoryRetrievalService.js
//
// Hybrid memory retrieval engine.
//
// No vector database and no embedding-capable provider are configured in
// this project (Groq/xAI are chat-completion only), so retrieval combines —
// entirely inside MongoDB, per-user:
//
//   1. Keyword & full-text: a lightweight term-match scorer over title,
//      summary, topics and content (weighted), plus a MongoDB $text search
//      as an additional candidate source.
//   2. Fuzzy/partial matching: stem-lite (s/es/ed/ing) + substring hits so a
//      user can describe an event in different words from the original.
//   3. Metadata + temporal relevance: memory-type hints parsed from the
//      question, recency boost, and optional type/date filters.
//   4. User-scoped access control: every query is hard-wired to userId —
//      a client can never ask for another user's memories.
//
// The engine returns compact excerpts only; it never ships full memories to
// the AI context without the caller's explicit shaping.

const Memory = require("../models/Memory");
const MEMORY_TYPES = require("../models/Memory").MEMORY_TYPES;

// ── token helpers ─────────────────────────────────────────────────────────

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u00e0-\u024f\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

// Light stemmer: helps "interview" match "interviews", "plan" match
// "planned". Not a real lemmatizer — intentionally simple and deterministic.
function stemLite(tok) {
  if (tok.length > 4 && tok.endsWith("ing")) return tok.slice(0, -3);
  if (tok.length > 3 && tok.endsWith("ed")) return tok.slice(0, -2);
  if (tok.length > 3 && tok.endsWith("es")) return tok.slice(0, -2);
  if (tok.length > 3 && tok.endsWith("s")) return tok.slice(0, -1);
  return tok;
}

// Functional/stop words never carry memory meaning — dropping them from the
// QUERY keeps tiny tokens ("am", "of", "the") from falsely matching inside
// longer words ("family", "offer", "thread") and cheapens every score.
const STOPWORDS = new Set([
  "the","and","for","with","was","were","this","that","have","has","had","not","but",
  "from","they","their","there","what","which","when","where","how","why","will",
  "would","can","could","should","shall","may","might","must","been","are","is","am",
  "my","our","your","you","all","one","two","a","an","of","to","in","on","at","by",
  "it","its","we","he","she","him","her","his","them","me","us","as","or","so","if",
  "then","into","over","under","again","further","once","too","very","just","also",
  "because","until","while","do","does","did","done","get","got","any","who","whose",
  "whom","than","thats","out","up","down","off","about","between","after","before",
]);

function isStopword(tok) {
  return STOPWORDS.has(tok) || tok.length < 3;
}

function stemToken(tok) {
  const key = stemLite(tok);
  // Also keep a fuzzy variant for substring matching.
  return { exact: tok, stem: key };
}

// ── type hints parsed from the question ───────────────────────────────────

const TYPE_HINT_PATTERNS = [
  { type: "voice", words: ["voice", "audio", "record", "speak", "said in a recording"] },
  { type: "journal", words: ["journal", "diary", "entry", "wrote in my journal"] },
  { type: "email", words: ["email", "letter", "mail", "sent to", "wrote to"] },
  { type: "document", words: ["document", "file", "pdf", "uploaded", "attachment"] },
  { type: "story", words: ["story", "note", "thought", "memory note", "wrote down"] },
];

function hintType(query) {
  const q = String(query || "").toLowerCase();
  for (const h of TYPE_HINT_PATTERNS) {
    if (h.words.some((w) => q.includes(w))) return h.type;
  }
  return null;
}

// ── scoring ───────────────────────────────────────────────────────────────

const FIELD_WEIGHTS = { title: 4, summary: 2.5, topics: 3, content: 1 };

function tfScore(fieldTokens, qStem) {
  let score = 0;
  for (const ft of fieldTokens) {
    if (ft === qStem || stemLite(ft) === qStem) {
      score += 1;
    } else if (qStem.length >= 4 && ft.length >= 4 && (ft.startsWith(qStem) || ft.endsWith(qStem) || qStem.startsWith(ft) || qStem.endsWith(ft))) {
      // partial/prefix match — both sides must be real words (≥4 chars) so
      // that "moon" can't match "on" or "friends" can't match "end" inside.
      score += 0.5;
    }
  }
  return score;
}

function scoreMemory(memory, queryTokens, typeHint) {
  if (!memory || !queryTokens || !queryTokens.length) return 0;

  // Drop functional words from the query before scoring.
  const meaningful = queryTokens.filter((t) => !isStopword(t));
  if (!meaningful.length) return 0;

  const titleTokens = tokenize(memory.title);
  const summaryTokens = tokenize(memory.summary);
  const topicsTokens = tokenize((memory.topics || []).join(" "));
  const contentTokens = tokenize(memory.content || memory.audioTranscript || "");

  const buckets = [
    { tokens: titleTokens, w: FIELD_WEIGHTS.title },
    { tokens: summaryTokens, w: FIELD_WEIGHTS.summary },
    { tokens: topicsTokens, w: FIELD_WEIGHTS.topics },
    { tokens: contentTokens, w: FIELD_WEIGHTS.content },
  ];

  let raw = 0;
  for (const qt of meaningful) {
    const qStem = stemLite(qt);
    for (const b of buckets) {
      raw += b.w * tfScore(b.tokens, qStem);
    }
  }
  // Normalize for query length so short questions aren't penalized.
  const perQuery = raw / meaningful.length;

  // Recency: small ordering boost for recently saved memories.
  let score = perQuery;
  const ageDays = (Date.now() - new Date(memory.createdAt || Date.now()).getTime()) / 86400000;
  if (ageDays <= 30) score += 0.15;
  else if (ageDays <= 180) score += 0.08;

  // Explicit type hint from the question boosts matching type.
  if (typeHint && memory.type === typeHint) score += 0.5;

  return score;
}

function excerpt(content, len = 180) {
  const c = String(content || "").replace(/\s+/g, " ").trim();
  if (c.length <= len) return c;
  return `${c.slice(0, len)}…`;
}

// ── main retrieval ────────────────────────────────────────────────────────

/**
 * Retrieve up to `limit` of the user's own processed memories most relevant
 * to `query`, ranked by the hybrid scorer.
 *
 * @param {object} opts
 *   userId    required — always derived from the authenticated JWT
 *   query     user question / search text
 *   types     optional array of Memory types to restrict
 *   before/after  optional Date bounds
 *   limit     default 6
 *   minScore  default 0.2 (memories below this are considered irrelevant)
 */
async function retrieveMemories({ userId, query, types, before, after, limit = 6, minScore = 0.2 }) {
  if (!userId) return [];
  const queryText = String(query || "").trim();
  const typeHint = hintType(queryText);

  const filter = { userId, status: "ready" };
  if (Array.isArray(types) && types.length) {
    const clean = types.filter((t) => MEMORY_TYPES.includes(t));
    if (clean.length) filter.type = { $in: clean };
  }
  if (before) filter.createdAt = { ...(filter.createdAt || {}), $lte: before };
  if (after) filter.createdAt = { ...(filter.createdAt || {}), $gte: after };

  // Candidate pool — never all memories. Seed from $text search when the
  // query has meaningful tokens, always bounded; then score freshly over the
  // whole pool (per-user, so it is cheap) so rankings never depend on the
  // order MongoDB chose to return rows.
  const pool = new Map();

  const add = (doc) => {
    if (doc && !pool.has(String(doc._id))) pool.set(String(doc._id), doc);
  };

  if (queryText) {
    try {
      // Fetch FULL docs for text hits (a lean {_id}-only stub would be scored
      // as an empty object when it later joins the candidate pool).
      const textHits = await Memory.find({ ...filter, $text: { $search: queryText } })
        .limit(50)
        .lean();
      textHits.forEach((h) => add(h));
    } catch (e) {
      // Text index unavailable → the lexical scorer below still works.
    }
  }

  const recent = await Memory.find(filter)
    .sort({ createdAt: -1 })
    .limit(250)
    .lean();
  recent.forEach((r) => add(r));

  if (!pool.size) return [];

  const queryTokens = tokenize(queryText);
  if (!queryTokens.length) {
    // No textual query: return the most recent memories (bounded).
    return [...pool.values()]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map((m) => ({
        memoryId: String(m._id),
        type: m.type,
        title: m.title || "",
        date: m.eventDate || m.createdAt,
        excerpt: excerpt(m.content || m.audioTranscript || m.summary),
        score: 1, // arbitrary placeholder — caller treats it as "recent"
      }));
  }

  const scored = [...pool.values()]
    .map((m) => ({ m, score: scoreMemory(m, queryTokens, typeHint) }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score);

  // Dedupe near-identical memories (same normalized content), keep best.
  const seen = new Set();
  const ranked = [];
  for (const { m, score } of scored) {
    const key = String(m.content || m.audioTranscript || m.summary || m.title || m._id).replace(/\s+/g, " ").toLowerCase().slice(0, 120);
    if (seen.has(key)) continue;
    seen.add(key);
    ranked.push({
      memoryId: String(m._id),
      type: m.type,
      title: m.title || "",
      date: m.eventDate || m.createdAt,
      excerpt: excerpt(m.content || m.audioTranscript || m.summary),
      score,
    });
    if (ranked.length >= limit) break;
  }

  return ranked;
}

module.exports = { retrieveMemories, scoreMemory, tokenize, stemLite, hintType, excerpt };