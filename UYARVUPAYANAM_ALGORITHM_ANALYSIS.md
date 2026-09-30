# Uyarvu Payanam — Algorithm Analysis

> **Project:** Uyarvu Payanam (உயர்வு பயணம்) — "Ascending Journey"
> **Scope of this document:** Every algorithm, scoring formula, ranking method, filtering mechanism, decision rule, and AI integration that is **actually implemented** in the source code.
> **Basis:** Read-only analysis of the repository at `C:\Users\Priya Dharshini\Downloads\Uyarvupayanam_merged-main\Uyarvupayanam_merged-main`. Every claim below carries an exact `file:function` reference. Nothing has been inferred or fabricated.

---

## 0. How to read this document

The project contains **four fundamentally different kinds of "intelligence"**. They are kept strictly separate in this report, because the code keeps them strictly separate too:

| Kind | What it is | Example | Verdict on "is this ML?" |
|---|---|---|---|
| **Rule-based / deterministic scoring** | Closed-form arithmetic over question counts, weights and boolean graph lookups | `nextBestSkillEngine.decide()` 5-factor weighted sum | **No** — no training, no learned parameters |
| **LLM content generation** | External APIs (Anthropic / OpenAI / Grok / Groq / custom) that **write question and advice text only** | `utils/aiQuestionGenerator.js` | LLM *call*, but it never decides skill level or recommendations |
| **Legacy rule-based heuristics** | Older engines that are still mounted and live (onboarding) or dead code (academic recommendations) | `utils/recommendationEngine.js`, `services/academicRecommendationService.js` | **No** |
| **Library algorithms** | Third-party packages used for hashing, tokens, websockets, PDFs etc. | bcryptjs, jsonwebtoken, socket.io | External libraries, listed in §F |

**Executive finding (verified by grep over all of `backend/**/*.js` and `frontend/src/**/*.{js,jsx}`):**
> There is **no machine learning** in this repository. There is no `tensorflow`, `torch`, `sklearn`, `brain.js`, no model file, no training loop, no `.fit()`, no embedding lookup, no similarity index, and no collaborative filtering. Every "score", "rank", "status" and "recommendation" is a **deterministic function of counts, weights and set membership**. The constants live in `backend/config/ldnbs/*.js` and are override-able per admin via the `ldnbs_config` collection.

---

## 1. Algorithm inventory (one-page summary)

| # | Algorithm | Category | Status | File : function |
|---|---|---|---|---|
| 1 | Answer grading (string equality) | Rule-based | ✅ Live | `services/ldnbsOrchestrator.js:56` (inside `runAssessmentPipeline`) |
| 2 | Weight-normalised skill score (`weightedScore`) | Scoring | ✅ Live | `services/skillDiagnosisEngine.js:39-41` |
| 3 | 5-level skill-status classifier (grade-aware threshold ladder) | Classification (rule-based) | ✅ Live | `services/skillDiagnosisEngine.js:54-59` |
| 4 | Learning DNA dimension scoring (9 cognitive dimensions) | Scoring | ✅ Live | `services/learningDNAEngine.js:32-69` |
| 5 | Consistency score = 100 − mean absolute deviation | Scoring | ✅ Live | `services/learningDNAEngine.js:61-69` |
| 6 | Exposure-normalised interest scoring (8 categories) | Scoring | ✅ Live | `services/interestProfileEngine.js:33-81` |
| 7 | Skill↔interest alignment score | Matching | ✅ Live | `services/interestProfileEngine.js:86-91` |
| 8 | Gap detection (4 rules + 3 severity bands) | Rule-based detection | ✅ Live | `services/gapDetectionEngine.js:74-102` |
| 9 | Progress classification (improving/stable/declining/mastered) | Classification | ✅ Live | `services/progressAnalysisEngine.js:29-40` |
| 10 | Skill dependency graph: locks / unlocks / learning path (topological walk) | Graph algorithm | ✅ Live | `services/skillDependencyEngine.js:29-104` |
| 11 | Prerequisite importance + downstream-count recursion | Graph algorithm | ✅ Live | `services/nextBestSkillEngine.js:36-53` |
| 12 | **Next-Best-Skill weighted sum (0.35/0.25/0.20/0.10/0.10) + 3-level tie-break** | Ranking / decision | ✅ Live | `services/nextBestSkillEngine.js:85-120` |
| 13 | Recommendation-type classification (FOUNDATION/DEVELOPMENT/ADVANCEMENT/EXPLORATION) | Decision rule | ✅ Live | `services/nextBestSkillEngine.js:138-183` |
| 14 | Weight validation / renormalisation | Normalisation | ✅ Live | `config/ldnbs/recommendationWeights.js:69-79` |
| 15 | Effective-config merge (DB override over defaults) | Configuration | ✅ Live | `config/ldnbs/loadEffectiveConfig.js` |
| 16 | Completion-ratio gate (`MIN_COMPLETION_RATIO = 0.3`) | Validation gate | ✅ Live | `services/ldnbsOrchestrator.js:19,67-74` |
| 17 | LLM question-text generation (provider resolution, validation rails, retries, bank top-up) | LLM content generation | ✅ Live | `utils/aiQuestionGenerator.js`, `services/diagnosticQuestionService.js` |
| 18 | Legacy onboarding skill classification (Strong/Average/Needs Improvement) | Rule-based | ✅ Live (legacy) | `utils/recommendationEngine.js:19-23` |
| 19 | Academic banding + minute allocation + study-plan split (0.40/0.35/quiz) | Optimisation-ish heuristic | ⚠️ **Dead code (route not mounted)** | `services/academicRecommendationService.js:51-123,406-428,473-476` |
| 20 | Graduate career `matchScore` (50 base + 30·ratio + 20|5 domain + 10 interest, clamp 55–96) | Rule-based ranking | ⚠️ **Dead code** | `controllers/graduateController.js:121-152` |
| 21 | College content `relevanceScore` (+50/+40/+25/+25/+20/−30, threshold ≥20) | Rule-based ranking | ✅ Live | `services/collegeRelevanceEngine.js:68-147` |
| 22 | Reassessment question-mix allocation (weighted floors) | Allocation | ✅ Live | `services/schoolReassessmentService.js:126-129` |
| 23 | Grade/class label normalisation | Text normalisation | ✅ Live | `utils/normalizeClass.js:32-45` |
| 24 | Course list dedupe / normalisation (`dedupeCourses`) | Text normalisation | ✅ Live (frontend) | `utils/courseNormalizer.js`, `student/pages/colleges/CollegesPage.jsx` |
| 25 | College onboarding bands (85/65/45) and practice bands (90/75/60) | Rule-based bands | ✅ Live | `controllers/collegeOnboardingController.js:980-984`, `controllers/collegeStudyToolsController.js:235-240` |
| 26 | Assessment-summary banding (80/50) | Rule-based bands | ✅ Live | `services/ldnbsOrchestrator.js:179-190` |

