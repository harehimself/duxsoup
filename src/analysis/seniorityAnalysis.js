// src/analysis/seniorityAnalysis.js
const mongoose = require('mongoose');
const Visit = require('../models/visitsModel');

async function analyzeSeniorityDistribution() {
  // Define seniority keywords and their weights
  const seniorityLevels = [
    { level: "C-Suite", regex: /^c[a-z]o$|chief|president/i, weight: 5 },
    { level: "VP", regex: /^vp|vice president/i, weight: 4 },
    { level: "Director", regex: /director/i, weight: 3 },
    { level: "Manager", regex: /manager|head of/i, weight: 2 },
    { level: "Individual Contributor", regex: /specialist|associate|analyst|consultant/i, weight: 1 }
  ];
  
  // Pipeline to analyze titles
  const pipeline = [
    // Match records with title data
    { $match: { Title: { $exists: true, $ne: "" } } },
    // Project fields for seniority analysis
    { $project: {
      id: 1,
      name: { $concat: ["$First Name", " ", "$Last Name"] },
      title: "$Title",
      company: "$Company",
      profile: "$Profile"
    }}
  ];

  const profiles = await Visit.aggregate(pipeline);
  
  // Process profiles to determine seniority
  const results = {
    seniorityDistribution: {},
    profiles: []
  };
  
  // Initialize counts
  seniorityLevels.forEach(level => {
    results.seniorityDistribution[level.level] = 0;
  });
  
  // Analyze each profile
  profiles.forEach(profile => {
    let matchedLevel = "Other";
    let highestWeight = 0;
    
    // Find the highest seniority level that matches
    seniorityLevels.forEach(level => {
      if (level.regex.test(profile.title) && level.weight > highestWeight) {
        matchedLevel = level.level;
        highestWeight = level.weight;
      }
    });
    
    // Increment count
    results.seniorityDistribution[matchedLevel] = (results.seniorityDistribution[matchedLevel] || 0) + 1;
    
    // Add to profiles with seniority classification
    results.profiles.push({
      ...profile,
      seniorityLevel: matchedLevel,
      seniorityWeight: highestWeight
    });
  });
  
  return results;
}

module.exports = { analyzeSeniorityDistribution };