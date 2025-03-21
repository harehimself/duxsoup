// src/utils/collectionUtils.js
const logger = require('./logger');

/**
 * Check if a MongoDB collection exists
 * @param {Object} model - Mongoose model
 * @returns {Promise<boolean>} - True if collection exists
 */
const collectionExists = async (model) => {
  try {
    const db = model.db.client.db(); // Correct MongoDB client reference
    const collections = await db.listCollections().toArray();
    return collections.some(col => col.name === model.collection.name);
  } catch (error) {
    logger.warn("Could not check collections list, assuming it exists", { error: error.message });
    return true; // Assume it exists to prevent blocking the process
  }
};

module.exports = {
  collectionExists
};