**External-library algorithms (§F):** bcrypt hashing (password), JWT signing/verification, mongoose indexing, socket.io pub/sub, nodemailer transport, web-push (VAPID), pdf-parse/pdfjs-dist parsing, xlsx export, jspdf generation — none are "intelligent".

**Not implemented (§H):** any trained ML model, collaborative filtering, embeddings/semantic search, learning-rate optimisation, A/B testing of weights, or a live adaptive reassessment loop (the reassess endpoint writes questions but **no submit path exists**).

---

## 2. The core recommendation pipeline (LD‑NBSE)

The whole personalised-career pipeline runs in this order on **every** `POST /api/onboarding/ld/submit`:

```
client answers  →  orchestrator.runAssessmentPipeline()  →  result payload
     │                                 │
     │ ① grade answers                  │ ⑦ write 8 collections
     │ ② skillDiagnosisEngine          │ ⑧ build response payload
     │ ③ learningDNAEngine             │
     │ ④ interestProfileEngine         │
     │ ⑤ gapDetectionEngine            │
     │ ⑥ progressAnalysisEngine        │
     │ ⑦ skillDependencyEngine         │
     │ ⑧ nextBestSkillEngine.decide()  │
     │ ⑨ recommendationExplanationService
```

Entry point: `controllers/learningDiagnosisController.js:179-194` → `services/ldnbsOrchestrator.js:runAssessmentPipeline` (lines 31–220).

---

## 3. Algorithm ① — Answer grading

- **Category:** Rule-based validation.
- **Purpose:** Decide right/wrong for each answered question **without trusting the client and without re-querying the LLM**.
- **Where:** `backend/services/ldnbsOrchestrator.js:55-65`, uses `models/GeneratedAssessment.js` (`correctAnswer` persisted server-side at question-generation time, `controllers/learningDiagnosisController.js:121-138`).
- **Input:** list of `{ questionId, selectedAnswer }` from the client + the stored rows for `(studentId, sessionId)`.
- **Logic:**
  1. Load stored rows for the session. Answers whose `questionId` is not in the session are **silently dropped** (`if (!r) continue;`).
  2. `isCorrect = (r.correctAnswer === a.selectedAnswer)` — exact string equality. No partial credit, no fuzzy matching.
  3. Each graded answer is normalised to `{ skill, subskill, cognitiveType, difficulty, weight, isCorrect }`.
- **Output:** `answeredQuestions[]`, plus a `completionRatio = answered.length / rows.length`.
- **Why safe:** the answer key is written server-side *before* the set is shipped for display; `services/diagnosticQuestionService.js` and `toClientQuestion()` (`learningDiagnosisController.js:40-51`) strip `correctAnswer` from the client payload.
- **Limitations:** no partial credit; a typo counts as fully wrong; answers arriving twice in the payload would be counted twice (no de-dupe).
- **Complexity:** O(n) over rows.
- **Example:** stored row `{ correctAnswer: "B" }`, client sends `{ questionId: q1, selectedAnswer: "B" }` → correct. Sends `"C"` → wrong.

---

## 4. Algorithm ② — Weight-normalised skill score (`weightedScore`)

- **Category:** Scoring (weighted mean).
- **Purpose:** Turn raw correctness into a 0–100 subskill score in which harder/higher-weight questions count more.
- **Where:** `backend/services/skillDiagnosisEngine.js:38-61` (`diagnose`).
- **Inputs:** for one subskill: `correctCount`, `attemptedCount`, the graded answers with their `weight` (default 1).
- **Formulae (verbatim):**

```js
const rawScore = Math.round((correctCount / attemptedCount) * 100);
const totalWeight = qs.reduce((s, q) => s + (Number(q.weight) || 1), 0);
const weightedSum  = qs.reduce((s, q) => s + ((Number(q.weight) || 1) * (q.isCorrect ? 1 : 0)), 0);
const weightedScore = totalWeight ? Math.round((weightedSum / totalWeight) * 100) : 0;
```

- **Output:** `rawScore` (stored as `score`) and `weightedScore` — the latter drives everything downstream (status, gaps, next-best-skill).
- **Complexity:** O(k) per subskill.
- **Example:** 2 questions of weight 1 (1 correct) + 1 question of weight 3 (1 correct): `weightedScore = round((1+1+3*1)/(1+1+3) * 100) = round(5/5*100)=100`; rawScore = `round(2/3*100)=67`.

---

## 5. Algorithm ③ — Grade-aware skill-status classifier

- **Category:** Rule-based classification (threshold ladder).
- **Purpose:** Map a weighted score to one of 5 lifecycle statuses: `insufficient_evidence | foundation | developing | ready | advanced`.
- **Where:** `backend/services/skillDiagnosisEngine.js:54-59`; thresholds in `config/ldnbs/recommendationWeights.js:26-32`.
- **Threshold curves (verbatim):**

