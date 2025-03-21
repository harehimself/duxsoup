// src/analysis/domainAnalysis.js
const mongoose = require('mongoose');
const Visit = require('../models/visitsModel');

async function analyzeIndustryDomains() {
  // Pipeline to analyze industry domains
  const pipeline = [
    // Match records with industry data
    { $match: { Industry: { $exists: true, $ne: "" } } },
    // Group by industry
    { $group: {
      _id: "$Industry",
      count: { $sum: 1 },
      profiles: { $push: { 
        id: "$id", 
        name: { $concat: ["$First Name", " ", "$Last Name"] },
        title: "$Title",
        company: "$Company",
        profile: "$Profile"
      }}
    }},
    // Sort by count
    { $sort: { count: -1 } }
  ];

  const industryData = await Visit.aggregate(pipeline);
  
  return industryData.map(industry => ({
    industry: industry._id,
    count: industry.count,
    profiles: industry.profiles
  }));
}

module.exports = { analyzeIndustryDomains };