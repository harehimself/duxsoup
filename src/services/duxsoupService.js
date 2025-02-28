const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class DuxSoupService {
  constructor() {
    this.client = axios.create({
      baseURL: config.duxsoup.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': config.duxsoup.apiKey
      }
    });
  }

  async getVisits(params = {}) {
    try {
      // Default to fetching most recent visits if no date range provided
      const defaultParams = {
        limit: 100,
        ...params
      };

      const response = await this.client.get('/visits', { params: defaultParams });
      
      if (response.status !== 200) {
        throw new Error(`DuxSoup API returned status code ${response.status}`);
      }
      
      logger.info(`Retrieved ${response.data.length} visits from DuxSoup API`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching visits from DuxSoup API', { error: error.message });
      throw error;
    }
  }

  async getVisitDetails(visitId) {
    try {
      const response = await this.client.get(`/visits/${visitId}`);
      
      if (response.status !== 200) {
        throw new Error(`DuxSoup API returned status code ${response.status}`);
      }
      
      logger.info(`Retrieved details for visit ${visitId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching details for visit ${visitId}`, { error: error.message });
      throw error;
    }
  }

  async getFirstDegreeConnections() {
    try {
      // Fetch only first-degree connections (1)
      const response = await this.getVisits({ degree: 1 });
      return response;
    } catch (error) {
      logger.error('Error fetching first-degree connections', { error: error.message });
      throw error;
    }
  }
}

module.exports = new DuxSoupService();