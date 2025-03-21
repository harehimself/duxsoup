// src/controllers/analysisController.js
const connectionMapping = require('../analysis/connectionMapping');
const connectionTiming = require('../analysis/connectionTiming');
const careerThrust = require('../analysis/careerThrust');
const geographicDistribution = require('../analysis/geographicDistribution');
const educationAnalysis = require('../analysis/educationAnalysis');
const seniorityAnalysis = require('../analysis/seniorityAnalysis');
const domainAnalysis = require('../analysis/domainAnalysis');

class AnalysisController {
  async getCompanyConnections(req, res) {
    try {
      const { company } = req.params;
      if (!company) {
        return res.status(400).json({ error: 'Company name is required' });
      }
      
      const results = await connectionMapping.mapCompanyConnections(company);
      res.status(200).json({
        status: 'success',
        data: results
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getConnectionTiming(req, res) {
    try {
      const results = await connectionTiming.analyzeConnectionTiming();
      res.status(200).json({
        status: 'success',
        data: results
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getRisingLeaders(req, res) {
    try {
      const { domain, timeframe } = req.query;
      const domains = domain ? domain.split(',') : [];
      const months = timeframe ? parseInt(timeframe) : 24;
      
      const results = await careerThrust.identifyRisingLeaders(domains, months);
      res.status(200).json({
        status: 'success',
        data: results
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getGeographicDistribution(req, res) {
    try {
      const results = await geographicDistribution.analyzeGeographicDistribution();
      res.status(200).json({
        status: 'success',
        data: results
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getEducationPatterns(req, res) {
    try {
      const results = await educationAnalysis.analyzeEducationPatterns();
      res.status(200).json({
        status: 'success',
        data: results
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getSeniorityDistribution(req, res) {
    try {
      const results = await seniorityAnalysis.analyzeSeniorityDistribution();
      res.status(200).json({
        status: 'success',
        data: results
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getIndustryDomains(req, res) {
    try {
      const results = await domainAnalysis.analyzeIndustryDomains();
      res.status(200).json({
        status: 'success',
        data: results
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AnalysisController();