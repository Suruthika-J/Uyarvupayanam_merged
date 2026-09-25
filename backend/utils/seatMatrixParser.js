/**
 * seatMatrixParser.js
 *
 * Parses the TNEA General Academic Seat Matrix PDF (319 pages) into
 * College-Branch rows.
 *
 * PDF row layout (one "record" per College-Branch pairing):
 *   [college-name line(s)]            <- x ~55-340 (college zone) / x ~390+ (branch zone)
 *   [NUMBER LINE]  college code | branch code | OC BC BCM MBC SC SCA ST TOTAL
 *   [address + wrap line(s)]          <- branch-name continuations may sit ~7-30pt below
 *
 * Parsing hazards handled:
 *  - College / branch names wrap across several lines with variable spacing
 *    (7.3pt single, 14.6pt doubled at stretched/corner layouts, up to ~30pt for
 *    very long names at page boundaries). Records are attributed via
 *    gap-grouping rather than fixed distances:
 *      ABOVE the number line: partition the lines into groups separated by a
 *      gap > GROUP_GAP; the group adjacent to the number line is the record's
 *      own name block (taller blocks above it belong to the previous record).
 *      BELOW the number line: branch continuations are taken while bounded by
 *      the next record's name block (next number line + 7.3) and a 30pt cap.
 *  - College-name continuation text also rides ON the number line itself.
 *  - Rows missing COLLEGE CODE/COLLEGE NAME are carried forward from the last
 *    seen row (also carried across page boundaries).
 */
const seatAnchors = [
  { key: "oc", x: 543 },
  { key: "bc", x: 571 },
  { key: "bcm", x: 600 },
  { key: "mbc", x: 624 },
  { key: "sc", x: 651 },
  { key: "sca", x: 674 },
  { key: "st", x: 706 },
  { key: "total", x: 730 },
];

const SEAT_X_MIN = 540; // anything >= this x and numeric is a seat value
const COLLEGE_ZONE = [55, 340]; // college-name tokens (x)
const BRANCH_ZONE = [386, 540]; // branch-name tokens (x); real tokens start ~388.6 (ENGINEERING (CYBER SECURITY))
const BRANCH_CODE_ZONE = [335, 430]; // branch-code tokens (x)
const UP_LINE_CAP = 60; // hard cap for name-line scanning above a number line (page-bottom blocks can reach ~51)
const DOWN_MAX = 30; // hard cap for branch continuations below a number line
const GROUP_GAP = 14.6; // gap that separates line-groups (records are 7.3pt-grid)
const HEADER_Y = 515.5; // anything at/above this y is title/header noise
const FOOTER_Y = 30; // "Page N of XXX" sits near y~27 (real content can reach y~50)
const HEADER_CHECK_Y = 510; // token-based header detection only applies in this band

// First word of every valid branch name seen in the 2026 TNEA seat matrix.
// Used to (a) refuse nonsensical consensus targets and (b) spot stray prefixes
// in the post-pass. A name that fails this AND the paren checks is garbage
// (e.g. a misfiled wrap like "TECHNOLOGY) COMPUTER SCIENCE AND ...").
const BRANCH_HEAD_RE =
  /^(B\.|BIO |BACHELOR |COMPUTER |ELECTRONICS |ELECTRICAL |MECHANICAL |CIVIL |CHEMICAL |INFORMATION |ARTIFICIAL |DATA |AERONAUTICAL |AEROSPACE |AGRICULTUR|APPLIED |APPAREL |ARCHITECT|AUTOMOBILE |CERAMIC |COMMUNICATION |CONSTRUCTION |CYBER |ENVIRONMENTAL |FASHION |FOOD |GENERATIVE |GEO |HANDLOOM |INDUSTRIAL |INSTRUMENTATION |INTERIOR |LEATHER |M\.TECH|MANUFACTURING |MARINE |MATERIALS? |MATHEMATICS |MECHATRONICS |MEDICAL |METALLURGIC|MINING |NANO |PETRO |PETROLEUM |PHARMACEUTICAL |PLASTIC |POLYMER |POWER |PRINTING |PRODUCTION |ROBOTICS |RUBBER |SAFETY |SOFTWARE |STRUCTURAL |TELECOMMUNICATION |TEXTILE |ENGINEERING |TRANSPORTATION |URBAN )/i;

const HEADER_WORDS = new Set(
  "TAMILNADU ENGINEERING ADMISSIONS DIRECTORATE TECHNICAL EDUCATION CHENNAI GENERAL ACADEMIC SEAT MATRIX BEFORE SPECIAL RESERVATION COUNSELLING COLLEGE NAME BRANCH CODE OC BC BCM MBC SC SCA ST TOTAL PAGE"
    .toUpperCase()
    .split(/\s+/)
);

