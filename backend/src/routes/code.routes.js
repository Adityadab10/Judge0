const express = require('express');
const codeController = require('../controllers/code.controller');

const router = express.Router();

// Health check endpoint
router.get('/health', codeController.healthCheck);

// Get available languages
router.get('/languages', codeController.getLanguages);

// Simple run endpoint (main endpoint)
router.post('/run', codeController.runSync);

// Run code synchronously (legacy)
router.post('/run-sync', codeController.runSync);

// Create async submission
router.post('/create-submission', codeController.createSubmission);

// Get submission status
router.get('/submissions/:token', codeController.getSubmission);

// Run multiple testcases
router.post('/run-testcases', codeController.runTestcases);

module.exports = router;
