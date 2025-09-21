const express = require('express');
const codeController = require('../controllers/code.controller');

const router = express.Router();

// Get available languages
router.get('/languages', codeController.getLanguages);

// Run code synchronously
router.post('/run-sync', codeController.runSync);

// Create async submission
router.post('/create-submission', codeController.createSubmission);

// Get submission status
router.get('/submissions/:token', codeController.getSubmission);

// Run multiple testcases
router.post('/run-testcases', codeController.runTestcases);

module.exports = router;
