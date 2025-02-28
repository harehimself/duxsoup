const duxsoupService = require('../services/duxsoupService');
const Visit = require('../models/visitsModel');
const logger = require('../utils/logger');

const MAX_DAILY_VISITS = 100; // Limit to 100 profile visits per day
const VISIT_DELAY_MS = 5000;  // 5-second delay between profile visits

// Helper function: Check if collection exists
const collectionExists = async (model) => {
  const collections = await model.db.db.listCollections().toArray();
  return collections.some(col => col.name === model.collection.name);
};

class VisitsController {
  async fetchAndStoreFirstDegreeConnections() {
    try {
      logger.info('Starting fetch of first-degree connections');

      // Ensure 'visits' collection exists
      const collectionFound = await collectionExists(Visit);
      if (!collectionFound) {
        logger.error("MongoDB collection 'visits' does not exist. Skipping fetch.");
        return { error: "Collection 'visits' does not exist" };
      }

      // Get today's date (UTC)
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Count visits for today (limit execution time)
      let todayVisitCount;
      try {
        todayVisitCount = await Visit.countDocuments({ VisitTime: { $gte: today } }).maxTimeMS(5000);
      } catch (error) {
        logger.error("Timeout while counting documents", { error: error.message });
        return { error: "Timeout while counting visits" };
      }

      if (todayVisitCount >= MAX_DAILY_VISITS) {
        logger.info(`Daily visit limit reached: ${todayVisitCount}/${MAX_DAILY_VISITS}`);
        return { message: 'Daily limit reached', added: 0, updated: 0, failed: 0 };
      }

      // Get first-degree connections from DuxSoup
      const connections = await duxsoupService.getFirstDegreeConnections();
      logger.info(`Retrieved ${connections.length} first-degree connections`);

      if (!connections.length) {
        logger.info('No connections found to process');
        return { added: 0, updated: 0, failed: 0 };
      }

      let visitsLeft = MAX_DAILY_VISITS - todayVisitCount;
      const stats = { added: 0, updated: 0, failed: 0 };

      for (const connection of connections) {
        if (visitsLeft <= 0) {
          logger.info(`Stopping further processing. Daily limit reached: ${MAX_DAILY_VISITS}`);
          break;
        }

        try {
          // Get detailed profile data for each connection (with retry)
          let profileData;
          for (let retry = 0; retry < 3; retry++) {
            try {
              profileData = await duxsoupService.getVisitDetails(connection.id);
              break;
            } catch (error) {
              logger.warn(`Retrying fetch for profile ${connection.id}, attempt ${retry + 1}`);
              if (retry === 2) throw error;
            }
          }

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
            const visit = new Visit({ ...profileData, VisitTime: new Date() });
            await visit.save();
            stats.added++;
            logger.info(`Added new profile: ${profileData.id}`);
          }

          visitsLeft--; // Decrease remaining allowed visits

          // Delay next request to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, VISIT_DELAY_MS));
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