function toLines(items) {
  const sorted = items
    .map((it) => ({
      x: it.transform ? it.transform[4] : 0,
      y: it.transform ? it.transform[5] : 0,
      str: (it.str || "").trim(),
    }))
    .filter((it) => it.str.length > 0);

  sorted.sort((a, b) => b.y - a.y || a.x - b.x);

  const lines = [];
  for (const it of sorted) {
    const last = lines[lines.length - 1];
    if (last && Math.abs(last.y - it.y) <= 2) last.tokens.push(it);
    else lines.push({ y: it.y, tokens: [it] });
  }
  for (const l of lines) l.tokens.sort((a, b) => a.x - b.x);
  return lines;
}

function isNumeric(str) {
  return /^\d+$/.test(str);
}

function isHeaderNoise(line) {
  if (line.y > HEADER_Y) return true;
  if (line.y < FOOTER_Y) return true;
  // all-token header word check ONLY in the header band (y >= 510).
  // Real content never rises above ~500.6, so single-word continuation lines
  // like "ENGINEERING" or "TECHNOLOGY" below that band must NOT be treated as
  // header noise even though those words appear in the page title.
  if (line.y >= HEADER_CHECK_Y) {
    const toks = line.tokens.map((t) => t.str.toUpperCase());
    if (toks.length && toks.every((t) => HEADER_WORDS.has(t.replace(/[^A-Z]/g, "")))) return true;
  }
  return false;
}

function isNumberLine(line) {
  let seatNums = 0;
  for (const t of line.tokens) {
    if (t.x >= SEAT_X_MIN && isNumeric(t.str)) seatNums += 1;
  }
  return seatNums >= 7;
}

function hasCollegeZoneToken(line) {
  return line.tokens.some(
    (t) => t.x >= COLLEGE_ZONE[0] && t.x < COLLEGE_ZONE[1] && !isNumeric(t.str)
  );
}

/**
 * Partition `lines` (sorted y-desc, i.e. reading order) into groups separated
 * by a vertical gap > GROUP_GAP.
 */
function partitionGroups(lines) {
  const groups = [];
  let cur = [];
  for (let i = 0; i < lines.length; i++) {
    if (cur.length && lines[i - 1].y - lines[i].y > GROUP_GAP) {
      groups.push(cur);
      cur = [];
    }
    cur.push(lines[i]);
  }
  if (cur.length) groups.push(cur);
  return groups;
}

function assignSeats(seatTokens) {
  const seats = { oc: 0, bc: 0, bcm: 0, mbc: 0, sc: 0, sca: 0, st: 0 };
  let total = 0;
  let totalParsed = false;
  for (const t of seatTokens) {
    const v = parseInt(t.str, 10);
    let best = null;
    for (const a of seatAnchors) {
      const d = Math.abs(t.x - a.x);
      if (!best || d < best.d) best = { key: a.key, d };
    }
    if (best.key === "total") {
      total = v;
      totalParsed = true;
    } else {
      seats[best.key] = v;
    }
  }
  const sum = seats.oc + seats.bc + seats.bcm + seats.mbc + seats.sc + seats.sca + seats.st;
  if (!totalParsed) total = sum;
  return { seats, total, sum, totalParsed };
}

