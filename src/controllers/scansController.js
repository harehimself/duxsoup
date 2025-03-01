const duxsoupService = require('../services/duxsoupService');
const Scan = require('../models/scansModel');
const logger = require('../utils/logger');

const MAX_DAILY_SCANS = 200; // Limit to 200 profile scans per day
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

  async scanBatch(profileIds) {
    try {
      logger.info(`Starting batch scan of ${profileIds.length} profiles`);

      // Ensure 'scans' collection exists
      const collectionFound = await collectionExists(Scan);
      if (!collectionFound) {
        logger.error("MongoDB collection 'scans' does not exist. Skipping scan.");
        return { error: "Collection 'scans' does not exist" };
      }

      // Get today's date (UTC)
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Count scans for today (limit execution time)
      let todayScanCount = 0;
      try {
        const existingData = await Scan.findOne({ ScanTime: { $gte: today } }).maxTimeMS(5000);
        todayScanCount = existingData ? await Scan.countDocuments({ ScanTime: { $gte: today } }).maxTimeMS(5000) : 0;
      } catch (error) {
        logger.error("Timeout while counting scans", { error: error.message });
        return { error: "Timeout while counting scans" };
      }

      if (todayScanCount >= MAX_DAILY_SCANS) {
        logger.info(`Daily scan limit reached: ${todayScanCount}/${MAX_DAILY_SCANS}`);
        return { message: 'Daily limit reached', added: 0, updated: 0, failed: 0 };
      }

      let scansLeft = MAX_DAILY_SCANS - todayScanCount;
      const stats = { added: 0, updated: 0, failed: 0 };

      for (const profileId of profileIds) {
        if (scansLeft <= 0) {
          logger.info(`Stopping further processing. Daily limit reached: ${MAX_DAILY_SCANS}`);
          break;
        }

        try {
          // Get profile scan data (with retry)
          let scanData;
          for (let retry = 0; retry < 3; retry++) {
            try {
              scanData = await duxsoupService.getScanDetails(profileId);
              if (!scanData || !scanData.id) throw new Error("Empty scan data");
              break;
            } catch (error) {
              logger.warn(`Retrying scan for profile ${profileId}, attempt ${retry + 1}`);
              if (retry === 2) throw error;
            }
          }

          // Process the scan data
          const result = await this.processScans(scanData);
          
          if (result.status === 'added') {
            stats.added++;
          } else if (result.status === 'updated') {
            stats.updated++;
          }

          scansLeft--; // Decrease remaining allowed scans

          // Delay next request to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, SCAN_DELAY_MS));
        } catch (error) {
          stats.failed++;
          logger.error(`Failed to process scan for ${profileId}`, { error: error.message });
        }
      }

      logger.info('Completed processing scans', { stats });
      return stats;
    } catch (error) {
      logger.error('Error in scanBatch', { error: error.message });
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