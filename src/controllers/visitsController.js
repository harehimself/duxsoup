const duxsoupService = require('../services/duxsoupService');
const Visit = require('../models/visitsModel');
const logger = require('../utils/logger');

class VisitsController {
  async fetchAndStoreFirstDegreeConnections() {
    try {
      logger.info('Starting fetch of first-degree connections');
      
      // Get first-degree connections from DuxSoup
      const connections = await duxsoupService.getFirstDegreeConnections();
      logger.info(`Retrieved ${connections.length} first-degree connections`);
      
      if (!connections.length) {
        logger.info('No connections found to process');
        return { added: 0, updated: 0, failed: 0 };
      }

      // Process each connection
      const stats = { added: 0, updated: 0, failed: 0 };
      
      for (const connection of connections) {
        try {
          // Get detailed profile data for each connection
          const profileData = await duxsoupService.getVisitDetails(connection.id);
          
          // Check if this profile already exists in our database
          const existingVisit = await Visit.findOne({ id: profileData.id });
          
          if (existingVisit) {
            // Update existing record
            Object.assign(existingVisit, profileData);
            await existingVisit.save();
            stats.updated++;
            logger.info(`Updated profile: ${profileData.id}`);
          } else {
            // Create new record
            const visit = new Visit(profileData);
            await visit.save();
            stats.added++;
            logger.info(`Added new profile: ${profileData.id}`);
          }
        } catch (error) {
          stats.failed++;
          logger.error(`Failed to process connection ${connection.id}`, { error: error.message });
        }
      }
      
      logger.info('Completed processing connections', { stats });
      return stats;
    } catch (error) {
      logger.error('Error in fetchAndStoreFirstDegreeConnections', { error: error.message });
      throw error;
    }
  }
  
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