```js
status: {
  default:  { foundationUnder: 45, developingUnder: 70, readyUnder: 85, advancedAt: 85 },
  "Class 5":{ foundationUnder: 40, developingUnder: 65, readyUnder: 80, advancedAt: 80 },
  "Class 8":{ foundationUnder: 40, developingUnder: 65, readyUnder: 80, advancedAt: 80 },
  "Class 10":{foundationUnder: 45, developingUnder: 70, readyUnder: 85, advancedAt: 85 },
  "Class 12":{foundationUnder: 45, developingUnder: 70, readyUnder: 85, advancedAt: 85 },
}
```

- **Logic:**
```js
if (attemptedCount < min)                 status = "insufficient_evidence";   // min = max(1, minForJudgment)=2
else if (weightedScore >= advancedAt)     status = "advanced";
else if (weightedScore >= readyUnder)     status = "ready";
else if (weightedScore >= developingUnder)status = "developing";
else                                      status = "foundation";
```
- **Evidence gate:** `evidence: { minForJudgment: 2, highConfidenceAt: 3 }` (`recommendationWeights.js:20-23`); a subskill with < 2 attempts is never classified by score — it is `insufficient_evidence`. `confidence` = `attemptedCount >= 3 ? "high" : attemptedCount >= 2 ? "medium" : "low"`.
- **Why:** prevents a strong judgement from a single question (design comment `skillDiagnosisEngine.js:3-5`: "Never classifies a student based on a single question").
- **Complexity:** O(1). **Limitation:** a subskill with 2–19 weak questions and one strong question is still `advanced` if the weighted mean ≥ threshold — statuses are aggregate, not per-question.
- **Example (Class 10):** `weightedScore = 50`, attempts = 2 → 50 ≥ 45 (developingUnder? No: 50 < 70, ≥45) → `foundation`. `weightedScore = 88` → `advanced`.

---

## 6. Algorithm ④ — Learning DNA dimension scoring (the "DNA")

- **Category:** Scoring / profiling (weighted means per cognitive dimension).
- **Purpose:** Produce the 9-dimension "Learning DNA" shown on the result page (`RecommendationResultPage.jsx` renders `DIM_LABELS`).
- **Where:** `backend/services/learningDNAEngine.js:32-69` (`build`); mapping `config/ldnbs/learningDNAConfig.js:10-19`.
- **Cognitive-type → dimension map (verbatim):**

```js
const COGNITIVE_TO_DIMENSION = {
  recall: "understanding",  understanding: "understanding",
  application: "application", reasoning: "reasoning",
  problem_solving: "problemSolving", pattern_recognition: "patternRecognition",
  interpretation: "comprehension", communication: "communication",
};
```

- **Formulae:**
  - **accuracy** = weighted mean over *all* questions: `round(Σ(weight·correct) / Σweight · 100)`.
  - **each dimension d ≠ accuracy** = `round(Σ(weight·correct for questions of that dimension) / Σ(weight for those questions) · 100)`; **`null` when zero questions mapped** (frontend filters these).
  - **consistency** = `100 − mean(|dimScore − accuracy|)` computed over evidenced dimensions, clamped ≥ 0, only when total questions ≥ `minForJudgment`.
- **Confidence:** `CONFIDENCE_BY_EVIDENCE(n) = n >= 4 ? "high" : n >= 2 ? "medium" : "low"` (`learningDNAConfig.js:51`) — this is an *evidence-count* label, not a statistical confidence.
- **Complexity:** O(n) per dimension.
- **Example:** 19 questions, 78% weighted accuracy; `understanding` from 5 questions = 82 (high evidence), `patternRecognition` = `{ score: null, evidenceCount: 0, confidence: "low" }`. Consistency = `100 − mean(|82−78|,…)`.
- **Limitation (documented):** on a first 6-question submission most dimensions are `null`; `consistency` is `null` below the evidence minimum (`learningDNAEngine.js:65`).

---

## 7. Algorithm ⑤ — Exposure-normalised interest profile

- **Category:** Scoring (normalised hit counting).
- **Purpose:** Convert up to 4 interest answers into 0–100 scores for 8 categories: `technology, science, mathematics, creative, design, communication, business, social`.
- **Where:** `backend/services/interestProfileEngine.js:33-81` (`compute`); interest questions in `config/ldnbs/skillTaxonomyConfig.js:290-335` (`INTEREST_BANK`, IDs `interest_1..interest_4`; every option tagged with 1–2 categories).
- **Formula (verbatim):**

```js
for (const c of CATEGORIES) interests[c] = 50;                       // neutral default
for (const c of CATEGORIES) {
  const possible = INTEREST_BANK.filter(q =>
      answers.some(a => a.questionId === q.questionId) &&
      q.options.some(o => o.categories.includes(c))).length;
  interests[c] = possible ? Math.round((hitCount[c] / possible) * 100) : 50;
}
```

- **Key property — exposure normalisation:** the denominator is only the set of questions the student *actually answered* that could express that category, so a category reachable from a single question can only ever be 0 or 100.
- **Fallback:** if no `interestAnswers` are sent, `compute` uses the legacy *form* fields via `LEGACY_INTEREST_MAP` (`careerInterest`, `preferredCourseCategory`, `preferredStream`, `stream` — `interestProfileEngine.js:73-79`); with nothing at all → all 50 (`source: "neutral"`).
- **Client confidentiality:** `sanitizeInterestBank()` strips `categories` from the payload the browser receives (`learningDiagnosisController.js:53-60`).
- **Complexity:** O(C × Q × O).
- **Example:** student answers `interest_1` (option tagged `technology`) and `interest_2` (tagged `technology`); `technology = 100`, others unaffected → 50 unless the answered option expressed them.

---

## 8. Algorithm ⑦ — Skill↔interest alignment

- **Category:** Matching / lookup.
- **Where:** `backend/services/interestProfileEngine.js:86-91` (`interestScoreForSkill`).
- **Formula (verbatim):**

