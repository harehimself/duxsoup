// src/controllers/webhookController.js
const Visit = require('../models/visitsModel');
const scansController = require('./scansController');
const logger = require('../utils/logger');

class WebhookController {
  constructor() {
    // Bind methods to preserve 'this' context when used as callbacks
    this.processDuxSoupWebhook = this.processDuxSoupWebhook.bind(this);
    this.processVisitEvent = this.processVisitEvent.bind(this);
    this.processScanEvent = this.processScanEvent.bind(this);
  }

  /**
   * Process incoming webhook data from DuxSoup
   */
  async processDuxSoupWebhook(req, res) {
    try {
      const webhookData = req.body;
      
      // Enhanced logging of the full webhook data to help with debugging
      logger.info('Received webhook data from DuxSoup', { 
        endpoint: req.originalUrl,
        method: req.method,
        eventType: webhookData.type || webhookData.event || 'unknown',
        dataKeys: webhookData.data ? Object.keys(webhookData.data) : 'no data'
      });
      
      // Log a sample of the raw data to understand its structure
      logger.info('Raw webhook payload sample', {
        sample: webhookData.data ? 
          JSON.stringify(webhookData.data).substring(0, 1000) + 
          (JSON.stringify(webhookData.data).length > 1000 ? '...(truncated)' : '') 
          : 'No data'
      });

      // Validate webhook data
      if (!webhookData || (!webhookData.type && !webhookData.event)) {
        logger.warn('Invalid webhook data received', { body: webhookData });
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid webhook data format' 
        });
      }

      // Handle different webhook event types
      if (webhookData.type === 'visit') {
        await this.processVisitEvent(webhookData);
      } else if (webhookData.type === 'scan') {
        await this.processScanEvent(webhookData);
      } else {
        logger.info(`Unhandled webhook event type: ${webhookData.type || 'unknown'}`);
      }

      // Acknowledge receipt
      return res.status(200).json({ 
        status: 'success',
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      logger.error('Error processing webhook', { 
        error: error.message,
        stack: error.stack
      });
      return res.status(500).json({ 
        status: 'error',
        message: error.message 
      });
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
        logger.info(`Ignoring visit event type: ${event}`);
        return;
      }

      // Additional validation
      if (!data || !data.id) {
        logger.warn('Visit event missing required data fields', { data });
        return;
      }

      logger.info(`Processing visit ${event} for profile: ${data.id}`, {
        availableFields: Object.keys(data),
        hasPositions: data['Position-0-Company'] ? true : false,
        hasSchools: data['School-0-Name'] ? true : false,
        hasSkills: data['Skill-0'] ? true : false
      });
      
      // Check if profile already exists
      const existingVisit = await Visit.findOne({ id: data.id });

      if (existingVisit) {
        // Update existing record
        Object.assign(existingVisit, data);
        existingVisit.VisitTime = new Date(data.VisitTime || existingVisit.VisitTime);
        await existingVisit.save();
        logger.info(`Updated existing profile: ${data.id}`);
      } else {
        // Create new record
        const visitData = {
          ...data,
          VisitTime: new Date(data.VisitTime || new Date())
        };
        
        const visit = new Visit(visitData);
        await visit.save();
        logger.info(`Added new profile from webhook: ${data.id}`);
      }
    } catch (error) {
      logger.error('Error processing visit event', { 
        error: error.message,
        stack: error.stack,
        data: webhookData?.data?.id 
      });
      throw error;
    }
  }

  /**
   * Process a LinkedIn profile scan event
   */
  async processScanEvent(webhookData) {
    try {
      const { event, data } = webhookData;
      
      // Additional validation
      if (!data || !data.id) {
        logger.warn('Scan event missing required data fields', { data });
        return;
      }

      logger.info(`Processing scan data for profile: ${data.id}`, {
        availableFields: Object.keys(data),
        hasPositions: data['Position-0-Company'] ? true : false,
        hasSchools: data['School-0-Name'] ? true : false,
        hasSkills: data['Skill-0'] ? true : false
      });
      
      // Use the scansController to process scan data
      await scansController.processScans(data);
      
    } catch (error) {
      logger.error('Error processing scan event', { 
        error: error.message,
        stack: error.stack,
        data: webhookData?.data?.id
      });
      throw error;
    }
  }
}

module.exports = new WebhookController();