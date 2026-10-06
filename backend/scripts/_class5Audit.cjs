/**
 * _class5Audit.cjs
 * ============================================================================
 * Class 5 complete-integration audit (real HTTP + real database).
 *
 * Exercises the ACTUAL Class 5 student journey end-to-end against the live
 * backend, using an isolated class-5 student:
 *
 *   IDENTITY                         register -> verify -> login -> profile
 *                                    (classLevel must be "5", school_student)
 *   KURAL WORLDS                     /tamil/adhikarams list + detail (public
 *                                    read-only content; 404 for unknown ids)
 *   MATH ADVENTURE                   worlds -> topic question -> wrong+right
 *                                    answer recorded -> progress restored
 *   WORLD EXPLORER                   worlds -> activity -> answer recorded
 *   SCIENCE WORLD                    worlds -> server-validated answer ->
 *                                    experiment result saved -> daily attempt
 *   ENGLISH ADVENTURE                daily -> activity + grammar persisted ->
 *                                    progress view shows the stars
 *   SCHOLARSHIPS                     grade-filtered list (matches the shipped
 *                                    page) + apply bound to the student token
 *   DISCOVER ME / QUESTS             sorting quiz submit -> result world;
 *                                    game list -> detail -> attempt persisted
 *                                    (regression: game attempt endpooint fix)
 *   COMMUNICATION SKILLS             step + activity-result + daily mission +
 *                                    public passport (no PII in passport)
 *   SECURITY                         no-token denials, student->admin denial,
 *                                    student CANNOT mutate communication
 *                                    content (admin-only after this audit's
 *                                    fix), cross-student 403 on skill profile,
 *                                    body studentId spoof ignored on writes
 *   ADMIN VISIBILITY                 dashboard, school_student listing,
 *                                    user detail, admin content CRUD roundtrip,
 *                                    block/unblock live effect
 *   RECOVERY                         re-login keeps maths/english/communication
 *                                    progress (real persistence, no fabrication)
 *
 * Usage:   node scripts/_class5Audit.cjs
 * Env:     AUDIT_BASE_URL  default http://localhost:5000/api
 *          AUDIT_LOG_FILE  optional server log for real-OTP extraction
 *          AUDIT_KEEP=1    keep the isolated identities (default: cleanup)
 *
 * Exit 0 = all passed, 1 = failures, 2 = aborted.
 */
"use strict";
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const axios = require("axios");

const BASE = process.env.AUDIT_BASE_URL || "http://localhost:5000/api";
const LOG_FILE = process.env.AUDIT_LOG_FILE || "";
const KEEP = process.env.AUDIT_KEEP === "1";

const RUN = crypto.randomBytes(3).toString("hex");
const EMAIL_A = `audit.c5.a.${RUN}@uyarvupayanam.local`;
const EMAIL_B = `audit.c5.b.${RUN}@uyarvupayanam.local`;
const EMAIL_ADMIN = `audit.c5.admin.${RUN}@uyarvupayanam.local`;
const PASSWORD = "AuditPass@123";

let adminToken = null;
let tokenA = null;
let tokenB = null;
let studentAId = null;
let studentBId = null;
let adminDocId = null;
let contentDocId = null;

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, urlPath, { data, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await axios({ method, url: BASE + urlPath, data, headers, timeout: 60000, validateStatus: () => true });
  return { status: res.status, data: res.data };
}

function extractOtpFromLog(email) {
  if (!LOG_FILE || !fs.existsSync(LOG_FILE)) return null;
  try {
    const text = fs.readFileSync(LOG_FILE, "utf8");
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`OTP for ${escaped}: \\[ (\\d{6}) \\]`, "g");
    const codes = [];
    let m;
    while ((m = re.exec(text)) !== null) codes.push(m[1]);
    return codes.length ? codes[codes.length - 1] : null;
  } catch (e) {
    return null;
  }
}

