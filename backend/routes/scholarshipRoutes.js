const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { 
  getAllScholarships,
  getScholarshipById,
  applyForScholarship, 
  addScholarship, 
  importScholarshipsCSV,
  importScholarshipsFromLocalCSV,
  uploadScholarshipsCSV, 
  updateScholarship, 
  deleteScholarship 
} = require('../controllers/scholarshipController');
const verifyAdmin = require('../middleware/verifyAdmin');

// GET /api/scholarships
router.get('/', getAllScholarships);
router.get('/:id', getScholarshipById);

router.post('/add-scholarship', verifyAdmin, addScholarship);
router.post('/import', verifyAdmin, upload.single('file'), importScholarshipsCSV);
router.post('/import-csv', importScholarshipsFromLocalCSV);
router.post('/apply', applyForScholarship);
router.post('/upload', upload.single('file'), uploadScholarshipsCSV);
router.put('/:id', verifyAdmin, updateScholarship);
router.delete('/:id', verifyAdmin, deleteScholarship);

module.exports = router;
