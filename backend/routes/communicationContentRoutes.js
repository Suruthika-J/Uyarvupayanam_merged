const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const ctrl = require("../controllers/communicationContentController");

router.get("/type/:contentType", verifyStudent, ctrl.getByType);
router.get("/all", verifyStudent, ctrl.getAllContent);
router.post("/", verifyStudent, ctrl.createContent);
router.put("/:id", verifyStudent, ctrl.updateContent);
router.delete("/:id", verifyStudent, ctrl.deleteContent);

module.exports = router;
