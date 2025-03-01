const Scan = require('../models/scansModel');
const logger = require('../utils/logger');

const MAX_DAILY_SCANS = 1000; // Limit to 1000 profile scans per day
const SCAN_DELAY_MS = 3000;  // 3-second delay between profile scans

// Helper function: Check if collection exists
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

class ScansController {
  async processScans(scanData) {
    try {
      logger.info('Processing scan event', { profileId: scanData.id });

      // Ensure 'scans' collection exists
      const collectionFound = await collectionExists(Scan);
      if (!collectionFound) {
        logger.error("MongoDB collection 'scans' does not exist");
        return { error: "Collection 'scans' does not exist" };
      }

      // Check if this profile already exists in our database
      const existingScan = await Scan.findOne({ id: scanData.id });

      if (existingScan) {
        // Update existing record
        Object.assign(existingScan, scanData);
        await existingScan.save();
        logger.info(`Updated scan: ${scanData.id}`);
        return { status: 'updated', id: scanData.id };
      } else {
        // Create new record
        const scan = new Scan({ ...scanData, ScanTime: new Date(scanData.ScanTime) });
        await scan.save();
        logger.info(`Added new scan: ${scanData.id}`);
        return { status: 'added', id: scanData.id };
      }
    } catch (error) {
      logger.error('Error in processScans', { error: error.message, profileId: scanData?.id });
      throw error;
    }
  }

  async getStoredScans(query = {}) {
    try {
      const scans = await Scan.find(query).lean();
      return scans;
    } catch (error) {
      logger.error('Error fetching stored scans', { error: error.message });
      throw error;
    }
  }
}

module.exports = new ScansController();