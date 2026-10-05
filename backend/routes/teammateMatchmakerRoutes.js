const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  getListings,
  getListingById,
  createListing,
  requestToJoin,
  respondToJoinRequest,
  getMyTeams,
  deleteListing,
  getCompetitions,
  getSummary
} = require("../controllers/teammateMatchmakerController");

// All teammate matchmaker routes are student authenticated
router.get("/competitions", verifyStudent, getCompetitions);
router.get("/summary", verifyStudent, getSummary);
router.get("/listings", verifyStudent, getListings);
router.get("/listings/:id", verifyStudent, getListingById);
router.post("/listings", verifyStudent, createListing);
router.post("/listings/:id/join-request", verifyStudent, requestToJoin);
router.post("/listings/:id/respond-request", verifyStudent, respondToJoinRequest);
router.get("/my-teams", verifyStudent, getMyTeams);
router.delete("/listings/:id", verifyStudent, deleteListing);

module.exports = router;
