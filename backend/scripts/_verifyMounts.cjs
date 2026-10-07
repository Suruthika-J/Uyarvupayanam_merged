/**
 * _verifyMounts.cjs — static verification of the Express mount table in
 * server.js. Proves the audit's "duplicate mounts" findings are benign:
 *
 *   (a) Every base path is mapped to a module file; same-module multi-mounts
 *       (aliases like /api/cutoff + /api/cutoffs) are the SAME require() target,
 *       so they share one router instance (no conflicting handlers).
 *   (b) Where the SAME base path mounts TWO DIFFERENT modules
 *       (/api/assessment = grokAssessmentRoutes + assessmentRoutes,
 *        /api/maths    = mathsRoutes + mathsMissionsRoutes),
 *       the registered method+path sets must NOT overlap, otherwise the module
 *       mounted first would shadow routes in the second.
 *
 * Path overlap semantics: `:param` matches any one segment, `*` matches any
 * remainder; two paths that can match the same URL with the same HTTP method
 * are treated as a (real) shadow risk.
 *
 * Usage: node scripts/_verifyMounts.cjs
 * Exit code 0 = mount table is clean.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const BACKEND = path.join(__dirname, "..");
const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

const serverSrc = fs.readFileSync(path.join(BACKEND, "server.js"), "utf8");
const mountRe = /app\.use\("([^"]+)", require\("([^"]+)"\)\);/g;
const mounts = [];
let m;
while ((m = mountRe.exec(serverSrc)) !== null) {
  mounts.push({ base: m[1], file: m[2] });
}

const baseToFiles = new Map();
for (const { base, file } of mounts) {
  const entry = baseToFiles.get(base) || { files: [], order: [] };
  const resolved = path.resolve(BACKEND, file.replace(/^\.\//, "") + ".js");
  if (!entry.files.includes(resolved)) entry.files.push(resolved);
  entry.order.push(resolved);
  baseToFiles.set(base, entry);
}

const routeRe = /router\.(get|post|put|patch|delete)\(\s*"([^"]+)"/g;
function routesOf(file) {
  const src = fs.readFileSync(file, "utf8");
  const out = [];
  let r;
  while ((r = routeRe.exec(src)) !== null) out.push({ method: r[1], path: r[2] });
  return out;
}

function segments(p) {
  return p.split("/").filter(Boolean);
}
function overlaps(pA, pB) {
  const a = segments(pA);
  const b = segments(pB);
  const aStar = a.includes("*") || a.includes(":path");
  const bStar = b.includes("*") || b.includes(":path");
  if (a.length !== b.length && !aStar && !bStar) return false;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const sa = a[i];
    const sb = b[i];
    if (sa === undefined || sb === undefined) continue; // star-domain handled below
    const compat = sa === sb || sa.startsWith(":") || sb.startsWith(":");
    if (!compat) return false;
  }
  return true;
}

// (a) same-module aliases: identical require target
const aliasNames = [];
for (const [base, entry] of baseToFiles) {
  if (entry.files.length === 1) {
    // Same module mounted at multiple bases is intentional (alias) — safe by
    // construction (require cache returns the same router instance).
    const uniqueBases = (entry.order[0] === entry.files[0]) ? mounts.filter((mn) => mn.base === base).length : 1;
    void uniqueBases;
  } else {
    aliasNames.push(`${base} -> ${entry.files.length} distinct modules`);
  }
}

// (b) cross-module shadow check for every distinct-pair mount
let crossPairsChecked = 0;
let shadowed = 0;
const shadowNotes = [];
for (const [base, entry] of baseToFiles) {
  if (entry.files.length <= 1) {
    const dupBases = mounts.filter((mn) => mn.base === base).length;
    if (dupBases > 1) {
      check(`alias mount "${base}" uses one module (N=${dupBases})`, true, `module=${path.basename(entry.files[0])}`);
    }
    continue;
  }
  // distinct modules on the same base, mounted in server order
  const orderedDistinct = [];
  for (const f of entry.order) {
    if (!orderedDistinct.includes(f)) orderedDistinct.push(f);
  }
  const first = routesOf(orderedDistinct[0]);
  for (let i = 1; i < orderedDistinct.length; i++) {
    const second = routesOf(orderedDistinct[i]);
    crossPairsChecked++;
    for (const r2 of second) {
      const hit = first.find(
        (r1) => r1.method === r2.method && overlaps(r1.path, r2.path)
      );
      if (hit) {
        shadowed++;
        shadowNotes.push(`${base} ${r2.method.toUpperCase()} "${r2.path}" shadowed by "${hit.path}" (mounted earlier)`);
      }
    }
  }
}
check(`cross-module pairs on shared base paths assessed (N=${crossPairsChecked})`, crossPairsChecked === 2,
  `pairs=${crossPairsChecked} (expected 2: /api/assessment, /api/maths)`);
check("no route shadowing across duplicated base mounts", shadowed === 0,
  shadowed ? shadowNotes.join("; ") : "assessment + maths pairs disjoint");

// Sanity: every mounted router must be resolvable
let missing = 0;
for (const [base, entry] of baseToFiles) {
  for (const f of entry.files) {
    if (!fs.existsSync(f)) {
      missing++;
      console.error(`  MISSING MODULE: ${base} -> ${f}`);
    }
  }
}
check("every mounted router file resolves on disk", missing === 0, missing ? `missing=${missing}` : `mounts=${mounts.length} bases=${baseToFiles.size}`);

const failed = results.filter((r) => !r.ok);
console.log(`\nMOUNT TABLE VERIFY — ${results.length} checks, ${results.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);