// Writing analysis — a friendly, rule-based engine for Story Writer.
//
// It never says "WRONG". It looks for the 2–4 MOST useful things to improve
// and phrases every finding as a warm suggestion ("Try...", "Small tip...",
// "Almost!"). Rules cover the Class 5 grammar the module teaches:
//   • first-letter capitals & sentence-ending punctuation
//   • a / an
//   • am / is / are , has / have , was / were (subject–verb agreement)
//   • singular / plural slips inside simple repeated patterns
//   • a small common-misspelling list
//
// analyzeText returns:
//   { issues: [{ type, message, tip, at? }], score, stars, wordCount, sentenceCount }

const VOWEL_WORDS = ['an', 'apple', 'elephant', 'orange', 'umbrella', 'egg', 'owl', 'hour', 'honest', 'interesting', 'artist', 'engineer', 'ice', 'ant']

const COMMON_MISSPELLINGS = {
  freind: 'friend',
  freinds: 'friends',
  becuase: 'because',
  beacuse: 'because',
  recieve: 'receive',
  ture: 'true',
  wich: 'which',
  diffrent: 'different',
  meny: 'many',
  becouse: 'because',
  studed: 'studied',
  thier: 'their',
  langauge: 'language',
  hapy: 'happy',
  famaly: 'family',
  scool: 'school',
  tacher: 'teacher',
  favrite: 'favourite',
  birlhday: 'birthday',
  holliday: 'holiday',
  september: 'September',
}

// quick guessers for subject–verb agreement
const SINGULAR_PRONOUNS = new Set(['i', 'he', 'she', 'it'])
const PLURAL_PRONOUNS = new Set(['we', 'they', 'you'])
const PLURAL_NOUN_HINTS = ['are', 'were', 'have']

const FRIENDLY = {
  capital: 'Start every sentence with a big capital letter. 😊',
  punctuation: 'End your sentence with a full stop (.) or a question mark (?).',
  aVsAn: 'Use "an" before words that start with a vowel sound — like "an apple".',
  verbAgree: 'The little verb (is/are, has/have, was/were) should match the person or thing in front of it.',
  plural: 'When we speak about many things, the word should often end with an "s".',
  spelling: 'This word can be written more neatly.',
  runOn: 'A sentence is a complete idea — maybe split this long one into two shorter sentences.',
}