function parseOneRecord(numberLine, lines, idx, prevNumY, nextNumY, carry, prevConsumedRefs, dbg) {
  const tokens = numberLine.tokens;
  const consumedRefs = new Set(); // lines this record claims (for the next record)

  // ── college code ──
  const codeTokens = tokens.filter((t) => t.x < COLLEGE_ZONE[0] && isNumeric(t.str));
  let collegeCode = codeTokens.length ? codeTokens[0].str : null;

  // ── seats ──
  const seatTokens = tokens.filter((t) => t.x >= SEAT_X_MIN && isNumeric(t.str));
  const { seats, total, sum, totalParsed } = assignSeats(seatTokens);

  // ── branch code : leftmost alphabetic-ish token in the branch-code band ──
  const codeBand = tokens.filter((t) => t.x >= BRANCH_CODE_ZONE[0] && t.x < BRANCH_CODE_ZONE[1]);
  let branchCode = "";
  let branchCodeX = null;
  for (const t of codeBand) {
    const iso = t.str.replace(/[^A-Za-z0-9]/g, "");
    if (!isNumeric(iso) && /^[A-Z]{1,4}[0-9]{0,2}$/i.test(iso) && iso.length >= 2 && iso.length <= 5) {
      branchCode = iso.toUpperCase();
      branchCodeX = t.x;
      break;
    }
  }

  // ── lines ABOVE the number line ──
  // Walk up from the number line (idx-1, idx-2, ... gives y-ASCENDING), then
  // reverse into reading order (y-desc). A record's own above-block sits within
  // ~22pt of its num; the previous record's below-claims occupy the top of this
  // window. Claim the contiguous run of lines nearest the num that the previous
  // record did NOT consume.
  const upRaw = [];
  for (let j = idx - 1; j >= 0; j--) {
    const line = lines[j];
    if (line.y - numberLine.y > UP_LINE_CAP) break;
    if (isHeaderNoise(line)) continue;
    if (prevNumY != null && line.y >= prevNumY) break; // never cross the previous number line
    upRaw.push(line);
  }
  const upReading = upRaw.reverse(); // y-desc (top of page first)

  // Claim the up block: the contiguous run of UN-consumed lines nearest this
  // num. A record whose branch name wraps above the num line (e.g.
  // "ELECTRONICS AND" / "COMMUNICATION" / "ENGINEERING" split across three
  // lines, or a college whose name block sits 2 slots up) keeps its own wraps;
  // lines the previous record already claimed (its continuations) are never
  // re-claimed. Stray branch fragments on the previous record's tail line are
  // therefore excluded without any "complete num line" shortcut.
  const nameLines = [];
  for (let k = upReading.length - 1; k >= 0; k--) {
    const line = upReading[k];
    if (prevConsumedRefs.has(line)) break;
    nameLines.push(line);
  }
  nameLines.reverse(); // back to reading order (y-desc)

  // ── lines BELOW the number line ──
  // Walk down (idx+1, idx+2, ... gives y-desc, i.e. reading order). The window
  // is bounded below by the next record's name block (nextNum+7.3, with margin)
  // or a 30pt cap at a page bottom. A record's OWN continuations never reach
  // more than 2 slots (~15.5pt) below its num: the next record's nearest line is
  // at least spacing−14.5 ≥ 21.9pt below, so the depth bound below can never
  // capture another record's line. Deeper rare 3-slot tails are recovered by the
  // unbalanced-paren repair further down.
  let downFloor;
  if (nextNumY != null) downFloor = nextNumY + 10.3;
  else downFloor = numberLine.y - DOWN_MAX;
  const downLines = [];
  for (let j = idx + 1; j < lines.length; j++) {
    const line = lines[j];
    if (line.y < downFloor) break;
    if (isHeaderNoise(line)) continue;
    downLines.push(line);
  }
  const belowLines = downLines.filter((l) => numberLine.y - l.y <= 15.5);

  if (dbg) {
    console.error(
      "DBG numY=" + numberLine.y.toFixed(2) +
      " prevY=" + (prevNumY != null ? prevNumY.toFixed(2) : "null") +
      " nextY=" + (nextNumY != null ? nextNumY.toFixed(2) : "null")
    );
    console.error("DBG  upReading:", upReading.map((l) => l.y.toFixed(2)) + " -> nameLines:", nameLines.map((l) => l.y.toFixed(2)));
    console.error("DBG  downLines:", downLines.map((l) => l.y.toFixed(2)) + " -> belowLines:", belowLines.map((l) => l.y.toFixed(2)));
  }

  const collegeToks = [];
  const branchToks = [];

  const collect = (line, isBelow) => {
    for (const t of line.tokens) {
      if (isNumeric(t.str)) continue;
      if (t.x >= COLLEGE_ZONE[0] && t.x < COLLEGE_ZONE[1]) {
        // college name wraps onto the address line too (e.g. "..., Ketti Valley, The Nilgiris-643215.")
        collegeToks.push(t);
      } else if (t.x >= BRANCH_ZONE[0] && t.x < BRANCH_ZONE[1]) {
        branchToks.push(t);
      }
    }
  };
  for (const line of nameLines) {
    collect(line, false);
    consumedRefs.add(line);
  }
  collect(numberLine, false); // number line itself
  consumedRefs.add(numberLine);
  for (const line of belowLines) {
    collect(line, true);
    consumedRefs.add(line);
  }

  const collegeName = cleanup(collegeToks.map((t) => t.str).join(" "));
  const branchName = cleanup(branchToks.map((t) => t.str).join(" "));

  // ── branch-name repair ──
  // If the assembled name has unbalanced parens (a deep wrap got split off by
  // the down-split — e.g. a 3-line continuation under a long branch name whose
  // lines exactly share slots with the next record's name block), re-scan the
  // full below band WITHOUT the split and append any new branch tokens.
  const isHealthy = (n) => {
    const open = (n.match(/\(/g) || []).length;
    const close = (n.match(/\)/g) || []).length;
    return open === close && !n.includes(") ") && (n.match(/\(SS\)/g) || []).length <= 1 && n.length > 0;
  };
  // React only to UNBALANCED parens: balanced names containing ") (" are legit
  // (e.g. "(VLSI DESIGN AND TECHNOLOGY) (SS)") and must never trigger a re-scan.
  const parensUnbalanced =
    (branchName.match(/\(/g) || []).length !== (branchName.match(/\)/g) || []).length;
  if (branchName && parensUnbalanced) {
    const seen = new Set(branchToks.map((t) => t.str));
    const extra = [];
    const usedLines = [];
    const scanBand = (floorY) => {
      for (let j = idx + 1; j < lines.length; j++) {
        const line = lines[j];
        if (line.y < floorY) break;
        if (isHeaderNoise(line)) continue;
        let used = false;
        for (const t of line.tokens) {
          if (isNumeric(t.str)) continue;
          if (t.x >= BRANCH_ZONE[0] && t.x < BRANCH_ZONE[1] && !seen.has(t.str)) {
            extra.push(t);
            seen.add(t.str);
            used = true;
          }
        }
        if (used) usedLines.push(line);
      }
    };
    scanBand(downFloor);
    if (extra.length) {
      const repaired = cleanup(branchName + " " + extra.map((t) => t.str).join(" "));
      if (isHealthy(repaired) || repaired.length > branchName.length) {
        branchToks.push(...extra);
        for (const l of usedLines) consumedRefs.add(l);
      }
    } else if (nextNumY != null) {
      // extend one more notch below: everything strictly above the next num line
      scanBand(nextNumY + 0.5);
      const repaired = cleanup(branchName + " " + extra.map((t) => t.str).join(" "));
      if (isHealthy(repaired) || repaired.length > branchName.length) {
        branchToks.push(...extra);
        for (const l of usedLines) consumedRefs.add(l);
      }
    }
  }
  const branchNameFinal = cleanup(branchToks.map((t) => t.str).join(" "));

  // ── carry-forward of last-seen COLLEGE CODE / NAME ──
  const finalCode = collegeCode || carry.code;
  const finalName = collegeName || carry.name;

  return {
    collegeCode: finalCode,
    collegeName: finalName,
    branchCode,
    branchName: branchNameFinal,
    seats: { ...seats, total },
    seatSum: sum,
    seatTotalParsed: totalParsed,
    carryNext: { code: finalCode, name: finalName || carry.name },
    consumedRefs,
  };
}

