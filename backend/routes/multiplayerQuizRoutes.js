const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  acceptInviteAndCreateSession,
  getSession,
  setPlayerReady,
  submitAnswer,
  getSessionResults,
  getReviewData
} = require("../controllers/multiplayerQuizController");

// Accept invite & create session
router.post("/accept-invite/:inviteId", verifyStudent, acceptInviteAndCreateSession);

// Session endpoints
router.get("/:sessionId", verifyStudent, getSession);
router.post("/:sessionId/ready", verifyStudent, setPlayerReady);
router.post("/:sessionId/answer", verifyStudent, submitAnswer);
router.get("/:sessionId/results", verifyStudent, getSessionResults);
router.get("/:sessionId/review", verifyStudent, getReviewData);

module.exports = router;
