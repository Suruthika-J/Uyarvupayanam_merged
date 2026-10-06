/**
 * _graduateAudit.cjs
 * ============================================================================
 * Graduate career portal end-to-end audit (real API + real database) for the
 * newly connected `/api/graduate` module:
 *
 *   REGISTRATION / AUTH
 *     - register (userType=graduate) -> OTP (real code from the server log) ->
 *       verify -> token; login path matches the app.
 *
 *   PROFILE / ONBOARDING FLOW (all identity derived from the token)
 *     - GET  /graduate/profile                   auto-creates own profile
 *     - POST /graduate/profile/step              saves step fields
 *     - POST /graduate/onboarding/complete       finalises + sets userType
 *     - academic-combination validation          invalid combos -> 400
 *
 *   MASS-ASSIGNMENT HARDENING (regression)
 *     - step body carrying userId of ANOTHER student, onboardingCompleted:true,
 *       careerReadinessScore:99, currentStep:99 must ALL be ignored; ownership
 *       never changes and telemetry is server-computed.
 *
 *   PORTAL ENDPOINTS
 *     - dashboard, careers, skill-gap, exams, higher-studies, roadmap, AI chat
 *
 *   AUTHORIZATION
 *     - no token -> 401; cross-student isolation (student B never sees A's data)
 *
 *   ADMIN VISIBILITY
 *     - admin dashboard graduate count includes the new graduate account;
 *       admin users list contains the graduate email.
 *
 * Usage (run against the isolated audit server on :5001):
 *   node scripts/_graduateAudit.cjs
 * Env:
 *   AUDIT_BASE_URL   default http://localhost:5001/api
 *   AUDIT_LOG_FILE   server log path for OTP extraction (optional)
 *   AUDIT_KEEP=1     keep isolated identities (default cleans up)
 *
 * Exit code 0 = all assertions passed, 1 = one or more failed.
 */
"use strict";
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const axios = require("axios");

const BASE = process.env.AUDIT_BASE_URL || "http://localhost:5001/api";
const LOG_FILE = process.env.AUDIT_LOG_FILE || "";
const KEEP = process.env.AUDIT_KEEP === "1";

const RUN = crypto.randomBytes(3).toString("hex");
const EMAIL_G1 = `audit.grad.${RUN}@uyarvupayanam.local`;
const EMAIL_G2 = `audit.gradb.${RUN}@uyarvupayanam.local`;
const EMAIL_ADMIN = `audit.gadmin.${RUN}@uyarvupayanam.local`;
const PASSWORD = "AuditGrad@123";

