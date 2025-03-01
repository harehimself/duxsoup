// src/controllers/queueController.js
const duxsoupService = require('../services/duxsoupService');
const Visit = require('../models/visitsModel');
const Scan = require('../models/scansModel');
const logger = require('../utils/logger');

class QueueController {
  /**
   * Get queue status information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getQueueStatus(req, res) {
    try {
      const { campaignId, profileId, command } = req.query;
      
      const queueSize = await duxsoupService.getQueueSize(campaignId, profileId, command);
      
      res.status(200).json({
        status: 'success',
        data: queueSize
      });
    } catch (error) {
      logger.error('Error getting queue status', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get queued items
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getQueuedItems(req, res) {
    try {
      const { campaignId, profileId, command } = req.query;
      
      const queuedItems = await duxsoupService.getQueuedItems(campaignId, profileId, command);
      
      res.status(200).json({
        status: 'success',
        data: queuedItems
      });
    } catch (error) {
      logger.error('Error getting queued items', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Clear the queue
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async clearQueue(req, res) {
    try {
      const result = await duxsoupService.clearQueue();
      
      res.status(200).json({
        status: 'success',
        message: 'Queue cleared successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error clearing queue', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Queue a single profile visit
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async queueVisit(req, res) {
    try {
      const { profileUrl, campaignId, force, runAfter } = req.body;
      
      if (!profileUrl) {
        return res.status(400).json({ error: 'Profile URL is required' });
      }
      
      const result = await duxsoupService.queueVisit(profileUrl, campaignId, force, runAfter);
      
      res.status(200).json({
        status: 'success',
        message: 'Visit queued successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error queueing visit', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Queue a batch of profile visits
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async queueBatchVisits(req, res) {
    try {
      const { profileUrls, campaignId, force, batchSize } = req.body;
      
      if (!profileUrls || !Array.isArray(profileUrls) || profileUrls.length === 0) {
        return res.status(400).json({ error: 'Profile URLs array is required' });
      }
      
      const result = await duxsoupService.queueBatchVisits(profileUrls, campaignId, force, batchSize);
      
      res.status(200).json({
        status: 'success',
        message: `Queued ${result.queued} visits successfully, ${result.failed} failed`,
        data: result
      });
    } catch (error) {
      logger.error('Error queueing batch visits', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Queue visits for all profiles in the database
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async queueAllProfiles(req, res) {
    try {
      const { collectionType, limit, campaignId, force, batchSize } = req.body;
      
      // Default to 'scans' if not specified
      const collection = collectionType === 'visits' ? Visit : Scan;
      const limitValue = limit || 1000; // Default limit to 1000
      
      logger.info(`Fetching profiles from ${collectionType} collection with limit ${limitValue}`);
      
      // Find profiles that have not been visited recently (in the last 14 days)
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      const profileField = collectionType === 'scans' ? 'Profile' : 'Profile';
      const timeField = collectionType === 'scans' ? 'ScanTime' : 'VisitTime';
      
      const profiles = await collection.find({
        [timeField]: { $lt: twoWeeksAgo }
      })
      .limit(limitValue)
      .lean();
      
      if (profiles.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: 'No profiles found to queue',
          data: { total: 0, queued: 0, failed: 0 }
        });
      }
      
      logger.info(`Found ${profiles.length} profiles to queue for visits`);
      
      const profileUrls = profiles.map(p => p[profileField]);
      
      const result = await duxsoupService.queueBatchVisits(profileUrls, campaignId, force, batchSize || 50);
      
      res.status(200).json({
        status: 'success',
        message: `Queued ${result.queued} visits successfully, ${result.failed} failed`,
        data: result
      });
    } catch (error) {
      logger.error('Error queueing all profiles', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Queue connect requests for profiles
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async queueConnect(req, res) {
    try {
      const { profileUrl, messageText, campaignId, force, runAfter } = req.body;
      
      if (!profileUrl) {
        return res.status(400).json({ error: 'Profile URL is required' });
      }
      
      if (!messageText) {
        return res.status(400).json({ error: 'Message text is required for connection requests' });
      }
      
      const result = await duxsoupService.queueConnect(profileUrl, messageText, campaignId, force, runAfter);
      
      res.status(200).json({
        status: 'success',
        message: 'Connection request queued successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error queueing connection request', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Queue a direct message to a profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async queueMessage(req, res) {
    try {
      const { profileUrl, messageText, campaignId, force, runAfter } = req.body;
      
      if (!profileUrl) {
        return res.status(400).json({ error: 'Profile URL is required' });
      }
      
      if (!messageText) {
        return res.status(400).json({ error: 'Message text is required' });
      }
      
      const result = await duxsoupService.queueMessage(profileUrl, messageText, campaignId, force, runAfter);
      
      res.status(200).json({
        status: 'success',
        message: 'Message queued successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error queueing message', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new QueueController();