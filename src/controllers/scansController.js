const Scan = require('../models/scansModel');
const logger = require('../utils/logger');
const { collectionExists } = require('../utils/collectionUtils');

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