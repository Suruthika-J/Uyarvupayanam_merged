# Uyarvu Payanam — Viva Questions & Answers (50 Q&As)

> **Purpose:** exam/viva preparation for the final-year project *Uyarvu Payanam (உயர்வு பயணம்)*.
> **Important honesty rule:** this document answers every question from **what the actual code does**. It deliberately does **not** claim things the project does not do. In particular:
> - The project is **rule-based / deterministic**, not machine learning. There are **no trained models** anywhere in the code. The only AI is **LLM content generation** (question text, chat replies, summaries) — it never decides skill levels or recommendations.
> - No fabricated test results, no invented research papers. Where a claim names a file, you can open that file and verify it.
> **Repo root:** `C:\Users\Priya Dharshini\Downloads\Uyarvupayanam_merged-main\Uyarvupayanam_merged-main\`

---

## Section A — Project overview (Q1–Q6)

### Q1. What is Uyarvu Payanam?
**A.** A full-stack career-guidance web platform for Tamil Nadu students. It targets the transitions after **5th, 8th, 10th and 12th standard** and provides verified data on careers, courses, colleges, TNEA cut-offs, scholarships and exams. It also has a Class-5 gamified learning world, a college-student portal, and an admin console.
**Evidence:** `frontend/src/student/StudentRoutes.jsx`, `backend/routes/*`, `PROJECT_ABSTRACT.md`.

### Q2. Who are the three user types?
**A.** `school_student` (Class 5/8/10/12), `college_student`, and `graduate` — stored in `User.userType` (`backend/models/User.js`). Admins live in a separate `Admin` collection with their own login (`adminController.loginAdmin`).

### Q3. What problem does it solve?
**A.** Students don't know what stream, college, scholarship or exam fits them, and data is scattered and stale. The platform centralises verified, admin-curated data and personalises guidance from a short assessment.

### Q4. How does it "personalise" without machine learning?
**A.** Through a deterministic engine called **LD-NBSE** (Learning DNA). After a ~20-question diagnostic, rule-based engines compute a 9-dimension cognitive "DNA", detect gaps, and pick a "next best skill" using a weighted score with **fixed, admin-configurable weights** (`backend/config/ldnbs/recommendationWeights.js`). Same inputs → same outputs, always.

### Q5. Which modules exist?
**A.** Auth/OTP; legacy onboarding; **LD-NBSE learning DNA**; Class-5 worlds (Maths, Social, Science, English, Tamil) + discovery/gamification; communication skills; career paths & class content; courses; colleges & mapping; TNEA cut-offs; colleges insight; seat-matrix PDF import; scholarships (school + college); exams; streams; notifications; user actions; college portal (profile/advisor/study-tools/community); admin console/reports. A graduate portal and an academic-recommendation module also exist **but are not wired into the running app** (dead code).

### Q6. Is the project "AI"?
**A.** Partially. It *calls* LLM APIs (Anthropic, OpenAI, xAI Grok, Groq — see `backend/utils/aiQuestionGenerator.js`) **only to write question text, chat replies and summaries**. All scoring and recommendations are deterministic rules. There is **no ML training or inference**; "confidence" is just an evidence-count label.

---

## Section B — Architecture & technology (Q7–Q13)

### Q7. What is the tech stack?
**A.** Frontend: React 19 + Vite 5 + react-router-dom 7, axios, framer-motion, recharts, jspdf, xlsx, socket.io-client; primary styling is custom CSS (Tailwind 4 in devDeps). Backend: Node.js, Express 5, Mongoose 9 (MongoDB), jsonwebtoken, bcryptjs, Socket.io, web-push, nodemailer, multer, pdfjs-dist, cheerio, xlsx/csv parsers.

### Q8. Why MongoDB / Mongoose?
**A.** Documents match the data's shape (profiles, nested diagnostics, flexible taxonomies), and ~98 model files span many heterogeneous collections; Mongoose gives schemas, unique compound indexes and validation without a rigid relational schema.

### Q9. Describe the architecture and layering.
**A.** A monorepo with `frontend/` (React SPA, two router trees: admin + student) and `backend/` (Express REST API on port 5000). In the backend the layering is route file → middleware (auth/ownership/rate-limit) → controller → service (business logic/engines) → Mongoose model → MongoDB. The browser speaks REST with JWT (`Authorization: Bearer`); the backend talks to MongoDB and external LLM/SMTP/Web-Push services; Socket.io carries real-time admin notifications.

### Q10. How is the frontend organised?
**A.** `main.jsx` → `BrowserRouter` → `ThemeProvider` → `AuthProvider` → `App.jsx`. `App.jsx` routes `/login` and `/admin/*` (wrapped in `ProtectedRoute`) and everything else goes to `student/StudentRoutes.jsx`. Six React Contexts handle auth, college profile, themes and notifications.

### Q11. What are the main backend folders?
**A.** `controllers/` (45), `routes/` (40), `models/` (98), `services/` (18), `middleware/` (5), `utils/` (15+), `config/` (+ `config/ldnbs/`), `seeders/` (15), `scripts/` (63), entry `server.js`.

### Q12. What does `server.js` do at startup besides listening?
**A.** It configures CORS, creates the Socket.io server, and inside `connectDB().then(...)` runs **11 boot-time jobs** (each individually try/caught): 5 domain importers (diploma, arts-science, medical, siddha, ayurveda), taxonomy + college-career seeders, the class-5 discovery seed, the Class-5 scheduler, and seeds for Adhikarams, Maths, Social, Science and Streams.

### Q13. What is the API base URL pattern?
**A.** Everything is under `/api/...`; frontend uses `VITE_API_URL` (fallback `http://localhost:5000/api`). There are 37 mounted routers (38 `app.use` calls — `/api/students` and `/api/student` mount the same router). Static files are served at `/uploads`.

---

## Section C — Modules (Q14–Q21)

### Q14. What does the legacy onboarding do?
**A.** `POST /api/onboarding/submit` scores simple MCQs per skill, classifies each skill as **Strong (≥80%) / Average (≥50%) / Needs Improvement** (`backend/utils/recommendationEngine.js`), and stores a legacy `Recommendation` (scorePercentage, strong/weak skills, guidelines, recommended exams).

### Q15. What is the Learning DNA (LD-NBSE)?
**A.** A rule-based pipeline that turns assessment answers into: (1) a 9-dimension cognitive profile, (2) per-subskill statuses, (3) an interest profile, (4) detected gaps, (5) a progress trend, (6) a chosen **next best skill** with a learning path, locked/unlocked skills and an explanation. Orchestrated by `backend/services/ldnbsOrchestrator.js`.

### Q16. Which collections make up LD?
**A.** `student_learning_dna`, `student_skill_profiles`, `student_interest_profiles`, `skill_progress_history`, `learning_recommendations`, `generated_assessments`, plus `ldnbs_config`, `skill_taxonomy`, `skill_dependencies` (and side-effect writes to `assessment_summaries`, `student_profiles`).

### Q17. What are the Class-5 worlds?
**A.** Gamified subject areas — Maths, Social, Science, English and Tamil (Thirukkural Adhikarams) — with adaptive questions (3 correct → level up, any wrong → level down), daily challenges and streak/XP tracking. Backend handlers are inline in `mathsRoutes.js`, `socialRoutes.js`, `scienceRoutes.js`, `englishRoutes.js`, `tamilRoutes.js`.

### Q18. What is the Class-5 discovery module?
**A.** A career-exploration gamification layer: "Discover Me" quiz, skill-profile radar, weekly challenges, mini-games, squad expeditions, weekly spotlight, nudges, badges, streaks, certificates and a future-map PDF. Engine: `class5EngineService.js` (with a daily/spotlight scheduler) + `class5DiscoveryController.js`; PDFs via `class5PdfService.js`.

### Q19. What does the college portal offer, and how does the advisor score?
**A.** A college profile, an advisor with relevance-scored course/career recommendations, study tools (AI planner, note summariser, practice questions, interview prep, resume builder, analytics), mentor doubt-requests and admission help. Scoring (`collegeRelevanceEngine.js`): +50 specification, +40 domain, +25 degree, +25 career, +20 skill overlap, −30 for overlapping a demonstrated strength; eligible ≥ 20, clamped 0–100, sorted desc.

### Q20. What does the admin console do?
**A.** User management (block/unblock/reset/delete), sub-admins, career paths & class-content CMS, course/college/exam/cutoff/scholarship/stream management, onboarding rules & LD config, notifications, data imports — including the **TNEA seat-matrix PDF parser** (`utils/seatMatrixParser.js`, pdfjs-dist) exposed at `/api/admin/seat-matrix/import` — and reports (registrations, popular courses, scholarships) with PDF/Excel export.

### Q21. How do notifications reach the user?
**A.** Three channels: (1) stored notifications with read-tracking (`Notification` model), (2) **Socket.io** real-time events (rooms `admins`, `students`, `user_<id>` — `server.js:136-181`), (3) **Web Push** (VAPID) plus optional email (nodemailer).

---

## Section D — Recommendation engine & Learning DNA (Q22–Q33)

### Q22. When is the Learning DNA created?
**A.** Only at **`POST /api/onboarding/ld/submit`** — never at registration or login. The only writer is `ldnbsOrchestrator.runAssessmentPipeline` (verified by grep).

### Q23. What does the diagnostic assessment look like?
**A.** 18–20 blueprint questions per grade (Class 5 → 20, Class 8 → 19, Class 10 → 19, Class 12 → 20), each tagged skill/subskill/cognitiveType/difficulty/weight, plus 4 interest questions (`interest_1..4`). Sources: LLM-generated, static bank, or `mixed` (LLM topped up from the bank).

### Q24. Who grades the answers, and how?
**A.** The server. `correctAnswer` is stored server-side in `generated_assessments` and **stripped from the client payload**. Grading is exact string equality: `r.correctAnswer === a.selectedAnswer` (`ldnbsOrchestrator.js:56`). No partial credit; the LLM is never re-queried to grade.

### Q25. What is the weighted score?
**A.** `weightedScore = round( Σ(weight × correct) / Σweight × 100 )` per subskill (`skillDiagnosisEngine.js:39-41`). Higher-weight (harder) questions count more; this score drives statuses, gaps and the final decision.

### Q26. What are the five skill statuses?
**A.** `insufficient_evidence` (fewer than 2 attempts), `foundation`, `developing`, `ready`, `advanced`. Thresholds are grade-aware (`recommendationWeights.js`): default/Class 10/12 = 45/70/85/85; Class 5/8 = 40/65/80/80. A subskill with < 2 attempts is never classified by score.

### Q27. What are the 9 Learning-DNA dimensions?
**A.** `accuracy`, `understanding`, `application`, `reasoning`, `problemSolving`, `patternRecognition`, `comprehension`, `communication`, `consistency`. Each has `{score, evidenceCount, confidence}`. `consistency = 100 − mean(|dim − accuracy|)`, clamped ≥ 0, only when evidence is sufficient.

### Q28. How is "confidence" computed?
**A.** From evidence count alone: `n ≥ 4 → "high"`, `n ≥ 2 → "medium"`, else `"low"` (`CONFIDENCE_BY_EVIDENCE` in `learningDNAConfig.js`). It is **not** a statistical/ML confidence.

### Q29. What is the next-best-skill formula?
**A.** For each candidate: `score = skillGap·0.35 + prerequisiteImportance·0.25 + cognitiveGap·0.20 + interestAlignment·0.10 + recentProgress·0.10` where:
- `skillGap = (100 − weightedScore)/100`
- `prerequisiteImportance = min(1, downstreamCount·0.5 + 0.5 if blocking)`
- `cognitiveGap` = 1 if a detected gap names the subskill, else 0
- `interestAlignment` = mean interest of the skill's mapped categories (0.5 if unmapped)
- `recentProgress` = lookup (improving 1, stable 0.6, declining 0.8, mastered 0.2, insufficient_data 0.5)
Score ∈ [0,1]. Ties: highest score → lowest weightedScore → alphabetical key (`nextBestSkillEngine.js:115-120`).

### Q30. Which subskills are candidates?
**A.** Only `foundation`/`developing` subskills with ≥ 1 attempt, plus the blocking prerequisites of weak subskills (which may be `insufficient_evidence`). `ready`/`advanced`/ordinary `insufficient_evidence` are excluded. All-strong students fall through to an "EXPLORATION" recommendation.

### Q31. What are the four recommendation types?
**A.** `FOUNDATION` (weak or prerequisite), `DEVELOPMENT` (developing), `ADVANCEMENT` (ready → advanced), `EXPLORATION` (no weak spots — strongest skill + interests). Target status: foundation→ready, ready→advanced, else ready.

### Q32. How is the decision auditable?
**A.** Every `learning_recommendations` document stores `explanation.decision` with `scoresByFactor`, `weightsUsed` and a `tieBreakNote`, plus `evidence{sessionId, questionCount, assessedSubskills}`. The frontend never shows `explanation.decision` to the student, but the record is persisted as the audit trail.

### Q33. What happens if the student answers too few questions?
**A.** `completionRatio = answered/total`; below **0.30** the submit returns HTTP 422 `INCOMPLETE_ASSESSMENT` and nothing is written. The session is preserved so the student can finish and resubmit.

---

## Section E — Algorithms & the "AI/ML" question (Q34–Q41)

### Q34. Which algorithms are really used in the decision path?
**A.** String-equality grading; weighted-mean scoring; a 5-level threshold classifier; weighted DNA dimension means; exposure-normalised interest counting; 4 rule-based gap detectors; a 3-band progress classifier; a **dependency-graph walk** (locks/unlocks/learning path with a cycle guard); the 5-factor weighted sum with 3-level tie-breaking; and weight renormalisation.

### Q35. Is LD-NBSE machine learning? Why not?
**A.** No. There is no labelled dataset, no training loop, no model file, no learned weights, no embeddings and no optimisation. Every score is a closed-form arithmetic expression over counts and fixed/admin-configurable constants. The code comments say the same (`learningDiagnosisController.js:5-7`).

### Q36. But it "adapts" — isn't that learning?
**A.** It's **adaptive configuration, not learning**. The system re-runs deterministic formulas on new answers and reads admin-set weights from `ldnbs_config`. It never updates its own parameters from outcomes.

### Q37. Where is the LLM used, and what are the rails around it?
**A.** `backend/utils/aiQuestionGenerator.js` (multi-provider: custom OpenAI-compatible, Anthropic, OpenAI, Grok, Groq — env-var precedence) plus college study tools. Rails: exactly 4 unique options, the answer must be an exact member, `subskill`/`weight` forced back to the blueprint spec, 25 s timeout with retries, bank top-up to preserve counts, and the LLM is never trusted to grade.

### Q38. Where else does the LLM appear?
**A.** `grokAssessmentController` (Grok questions), `collegeStudyToolsController` (planner, chat, summarise, practice, interview, resume), `schoolReassessmentService`, `collegePracticeEngine`, `graduateAdvisorController` (dead module). Numeric bands next to these calls stay hard-coded (e.g. 90/75/60).

### Q39. What is `validateWeights` for?
**A.** Admin weight edits are merged over defaults and renormalised so the five weights always sum to 1.0 (tolerance 0.0001) — an admin can never break the engine's scoring (`recommendationWeights.js:69-79`).

### Q40. What is `loadEffectiveConfig`?
**A.** It deep-clones the default weights/thresholds/effort/messages and layers the admin `ldnbs_config` document over them; if the DB is unreachable it silently returns defaults (`catch`). It is re-run on every LD generate/submit/reassess (no caching). ⚠ An admin that replaces `thresholds.status` without a `default` key silently reverts all other grades to hardcoded `{45,70,85,85}`.

### Q41. Are there algorithms that are written but never run?
**A.** Yes — dead code: `academicRecommendationService` (bands + `allocateMinutes` + study-plan split) and `graduateController.matchScore` (career matching) exist, but their routers (`recommendationRoutes.js`, `graduateRoutes.js`) are **not mounted** in `server.js`. Never present these as working in the running app.

---

## Section F — Database & API (Q42–Q45)

### Q42. How is the database designed, and how are relationships handled?
**A.** MongoDB with Mongoose schemas (98 models); **document references** (`ref`) with `populate` instead of joins; unique compound indexes where integrity matters (e.g. `student_skill_profiles` on `(studentId, skill, subskill)`, `users.email`). LD collections key on `studentId`; mapping collections link colleges ↔ courses.

### Q43. How many endpoints exist and how are they guarded?
**A.** ~300+ reachable endpoints across 37 mounted routers. Guards: `verifyStudent` (JWT + blocked-check via `Settings`), `verifyAdmin`, `verifyOwnership(<param>)` on `:userId`/`:studentId` routes, and an in-memory `rateLimit` (class-5/world routes). Several routers have **no auth at all** (courses, exams, cutoffs) — a known gap, not a feature.

### Q44. What are `verifyOwnership` and the OTP service?
**A.** `verifyOwnership(param)` is a middleware factory that rejects a request when the URL `:userId`/`:studentId` doesn't match the token's user — an IDOR guard used on LD results, notifications, onboarding results, saved items, etc. `utils/otpService.js` generates a 6-digit code with a TTL, stores it in `OtpCode`, emails it, and verifies with an attempt cap (`MAX_OTP_ATTEMPTS`) — used for student signup, login OTP, resend and forgot-password.

### Q45. What are the key auth and LD endpoints, and the error convention?
**A.** Auth: `/api/auth/{register, login, otp/send, login/otp, resend-otp, forgot-password, forgot-password/verify, reset-password}`, `/api/students/{register, login, verify-otp, resend-otp}`, `/api/admin/login`. LD: `POST /api/onboarding/ld/{generate-questions, submit, reassess}`, `GET /api/onboarding/ld/result/:studentId`, admin `GET/PUT /api/onboarding/ld/admin/{config, taxonomy, dependencies}`. Convention: success `{success:true,…}`, error `{success:false, message}` with 400/401/403/404/422/500. There is **no global error handler** — controllers catch their own errors.

---

## Section G — Security, testing, limitations, future (Q46–Q50)

### Q46. How are passwords and sessions handled?
**A.** Passwords are hashed with **bcryptjs** (cost 10–12); login compares with `bcrypt.compare`. Sessions are **JWT (HS256)** kept in `localStorage` (`studentToken`/`adminToken`); the axios interceptor in `config/axios.js` adds `Authorization: Bearer <token>`, choosing admin vs student token by URL path.

### Q47. What are the most important security weaknesses found?
**A.** Evidence-based, all listed with locations in the technical report §19:
1. `GET /api/admin/create-admin` is unauthenticated and recreates a super-admin.
2. `courseRoutes`, `examRoutes`, `cutoffRoutes` have **zero auth** — public writes.
3. The three LD write POSTs are unauthenticated and trust `studentId` from the body (acknowledged as an open follow-up in `utils/studentProfileSync.js:20-26`).
4. Hard-coded secret/Grok-key fallbacks in source (including `JWT_SECRET || "fallback_secret"` in three route files).
5. Acceptance-test endpoints exposed in production (`/college-advisor/test-profiles`, `/study-tools/planner/test`).

### Q48. How is the project tested?
**A.** Honestly: there is **no automated unit/CI test suite**. What exists: dev harness scripts (`backend/scripts/_verify*.js`), two deployed acceptance endpoints, `EXAMPLES/API_TESTING_GUIDE.md`, and PDF-parser debug scripts. Production "validation gates" are OTP attempt caps, ownership checks, LLM question validation rails, the weight-sum check, and multer upload limits.

### Q49. What are the main limitations?
**A.** No ML personalisation; LD results **not** shown on the school dashboard (it reads legacy `Recommendation` via `dashboardSummaryController.js:48`); the LD **reassess loop is write-only** (generates 4 questions but has no submit/scoring path, and the orchestrator is hardcoded to `mode:"onboarding"`); graduate + academic modules are unwired dead code; in-memory rate limiting; boot-time jobs not idempotent; interests are coarse (8 categories from 4 questions); several frontend hard-coded `http://localhost:5000` URLs.

### Q50. What would you improve next, and could real ML be added?
**A.** Improvements: (1) add the reassess submit path to close the adaptive loop; (2) wire the graduate module and mount its routes; (3) point the dashboard at `LearningRecommendation`; (4) auth-harden the open write routers, remove `create-admin` and hard-coded secrets; (5) Redis rate limiting + refresh tokens/httpOnly cookies; (6) automated tests + CI; (7) an admin UI for LD weights (currently none); (8) idempotent boot jobs and a health endpoint. Real ML: given labelled outcome data (e.g. later exam performance), a supervised model could predict proficiency from DNA dimensions, learn per-grade next-best-skill weights, or cluster study habits — but that is genuinely **future work**, not what the code does today. One-sentence summary: **Uyarvu Payanam is a scalable career-guidance platform combining admin-curated Tamil Nadu education data, gamified Class-5 learning, a deterministic Learning-DNA "next-best-skill" engine, a college AI-study portal — while honestly carrying unfinished corners (dead graduate/academic modules, a write-only reassess loop, non-ML personalisation).**

---

## Quick-reference card (memorise these numbers)

| Item | Value |
|---|---|
| Backend stack | Node + Express 5 + Mongoose 9 (MongoDB), port 5000 |
| Frontend stack | React 19 + Vite 5 + react-router-dom 7 |
| Models / controllers / routes | 98 / 45 / 40 (37 mounted) |
| LD submit gate | ≥ 30% answered (`0.3`), else HTTP 422 |
| Next-best-skill weights | 0.35 / 0.25 / 0.20 / 0.10 / 0.10 |
| Evidence thresholds | < 2 attempts = `insufficient_evidence`; ≥ 4 = high, ≥ 2 = medium confidence |
| Status thresholds (default / Class 10 / 12) | 45 / 70 / 85 / 85 |
| Status thresholds (Class 5 / 8) | 40 / 65 / 80 / 80 |
| Diagnostic size | 18–20 questions + 4 interest questions |
| Legacy skill classes | Strong ≥ 80 / Average ≥ 50 |
| College relevance eligibility | score ≥ 20 (max 100) |
| Graduate matchScore (dead code) | clamp(55, 96) |
| Assessment-summary bands | ≥ 80 Strong / ≥ 50 Average |
| Dead modules | graduate portal, academic recommendations, college-onboarding backend |

*End of UYARVUPAYANAM_VIVA_QUESTIONS.md.*