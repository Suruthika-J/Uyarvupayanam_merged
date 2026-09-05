const express = require("express");
const verifyAdmin = require("../middleware/verifyAdmin");
const { getSettings, updateSettings, getPublicSettings } = require("../controllers/settingsController");

const router = express.Router();

router.get("/public", getPublicSettings);
router.get("/", verifyAdmin, getSettings);
router.put("/update", verifyAdmin, updateSettings);

module.exports = router;