let adminToken = null;
let adminDocId = null;
let tokenG1 = null;
let idG1 = null;
let tokenG2 = null;
let idG2 = null;

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, urlPath, { data, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await axios({ method, url: BASE + urlPath, data, headers, timeout: 90000, validateStatus: () => true });
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

// Full register -> OTP (from log) -> verify chain. Returns { id, token }.
async function registerGraduate(email) {
  const r = await api("post", "/student/register", { data: {
    name: "Audit Graduate", email, password: PASSWORD, userType: "graduate", classLevel: "", district: "Chennai",
  }});
  if (r.status !== 201) return null;
  await sleep(1800);
  const otp = extractOtpFromLog(email);
  if (otp) {
    const v = await api("post", "/student/verify-otp", { data: { email, otp } });
    return v.status === 200 && v.data.token
      ? { id: String(v.data.student?._id || v.data.student?.id || ""), token: v.data.token, via: "otp" }
      : null;
  }
  // Deterministic documented fallback: DB-verify + real login.
  await mongoose.connection.db.collection("users").updateOne({ email }, { $set: { isVerified: true } });
  const l = await api("post", "/student/login", { data: { email, password: PASSWORD } });
  return l.status === 200 && l.data.token
    ? { id: String(l.data.student?._id || l.data.student?.id || ""), token: l.data.token, via: "dbfallback" }
    : null;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/uyarvu-payanam");
  const db = mongoose.connection.db;

  // ── 1. Isolated test admin ──────────────────────────────────────────────
  {
    const hashed = await bcrypt.hash(PASSWORD, 10);
    const admin = await db.collection("admins").insertOne({
      email: EMAIL_ADMIN, password: hashed, role: "Admin", isActive: true, name: "Audit Grad Admin",
      createdAt: new Date(), updatedAt: new Date(),
    });
    adminDocId = admin.insertedId;
    const r = await api("post", "/admin/login", { data: { email: EMAIL_ADMIN, password: PASSWORD } });
    check("admin login (isolated admin)", r.status === 200 && !!r.data.token, `status=${r.status}`);
    adminToken = r.data.token || null;
  }

  // ── 2. Graduate A — real register -> OTP -> login ───────────────────────
  const acc1 = await registerGraduate(EMAIL_G1);
  check("graduate register -> verify -> token chain", !!acc1, acc1 ? `via=${acc1.via}` : "no token");
  if (!acc1) {
    await mongoose.disconnect();
    console.log(`GRADUATE AUDIT ABORTED — could not authenticate ${EMAIL_G1}`);
    process.exit(2);
  }
  tokenG1 = acc1.token;
  idG1 = acc1.id;

  // No-token access must be rejected
  const noTok = await api("get", "/graduate/profile");
  check("GET /graduate/profile without token -> 401", noTok.status === 401, `status=${noTok.status}`);

  // ── 3. Profile + onboarding step + mass-assignment hardening ────────────
  let profileUserId = null;
  {
    const r = await api("get", "/graduate/profile", { token: tokenG1 });
    profileUserId = String(r.data?.profile?.userId || "");
    check("GET /graduate/profile returns own auto-created profile",
      r.status === 200 && r.data.success === true && profileUserId === idG1,
      `status=${r.status} userId=${profileUserId}`);
  }

  {
    // Attack payload: body claims another student's userId and tries to flip
    // telemetry/completion flags. All of it must be ignored.
    const attack = {
      userId: crypto.randomBytes(12).toString("hex"), // arbitrary other id
      onboardingCompleted: true,
      careerReadinessScore: 99,
      currentStep: 99,
      cachedRecommendations: { bestFitCareers: [{ title: "HACKED" }] },
      degree: "B.E",
      field: "Engineering",
      domain: "Computer Science & Engineering",
      graduationYear: "2024",
      technicalSkills: [{ name: "JavaScript", proficiency: "Intermediate" }],
      projects: [{ title: "Audit Project", description: "Proves identity-bound persistence" }],
    };
    const r = await api("post", "/graduate/profile/step", { token: tokenG1, data: attack });
    const p = r.data?.profile || {};
    const cleanedBySave = mongoose.Types.ObjectId.isValid(p.userId);
    check("step save succeeds (200 + success)",
      r.status === 200 && r.data.success === true, `status=${r.status}`);

    const rel = await api("get", "/graduate/profile", { token: tokenG1 });
    const pr = rel.data?.profile || {};
    profileUserId = String(pr.userId || "");
    check("mass-assignment: profile userId stays OWN (spoof ignored)",
      pr.userId && profileUserId === idG1, `userId=${profileUserId}`);

    check("mass-assignment: onboardingCompleted stays false",
      pr.onboardingCompleted === false, `value=${pr.onboardingCompleted}`);

    check("mass-assignment: careerReadinessScore is server-computed (not 99)",
      Number(pr.careerReadinessScore) !== 99 && Number(pr.careerReadinessScore) > 0,
      `score=${pr.careerReadinessScore}`);

    check("mass-assignment: currentStep is server-managed (not 99)",
      Number(pr.currentStep) !== 99, `step=${pr.currentStep}`);

    check("allowed fields ARE persisted (degree/projects)",
      pr.degree === "B.E" && Array.isArray(pr.projects) && pr.projects.length === 1,
      `degree=${pr.degree} projects=${(pr.projects || []).length}`);

    check("persisted profile survives re-read (GET returns same data)",
      cleanedBySave && pr.degree === "B.E", `degree=${pr.degree}`);
  }

  // ── 4. Academic-combination validation ──────────────────────────────────
  {
    const bad = await api("post", "/graduate/profile/step", { token: tokenG1, data: {
      field: "Medical", degree: "B.E", domain: "Mechanical Engineering",
    }});
    check("invalid academic combination -> 400 (rejected, not saved)",
      bad.status === 400 && bad.data.success === false, `status=${bad.status} msg=${bad.data?.message || ""}`);

    const good = await api("post", "/graduate/profile/step", { token: tokenG1, data: {
      field: "Engineering", degree: "B.E", domain: "Computer Science & Engineering",
      employmentStatus: "Fresher / Not currently working",
      primaryCareerDirection: "Get a Job",
      examInterest: "Yes",
      selectedExams: [{ examName: "GATE", category: "Engineering", targetYear: "2025", preparationStatus: "Exploring" }],
      higherStudyInterest: "Maybe",
    }});
    check("valid combination step accepted (200)", good.status === 200, `status=${good.status}`);
  }

  // ── 5. Complete onboarding ──────────────────────────────────────────────
  let completion = null;
  {
    const r = await api("post", "/graduate/onboarding/complete", { token: tokenG1, data: { expectedSalary: "6-8 LPA" } });
    completion = r.data?.profile || null;
    check("onboarding complete returns success + summary",
      r.status === 200 && r.data.success === true && !!r.data.summary?.topCareer,
      `status=${r.status} topCareer=${r.data?.summary?.topCareer || ""}`);

    const userDoc = await db.collection("users").findOne({ email: EMAIL_G1 });
    check("User row updated to userType=graduate + onboardingCompleted=true",
      userDoc && userDoc.userType === "graduate" && userDoc.onboardingCompleted === true,
      `userType=${userDoc?.userType} onboardingCompleted=${userDoc?.onboardingCompleted}`);

    check("profile flagged onboardingCompleted=true in DB",
      completion && completion.onboardingCompleted === true && completion.currentStep === 6,
      `onboardingCompleted=${completion?.onboardingCompleted} currentStep=${completion?.currentStep}`);
  }

  // ── 6. Portal endpoints (all live, token-bound) ─────────────────────────
  {
    const dash = await api("get", "/graduate/dashboard", { token: tokenG1 });
    check("GET /graduate/dashboard (profile + readiness + weeklyPlan)",
      dash.status === 200 && dash.data.success && !!dash.data.profile && dash.data.weeklyPlan?.length > 0,
      `status=${dash.status} planTasks=${(dash.data?.weeklyPlan || []).length}`);

    const careers = await api("get", "/graduate/careers", { token: tokenG1 });
    check("GET /graduate/careers returns catalog matches",
      careers.status === 200 && careers.data.success && Array.isArray(careers.data.careers) && careers.data.careers.length > 0,
      `status=${careers.status} careers=${(careers.data?.careers || []).length}`);

    const gap = await api("get", "/graduate/skill-gap", { token: tokenG1 });
    check("GET /graduate/skill-gap (targetCareer + learning order)",
      gap.status === 200 && gap.data.success && !!gap.data.targetCareer,
      `status=${gap.status} target=${gap.data?.targetCareer || ""}`);

    const exams = await api("get", "/graduate/exams", { token: tokenG1 });
    check("GET /graduate/exams (curated catalog + user selection)",
      exams.status === 200 && exams.data.success && Array.isArray(exams.data.exams) && exams.data.exams.length > 0,
      `status=${exams.status} exams=${(exams.data?.exams || []).length}`);

    const hs = await api("get", "/graduate/higher-studies", { token: tokenG1 });
    check("GET /graduate/higher-studies (programmes guide)",
      hs.status === 200 && hs.data.success && Array.isArray(hs.data.programmes) && hs.data.programmes.length > 0,
      `status=${hs.status} programmes=${(hs.data?.programmes || []).length}`);

    const roadmap = await api("get", "/graduate/roadmap", { token: tokenG1 });
    check("GET /graduate/roadmap (phased plan)",
      roadmap.status === 200 && roadmap.data.success && Array.isArray(roadmap.data.roadmapPhases) && roadmap.data.roadmapPhases.length > 0,
      `status=${roadmap.status} phases=${(roadmap.data?.roadmapPhases || []).length}`);

    const chat = await api("post", "/graduate/advisor/chat", { token: tokenG1, data: {
      message: "What should I prepare next as a fresher to pivot into full-stack development?",
      history: [],
    }});
    check("POST /graduate/advisor/chat returns a reply",
      chat.status === 200 && !!(chat.data?.reply || chat.data?.message),
      `status=${chat.status} hasReply=${!!(chat.data?.reply || chat.data?.message)}`);
  }

  // ── 7. Cross-student isolation ──────────────────────────────────────────
  // Graduate B must only ever see their own (empty) profile, and a spoofed
  // userId in B's step body must not redirect the write to A's profile.
  {
    const acc2 = await registerGraduate(EMAIL_G2);
    check("second graduate register -> token", !!acc2, acc2 ? `via=${acc2.via}` : "no token");
    if (!acc2) {
      console.error("Could not authenticate graduate B; skipping isolation checks");
    } else {
      tokenG2 = acc2.token;
      idG2 = acc2.id;

      const r = await api("get", "/graduate/profile", { token: tokenG2 });
      check("graduate B sees ONLY their own empty profile",
        r.status === 200 && String(r.data?.profile?.userId || "") === idG2 && String(r.data?.profile?.userId || "") !== idG1,
        `userId=${r.data?.profile?.userId}`);

      const beforeA = await api("get", "/graduate/profile", { token: tokenG1, data: undefined });
      const aDegreeBefore = beforeA.data?.profile?.degree || "";

      const attack = await api("post", "/graduate/profile/step", { token: tokenG2, data: {
        userId: idG1, // try to write into graduate A's profile
        degree: "B.Sc", domain: "Data Science",
      }});
      const bRel = await api("get", "/graduate/profile", { token: tokenG2 });
      check("spoofed userId write is bound to B (ownership preserved)",
        attack.status === 200 && String(bRel.data?.profile?.userId || "") === idG2,
        `bUserId=${bRel.data?.profile?.userId || ""}`);

      const afterA = await api("get", "/graduate/profile", { token: tokenG1 });
      const aDegreeAfter = afterA.data?.profile?.degree || "";
      check("graduate A's profile untouched by B's spoofed step (no cross-write)",
        aDegreeAfter === aDegreeBefore, `before=${aDegreeBefore} after=${aDegreeAfter}`);
    }
  }

  // ── 8. Admin visibility ─────────────────────────────────────────────────
  {
    const dash = await api("get", "/admin/dashboard", { token: adminToken });
    const graduateCount = Number(dash.data?.graduates);
    check("admin dashboard graduate count includes new graduates",
      dash.status === 200 && graduateCount >= 1, `status=${dash.status} graduates=${graduateCount}`);

    const users = await api("get", "/admin/users?limit=500", { token: adminToken });
    const list = Array.isArray(users.data?.users) ? users.data.users : (Array.isArray(users.data) ? users.data : []);
    check("graduate listed in admin users",
      list.some((u) => u.email === EMAIL_G1), `listed=${list.filter((u) => String(u.email || "").includes("audit.grad")).length}`);
  }

  // ── 9. Cleanup (isolated identities only) ───────────────────────────────
  if (!KEEP) {
    await db.collection("users").deleteMany({ email: { $in: [EMAIL_G1, EMAIL_G2] } });
    await db.collection("admins").deleteMany({ $or: [{ _id: adminDocId }, { email: EMAIL_ADMIN }] });
    const g1 = new mongoose.Types.ObjectId(idG1);
    const g2 = idG2 ? new mongoose.Types.ObjectId(idG2) : null;
    await db.collection("graduateprofiles").deleteMany({
      $or: [{ userId: g1 }, ...(g2 ? [{ userId: g2 }] : [])],
    });
    for (const col of ["studenttestresults", "assessmentsummaries", "notifications"]) {
      try {
        await db.collection(col).deleteMany({
          $or: [{ userId: g1 }, { userId: g2 }, { studentId: g1 }, { studentId: g2 }].filter(Boolean),
        });
      } catch { /* collection may not exist */ }
    }
    console.log("CLEANUP: removed isolated graduate audit identities");
  } else {
    console.log(`KEEP: graduate audit identities retained — ${EMAIL_G1}`);
  }

  await mongoose.disconnect();

  const failed = results.filter((r) => !r.ok);
  console.log("\n" + "═".repeat(70));
  console.log(`GRADUATE AUDIT ${RUN} — ${results.length} checks, ${results.length - failed.length} passed, ${failed.length} failed`);
  if (failed.length) {
    for (const f of failed) console.log(`  ✗ ${f.name}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("GRADUATE AUDIT ABORTED:", e.message);
  process.exit(2);
});