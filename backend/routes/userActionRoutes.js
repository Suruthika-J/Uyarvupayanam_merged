const express = require("express");
const { saveItem, getSavedItems, unsaveItem } = require("../controllers/savedItemController");
const { toggleHabit, getHabits } = require("../controllers/habitController");
const verifyStudent = require("../middleware/verifyStudent");

const router = express.Router();

// Required student login for all saving actions
router.post("/save", verifyStudent, saveItem);
router.get("/saved-list", verifyStudent, getSavedItems);
router.delete("/unsave/:contentId", verifyStudent, unsaveItem);

// Habits
router.post("/habits/toggle", verifyStudent, toggleHabit);
router.get("/habits", verifyStudent, getHabits);

module.exports = router;
