const express = require("express");
const router = express.Router();
const { getCseSkillQuestions, evaluateCseSkills } = require("../controllers/cseSkillController");

router.get("/questions", getCseSkillQuestions);
router.post("/evaluate", evaluateCseSkills);

module.exports = router;
