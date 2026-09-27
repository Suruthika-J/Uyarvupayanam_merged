"use strict";

// ────────────────────────────────────────────────────────────────────────────
// backend/middleware/verifyOwnership.js
//
// Ownership guard for student-scoped routes. MUST be chained AFTER
// verifyStudent (it requires `req.student`, which verifyStudent sets).
//
//   router.get("/user/:userId", verifyStudent, verifyOwnership("userId"), handler);
//
// Returns 403 "Access denied" whenever the URL :param does not exactly match
// the authenticated student's _id. The generic message is intentional: it must
// not reveal whether another student's account or record exists.
//
// Phase 2 — IDOR / ownership hardening. No business logic here.
// ────────────────────────────────────────────────────────────────────────────

const verifyOwnership = (paramName) => (req, res, next) => {
    const requestedId = String((req.params && req.params[paramName]) || "");
    const authenticatedId = String((req.student && req.student._id) || "");

    if (!authenticatedId || requestedId !== authenticatedId) {
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    next();
};

module.exports = verifyOwnership;