```js
const cats = taxonomy.SKILL_TO_INTEREST[skill] || [];
if (!cats.length) return 0.5;
const vals = cats.map((c) => (interests[c] ?? 50) / 100);
return vals.reduce((a, b) => a + b, 0) / vals.length;
```

- **Output:** `[0,1]`. Unmapped skills (e.g. `General Knowledge`, `Creativity`) get the neutral 0.5 — that 10% weight is inert for them (documented limitation).
- **Complexity:** O(1). **Example:** `Mathematics → ["mathematics"]`, interests.mathematics = 75 → 0.75.

---

## 9. Algorithm ⑧ — Gap detection (4 rules, 3 severity bands)

- **Category:** Rule-based anomaly detection.
- **Where:** `backend/services/gapDetectionEngine.js:74-102` (`detect`); thresholds `recommendationWeights.js:33-45`.
- **Evidence gate (line 41):** a gap is never emitted for a dimension with `< minForJudgment` evidence (except `transfer`, which uses difficulty spreads).
- **The 4 rules (verbatim):**
```js
strong = (name) => dimScore(name) !== null && dimScore(name) >= 60;
// application_gap: understanding strong && (understanding − application ≥ 25 OR application < 40)
// reasoning_gap:   understanding strong && (understanding − reasoning   ≥ 25 OR reasoning   < 40)
// transfer_gap:    any subskill with easy ≥ 70 && easy − hard ≥ 30
// expression_gap:  max(reasoning, patternRecognition) − communication ≥ 25 OR communication < 40
```
- **Severity:** `delta >= 40 ? "high" : delta >= dimGapMin(25) ? "medium" : "low"`.
- **Output:** `[{ type, label, relatedSkills, severity, description }]` with `relatedSkills` deduped and sliced to 6 (`gapDetectionEngine.js:68`).
- ⚠️ **Known defect (line 102):** the "sort" is `(a.severity==='high'?-1:0)-(b.severity==='high'?-1:0)` which returns 0 for (medium, low) — **medium and low gaps are never ranked relative to each other**. The frontend `RecommendationResultPage.jsx:112` `maxGap` comparator has the identical bug.
- **Complexity:** O(dimensions × subskills). **Example:** understanding=78, application=48 → delta 30 ≥ 25 → `application_gap`, severity medium.

---

## 10. Algorithm ⑨ — Progress classification

- **Category:** Time-series classification (rule-based).
- **Where:** `backend/services/progressAnalysisEngine.js:29-40`; thresholds `improveBy: 10, declineBy: -10` (`recommendationWeights.js:33`).
- **Logic (verbatim):**
```js
change = round((weightedScore − prev.score) * 10) / 10;
if (change >= 10)            "improving"
else if (change <= -10)      "declining"
else if (status === "advanced" && prev.score >= 85) "mastered"     // uses thresholds.status.default always
else                         "stable"
```
- ⚠️ **Two documented subtleties:** `prev` is the **earliest** `skill_progress_history` row (the baseline), not the immediately-previous cycle (`progressAnalysisEngine.js:20-24`); and the `mastered` check always uses the default curve's `readyUnder: 85`, ignoring the grade curve (`:18`).
- **Missing history →** `{ previousScore: null, change: null, classification: "insufficient_data" }`.
- **Complexity:** O(h) per subskill. **Example:** baseline 40 → now 55 (change +15) → `improving`.

---

## 11. Algorithm ⑩ — Skill dependency graph (locks, unlocks, learning path)

- **Category:** Graph algorithm (set-based, topological ordering with a cycle guard).
- **Where:** `backend/services/skillDependencyEngine.js:29-104`; edges seeded from `config/ldnbs/skillTaxonomyConfig.js` `DEPENDENCIES` and admin `SkillDependency` docs; admin editable via `PUT /api/onboarding/ld/admin/dependencies`.
- **What it does:**
  - **lockedSkills:** for every weak subskill, its prerequisites that are not in `READY_STATUSES = {ready, advanced}` are locked with `reason`.
  - **unlockedSkills:** prerequisites now in `{ready, advanced}`.
  - **learningPath:** a forward topological walk from the chosen focus, appending milestones `{step, skill, subskill, milestone}` and stepping out of a subskill once it is `ready`/`advanced`; a visited-set **prevents infinite loops** on cyclic config.
- **Complexity:** O(V + E) per walk (each node visited once per traversal via the `seen` set).
- **Example:** `percentages` has prereq `algebraicThinking`; if `algebraicThinking` is `foundation`, then `percentages` is `locked` until it reaches `ready`.

---

## 12. Algorithm ⑪ — Prerequisite importance + downstream count

- **Category:** Graph centrality heuristic.
- **Where:** `backend/services/nextBestSkillEngine.js:36-53`.
- **Logic (verbatim):**
```js
const downstreamCount = downstream.get(key) || 0;      // recursive count, per-root seen set
const isBlocking = blockingPrereq.has(key);
const prerequisiteImportance = Math.min(1, downstreamCount * 0.5 + (isBlocking ? 0.5 : 0));
```
- `downstreamCount` is computed by a **recursive walk with a per-root `seen` set** (lines 41–51) so each node is visited at most once per traversal root. A subskill that unblocks many others scores higher (max 1.0).
- **Complexity:** O(E) per root. **Example:** `percentages` unlocks 2 subskills and blocks 1 weak subskill → `prerequisiteImportance = min(1, 2*0.5 + 0.5) = 1.0`.

---

## 13. Algorithm ⑫ — ⭐ THE decision: Next-Best-Skill weighted score + tie-break

This is the single most important algorithm in the project — the thing that picks the student's **"next best skill to learn"**.

- **Category:** Multi-criteria decision / ranking.
- **Where:** `backend/services/nextBestSkillEngine.js:85-120` (`decide`).
- **Weights (config, `backend/config/ldnbs/recommendationWeights.js:9-16`, sum = 1.00):**

