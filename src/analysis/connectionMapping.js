// src/analysis/connectionMapping.js
const mongoose = require('mongoose');
const Visit = require('../models/visitsModel');
const logger = require('../utils/logger');

async function mapCompanyConnections(companyName) {
  try {
    // Use a simpler query approach
    const companyPattern = new RegExp(companyName, 'i');
    
    // Simple find query with projection and limit
    const companyConnections = await Visit.find({
      $or: [
        { Company: companyPattern },
        { "positions.company": companyPattern }
      ]
    })
    .select('id "First Name" "Last Name" Title Company Degree Location Profile')
    .limit(50)  // Limit results to avoid performance issues
    .maxTimeMS(30000)  // Extend timeout to 30 seconds
    .lean();  // Return plain objects instead of Mongoose documents
    
    // Process the results
    const result = {
      directConnections: [],
      secondDegree: [],
      thirdDegree: []
    };
    
    for (const conn of companyConnections) {
      const profile = {
        id: conn.id,
        fullName: `${conn['First Name']} ${conn['Last Name']}`,
        title: conn.Title,
        company: conn.Company,
        degree: conn.Degree || '3rd', // Default to 3rd if not specified
        location: conn.Location,
        profile: conn.Profile
      };
      
      // Sort by connection degree
      if (profile.degree === '1st') {
        result.directConnections.push(profile);
      } else if (profile.degree === '2nd') {
        result.secondDegree.push(profile);
      } else {
        result.thirdDegree.push(profile);
      }
    }
    
    return result;
  } catch (error) {
    logger.error('Error in mapCompanyConnections', { error: error.message });
    throw error;
  }
}

module.exports = { mapCompanyConnections };