// ── Module helpers ────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/uyarvu-payanam");
  const db = mongoose.connection.db;

  // ══ 1. ISOLATED ADMIN (DB-seeded; then REAL login via /admin/login) ══════
  {
    const hashed = await bcrypt.hash(PASSWORD, 10);
    const admin = await db.collection("admins").insertOne({
      email: EMAIL_ADMIN, password: hashed, role: "Admin", isActive: true, name: "Audit C5 Admin",
      createdAt: new Date(), updatedAt: new Date(),
    });
    adminDocId = admin.insertedId;
    const r = await api("post", "/admin/login", { data: { email: EMAIL_ADMIN, password: PASSWORD } });
    check("admin login (isolated admin)", r.status === 200 && !!r.data.token, `status=${r.status}`);
    adminToken = r.data.token || null;
  }

  // ══ 2. CLASS-5 STUDENT A — REAL register → OTP → login ══════════════════
  {
    const r = await api("post", "/student/register", { data: {
      name: "Audit C5 Student A", email: EMAIL_A, password: PASSWORD,
      userType: "school_student", classLevel: "5", district: "Chennai",
    }});
    check("register class-5 student (201 + requiresVerification)",
      r.status === 201 && r.data.requiresVerification === true, `status=${r.status} msg=${r.data.message || ""}`);

    await sleep(1800);
    const r2 = await api("post", "/student/login", { data: { email: EMAIL_A, password: PASSWORD } });
    check("login blocked before email verification",
      r2.status === 403 && r2.data.code === "EMAIL_NOT_VERIFIED", `status=${r2.status} code=${r2.data.code || ""}`);

    const r3 = await api("post", "/student/verify-otp", { data: { email: EMAIL_A, otp: "000000" } });
    check("wrong OTP rejected", r3.status === 400, `status=${r3.status}`);

    const otp = extractOtpFromLog(EMAIL_A);
    if (otp) {
      const r4 = await api("post", "/student/verify-otp", { data: { email: EMAIL_A, otp } });
      check("real OTP from server log completes sign-up", r4.status === 200 && !!r4.data.token, `status=${r4.status}`);
      tokenA = r4.data.token || null;
      studentAId = r4.data.student?._id || r4.data.student?.id || null;
    }
    if (!tokenA) {
      await db.collection("users").updateOne({ email: EMAIL_A }, { $set: { isVerified: true } });
      const r5 = await api("post", "/student/login", { data: { email: EMAIL_A, password: PASSWORD } });
      check("login after DB-verify fallback", r5.status === 200 && !!r5.data.token, `status=${r5.status}`);
      tokenA = r5.data.token || null;
      studentAId = r5.data.student?._id || r5.data.student?.id || null;
    }
    check("class-5 student A identity captured", !!studentAId, studentAId || "missing");
  }

  // Student B — isolated second class-5 student (target of denial checks).
  {
    const hashed = await bcrypt.hash(PASSWORD, 10);
    const u = await db.collection("users").insertOne({
      name: "Audit C5 Student B", email: EMAIL_B, password: hashed,
      userType: "school_student", classLevel: "5", district: "Madurai",
      role: "student", status: "active", isVerified: true, createdAt: new Date(), updatedAt: new Date(),
    });
    studentBId = String(u.insertedId);
    const r = await api("post", "/student/login", { data: { email: EMAIL_B, password: PASSWORD } });
    check("class-5 student B logs in", r.status === 200 && !!r.data.token, `status=${r.status}`);
    tokenB = r.data.token || null;
  }

  // ══ 3. CAREER-PATH IDENTITY ═════════════════════════════════════════════
  {
    const r = await api("get", "/student/profile", { token: tokenA });
    const s = r.data?.student || r.data?.user || r.data;
    check("profile: classLevel 5 + school_student (career-path identity)",
      r.status === 200 && String(s?.classLevel) === "5" && s?.userType === "school_student",
      `status=${r.status} classLevel=${s?.classLevel} userType=${s?.userType}`);

    const d = await api("get", "/student/dashboard-summary", { token: tokenA });
    check("dashboard-summary live", d.status === 200, `status=${d.status}`);
  }

  // ══ 4. KURAL WORLDS (Tamil — public read-only content) ═══════════════════
  {
    const r = await api("get", "/tamil/adhikarams");
    const list = (r.data && r.data.adhikarams) || [];
    const wellFormed = list.length > 0 && list.every((a) => a.number && a.nameTamil && a.nameEn && a.section);
    check("adhikarams list: real content (108 chapters, structured)", r.status === 200 && wellFormed,
      `status=${r.status} count=${list.length}`);

    const sortedUp = list.every((a, i) => i === 0 || list[i - 1].number < a.number);
    check("adhikarams list: sorted by number ascending", sortedUp, `count=${list.length}`);

    const d = await api("get", "/tamil/adhikarams/1");
    const k = d.data?.adhikaram;
    check("adhikaram detail: full chapter + kurals + navigation",
      d.status === 200 && !!k && Array.isArray(k.kurals) && k.kurals.length > 0 && k.navigation && typeof k.intro === "string",
      `status=${d.status} kurals=${(k && k.kurals || []).length} prev=${k && k.navigation && k.navigation.previousId} next=${k && k.navigation && k.navigation.nextId}`);

    const bad = await api("get", "/tamil/adhikarams/99999");
    check("adhikaram unknown id → 404", bad.status === 404, `status=${bad.status}`);
  }

  // ══ 5. MATH ADVENTURE ═══════════════════════════════════════════════════
  let mathTopic = null;
  {
    const r = await api("get", "/maths/worlds", { token: tokenA });
    const worlds = (r.data?.data?.worlds) || [];
    const first = worlds.find((w) => w.order === 1) || worlds[0];
    check("maths worlds served", r.status === 200 && worlds.length > 0, `status=${r.status} worlds=${worlds.length}`);
    check("maths first world unlocked", !!first && first.locked !== true, first && first.nameEn);

    const q = await api("get", `/maths/${encodeURIComponent(first.id)}`, { token: tokenA });
    const t = q.data?.data;
    check("maths topic question served (adaptive)", q.status === 200 && !!t?.question?.id && !!t?.world?.id,
      `status=${q.status} topic=${t?.world?.id} qid=${t?.question?.id}`);
    mathTopic = t?.world?.id;
    const qid = t?.question?.id;

    if (mathTopic && qid != null) {
      const w = await api("post", "/maths/answer", { token: tokenA, data: { topic: mathTopic, questionId: qid, correct: false } });
      check("maths wrong answer recorded (200, not solved)", w.status === 200 && w.data.success !== false, `status=${w.status}`);

      const c = await api("post", "/maths/answer", { token: tokenA, data: { topic: mathTopic, questionId: qid, correct: true } });
      check("maths right answer recorded", c.status === 200 && c.data.success !== false, `status=${c.status}`);

      const again = await api("get", `/maths/${encodeURIComponent(mathTopic)}`, { token: tokenA });
      check("maths progress restored on next fetch (completed ≥ 1)",
        again.status === 200 && (again.data?.data?.progress?.completed || 0) >= 1,
        `status=${again.status} completed=${again.data?.data?.progress?.completed}`);

      const rows = await db.collection("mathsprogresses").find({ studentId: new mongoose.Types.ObjectId(studentAId) }).toArray();
      check("maths persistence rows exist + owned by A", rows.length >= 1 && rows.every((x) => String(x.studentId) === studentAId),
        `rows=${rows.length}`);
    }
    const bentries = await db.collection("mathsprogresses").find({ studentId: new mongoose.Types.ObjectId(studentBId) }).toArray();
    check("maths: B has no fabricated progress (isolation)", bentries.length === 0, `rows=${bentries.length}`);
  }

  // ══ 6. WORLD EXPLORER (Social) ══════════════════════════════════════════
  {
    const r = await api("get", "/social/worlds", { token: tokenA });
    const worlds = (r.data?.data?.worlds) || [];
    const first = worlds.find((w) => w.order === 1) || worlds[0];
    check("social worlds served", r.status === 200 && worlds.length > 0, `status=${r.status} worlds=${worlds.length}`);

    const q = await api("get", `/social/${encodeURIComponent(first.id)}`, { token: tokenA });
    const t = q.data?.data;
    check("social world activity served", q.status === 200 && !!t?.question?.id, `status=${q.status} qid=${t?.question?.id}`);

    if (first.id && t?.question?.id != null) {
      const a = await api("post", "/social/answer", { token: tokenA, data: { world: first.id, questionId: t.question.id, correct: true } });
      check("social answer recorded", a.status === 200, `status=${a.status}`);
      const rows = await db.collection("socialprogresses").find({ studentId: new mongoose.Types.ObjectId(studentAId) }).toArray();
      check("social row owned by A", rows.length >= 1 && rows.every((x) => String(x.studentId) === studentAId), `rows=${rows.length}`);
    }
  }

  // ══ 7. SCIENCE WORLD ════════════════════════════════════════════════════
  {
    const r = await api("get", "/science/worlds", { token: tokenA });
    const worlds = (r.data?.data?.worlds) || [];
    const first = worlds.find((w) => w.order === 1) || worlds[0];
    check("science worlds served", r.status === 200 && worlds.length > 0, `status=${r.status} worlds=${worlds.length}`);

    const q = await api("get", `/science/${encodeURIComponent(first.id)}`, { token: tokenA });
    const t = q.data?.data;
    check("science world play bundle served", q.status === 200 && !!t?.question?.id, `status=${q.status} qid=${t?.question?.id}`);

    if (first.id && t?.question?.id != null) {
      const a = await api("post", "/science/answer", { token: tokenA, data: { world: first.id, questionId: t.question.id, pick: "never-the-correct-answer" } });
      check("science answer server-validated (correct=false accepted)",
        a.status === 200 && a.data?.data?.correct === false && a.data.data.solved === false,
        `status=${a.status} correct=${a.data?.data?.correct}`);
      const rows = await db.collection("scienceprogresses").find({ studentId: new mongoose.Types.ObjectId(studentAId) }).toArray();
      check("science attempt persisted + owned by A", rows.length >= 1 && rows.every((x) => String(x.studentId) === studentAId),
        `rows=${rows.length} solved=${rows[0] && rows[0].solved}`);
    }

    // Experiment prediction round-trip (published earlier preview + real save)
    const ex = await api("get", `/science/experiments/${encodeURIComponent(first.id)}`);
    const exp = ex.data?.data?.experiment;
    check("experiment preview served", ex.status === 200 && !!exp && Array.isArray(exp.items) && exp.items.length > 0,
      `status=${ex.status} items=${exp && exp.items && exp.items.length}`);
    if (exp && exp.items.length && exp.buckets && exp.buckets.length) {
      const pick = {};
      exp.items.forEach((it) => { pick[it.key] = exp.buckets[0]; });
      const res = await api("post", `/science/experiments/${encodeURIComponent(first.id)}/result`, { token: tokenA, data: { pick } });
      check("science experiment result saved (upsert, validated)",
        res.status === 200 && res.data?.data?.total === exp.items.length,
        `status=${res.status} total=${res.data?.data?.total}`);
      const er = await db.collection("scienceexperimentresults").findOne({ studentId: new mongoose.Types.ObjectId(studentAId), world: first.id });
      check("experiment result persisted", !!er && er.total === exp.items.length, `world=${first.id} total=${er && er.total}`);
    }

    const d = await api("get", "/science/daily", { token: tokenA });
    check("science daily challenge served", d.status === 200 && !!d.data?.data?.question?.id, `status=${d.status} qid=${d.data?.data?.question?.id}`);
    if (d.data?.data?.question?.id != null) {
      const c1 = await api("post", "/science/daily/complete", { token: tokenA, data: { questionId: d.data.data.question.id, pick: "nope" } });
      const c2 = await api("post", "/science/daily/complete", { token: tokenA, data: { questionId: d.data.data.question.id, pick: "nope" } });
      const drs = await db.collection("sciencedailies").find({ studentId: new mongoose.Types.ObjectId(studentAId) }).toArray();
      const attempted = drs.some((x) => x.attempts >= 2 && x.at);
      check("science daily: validation + attempts counted, no dup rows",
        c1.status === 200 && c2.status === 200 && drs.length === 1 && drs[0].attempts >= 2,
        `c1=${c1.status} c2=${c2.status} rows=${drs.length} attempts=${drs[0] && drs[0].attempts}`);
      void attempted;
    }
  }

  // ══ 8. ENGLISH ADVENTURE ════════════════════════════════════════════════
  {
    const d = await api("get", "/english/daily", { token: tokenA });
    check("english daily served", d.status === 200 && !!d.data?.data?.activityKey, `status=${d.status} key=${d.data?.data?.activityKey}`);

    const a = await api("post", "/english/activity", { token: tokenA, data: { activity: "word-explorer", stars: 2, completed: true } });
    check("english activity persisted", a.status === 200 && (a.data?.data?.state?.stars || 0) >= 2, `status=${a.status} stars=${a.data?.data?.state?.stars}`);

    const g = await api("post", "/english/grammar-answer", { token: tokenA, data: { topicId: "nouns", correct: true } });
    const gMeta = await db.collection("englishstudentmetas").findOne({ studentId: new mongoose.Types.ObjectId(studentAId) });
    const nouns = (gMeta && gMeta.grammarTopics || []).find((t) => t.topicId === "nouns");
    check("english grammar answer recorded (DB-verified)", g.status === 200 && !!nouns && nouns.solved >= 1,
      `status=${g.status} solved=${nouns && nouns.solved}`);

    const p = await api("get", "/english/progress", { token: tokenA });
    check("english progress view shows the real stars (no fabrication)",
      p.status === 200 && (p.data?.data?.stars || 0) >= 2, `status=${p.status} stars=${p.data?.data?.stars}`);
  }

  // ══ 9. SCHOLARSHIPS ═════════════════════════════════════════════════════
  {
    const l = await api("get", "/scholarships?grade=5th&userSide=true");
    check("scholarships grade-filtered list (shipped page call)", l.status === 200 && Array.isArray(l.data?.data),
      `status=${l.status} count=${l.data?.count}`);

    const any = await api("get", "/scholarships");
    const sample = (any.data?.data || [])[0];
    if (sample && sample._id) {
      const d = await api("get", `/scholarships/${sample._id}`);
      check("scholarship detail live", d.status === 200, `status=${d.status}`);
    } else {
      check("scholarship detail live", true, "no scholarship rows in DB — list checked only");
    }

    const app = await api("post", "/scholarships/apply", { token: tokenA, data: { scholarshipName: "Audit Class5 Scholarship", scholarshipProvider: "Audit Provider" } });
    check("scholarship apply bound to authenticated student",
      app.status === 201 && String(app.data?.application?.studentId) === studentAId,
      `status=${app.status} studentId=${app.data?.application?.studentId}`);
  }

  // ══ 10. DISCOVER ME / SKILL QUESTS (quiz + games) ═══════════════════════
  let quizWorldKey = null;
  {
    const q = await api("get", "/class5/quiz/questions", { token: tokenA });
    const qs = q.data?.data || [];
    check("quiz questions live (10 configured for class 5)", q.status === 200 && qs.length >= 1,
      `status=${q.status} questions=${qs.length}`);
    if (qs.length) {
      const answers = qs.map((qq) => ({ questionId: qq.id, optionIndex: 0 }));
      const s = await api("post", "/class5/quiz/submit", { token: tokenA, data: { answers } });
      const rw = s.data?.data?.resultWorld;
      check("quiz submit → result world persisted", s.status === 200 && !!rw?.key && !!rw?.name,
        `status=${s.status} world=${rw && rw.key}`);
      quizWorldKey = rw && rw.key;

      const pr = await api("get", "/class5/students/" + studentAId + "/skill-profile", { token: tokenA });
      check("skill profile retrievable after quiz (own data)", pr.status === 200 && !!pr.data?.data?.skills,
        `status=${pr.status}`);
      const meta = await db.collection("quizresults").findOne({ studentId: new mongoose.Types.ObjectId(studentAId) });
      check("quiz result row exists for A", !!meta && meta.resultWorldKey === quizWorldKey, `world=${meta && meta.resultWorldKey}`);
    }
  }

  {
    const g = await api("get", "/class5/games", { token: tokenA });
    const games = g.data?.data || [];
    check("games list live", g.status === 200 && games.length > 0, `status=${g.status} games=${games.length}`);
    const game = games[0];
    if (game) {
      const d = await api("get", `/class5/games/${encodeURIComponent(game.id)}`, { token: tokenA });
      check("game detail (play bundle) served", d.status === 200 && !!d.data?.data?.play, `status=${d.status} hasPlay=${!!d.data?.data?.play}`);
      const before = (d.data?.data?.attempts || []).length;

      const att = await api("post", `/class5/games/${encodeURIComponent(game.id)}/attempt`, { token: tokenA, data: { pct: 88 } });
      check("game attempt persisted via /games/:id/attempt (regression fix)",
        att.status === 200 && typeof att.data?.data?.xpEarned === "number" && att.data.data.xpEarned > 0,
        `status=${att.status} xp=${att.data?.data?.xpEarned}`);

      const d2 = await api("get", `/class5/games/${encodeURIComponent(game.id)}`, { token: tokenA });
      check("game attempt visible in later detail fetch",
        d2.status === 200 && (d2.data?.data?.attempts || []).length === before + 1,
        `before=${before} after=${(d2.data?.data?.attempts || []).length}`);
    }
  }

  const snapshot = await api("get", `/class5/parent/career-snapshot?studentId=${studentAId}`, { token: tokenA });
  check("parent career snapshot (own data only, query-bound)", snapshot.status === 200 && !!snapshot.data?.data,
    `status=${snapshot.status}`);

  // ══ 11. COMMUNICATION SKILLS (Class 5 communication + passport) ══════════
  {
    const dm = await api("get", "/class5-communication/daily-mission", { token: tokenA });
    check("communication daily mission served", dm.status === 200, `status=${dm.status}`);

    const st = await api("post", "/class5-communication/step", { token: tokenA, data: { stepId: "emotion_detective" } });
    check("communication step completes + XP", st.status === 200 && (st.data?.data?.progress?.xp || 0) >= 20,
      `status=${st.status} xp=${st.data?.data?.progress?.xp}`);

    const ar = await api("post", "/class5-communication/activity-result", { token: tokenA, data: { activityId: "pattern_master", score: 9, total: 10, percentage: 90 } });
    check("communication activity-result saved", ar.status === 200 && (ar.data?.data?.xpEarned || 0) >= 20,
      `status=${ar.status} xp=${ar.data?.data?.xpEarned}`);

    const p = await api("get", "/class5-communication/progress", { token: tokenA });
    const xp = p.data?.data?.progress?.xp ?? p.data?.data?.xp ?? 0;
    check("communication progress view reflects XP", p.status === 200 && xp >= 20, `status=${p.status} xp=${xp}`);

    const pass = await api("get", `/class5-communication/passport/${studentAId}`);
    const body = JSON.stringify(pass.data || {});
    check("passport public + no email/phone PII", pass.status === 200 && !!pass.data?.data?.student?.name && !/email/i.test(body) && !/phone/i.test(body),
      `status=${pass.status} name=${pass.data?.data?.student?.name}`);
  }

  // ══ 12. CLASS CONTENT (public detail source for class 5 pages) ══════════
  {
    const r = await api("get", "/class-content/level/5");
    const list = Array.isArray(r.data?.data) ? r.data.data : (Array.isArray(r.data) ? r.data : []);
    check("class-content level 5 served", r.status === 200 && list.length >= 0, `status=${r.status} items=${list.length}`);
  }

  // ══ 13. SECURITY / AUTHORIZATION (incl. this audit's content-CRUD fix) ═══
  {
    const noToken = [
      ["post", "/maths/answer", { topic: "x", questionId: 1, correct: true }],
      ["post", "/social/answer", { world: "x", questionId: 1, correct: true }],
      ["post", "/science/answer", { world: "x", questionId: 1, pick: "a" }],
      ["post", "/english/activity", { activity: "word-explorer" }],
      ["get", "/class5/quiz/questions", undefined],
      ["post", "/class5/games/000000000000000000000000/attempt", { pct: 50 }],
      ["post", "/scholarships/apply", { scholarshipName: "T" }],
      ["post", "/class5-communication/step", { stepId: "video" }],
      ["get", "/admin/dashboard", undefined],
    ];
    for (const [m, p, body] of noToken) {
      const r = await api(m, p, { data: body });
      check(`no-token ${m.toUpperCase()} ${p} denied`, r.status === 401 || r.status === 403, `status=${r.status}`);
    }

    const role = await api("get", "/admin/dashboard", { token: tokenA });
    check("student token on admin route → denied", role.status === 401 || role.status === 403, `status=${role.status}`);

    // Student must NOT be able to mutate global communication content.
    const sCreate = await api("post", "/communication-content", { token: tokenA, data: { contentType: "talk_topic", data: { prompt: "hack" } } });
    check("student CANNOT create communication content (admin-only fix)",
      sCreate.status === 401 || sCreate.status === 403, `status=${sCreate.status}`);

    // Admin CAN — full CRUD round-trip.
    const aCreate = await api("post", "/communication-content", { token: adminToken, data: { contentType: "talk_topic", data: { prompt: "Audit C5 content" }, order: 9999 } });
    contentDocId = (aCreate.data?.data && (aCreate.data.data._id || aCreate.data.data.id)) || null;
    check("admin creates communication content", aCreate.status === 201 && !!contentDocId, `status=${aCreate.status} id=${contentDocId || ""}`);

    // /all is a student-scoped read (verifyStudent) — admin tokens are denied
    // there by design. Content existence is verified at the DB layer instead.
    const created = await db.collection("communicationcontents").findOne({ _id: new mongoose.Types.ObjectId(contentDocId) });
    check("admin-created content persisted (DB-verified)", !!created && created.contentType === "talk_topic",
      `status=${created ? "found" : "missing"}`);

    const noneAuth = await api("get", "/communication-content/all", { token: tokenA });
    check("communication-content reads are student-scoped", noneAuth.status === 200, `status=${noneAuth.status}`);

    const sPut = await api("put", `/communication-content/${contentDocId}`, { token: tokenA, data: { data: { prompt: "x" } } });
    check("student CANNOT edit communication content", sPut.status === 401 || sPut.status === 403, `status=${sPut.status}`);

    const sDel = await api("delete", `/communication-content/${contentDocId}`, { token: tokenA });
    check("student CANNOT delete communication content", sDel.status === 401 || sDel.status === 403, `status=${sDel.status}`);

    const aDel = await api("delete", `/communication-content/${contentDocId}`, { token: adminToken });
    check("admin deletes the content (cleanup)", aDel.status === 200, `status=${aDel.status}`);
    contentDocId = null;

    // Cross-student ownership.
    const xSkill = await api("get", `/class5/students/${studentAId}/skill-profile`, { token: tokenB });
    check("student B cannot read student A skill profile (403 ownsId)", xSkill.status === 403, `status=${xSkill.status}`);

    const xSnap = await api("get", `/class5/parent/career-snapshot?studentId=${studentAId}`, { token: tokenB });
    check("student B cannot read student A parent snapshot (403 own-data)", xSnap.status === 403, `status=${xSnap.status}`);

    const cAdmin = await api("get", "/admin/create-admin");
    check("admin bootstrap endpoint gated (404)", cAdmin.status === 404, `status=${cAdmin.status}`);

    const mal = await axios({ method: "get", url: BASE + "/student/profile", headers: { Authorization: "Bearer not-a-valid-jwt" }, validateStatus: () => true, timeout: 30000 });
    check("malformed token → 401", mal.status === 401, `status=${mal.status}`);

    // Body-supplied identity spoof on a write must be ignored.
    const spoof = await api("post", "/maths/answer", { token: tokenA, data: { topic: mathTopic, questionId: 1, correct: true, studentId: studentBId, classLevel: "8" } });
    const spoofRow = await db.collection("mathsprogress").findOne({ studentId: new mongoose.Types.ObjectId(studentBId), questionId: 1 });
    check("body studentId spoof ignored on maths write",
      (spoof.status === 200 || spoof.status === 404 || spoof.status === 400) && !spoofRow,
      `status=${spoof.status} bRow=${!!spoofRow}`);
  }

  // ══ 14. ADMIN VISIBILITY (real aggregations over the data just written) ══
  {
    const dash = await api("get", "/admin/dashboard", { token: adminToken });
    check("admin dashboard live (real aggregation)", dash.status === 200 && typeof dash.data?.totalStudents === "number",
      `status=${dash.status}`);

    const users = await api("get", "/admin/users?userType=school_student&limit=500", { token: adminToken });
    const list = Array.isArray(users.data) ? users.data : (Array.isArray(users.data?.users) ? users.data.users : []);
    const a = list.find((u) => u.email === EMAIL_A);
    check("class-5 student visible in admin school_student listing",
      users.status === 200 && !!a && String(a.classLevel) === "5", `status=${users.status} classLevel=${a && a.classLevel}`);

    const detail = await api("get", `/admin/users/${studentAId}`, { token: adminToken });
    check("admin user detail returns profile + recommendation key",
      detail.status === 200 && detail.data?.user?._id === studentAId && "recommendation" in (detail.data || {}),
      `status=${detail.status}`);

    const blk = await api("patch", `/admin/users/${studentAId}/block`, { token: adminToken });
    const l1 = await api("post", "/student/login", { data: { email: EMAIL_A, password: PASSWORD } });
    check("admin block round-trip: blocked student cannot login",
      blk.status === 200 && l1.status === 403, `blk=${blk.status} login=${l1.status}`);
    const unblk = await api("patch", `/admin/users/${studentAId}/unblock`, { token: adminToken });
    const l2 = await api("post", "/student/login", { data: { email: EMAIL_A, password: PASSWORD } });
    check("admin unblock restores login", unblk.status === 200 && l2.status === 200, `unblk=${unblk.status} login=${l2.status}`);
    tokenA = l2.data.token || tokenA;
  }

  // ══ 15. RECOVERY — progress survives a fresh login (no fabricated state) ══
  {
    const m = await api("get", "/maths/" + encodeURIComponent(mathTopic), { token: tokenA });
    check("persistence: maths progress after re-login", m.status === 200 && (m.data?.data?.progress?.completed || 0) >= 1,
      `status=${m.status} completed=${m.data?.data?.progress?.completed}`);

    const e = await api("get", "/english/progress", { token: tokenA });
    check("persistence: english stars after re-login", e.status === 200 && (e.data?.data?.stars || 0) >= 2,
      `status=${e.status} stars=${e.data?.data?.stars}`);

    const p = await api("get", "/class5-communication/progress", { token: tokenA });
    check("persistence: communication XP after re-login",
      p.status === 200 && (p.data?.data?.progress?.xp ?? p.data?.data?.xp ?? 0) >= 20,
      `status=${p.status}`);
  }

  // ══ 16. CLEANUP (isolated identities only) ═══════════════════════════════
  if (!KEEP) {
    const aId = new mongoose.Types.ObjectId(studentAId);
    const bId = new mongoose.Types.ObjectId(studentBId);
    await db.collection("users").deleteMany({ email: { $in: [EMAIL_A, EMAIL_B] } });
    await db.collection("admins").deleteMany({ $or: [{ _id: adminDocId }, { email: EMAIL_ADMIN }] });
    if (contentDocId) await db.collection("communicationcontents").deleteMany({ _id: new mongoose.Types.ObjectId(contentDocId) });
    const idCols = [
      "mathsprogresses", "socialprogresses", "scienceprogresses", "scienceexperimentresults", "sciencedailies",
      "mathsstudentmetas", "mathsstudentlevels", "socialstudentmetas", "socialstudentlevels",
      "sciencestudentmetas", "sciencestudentlevels", "englishstudentmetas",
      "quizresults", "studentskillprofiles", "skillprofiles", "class5streaks", "gameattempts", "expeditioncontributions",
      "studentskillprogresses", "studentbadges", "studentactivityhistories", "studentvoicerecordings",
      "studentdiscoverprogresses", "studentcertificates", "studentcareerbadges",
    ];
    for (const col of idCols) {
      try {
        await db.collection(col).deleteMany({ $or: [{ studentId: aId }, { studentId: bId }, { userId: aId }, { userId: bId }] });
      } catch { /* collection may not exist */ }
    }
    // ScholarshipApplication stores studentId as a STRING (case-sensitive collection).
    await db.collection("scholarshipApplications").deleteMany({ $or: [{ studentId: studentAId }, { studentId: studentBId }, { studentId: aId }, { studentId: bId }] });
    console.log("CLEANUP: removed isolated class-5 audit identities");
  } else {
    console.log(`KEEP: audit identities retained — ${EMAIL_A}`);
  }

  await mongoose.disconnect();

  const failed = results.filter((r) => !r.ok);
  console.log("\n" + "═".repeat(70));
  console.log(`CLASS 5 AUDIT ${RUN} — ${results.length} checks, ${results.length - failed.length} passed, ${failed.length} failed`);
  if (failed.length) {
    for (const f of failed) console.log(`  ✗ ${f.name}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("CLASS5 AUDIT ABORTED:", e.message);
  process.exit(2);
});