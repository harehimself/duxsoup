// src/controllers/webhookController.js
const Visit = require('../models/visitsModel');
const scansController = require('./scansController');
const logger = require('../utils/logger');

class WebhookController {
  /**
   * Process incoming webhook data from DuxSoup
   */
  async processDuxSoupWebhook(req, res) {
    try {
      const webhookData = req.body;
      logger.info('Received webhook data from DuxSoup', { 
        type: webhookData.type,
        event: webhookData.event
      });

      // Handle different webhook event types
      if (webhookData.type === 'visit') {
        await this.processVisitEvent(webhookData);
      } else if (webhookData.type === 'scan') {
        await this.processScanEvent(webhookData);
      } else {
        logger.info(`Unhandled webhook event type: ${webhookData.type}`);
      }

      // Acknowledge receipt
      return res.status(200).json({ status: 'success' });
    } catch (error) {
      logger.error('Error processing webhook', { error: error.message });
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Process a LinkedIn profile visit event
   */
  async processVisitEvent(webhookData) {
    try {
      const { event, data } = webhookData;
      
      // Only process create and update events
      if (event !== 'create' && event !== 'update') {
        return;
      }

      // For update events, we're getting complete profile data
      if (event === 'update') {
        logger.info(`Processing visit update for profile: ${data.id}`);
        
        // Check if profile already exists
        const existingVisit = await Visit.findOne({ id: data.id });

        if (existingVisit) {
          // Update existing record
          Object.assign(existingVisit, data);
          await existingVisit.save();
          logger.info(`Updated existing profile: ${data.id}`);
        } else {
          // Create new record
          const visit = new Visit({ ...data, VisitTime: new Date(data.VisitTime) });
          await visit.save();
          logger.info(`Added new profile from webhook: ${data.id}`);
        }
      }
    } catch (error) {
      logger.error('Error processing visit event', { error: error.message });
      throw error;
    }
  }

  /**
   * Process a LinkedIn profile scan event
   */
  async processScanEvent(webhookData) {
    try {
      const { event, data } = webhookData;
      
      // Only process create events for scans
      if (event !== 'create') {
        return;
      }

      logger.info(`Processing scan data for profile: ${data.id}`);
      
      // Use the scansController to process scan data
      await scansController.processScans(data);
      
    } catch (error) {
      logger.error('Error processing scan event', { error: error.message });
      throw error;
    }
  }
}

module.exports = new WebhookController();