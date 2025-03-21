// src/analysis/educationAnalysis.js
const mongoose = require('mongoose');
const Visit = require('../models/visitsModel');
const Scan = require('../models/scansModel');

async function analyzeEducationPatterns() {
  // Analyze education details
  const pipeline = [
    // Match records with education data
    { $match: { schools: { $exists: true, $ne: [] } } },
    // Unwind the schools array to analyze each school separately
    { $unwind: "$schools" },
    // Group by school and degree
    { $group: {
      _id: { 
        school: "$schools.name",
        degree: "$schools.degree",
        field: "$schools.field"
      },
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

  const educationData = await Visit.aggregate(pipeline);
  
  return educationData.map(edu => ({
    school: edu._id.school,
    degree: edu._id.degree,
    field: edu._id.field,
    count: edu.count,
    profiles: edu.profiles
  }));
}

module.exports = { analyzeEducationPatterns };