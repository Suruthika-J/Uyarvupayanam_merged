# Class 8 English — "Space Explorer" Module — Implementation Report

**Module mount:** `/api/english-missions` (backend) · `/student/class8/english` (frontend, under Class 8 → "English Missions")
**Status:** implemented, built, and end-to-end smoke-tested (49/49 checks passing)

---

## 1. What was built

A complete Class 8 English learning area that mirrors the Class 8 Maths *Space Adventure* UX but with a **dark navy/purple galaxy theme** of its own (the Maths module keeps its white theme). Six learning areas, 23 topics, 69 graded activities, and AI-generated end-of-topic assessments on the existing backend Groq integration.

| Learning area | Topics | Activities | What it contains |
|---|---|---|---|
| Grammar | 8 | 24 | Tenses, subject–verb agreement, modals, articles, prepositions, conjunctions, voice, reported speech |
| Reading | 4 | 12 | Class-8 passages with comprehension (MCQ + true/false + fill-blank + sentence-order) |
| Vocabulary | 3 | 9 | Word games: synonyms/antonyms, collocations, match-pairs, best-word |
| Writing | 4 | 12 | Paragraph, letter, story, notice — template + rubric + optional AI feedback (guidance, never a grade) |
| Listening | 2 | 6 | Transcript-based passages with a text-to-speech control (frontend TTS via `speech.js`) |
| Speaking | 2 | 6 | Prompt cards with TTS read-aloud of sample lines (no fake recording/scoring UI) |
| **Total** | **23** | **69** | |

### Per-topic flow (every topic)
Intro → visual lesson (timeline band) → guided practice (hints) → activities (server-graded) → recap step → **completion unlocks the assessment** → attempt → submit → results/review (explanations) → retry (new question set). Opening a lesson never marks anything complete; completing one topic's assessment does **not** complete any other topic.

---

## 2. Backend (all server-authoritative)

| File | Purpose |
|---|---|
| `seeders/seedEnglishMissions.js` | The entire curriculum as code — the only source of answers. Exposes `getEnglishAreas/getEnglishTopics/englishTopicById/requiredActivityIds/activityById/shapeActivity/shapeTopic/orderedTopics`. `lesson.recap` and `lesson.practice` are hoisted to topic level here. |
| `models/StudentEnglishProgress.js` | One doc per (student, topic): completed activity ids, attempt counts, best score/percent, assessment-completed flag, last played. |
| `models/EnglishAssessment.js` | One doc per (student, topic, attempt): the server-side question set with the answer key + status (pending/submitted). |
| `services/englishAiService.js` | Groq-backed generation + strict validation (topic-scoped, deduplicated, exact-count) and rubric-based writing feedback. **Adaptive top-up generation**: asks for the full set, then asks only for the still-missing count, passing accepted questions to avoid repeats; backoff after failures/429s; rejection reasons logged. |
| `routes/englishMissionsRoutes.js` | 8 authenticated endpoints (below). Correctness/completion/scoring live **only** here. |
| `server.js` | Mounts the router and runs the seed summary. |

### Endpoints
1. `GET /areas` — 6 areas + per-topic status states + totals + continue-learning target
2. `GET /areas/:areaId` — one area + topic journey with statuses
3. `GET /topics/:topicId` — lesson + activities with **answers stripped** (`shapeTopic`/`shapeActivity`) + progress + assessment meta + next topic
4. `POST /topics/:topicId/activities/:activityId/answer` — server-side grading per activity type; records completion; enforces sequential unlock (403 if the previous topic's assessment isn't submitted)
5. `POST /topics/:topicId/assessment/start` — unlock-gated AI generation; reuses a pending (unsubmitted) set so an interrupted attempt resumes with the **same** questions; answers never leave the server
6. `POST /assessments/:assessmentId/submit` — grades against the stored set, returns results + explanations **after** submission; refuses duplicate submissions (400); stores best score/percent
7. `GET /progress` — module overview for dashboards
8. `POST /topics/:topicId/writing/feedback` — rubric-based AI guidance on a writing draft (length-guarded; guidance only, never a grade)

### Rules enforced
- **Topics unlock sequentially within an area:** topic N is open only after topic N−1's assessment is submitted; enforced on both activities (403) and assessment start (403). All areas are open from the start.
- **Assessment unlocks only when all activities in that topic are complete** (all 69 required — there are no optional activities).
- **Strict AI validation:** exact 6-question count, allowed types only (`mcq`, `true-false`, `fill-in-the-blank`, `sentence-correction`), exactly 4 distinct options for mcq/correction, correct answer must equal option text, `True`/`False` normalization, `____` required in fill-blanks, explanations required, deduplication by question text. If a clean set can't be produced the API returns a clear 502 `ai:true` "please try again" — **no fabricated or curated fallback**.
- **AI is never called from the frontend** and no keys/prompts are exposed. All generation happens in the backend via the shared `utils/aiQuestionGenerator` gateway (Groq, model `openai/gpt-oss-120b`, JSON mode). Only question text/options (no answers) are sent to the browser before submission.
- **Answer keys are server-side only:** topic/activity payloads and the pending assessment payload carry no answers; `correctAnswer`/explanations appear only in the post-submission results.

