const express = require("express");
const router  = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  discoverStudents,
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  sendStudyInvite,
  respondToStudyInvite
} = require("../controllers/peerChatController");

// All routes require authentication
router.get("/students",                                  verifyStudent, discoverStudents);
router.get("/conversations",                             verifyStudent, getConversations);
router.post("/conversations",                            verifyStudent, getOrCreateConversation);
router.get("/conversations/:id/messages",                verifyStudent, getMessages);
router.post("/conversations/:id/messages",               verifyStudent, sendMessage);
router.post("/conversations/:id/study-invite",           verifyStudent, sendStudyInvite);
router.patch("/messages/:msgId/invite-response",         verifyStudent, respondToStudyInvite);

module.exports = router;
