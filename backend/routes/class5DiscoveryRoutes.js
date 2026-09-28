const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const { rateLimit } = require("../middleware/rateLimit");
const c = require("../controllers/class5DiscoveryController");

// ── Discover Me ─────────────────────────────────────────────────────────
router.get("/quiz/questions", verifyStudent, c.getQuizQuestions);
router.post(
  "/quiz/submit",
  verifyStudent,
  rateLimit({ keyFn: (req) => `quiz:${req.student._id}`, max: 5, windowMs: 60000 }),
  c.submitQuiz
);
router.get("/students/:id/skill-profile", verifyStudent, c.getSkillProfile);
router.get("/challenges/current", verifyStudent, c.getCurrentChallenge);
router.post(
  "/challenges/:id/submit",
  verifyStudent,
  rateLimit({ keyFn: (req) => `challenge:${req.student._id}`, max: 3, windowMs: 3600000 }),
  c.submitChallenge
);

// ── Discover Me · quest cards (question bank, JSON-driven) ─────────────
router.get("/discover/progress", verifyStudent, c.getDiscoverProgress);
router.get("/discover/questions", verifyStudent, c.getNextQuestions);
router.post(
  "/discover/questions/complete",
  verifyStudent,
  rateLimit({ keyFn: (req) => `discover:${req.student._id}`, max: 30, windowMs: 60000 }),
  c.completeQuestion
);

// ── Skill Quests ────────────────────────────────────────────────────────
router.get("/games", verifyStudent, c.listGames);
router.get("/games/:id", verifyStudent, c.getGame);
router.post(
  "/games/:id/attempt",
  verifyStudent,
  rateLimit({ keyFn: (req) => `game:${req.student._id}`, max: 8, windowMs: 60000 }),
  c.submitGameAttempt
);

// ── Squad (collaborative, never ranked) ─────────────────────────────────
router.get("/expeditions/current", verifyStudent, c.getExpedition);
router.post(
  "/expeditions/:id/contribute",
  verifyStudent,
  rateLimit({ keyFn: (req) => `expedition:${req.student._id}`, max: 1, windowMs: 60000 }),
  c.contributeToExpedition
);
router.get("/spotlight/current", verifyStudent, c.getSpotlight);
router.get("/nudges", verifyStudent, c.getNudges);

// ── Real World ──────────────────────────────────────────────────────────
router.get("/videos", verifyStudent, c.listVideos);
router.get("/events/upcoming", verifyStudent, c.listEvents);
router.post("/events/:id/attend", verifyStudent, c.attendEvent);
router.post("/future-map/generate", verifyStudent, c.generateFutureMap);

// ── Trophy Room ─────────────────────────────────────────────────────────
router.get("/students/:id/streak", verifyStudent, c.getStreak);
router.get("/seasonal-events/active", verifyStudent, c.getSeasonalEvents);
router.get("/students/:id/badges", verifyStudent, c.getBadges);
router.get("/students/:id/certificates", verifyStudent, c.getCertificates);
router.get("/certificates/:id/pdf", verifyStudent, c.getCertificatePdf);
router.post("/certificates/badge", verifyStudent, c.generateBadgeCertificate);

// ── Parent / teacher read-only snapshot (public, like the existing passport route)
router.get("/parent/career-snapshot", c.getParentSnapshot);

module.exports = router;