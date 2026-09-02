const express = require("express");
const router = express.Router();
const {
  getFields,
  getDegreesByField,
  getDomainsByField,
  getSpecializationsByDomain,
  getCertificationsByField,
  adminAddTaxonomyItem,
  getAllTaxonomyAdmin
} = require("../controllers/taxonomyController");
const verifyAdmin = require("../middleware/verifyAdmin");

// Public Dynamic Taxonomy Endpoints
router.get("/fields", getFields);
router.get("/degrees", getDegreesByField);
router.get("/domains", getDomainsByField);
router.get("/specializations", getSpecializationsByDomain);
router.get("/certifications", getCertificationsByField);

// Protected Admin Management Endpoints
router.get("/admin/all", verifyAdmin, getAllTaxonomyAdmin);
router.post("/admin/manage", verifyAdmin, adminAddTaxonomyItem);

module.exports = router;