// Split into sentences (., !, ?) while keeping them.
function splitSentences(text) {
  const trimmed = (text || '').trim()
  if (!trimmed) return []
  return trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export const countWords = (text) => {
  const t = (text || '').trim()
  if (!t) return 0
  return t.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length
}

export const countSentences = (text) => splitSentences(text).length

function normalizeWord(w) {
  return w.replace(/[^a-z']/gi, '').toLowerCase()
}

function analyzeSentence(sentence, issues) {
  const words = sentence.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return

  // 1 — Capital first letter
  const first = words[0]
  const firstChar = first[0]
  if (firstChar && firstChar >= 'a' && firstChar <= 'z') {
    issues.push({
      type: 'capital',
      message: `Try starting with a big letter: "${first[0].toUpperCase()}${first.slice(1)} ..."`,
      tip: FRIENDLY.capital,
    })
  }

  // 2 — Ending punctuation
  const last = sentence.trim().slice(-1)
  if (!['.', '!', '?'].includes(last)) {
    issues.push({
      type: 'punctuation',
      message: 'Every sentence ends with a full stop, so add a "." at the end.',
      tip: FRIENDLY.punctuation,
    })
  }

  // 3 — a / an
  for (let i = 0; i < words.length - 1; i += 1) {
    const w = normalizeWord(words[i])
    const next = normalizeWord(words[i + 1])
    if (w === 'a' && VOWEL_WORDS.includes(next)) {
      issues.push({
        type: 'aVsAn',
        message: `"${words[i + 1]}" starts with a vowel sound — use "an" instead of "a".`,
        tip: FRIENDLY.aVsAn,
      })
      break
    }
    if (w === 'an' && next && !VOWEL_WORDS.includes(next) && /^[bcdfghjklmnpqrstvwxyz]/.test(next)) {
      issues.push({
        type: 'aVsAn',
        message: `"${words[i + 1]}" starts with a consonant sound — "a" fits better than "an".`,
        tip: FRIENDLY.aVsAn,
      })
      break
    }
  }

  // 4 — subject–verb agreement for the little verbs
  // pattern: <pronoun> is/are/am/was/were/has/have
  const VERB_MATCH = {
    i: ['am', 'was', 'have'],
    he: ['is', 'was', 'has'],
    she: ['is', 'was', 'has'],
    it: ['is', 'was', 'has'],
    we: ['are', 'were', 'have'],
    they: ['are', 'were', 'have'],
    you: ['are', 'were', 'have'],
  }
  const VERB_PRESENT = { i: 'am', he: 'is', she: 'is', it: 'is', we: 'are', they: 'are', you: 'are' }
  const VERB_PAST = { i: 'was', he: 'was', she: 'was', it: 'was', we: 'were', they: 'were', you: 'were' }
  const VERB_HAVE = { i: 'have', he: 'has', she: 'has', it: 'has', we: 'have', they: 'have', you: 'have' }

  const verbMatch = sentence.match(/^(he|she|it|i|we|they|you)\s+(is|are|am|was|were|has|have)\b/i)
  if (verbMatch) {
    const subj = normalizeWord(verbMatch[1])
    const verb = normalizeWord(verbMatch[2])
    if (!VERB_MATCH[subj].includes(verb)) {
      const need =
        (verb === 'is' || verb === 'are' || verb === 'am' ? VERB_PRESENT[subj] : undefined) ||
        (verb === 'was' || verb === 'were' ? VERB_PAST[subj] : undefined) ||
        VERB_HAVE[subj]
      if (need) {
        issues.push({
          type: 'verbAgree',
          message: `"${subj}" goes with "${need}" — try "${subj} ${need}" here.`,
          tip: FRIENDLY.verbAgree,
        })
      }
    }
  }

  // 5 — plural slip: "one<word>s" unlikely; check for "a dogs", "one cats"
  const pluralSlip = sentence.match(/\b(a|one)\s+([a-z]+s)\b/i)
  if (pluralSlip && issues.length < 6) {
    issues.push({
      type: 'plural',
      message: `"${pluralSlip[1]} ${pluralSlip[2]}" — for one thing, don't add "s" to "${pluralSlip[2]}".`,
      tip: FRIENDLY.plural,
    })
  }

  // 6 — common misspellings
  for (const w of words) {
    const nw = normalizeWord(w)
    if (COMMON_MISSPELLINGS[nw] && issues.length < 6) {
      issues.push({
        type: 'spelling',
        message: `"${w}" can be written as "${COMMON_MISSPELLINGS[nw]}".`,
        tip: FRIENDLY.spelling,
      })
      break
    }
  }
}

// Only keep the 4 most useful, de-duplicated issues.
function dedupeAndLimit(issues) {
  const seen = new Set()
  const out = []
  for (const it of issues) {
    const key = `${it.type}:${it.message}`
    if (!seen.has(key)) {
      seen.add(key)
      out.push(it)
    }
    if (out.length >= 4) break
  }
  return out
}

export function analyzeText(text) {
  const value = (text || '').trim()
  const wordCount = countWords(value)
  const sentenceCount = countSentences(value)

  if (!value) {
    return {
      issues: [{ type: 'empty', message: 'Write at least one sentence to get feedback. I am ready when you are!', tip: 'Start with a simple line like "My home is a happy place."' }],
      score: 0,
      stars: 0,
      wordCount: 0,
      sentenceCount: 0,
    }
  }

  const raw = []
  for (const sentence of splitSentences(value)) {
    analyzeSentence(sentence, raw)
  }

  const issues = dedupeAndLimit(raw)

  // Gentle, encouraging score — no child ever "fails"
  let score = 100
  score -= issues.length * 8
  if (wordCount < 12) score -= 5
  score = Math.max(60, Math.min(100, score))

  // 3 stars for a clean, complete submission; 2 if a few small tips; 1 always given
  const stars = issues.length === 0 && wordCount >= 8 ? 3 : issues.length <= 2 ? 2 : 1

  return {
    issues,
    score,
    stars,
    wordCount,
    sentenceCount,
  }
}

export default analyzeText