```js
const DEFAULT_WEIGHTS = {
  skillGap: 0.35,              // how far below mastery the skill is
  prerequisiteImportance: 0.25,// how many downstream skills it unblocks
  cognitiveGap: 0.20,          // whether a detected cognitive gap involves it
  interestAlignment: 0.10,     // how well it matches the student's interests
  recentProgress: 0.10,        // momentum classification
};
```

- **Candidate set (filtering, lines 58-78):** only subskills whose status is `foundation` or `developing` with `attemptedCount >= 1`, **plus** the blocking prerequisites of weak subskills (which may be `insufficient_evidence`). `ready`, `advanced` and ordinary `insufficient_evidence` are excluded from candidacy.
- **Component formulae (verbatim):**

```js
const skillGap = (100 - (p.weightedScore || 0)) / 100;
const prerequisiteImportance = Math.min(1, downstreamCount * 0.5 + (isBlocking ? 0.5 : 0));
let cognitiveGap = 0;   // binary: 1 if a detected gap's relatedSkills contains "<skill> · <subskill>"
const interestAlignment = interestScoreForSkill(p.skill, interests);   // [0,1], 0.5 if unmapped
const recentProgress = { improving: 1, stable: 0.6, declining: 0.8, mastered: 0.2, insufficient_data: 0.5 }[prev] ?? 0.5;

c.score = skillGap * weights.skillGap
        + prerequisiteImportance * weights.prerequisiteImportance
        + cognitiveGap * weights.cognitiveGap
        + interestAlignment * weights.interestAlignment
        + recentProgress * weights.recentProgress;
```

- **Range:** every component is in [0,1] and weights sum to 1 → **score ∈ [0,1]**.
- **Tie-breaking (3 levels, deterministic — lines 115-120):**

```js
candidates.sort((a, b) =>
    b.score - a.score ||                                        // 1. highest score
    (a.profile.weightedScore || 0) - (b.profile.weightedScore || 0) ||   // 2. weakest skill first
    PKEY(a.profile.skill, a.profile.subskill).localeCompare(PKEY(...))); // 3. alphabetical total order
```

- **Output:** `chosen` candidate + `components` per candidate (the full audit trail is stored in `explanation.decision`: `scoresByFactor`, `weightsUsed`, `tieBreakNote`).
- **Complexity:** O(C·E) candidate scoring + O(C log C) sort (C = candidates, usually ≤ 7).
- **Worked example (realistic Class 10 data):**
  - Candidate `Mathematics · percentage`: `weightedScore` 50 → `skillGap = 0.50`; unblocks 2, blocks 1 → `prerequisiteImportance = 1.0`; flagged by `transfer_gap` → `cognitiveGap = 1`; interests.mathematics = 75 → `interestAlignment = 0.75`; improving → `recentProgress = 1`.
    **score = 0.50·0.35 + 1.0·0.25 + 1·0.20 + 0.75·0.10 + 1·0.10 = 0.175 + 0.25 + 0.20 + 0.075 + 0.10 = 0.800**
  - Candidate `English · grammar`: `skillGap = 0.35`; no downstream → `0.25*0` … `prereq = 0`; no gap → 0; interest 0.6 → 0.06; declining → 0.08. **score = 0.1225 + 0 + 0 + 0.06 + 0.08 = 0.2625**.
  - Winner: `Mathematics · percentage` → `recommendationType FOUNDATION` (status `foundation`), target `ready`.

---

## 14. Algorithm ⑬ — Recommendation-type classification

- **Category:** Decision rule.
- **Where:** `backend/services/nextBestSkillEngine.js:181-183` and the two no-candidate branches (`:138-177`).
- **Rules:**
```js
type = (kind === "prereq" || p.status === "foundation") ? "FOUNDATION"
     : p.status === "ready" ? "ADVANCEMENT" : "DEVELOPMENT";
```
- **No-candidate branches:**
  - **All subskills `insufficient_evidence`** → `DEVELOPMENT`, focus = most-attempted subskill, `reasonCode: "insufficient_evidence"`, `confidence: "low"`, effort = "one short practice session, then reassess".
  - **No weak subskills (all strong)** → `EXPLORATION`, focus = strongest skill, `reasonCode: "exploration"`, difficulty `hard`, weekly challenge effort.
  - Zero profiles at all → EXPLORATION branch with default `{skill:"Mathematics", subskill:"exploration"}`.
- `targetStatus`: `foundation→ready`, `ready→advanced`, else `ready`. Effort/difficulty come from `cfg.effortByStatus[p.status]`; `successCondition` interpolates `successTarget` (default 70) into `cfg.successMessages[p.status]`.

---

## 15. Algorithm ⑭ — Weight validation / renormalisation (`validateWeights`)

- **Where:** `backend/config/ldnbs/recommendationWeights.js:69-79`.
- **Purpose:** Admin-edited weights can never brick the engine.
- **Logic:** merge admin over defaults → sum the five keys → if `|sum − 1| > 0.0001`, divide each weight by the sum (renormalise). Missing keys are defaulted first (spread), so `c.score` stays in [0,1].
- **Example:** admin sets `{skillGap: 0.9, cognitiveGap: 0.9}` → merged sum 1.0+0.2+0.1+0.1+0.9 = 2.3 → each weight ÷ 2.3 → `0.3913 / 0.087 / 0.0435 / 0.0435 / 0.3913`.

---

## 16. Algorithm ⑮ — Effective-config merge (`loadEffectiveConfig`)

- **Where:** `backend/config/ldnbs/loadEffectiveConfig.js` (full file, 37 lines).
- **Logic:** deep-clone defaults → if `LdnbsConfig.findOne({key:"default"})` exists, apply `weights` (validated/renormalised), shallow-spread `thresholds`/`effortByStatus`/`successMessages`, replace `blueprintOverrides` for the given grade. **DB down → pure defaults (catch), never throws.**
- ⚠️ **Documented footgun:** because `thresholds` is *shallow-merged at the top key*, an admin that replaces `thresholds.status` with `{"Class 5": {...}}` **wipes `default` and every other grade**, silently reverting all other grades to the hardcoded fallback `{45,70,85,85}` in `skillDiagnosisEngine.js:20`. Admin `PUT /api/onboarding/ld/admin/config` stores `thresholds` **raw, unvalidated** (`learningDiagnosisController.js:405-422`).
- **Called twice per LD submit (`learningDiagnosisController.js:107,173`) + once per reassess — no caching.**

