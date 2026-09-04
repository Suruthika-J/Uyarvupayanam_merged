const express = require('express');
const router = express.Router();
const { getCutoffData, manualImport } = require('../controllers/cutoffImportController');

// GET /api/cutoff?year=2024&course=Engineering
router.get('/', getCutoffData);

// POST /api/cutoff/import { year: 2024, course: 'Engineering' }
router.post('/import', manualImport);

module.exports = router;
