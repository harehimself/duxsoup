// src/index.js
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const webhookController = require('./controllers/webhookController');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Webhook endpoint for DuxSoup events
app.post('/api/webhook', async (req, res) => {
  try {
    await webhookController.processDuxSoupWebhook(req, res);
  } catch (error) {
    logger.error('Error in webhook endpoint', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get stored visits endpoint
app.get('/api/visits', async (req, res) => {
  try {
    const visits = await webhookController.getStoredVisits();
    res.status(200).json(visits);
  } catch (error) {
    logger.error('Error fetching visits', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongo.uri, {
      dbName: config.mongo.dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info("MongoDB connected successfully");
    return true;
  } catch (error) {
    logger.error("MongoDB connection error", { error: error.message });
    return false;
  }
};

// Start the server immediately to pass health checks
const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

// Connect to DB in background
(async () => {
  let connected = false;
  
  // Try to connect to MongoDB with retries
  for (let attempt = 1; attempt <= 5; attempt++) {
    logger.info(`MongoDB connection attempt ${attempt}...`);
    connected = await connectDB();
    if (connected) break;
    
    // Wait before retrying
    if (attempt < 5) {
      const delay = attempt * 5000; // Increasing backoff
      logger.info(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  if (!connected) {
    logger.error("Failed to connect to MongoDB after multiple attempts");
  } else {
    logger.info("Ready to receive webhook data from DuxSoup");
  }
})();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', { reason });
});

module.exports = app;