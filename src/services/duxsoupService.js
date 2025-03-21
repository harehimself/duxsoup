// src/services/duxsoupService.js
const crypto = require('crypto');
const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class DuxSoupService {
  constructor() {
    this.userId = config.duxsoup.userId;
    this.apiKey = config.duxsoup.apiKey;
    this.baseUrl = 'https://app.dux-soup.com/xapi/remote/control/';
  }

  /**
   * Calculate HMAC signature for API authentication
   * @param {string} message - Message to sign (URL or request body)
   * @returns {string} - Base64 encoded HMAC
   */
  calculateHMAC(message) {
    const hmac = crypto.createHmac('sha1', this.apiKey);
    hmac.update(message);
    return hmac.digest('base64');
  }

  /**
   * Make a GET request to Dux-Soup API
   * @param {string} endpoint - API endpoint path
   * @param {Object} params - Query parameters (optional)
   * @returns {Promise<Object>} - API response
   */
  async get(endpoint, params = {}) {
    try {
      const url = `${this.baseUrl}${this.userId}/${endpoint}`;
      const urlWithParams = new URL(url);
      
      // Add query parameters if any
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          urlWithParams.searchParams.append(key, params[key]);
        }
      });
      
      const fullUrl = urlWithParams.toString();
      const signature = this.calculateHMAC(fullUrl);
      
      const response = await axios.get(fullUrl, {
        headers: {
          'X-Dux-Signature': signature
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error making GET request to Dux-Soup API', { 
        endpoint, 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Make a POST request to Dux-Soup API
   * @param {string} endpoint - API endpoint path
   * @param {Object} data - Request body
   * @returns {Promise<Object>} - API response
   */
  async post(endpoint, data = {}) {
    try {
      const url = `${this.baseUrl}${this.userId}/${endpoint}`;
      
      // Add required fields to the request body
      const body = {
        targeturl: url,
        timestamp: Date.now(),
        userid: this.userId,
        ...data
      };
      
      const bodyString = JSON.stringify(body);
      const signature = this.calculateHMAC(bodyString);
      
      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-Dux-Signature': signature
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error making POST request to Dux-Soup API', { 
        endpoint, 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Get the number of messages waiting in the queue
   * @param {string} campaignId - Filter by campaign ID (optional)
   * @param {string} profileId - Filter by profile ID (optional)
   * @param {string} command - Filter by command type (optional)
   * @returns {Promise<Object>} - Queue size information
   */
  async getQueueSize(campaignId = null, profileId = null, command = null) {
    const params = {
      campaignid: campaignId,
      profileid: profileId,
      command: command
    };
    
    return this.get('queue/size', params);
  }

  /**
   * Get a list of current messages in the queue (max 100)
   * @param {string} campaignId - Filter by campaign ID (optional)
   * @param {string} profileId - Filter by profile ID (optional)
   * @param {string} command - Filter by command type (optional)
   * @returns {Promise<Array>} - List of queued items
   */
  async getQueuedItems(campaignId = null, profileId = null, command = null) {
    const params = {
      campaignid: campaignId,
      profileid: profileId,
      command: command
    };
    
    return this.get('queue/items', params);
  }

  /**
   * Clear all queued messages
   * @returns {Promise<Object>} - Response from the API
   */
  async clearQueue() {
    return this.post('reset');
  }

  /**
   * Queue a visit action for a profile
   * @param {string} profileUrl - LinkedIn profile URL
   * @param {string} campaignId - Campaign ID (optional)
   * @param {boolean} force - Force action ignoring exclusion rules (optional)
   * @param {string} runAfter - ISO date string for scheduled execution (optional)
   * @returns {Promise<Object>} - Response with message ID
   */
  async queueVisit(profileUrl, campaignId = null, force = false, runAfter = null) {
    const data = {
      command: 'visit',
      params: {
        profile: profileUrl,
        force: force
      }
    };
    
    if (campaignId) {
      data.params.campaignid = campaignId;
    }
    
    if (runAfter) {
      data.runafter = runAfter;
    }
    
    return this.post('queue', data);
  }

  /**
   * Queue a connect action for a profile
   * @param {string} profileUrl - LinkedIn profile URL (2nd or 3rd degree)
   * @param {string} messageText - Personalized message for connection request
   * @param {string} campaignId - Campaign ID (optional)
   * @param {boolean} force - Force action ignoring exclusion rules (optional)
   * @param {string} runAfter - ISO date string for scheduled execution (optional)
   * @returns {Promise<Object>} - Response with message ID
   */
  async queueConnect(profileUrl, messageText, campaignId = null, force = false, runAfter = null) {
    const data = {
      command: 'connect',
      params: {
        profile: profileUrl,
        messagetext: messageText,
        force: force
      }
    };
    
    if (campaignId) {
      data.params.campaignid = campaignId;
    }
    
    if (runAfter) {
      data.runafter = runAfter;
    }
    
    return this.post('queue', data);
  }

  /**
   * Queue a message action for a profile
   * @param {string} profileUrl - LinkedIn profile URL (1st degree)
   * @param {string} messageText - Personalized message to send
   * @param {string} campaignId - Campaign ID (optional)
   * @param {boolean} force - Force action ignoring exclusion rules (optional)
   * @param {string} runAfter - ISO date string for scheduled execution (optional)
   * @returns {Promise<Object>} - Response with message ID
   */
  async queueMessage(profileUrl, messageText, campaignId = null, force = false, runAfter = null) {
    const data = {
      command: 'message',
      params: {
        profile: profileUrl,
        messagetext: messageText,
        force: force
      }
    };
    
    if (campaignId) {
      data.params.campaignid = campaignId;
    }
    
    if (runAfter) {
      data.runafter = runAfter;
    }
    
    return this.post('queue', data);
  }

  /**
   * Queue multiple profile visits in batches
   * @param {Array<string>} profileUrls - Array of LinkedIn profile URLs
   * @param {string} campaignId - Campaign ID (optional)
   * @param {boolean} force - Force action ignoring exclusion rules (optional)
   * @param {number} batchSize - Number of profiles to process in each batch
   * @returns {Promise<Object>} - Summary of queuing results
   */
  async queueBatchVisits(profileUrls, campaignId = null, force = false, batchSize = 50) {
    const results = [];
    const total = profileUrls.length;
    
    logger.info(`Starting batch visit queueing for ${total} profiles`);
    
    for (let i = 0; i < total; i += batchSize) {
      const batch = profileUrls.slice(i, i + batchSize);
      const currentBatch = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(total / batchSize);
      
      logger.info(`Processing batch ${currentBatch}/${totalBatches} (${batch.length} profiles)`);
      
      const batchPromises = batch.map(profileUrl => 
        this.queueVisit(profileUrl, campaignId, force)
          .then(response => ({ profileUrl, success: true, messageId: response.messageid }))
          .catch(error => ({ profileUrl, success: false, error: error.message }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add a delay between batches to avoid overwhelming the API
      if (i + batchSize < total) {
        logger.info(`Waiting 2 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    logger.info(`Batch queueing completed: ${successCount} succeeded, ${failureCount} failed`);
    
    return {
      total,
      queued: successCount,
      failed: failureCount,
      details: results
    };
  }
}

module.exports = new DuxSoupService();