---

## 17. Algorithm ⑯ — Completion-ratio gate

- **Where:** `backend/services/ldnbsOrchestrator.js:19,67-74`.
- **Rule:** `completionRatio = answered / totalRows; if (< 0.3) return { ok:false, code:"INCOMPLETE_ASSESSMENT" }` → controller maps to **HTTP 422** (`learningDiagnosisController.js:196-199`). No rows are written; the session survives for resubmission.
- **Example:** Class 5 blueprint = 20 questions → minimum viable submission = 6 answered. (Documented tension: 6/20 is far below the `minForJudgment = 2`-per-subskill design intent → most subskills come back `insufficient_evidence`.)

---

## 18. Section B — LLM question generation (the AI integration)

- **Category:** External LLM content generation (Anthropic / OpenAI / Grok / Groq / custom OpenAI-compatible). **Decision-making is explicitly excluded.**
- **Design contract (verbatim comments in code):**
  - `services/diagnosticQuestionService.js:5-8`: *"Groq/LLM role is STRICTLY content creation… The LLM NEVER decides skill level, weakness or next best skill."*
  - `controllers/learningDiagnosisController.js:5-7`: *"Groq generates question CONTENT only. Everything about skill level, gaps, prerequisites and the next best skill is decided by the deterministic engines."*
- **Provider resolution (precedence 1→5), `backend/utils/aiQuestionGenerator.js:30-71`:**

| # | Trigger env | Endpoint | Default model |
|---|---|---|---|
| 1 | `AI_QUESTIONS_API_KEY` + `AI_QUESTIONS_BASE_URL` | `${base}/chat/completions` | `gpt-4o-mini` |
| 2 | `ANTHROPIC_API_KEY` | `https://api.anthropic.com/v1/messages` | `claude-sonnet-4-5` |
| 3 | `OPENAI_API_KEY` | `https://api.openai.com/v1` | `gpt-4o-mini` |
| 4 | `GROK_API_KEY` | `https://api.x.ai/v1` | `grok-2-latest` |
| 5 | `GROQ_API_KEY` | `https://api.groq.com/openai/v1` | `openai/gpt-oss-120b` (header comment claims `llama-3.3-70b-versatile` — mismatch) |
| — | none | `resolveProvider()` → null → **static question bank** | — |

- **Pipeline (`diagnosticQuestionService.js`):**
  1. Take the blueprint rows for the grade (`getBlueprintRows`, honoring `blueprintOverrides[grade]` if present).
  2. Request up to `MAX_QUESTIONS_PER_CALL = 5` per call, with per-skill concurrency `CONCURRENCY = 2`, timeout `AI_QUESTIONS_TIMEOUT_MS` (default 25000), `MAX_RETRIES = 2`.
  3. **Validate every generated question**: exactly 4 options, no empties, no duplicates (`new Set().size === 4`), and `correct_answer` must be an exact member of options. Anything invalid is dropped (`aiQuestionGenerator.js:96-118`).
  4. **Server overrides:** `subskill` is always forced back to the blueprint spec value ("We never let the LLM move a question outside the requested blueprint" — `diagnosticQuestionService.js:51`); `weight = Number(spec.weight) || 1`; out-of-vocabulary `cognitive_type`/`difficulty` fall back to the spec.
  5. **Bank top-up (mixed mode):** if the LLM returns fewer rows than requested, the missing tail is filled from the static bank so the **count** is preserved → `minForJudgment = 2` per core subskill can be met (`diagnosticQuestionService.js:149-161`). Stored `source` normalised to `"ai"` for both `ai` and `mixed` (`learningDiagnosisController.js:117`).
  6. Persist rows (with server-side `correctAnswer` key) into `generated_assessments` *before* shipping the sanitised client payload (`toClientQuestion()` strips `correctAnswer`, `interestQuestion` strips `categories`).
- **Retry/backoff:** JSON-mode retry-without-JSON-mode on HTTP 400 / `json_validate_failed`; 429/rate-limit backoff `600 * (attempt+1)` ms.
- **Guarantees:** the LLM can never grade — grading is always `r.correctAnswer === a.selectedAnswer` against the stored key; non-session question ids are dropped (`ldnbsOrchestrator.js:55`).
- **Other direct LLM call sites** (advice/text, not decisions): `controllers/grokAssessmentController.js` (question/scoring text), `controllers/collegeStudyToolsController.js:235-262`, `controllers/collegeOnboardingController.js:890-1067`, `controllers/graduateAdvisorController.js`. Numeric bands around them stay hardcoded.

---

## 19. Section C — Legacy recommendation engine (still live for school students)

- **Because** `POST /api/onboarding/recommendations/user/:userId`, `GET /api/onboarding/recommendations/user/:userId` and `POST /api/onboarding/retake/:userId` are mounted and used by the dashboard + result page, the **legacy** pipeline remains live in parallel to LD‑NBSE.
- **Where:** `backend/utils/recommendationEngine.js` (104 lines), `backend/controllers/onboardingController.js`, `backend/models/Recommendation.js`.
- **Algorithms inside it:**
  - `classifySkillLevel(pct)`: `>= 80 → "Strong"`, `>= 50 → "Average"`, else `"Needs Improvement"` (`recommendationEngine.js:19-23`).
  - Per-skill percentage: `round(min(correct,total)/total * 100)`, 0 if total is 0.
  - `overallScore` = `round(mean(breakdown.percentage))`.
  - `onboardingController` computes `scorePercentage`, `strongSkills`/`weakSkills` (`75`/`50` cut-offs in classic path), `recommendedSkills`, `suggestedActivities`, `learningGuidelines`, `recommendedExams` — persisted into `Recommendation` (`models/Recommendation.js`).
