const axios = require('axios');
const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');

class DuxSoupService {
  constructor() {
    // Use the correct URL from environment variable
    this.baseURL = process.env.DUXSOUP_REMOTE_CONTROL_URL || 'https://app.dux-soup.com/xapi/remote/control/' + process.env.DUXSOUP_USER_ID;
    this.apiKey = config.duxsoup.apiKey;
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
      const timestamp = Date.now();
      
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
        // Add required DuxSoup fields
        data.targeturl = url;
        data.timestamp = timestamp;
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
      // Use visits endpoint
      const response = await this.makeRequest('/visits', 'GET');
      logger.info(`Retrieved ${response.length} visits from DuxSoup API`);
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
      // LinkedIn Activity API - Command to visit 1st degree connections
      const data = {
        command: 'visit',
        params: {
          degree: 1
        }
      };
      
      const response = await this.makeRequest('', 'POST', data);
      logger.info(`Retrieved ${response.length || 0} first-degree connections`);
      return response;
    } catch (error) {
      logger.error('Error fetching first-degree connections', { error: error.message });
      throw error;
    }
  }
}

module.exports = new DuxSoupService();