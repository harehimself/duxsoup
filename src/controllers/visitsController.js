const Visit = require('../models/visitsModel');
const logger = require('../utils/logger');

class VisitsController {
  /**
   * Get all stored visits with optional filtering
   * @param {Object} query - MongoDB query object
   * @returns {Promise<Array>} - Array of visit documents
   */
  async getStoredVisits(query = {}) {
    try {
      const visits = await Visit.find(query).lean();
      return visits;
    } catch (error) {
      logger.error('Error fetching stored visits', { error: error.message });
      throw error;
    }
  }
}

module.exports = new VisitsController();