- **Backing seed data:** `backend/seeders/seedRecommendationRules.js` seeds `recommendation_rules` (10 skills × 3 levels, grade `"All"`) + `guideline_rules` (4 rows incl. a `"Fallback"`). **LD‑NBSE reads none of these.**
- ⚠️ The student dashboard's recommendations block reads the *legacy* `Recommendation` model (`dashboardSummaryController.js:48`) — **LD and dashboard can disagree.**

---

## 20. Section D — Other scoring subsystems

### D1. Academic recommendation service (⚠️ dead code — route never mounted)
- `backend/services/academicRecommendationService.js` (565 lines) + `backend/controllers/recommendationController.js` + `backend/routes/recommendationRoutes.js`.
- **`recommendationRoutes.js:3` claims "Mounted at /api/recommendations in server.js" — this is FALSE.** `server.js:192-248` never mounts `/api/recommendations`, so **all of this is unreachable over HTTP** (documented in Phase 9 of the technical report).
- Algorithms it *would* run if mounted:
  - **Bands:** `{max:40 → Critical w4}, {60 → Weak w3}, {75 → Needs Practice w2}, {90 → Good w1}, {∞ → Excellent w0}` — first `pct < max` wins.
  - **`allocateMinutes`:** `floor(total × w/Σw)` per subject, remainder distributed to highest-weight subjects round-robin.
  - **Study-plan split:** `REVISION 0.40 / PRACTICE 0.35 / QUIZ = remainder` (`:75-77,473-476`).
  - Weak topics: `pct < 75`, weakest-first sort; strong: `pct ≥ 75`, desc.

### D2. College content relevance engine (✅ live college portal)
- `backend/services/collegeRelevanceEngine.js:68-147` — `relevanceScore`:
  - `+50` specification match, `+40` domain match, `+25` degree match, `+25` career match, `+20` skill overlap, **−30** when beginner content overlaps a demonstrated strength; hard-reject if no positive relationship at all; clamp to [0,100]; **`isEligible: score ≥ 20`**; results sorted desc by `relevanceScore`.

### D3. Graduate career matching (⚠️ dead code — `/api/graduate` never mounted)
- `backend/controllers/graduateController.js:121-152` — `matchScore = clamp(50 + round(30·ratio) + (20|5 · domain) + 10·interest, 55, 96)`; sort desc. Unreachable over HTTP.

### D4. College onboarding & practice bands (✅ live)
- `85 / 65 / 45` bands (`collegeOnboardingController.js:980-984`) and `90 / 75 / 60` bands (`collegeStudyToolsController.js:235-240`) classify college-student practice performance.

### D5. Assessment-summary banding (LD side effect)
- `services/ldnbsOrchestrator.js:179-190`: `overallLevel = accuracy ≥ 80 ? "Strong" : ≥ 50 ? "Average" : "Needs Improvement"` — a third, independent banding system from `classifyBand` and `classifySkillLevel`.

### D6. Reassessment question mix
- `services/schoolReassessmentService.js:126-129`: `weights = targets.map((_,i)=>targets.length−i)`; `counts = floor(total × w/Σw)`. ⚠️ The **LD reassess endpoint** (`POST /api/onboarding/ld/reassess`) generates 4 questions but has **no submit path** — the adaptive loop is write-only (`learningDiagnosisController.js:186` hardcodes `mode:"onboarding"`).

---

## 21. Section E — Utility algorithms

| Utility | Formula / logic | File |
|---|---|---|
| Grade normalisation | strip non-digits, keep `5\|8\|10\|12`, relabel `"Class N"`; null for 6/7/9/11/15/college/graduate | `utils/normalizeClass.js:32-45` |
| Course dedupe / display-name | `dedupeCourses` keyed on name/code; `extractCoursesResponse`, `matchesCourseLevel` | `frontend/src/utils/courseNormalizer.js`, `student/pages/courses/courseCatalog.js` |
| Legacy subject list | split + trim (`normalizeSubjectList`) | `utils/studentProfileSync.js:42` |
| Interest question sanitisation | strip `categories` before client delivery | `learningDiagnosisController.js:53-60` |
| Admin config merge | shallow top-key spread with renormalised weights | `config/ldnbs/loadEffectiveConfig.js` |
| Blueprint selection | `blueprintOverrides[grade]` else `taxonomy.getBlueprint(grade)`; unknown grade → 404 | `learningDiagnosisController.js:62-66,109-111` |

---

## 22. Section F — External-library algorithms (used, not invented here)

| Library | Algorithm | Where used | Role in the project |
|---|---|---|---|
| `bcryptjs` | salted password hashing (12 rounds configured in `authController`) | `backend/controllers/authController.js` | Secures user passwords |
| `jsonwebtoken` | HS256 JWT sign/verify | auth middleware (`verifyStudent`, `verifyAdmin`, `verifyOwnership`) | Session tokens |
| `mongoose` | B-tree indexes, unique constraints, aggregation | all models; `User`, `StudentSkillProfile` unique compound indexes | Data integrity + lookups |
| `socket.io` / `socket.io-client` | pub/sub room-based eventing | `backend/server.js` + `admin/context/NotificationContext.jsx` | Live admin notifications (`admin_notification_created`, …) |
| `web-push` | VAPID-signed push notifications | notification controller/service | Browser push alerts |
| `nodemailer` | SMTP transport | `backend/config/mailer.js`, OTP emails | Email OTP / password reset |
| `multer` + `pdf-parse`/`pdfjs-dist` | multipart upload + PDF text extraction | seat-matrix + college-course importers | Parsing cut-off PDFs |
| `xlsx` / `csvtojson` / `csv-parser` | spreadsheet parsing | bulk course/scholarship/college importers | Admin data import |
| `jspdf` (+autotable) | client-side PDF generation | `admin/pages/admin/ReportsPage.jsx`, certificate PDFs | Report export |
| `cheerio` | HTML scraping | college website course scans (`collegeCourseController`) | Course discovery |
| `recharts` | chart rendering | `StrengthRadar.jsx`, admin `ReportsPage.jsx` | Visualisation (not analytics) |