function cleanup(str) {
  return str
    .replace(/\s+/g, " ")
    .replace(/\s+([,;])\s*/g, "$1 ") // ", " / "; " normalisation
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+/g, " ")
    .trim();
}

async function parseSeatMatrixPdf(pdfData) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(pdfData) }).promise;

  const rows = [];
  const skipped = [];
  const stats = { pages: doc.numPages, numberLines: 0 };
  let carry = { code: null, name: "" };

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const lines = toLines(tc.items);

    const numIdx = [];
    for (let i = 0; i < lines.length; i++) {
      if (isNumberLine(lines[i])) numIdx.push(i);
    }

    // Lines claimed by the previous record (used to keep a record's UP block
    // from swallowing the previous record's tail). Reset per page — y-values
    // repeat across pages, so reference matching is page-local.
    let prevConsumedRefs = new Set();

    for (let k = 0; k < numIdx.length; k++) {
      const i = numIdx[k];
      const prevNumY = k > 0 ? lines[numIdx[k - 1]].y : null;
      const nextNumY = k < numIdx.length - 1 ? lines[numIdx[k + 1]].y : null;
      const rec = parseOneRecord(lines[i], lines, i, prevNumY, nextNumY, carry, prevConsumedRefs);
      prevConsumedRefs = rec.consumedRefs;
      carry = rec.carryNext;

      if (!rec.branchCode && !rec.branchName) {
        skipped.push({
          page: p,
          collegeCode: rec.collegeCode,
          collegeName: rec.collegeName,
          reason: "missing branch code/name",
        });
        continue;
      }
      if (!rec.branchName) {
        skipped.push({
          page: p,
          collegeCode: rec.collegeCode,
          collegeName: rec.collegeName,
          branchCode: rec.branchCode,
          reason: "missing branch name",
        });
        continue;
      }
      if (rec.seats.total === 0 && rec.seatSum === 0) {
        skipped.push({
          page: p,
          collegeCode: rec.collegeCode,
          collegeName: rec.collegeName,
          branchCode: rec.branchCode,
          branchName: rec.branchName,
          reason: "no seats parsed",
        });
        continue;
      }

      rows.push({
        page: p,
        collegeCode: rec.collegeCode || "",
        collegeName: rec.collegeName || "",
        branchCode: rec.branchCode,
        branchName: rec.branchName,
        seats: rec.seats,
        seatSum: rec.seatSum,
        seatTotalParsed: rec.seatTotalParsed,
      });
    }
    stats.numberLines += numIdx.length;
  }

  // Canonicalise college names: each TNEA code gets ONE name (the most frequent
  // variant) so rows of the same college are consistent.
  const byCode = {};
  for (const r of rows) {
    (byCode[r.collegeCode] ??= { counts: {}, order: [] });
    const b = byCode[r.collegeCode];
    const n = r.collegeName || "";
    if (!(n in b.counts)) {
      b.counts[n] = 0;
      b.order.push(n);
    }
    b.counts[n] += 1;
  }
  const codeToName = {};
  for (const [code, b] of Object.entries(byCode)) {
    codeToName[code] = b.order.reduce((a, n) => (b.counts[n] > b.counts[a] ? n : a), b.order[0]);
  }
  for (const r of rows) r.collegeName = codeToName[r.collegeCode] || r.collegeName;

  // ── branch-name consensus ──
  // The same branch CODE carries the same branch NAME across colleges (the only
  // real variants are "(SS)" / "(TAMIL MEDIUM)" style suffixes). Normalise rows
  // that lost an up-wrap (e.g. "COMMUNICATION ENGINEERING" instead of
  // "ELECTRONICS AND COMMUNICATION ENGINEERING") or absorbed a stray prefix
  // ("MECHANICAL AND MECHATRONICS ENGINEERING ..." ) onto the modal valid name
  // for the code. Legit suffixed variants are never touched: the (SS) flag is
  // matched on both sides, and a variant like "CIVIL ENGINEERING (TAMIL MEDIUM)"
  // is neither a fragment of the canonical name nor ends with it.
  const syntaxValid = (n) => {
    if (!n || n.length < 4) return false;
    const open = (n.match(/\(/g) || []).length;
    const close = (n.match(/\)/g) || []).length;
    return open === close && !/\) [^(]/.test(n) && (n.match(/\(SS\)/g) || []).length <= 1;
  };
  const byBc = {};
  for (const r of rows) {
    (byBc[r.branchCode] ??= { counts: {}, order: [] });
    const b = byBc[r.branchCode];
    const n = r.branchName || "";
    if (!(n in b.counts)) {
      b.counts[n] = 0;
      b.order.push(n);
    }
    b.counts[n] += 1;
  }
  let consensusRepairs = 0;
  for (const r of rows) {
    const b = byBc[r.branchCode];
    if (!b) continue;
    const valid = b.order.filter((n) => syntaxValid(n) && BRANCH_HEAD_RE.test(n));
    if (!valid.length) continue;
    const hasSS = /\(SS\)/.test(r.branchName);
    const target =
      valid.filter((n) => /\(SS\)/.test(n) === hasSS).sort(
        (x, z) => b.counts[z] - b.counts[x] || z.length - x.length
      )[0] || valid[0];
    if (!target || target === r.branchName) continue;
    const rt = r.branchName.split(" ").filter(Boolean);
    const tt = target.split(" ").filter(Boolean);
    const containsSeq = (a, sub) => {
      for (let i = 0; i + sub.length <= a.length; i++) {
        if (sub.every((t, j) => t === a[i + j])) return true;
      }
      return false;
    };
    const tailMatch = tt.length < rt.length &&
      rt.slice(rt.length - tt.length).every((t, j) => t === tt[j]);
    if ((containsSeq(tt, rt) && rt.length < tt.length) || (containsSeq(rt, tt) && tailMatch)) {
      r.branchName = target;
      consensusRepairs++;
    }
  }
  stats.consensusRepairs = consensusRepairs;

  await doc.destroy();
  return { rows, skipped, stats };
}

module.exports = { parseSeatMatrixPdf, parseOneRecord, toLines, isNumberLine, isHeaderNoise, isNumeric, partitionGroups, BRANCH_HEAD_RE };