---

## 3. Frontend

| File | Purpose |
|---|---|
| `pages/class8/english/englishKit.jsx` | EM dark-galaxy theme tokens + shared components (`EmButton`, `EmChip`, `EmBar`, `EmOption`, `StateBadge`, `LoadingState`, `ErrorState`, `LockedState`, `ListenControl`). |
| `pages/class8/english/englishMissions.css` | Module styles. |
| `pages/class8/english/EnglishMissionsPage.jsx` | Overview: totals, continue-learning banner, 6 planet cards. |
| `pages/class8/english/EnglishAreaPage.jsx` | Area journey: locked/open/ready/completed chips + progress bar. |
| `pages/class8/english/EnglishTopicPage.jsx` | Lesson stepper (intro → visual lesson → practice → activities → recap), 6 activity widgets (mcq, true-false, fill-blank, match-pairs, sentence-order, error-find), `PracticeCard` with rubric, `AssessmentPanel` (locked / ready / completed states). |
| `pages/class8/english/EnglishAssessmentView.jsx` | Quiz runner + results with review and retake. |
| `services/englishMissionsApi.js` | Typed client with error envelope (`auth/notFound/locked/ai/network`) and generous AI-call timeouts. |
| `StudentRoutes.jsx`, `pages/careers/ClassLevelPage.jsx` | Routes + the dark "English Missions" card/tab on the Class 8 level page. |
| `utils/speech.js` (existing) | `speak`/`stopSpeaking` powers `ListenControl` for listening/speaking topics (real browser TTS). |

Sentence-order and match-pairs never receive the correct order/answer from the server; the pool is deterministically shuffled client-side and feedback shows explanations only.

---

## 4. Verification performed

- **Static:** `node --check` on every edited backend file; `npm run build` (frontend) **passes** — 1945 modules, only the pre-existing chunk-size advisory.
- **Unit:** `backend/scripts/_unitEnglishAi.js` — 6/6 good questions validated, 0 of 7 deliberately-bad questions accepted, JSON parse (array/object/fenced), fill-blank answer normalization. Pass.
- **Seed invariants:** `_checkEnglishSeed.js` — 6 areas / 23 topics / 69 activities, unique ids, required flags, per-area ordering, all activity shapes valid (incl. the known `letter-order` sentence-order topic). Pass.
- **End-to-end smoke:** `backend/scripts/_smokeEnglishMissions.js` — **49/49 passing** including: journey states + continue-learning; answer-key secrecy (banned-key tree walk on topic + assessment payloads); wrong/correct activity grading; all-activities-done gating; 403 sequential-unlock on activities; live AI generation (6/6, `source:"ai"`), pending-set reuse stability; DB-graded perfect submit → 100%; duplicate submit refused; retake = attempt 2 with a fresh set, all-wrong run → 0%, best 100% preserved; progress rollups + continue-learning advance; writing feedback (400 short / 200 guidance); cross-student access control (no progress leak, other student's assessment not submittable).
- **Live AI probe:** `_probeAiGeneration.js` demonstrates direct generation (6/6 in ~8 s, sensible type mix, topic-accurate content).

---

## 5. Honest limitations

- **Visual UI not browser-verified.** No browser client was available in this environment; the module is verified via production build + full API smoke, per-area code review, and server-side routing. Any layout quirk at specific viewport sizes would need a live-browser pass.
- **AI generation depends on the Groq key/network/rate limits.** Generating is verified working end-to-end in this environment, but it is live AI: at peak load Groq can return 429s (backoff handles it), and if the LLM can't produce a fully valid set after the retry budget, students see a clear "please try again" and nothing is fabricated. Generation can take up to ~1–2 minutes on a cold start (adaptive top-ups), which the UI copy and timeouts account for.
- **TTS requirement:** the listening/speaking sections use the browser's built-in speech synthesis — no audio files or microphone were added (per the no-fake-recording requirement).
- **`Maths` module untouched:** all Maths styling/layout remains as-is; English uses its own `em-` dark theme.

## 6. Files created/modified (inner repo)

**Created — backend:** `models/EnglishAssessment.js`, `models/StudentEnglishProgress.js`, `routes/englishMissionsRoutes.js`, `seeders/seedEnglishMissions.js`, `services/englishAiService.js`.
**Created — backend scripts (tests, keep):** `_checkEnglishSeed.js`, `_unitEnglishAi.js`, `_smokeEnglishMissions.js`, `_probeAiGeneration.js` (throwaway `_probeSeed.js`/`_probePractice.js` were deleted).
**Created — frontend:** `pages/class8/english/` (6 files), `services/englishMissionsApi.js`.
**Modified:** `backend/server.js` (mount + seed summary), `frontend/src/student/StudentRoutes.jsx`, `frontend/src/student/pages/careers/ClassLevelPage.jsx`.