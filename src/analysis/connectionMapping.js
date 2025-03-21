// src/analysis/connectionMapping.js
const mongoose = require('mongoose');
const Visit = require('../models/visitsModel');
const Scan = require('../models/scansModel');

async function mapCompanyConnections(companyName) {
  // Connect collections for cross-referencing
  const pipeline = [
    // Match records with the target company
    { $match: { 
      $or: [
        { Company: { $regex: companyName, $options: 'i' } },
        { "positions.company": { $regex: companyName, $options: 'i' } }
      ]
    }},
    // Project relevant fields
    { $project: {
      id: 1,
      fullName: { $concat: ["$First Name", " ", "$Last Name"] },
      title: "$Title",
      company: "$Company",
      degree: "$Degree",
      positions: 1,
      location: "$Location",
      profile: "$Profile"
    }},
    // Sort by connection degree (1st, 2nd, 3rd)
    { $sort: { degree: 1 } }
  ];

  const companyConnections = await Visit.aggregate(pipeline);
  
  // Organize by degree of connection
  const result = {
    directConnections: companyConnections.filter(c => c.degree === '1st'),
    secondDegree: companyConnections.filter(c => c.degree === '2nd'),
    thirdDegree: companyConnections.filter(c => c.degree === '3rd')
  };
  
  return result;
}

module.exports = { mapCompanyConnections };