const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const visitsController = require('./controllers/visitsController');
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

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://harelabs:cSajLWWmSpsbCPOx@linkedin-etl.xkw5e.mongodb.net/duxsoup?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection error", { error: error.message });
    process.exit(1); // Exit process if connection fails
  }
};

// Start the server only after DB connection
const startServer = async () => {
  await connectDB(); // Ensure MongoDB is connected before starting server

  app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
  });

  // Schedule periodic data fetch
  startPeriodicFetch();
};

// Schedule the periodic data fetch
const startPeriodicFetch = () => {
  logger.info(`Setting up periodic fetch every ${config.app.fetchInterval}ms`);

  // Immediately perform the first fetch
  visitsController.fetchAndStoreFirstDegreeConnections()
    .then(result => {
      logger.info('Initial fetch completed', { result });
    })
    .catch(error => {
      logger.error('Error in initial fetch', { error: error.message });
    });

  // Set up the interval for subsequent fetches
  setInterval(async () => {
    try {
      const result = await visitsController.fetchAndStoreFirstDegreeConnections();
      logger.info('Scheduled fetch completed', { result });
    } catch (error) {
      logger.error('Error in scheduled fetch', { error: error.message });
    }
  }, config.app.fetchInterval);
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', { reason });
});

// Start the app
startServer();

module.exports = app;
