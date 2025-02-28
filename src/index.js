// src/index.js
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Controllers (import after app initialization)
let visitsController;

// Health check endpoint - CRITICAL for Render
// Return healthy immediately, don't wait for DB connection
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// API routes - initialized after DB connection
const initializeRoutes = () => {
  // Import controller now that DB is connected
  visitsController = require('./controllers/visitsController');
  
  // Manual trigger endpoint
  app.post('/api/fetch', async (req, res) => {
    try {
      const result = await visitsController.fetchAndStoreFirstDegreeConnections();
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in manual fetch', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Get stored visits endpoint
  app.get('/api/visits', async (req, res) => {
    try {
      const visits = await visitsController.getStoredVisits();
      res.status(200).json(visits);
    } catch (error) {
      logger.error('Error fetching visits', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });
};

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

// Schedule the periodic data fetch
const startPeriodicFetch = () => {
  const interval = config.app.fetchInterval;
  logger.info(`Setting up periodic fetch every ${interval}ms`);

  // Initial fetch
  setTimeout(async () => {
    try {
      const result = await visitsController.fetchAndStoreFirstDegreeConnections();
      logger.info('Initial fetch completed', { result });
    } catch (error) {
      logger.error('Initial fetch error', { error: error.message });
    }
  }, 10000); // Delay initial fetch by 10 seconds

  // Scheduled fetches
  setInterval(async () => {
    try {
      const result = await visitsController.fetchAndStoreFirstDegreeConnections();
      logger.info('Scheduled fetch completed', { result });
    } catch (error) {
      logger.error('Scheduled fetch error', { error: error.message });
    }
  }, interval);
};

// Start the server immediately to pass health checks
const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

// Connect to DB and initialize routes in background
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
  
  if (connected) {
    initializeRoutes();
    startPeriodicFetch();
  } else {
    logger.error("Failed to connect to MongoDB after multiple attempts");
    // Keep server running - will attempt reconnection on API calls
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