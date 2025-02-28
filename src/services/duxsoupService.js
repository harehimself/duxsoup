const axios = require('axios');
const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');

class DuxSoupService {
  constructor() {
    this.baseURL = 'https://app.dux-soup.com/xapi';
    this.apiKey = process.env.DUXSOUP_API_KEY;
    this.userId = process.env.DUXSOUP_USER_ID;
    this.clientId = process.env.DUXSOUP_CLIENT_ID;
  }

  // Generate HMAC signature for DuxSoup API authentication
  calculateHMAC(message) {
    const hmac = crypto.createHmac('sha1', this.apiKey)
      .update(message)
      .digest('base64');
    return hmac;
  }

  // Make authenticated request to DuxSoup API
  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      // Prepare request options
      const options = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // For POST requests, include data and signature
      if (method === 'POST' && data) {
        data.targeturl = url;
        data.timestamp = Date.now();
        data.userid = this.userId;
        
        options.data = data;
        options.headers['X-Dux-Signature'] = this.calculateHMAC(JSON.stringify(data));
      } 
      // For GET requests, sign the URL
      else if (method === 'GET') {
        options.headers['X-Dux-Signature'] = this.calculateHMAC(url);
      }

      logger.info(`Making ${method} request to ${url}`);
      const response = await axios(options);
      
      if (response.status !== 200) {
        throw new Error(`DuxSoup API returned status code ${response.status}`);
      }
      
      return response.data;
    } catch (error) {
      logger.error(`Error in DuxSoup API request: ${error.message}`, { error });
      throw error;
    }
  }

  async getVisits(params = {}) {
    try {
      // Use correct visits endpoint with degree filter
      const endpointWithParams = `/visits?degree=1&limit=100`;
      const response = await this.makeRequest(endpointWithParams, 'GET');
      logger.info(`Retrieved ${response.length || 0} visits from DuxSoup API`);
      return response;
    } catch (error) {
      logger.error('Error fetching visits from DuxSoup API', { error: error.message });
      throw error;
    }
  }

  async getVisitDetails(visitId) {
    try {
      const response = await this.makeRequest(`/visits/${visitId}`, 'GET');
      logger.info(`Retrieved details for visit ${visitId}`);
      return response;
    } catch (error) {
      logger.error(`Error fetching details for visit ${visitId}`, { error: error.message });
      throw error;
    }
  }

  async getFirstDegreeConnections() {
    try {
      // Get 1st degree connections from visits endpoint
      return await this.getVisits({ degree: 1 });
    } catch (error) {
      logger.error('Error fetching first-degree connections', { error: error.message });
      throw error;
    }
  }

  // Add other useful methods based on docs
  async queueSize() {
    try {
      const response = await this.makeRequest(`/remote/control/${this.userId}/queue/size`, 'GET');
      logger.info(`Queue size: ${response.size || 0}`);
      return response;
    } catch (error) {
      logger.error('Error fetching queue size', { error: error.message });
      throw error;
    }
  }

  async queueItems() {
    try {
      const response = await this.makeRequest(`/remote/control/${this.userId}/queue/items`, 'GET');
      logger.info(`Queue items: ${response.length || 0}`);
      return response;
    } catch (error) {
      logger.error('Error fetching queue items', { error: error.message });
      throw error;
    }
  }
}

module.exports = new DuxSoupService();