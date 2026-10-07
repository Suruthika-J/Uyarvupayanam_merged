const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const verifyAdmin = require("../middleware/verifyAdmin");
const ctrl = require("../controllers/communicationContentController");

// Reads are served to authenticated students (Class 5 Communication page).
router.get("/type/:contentType", verifyStudent, ctrl.getByType);
router.get("/all", verifyStudent, ctrl.getAllContent);

// Mutations touch global curated content — admin-only. Students must not be
// able to create/edit/delete the shared lesson content that every class peer
// (and the passport) renders from.
router.post("/", verifyAdmin, ctrl.createContent);
router.put("/:id", verifyAdmin, ctrl.updateContent);
router.delete("/:id", verifyAdmin, ctrl.deleteContent);

module.exports = router;