None of the above perform learning; they are deterministic packages.

---

## 23. Section G — Complexity summary

| Algorithm | Time | Space | Practical size |
|---|---|---|---|
| Answer grading | O(n) | O(n) | ≤ 20 questions |
| `weightedScore` per subskill | O(k) | O(1) | k ≤ 5 questions |
| Status classifier | O(1) | O(1) | — |
| DNA dimensions | O(n) | O(d) | 9 dims |
| Interest scoring | O(C·Q·O) | O(C) | 8 cats × 4 q × 4 opt |
| Gap detection | O(dims·subs) | O(1) | ~10 subskills |
| Progress analysis | O(h) | O(h) | history grows per cycle |
| Dependency walk / learning path | O(V+E) | O(V) | graph ~ 30 nodes |
| **Next-best-skill** | O(C·E + C log C) | O(C) | C ≤ ~7 candidates |
| Weight renormalisation | O(1) | O(1) | — |
| LLM generation | O(S × calls) with network cost | O(1) | ≤ 12 skills × 5 q |

All decision engines comfortably run in milliseconds server-side; the only slow step is the LLM question-generation call (≤ 25 s timeout per call, concurrency 2).

---

## 24. Section H — What is deliberately NOT implemented

Verified by full-repo grep and code reading:

1. **No machine learning** — no training, no inference, no learned parameters, no embeddings, no similarity/collaborative filtering (see §0). "Confidence" is an evidence-count label (`CONFIDENCE_BY_EVIDENCE`), not a statistical confidence.
2. **No adaptive reassessment loop** — `POST /api/onboarding/ld/reassess` writes `generated_assessments` rows with `mode:"reassess"` but the orchestrator is hardcoded to `mode:"onboarding"` and there is no reassess submit endpoint. The loop is write-only (`learningDiagnosisController.js:186,268-286`; defect #7).
3. **No `USE_LDNA` / `LD_ENABLED` / `ldStatus` flags** exist anywhere — verified by grep. LD lifecycle booleans on `User` are only `onboardingCompleted` / `recommendationGenerated`.
4. **No demo/mock LD profiles** — `seedLdnbs.js` seeds only knowledge (taxonomy/dependencies/config), never student DNA. No `NODE_ENV` fudge branches in the engines.
5. **Unmounted scoring systems** — academic recommendation service and graduate career matching are implemented but unreachable over HTTP (defects #1).
6. **No A/B testing, no experiment framework, no feedback loop** that would tune the 0.35/0.25/0.20/0.10/0.10 weights from outcomes.

---

## 25. Defect list that affects algorithms (with file:line)

| # | Severity | Algorithm impact | Location |
|---|---|---|---|
| 1 | High | Graduate + academic scoring unreachable → those "algorithms" never run | `server.js:192-248`, `recommendationRoutes.js:3` |
| 2 | High | LD POSTs carry no auth; `studentId` trusted from body → anyone can pollute another student's LD | `routes/onboardingRoutes.js:82-84`, `utils/studentProfileSync.js:20-26` |
| 3 | High | Admin `thresholds` stored raw; missing `default` key silently reverts grades to `{45,70,85,85}` | `learningDiagnosisController.js:410` |
| 4 | Medium | `decision.dna` referenced but never written → empty `{dimensions:{}}` DNA | `learningDiagnosisController.js:332` |
| 5 | Medium | Gap severity sort returns 0 for (medium, low) → gaps not truly ranked; same bug mirrored in frontend | `gapDetectionEngine.js:102`, `RecommendationResultPage.jsx:112` |
| 6 | Medium | Retake deletes legacy collections but not LD collections → cycle keeps incrementing, history baseline kept | `onboardingController.js:453-457` |
| 7 | Medium | Reassess loop write-only (see §24.2) | `learningDiagnosisController.js:186,268-286` |
| 8 | Medium | Dashboard reads legacy `Recommendation`, not `LearningRecommendation` → LD and dashboard can disagree | `dashboardSummaryController.js:48` |
| 9 | Low | `getDependenciesFlat` not exported → admin defaults show `{}` | `learningDiagnosisController.js:383` |
| 10 | Low | `/api/assessment` mounted twice; first router shadows second on colliding paths | `server.js:209,213` |
| 11 | Low | `mastered` check always uses default curve 85; `prev` = earliest history row not previous cycle | `progressAnalysisEngine.js:18,20-24` |
| 12 | Low | Groq default model comment/code mismatch | `aiQuestionGenerator.js:8,66` |
| 13 | Low | `MIN_COMPLETION_RATIO 0.3` permits 6/20 submissions → mostly `insufficient_evidence` | `ldnbsOrchestrator.js:19` |
| 14 | Low | Unmapped skills get neutral 0.5 interest → 10% weight inert | `interestProfileEngine.js:88` |

---

## 26. Verification notes

- All formulas above were quoted from the source (read-only) between the dates of this analysis; no code was modified.
- "Unmounted route" claims were verified against `backend/server.js` mount table (lines 192–248) plus frontend service call-sites.
- "No ML" claim verified by searching for tensorflow/torch/sklearn/brain.js/fit/embedding/similarity terms across `backend/**` and `frontend/src/**`.

*End of Algorithm Analysis. Companion documents: `UYARVUPAYANAM_TECHNICAL_DOCUMENTATION.md` (system report), `UYARVUPAYANAM_MODULE_WORKFLOW.md` (module-wise workflows + Mermaid), `UYARVUPAYANAM_VIVA_QUESTIONS.md` (viva prep).*