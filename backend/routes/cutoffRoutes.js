const express = require('express');
const router = express.Router();
const { getCutoffs, createCutoff, updateCutoff, deleteCutoff, syncOrphanedRecords } = require('../controllers/cutoffController');

router.get('/', getCutoffs);
router.post('/sync-orphans', syncOrphanedRecords);
router.post('/', createCutoff);
router.put('/:id', updateCutoff);
router.delete('/:id', deleteCutoff);

module.exports = router;
