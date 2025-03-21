// src/routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const visitsController = require('../controllers/visitsController');
const scansController = require('../controllers/scansController');
const queueController = require('../controllers/queueController');
const analysisController = require('../controllers/analysisController');

// Note: Main webhook endpoint is now defined directly in index.js
// This route is kept for backward compatibility
router.post('/webhook/duxsoup', webhookController.processDuxSoupWebhook);

// Visits API endpoints
router.get('/visits', async (req, res) => {
  try {
    const visits = await visitsController.getStoredVisits();
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scans API endpoints
router.get('/scans', async (req, res) => {
  try {
    const scans = await scansController.getStoredScans();
    res.json(scans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analysis endpoints
router.get('/analysis/company/:company', analysisController.getCompanyConnections);
router.get('/analysis/timing', analysisController.getConnectionTiming);
router.get('/analysis/rising-leaders', analysisController.getRisingLeaders);
router.get('/analysis/geography', analysisController.getGeographicDistribution);
router.get('/analysis/education', analysisController.getEducationPatterns);
router.get('/analysis/seniority', analysisController.getSeniorityDistribution);
router.get('/analysis/industries', analysisController.getIndustryDomains);

// Queue management endpoints
router.get('/queue/status', queueController.getQueueStatus);
router.get('/queue/items', queueController.getQueuedItems);
router.post('/queue/clear', queueController.clearQueue);
router.post('/queue/visit', queueController.queueVisit);
router.post('/queue/batch', queueController.queueBatchVisits);
router.post('/queue/all', queueController.queueAllProfiles);
router.post('/queue/connect', queueController.queueConnect);
router.post('/queue/message', queueController.queueMessage);

module.exports = router;