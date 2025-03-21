// src/analysis/connectionTiming.js
const mongoose = require('mongoose');
const Visit = require('../models/visitsModel');

async function analyzeConnectionTiming() {
  // Analyze connection acceptance patterns
  const pipeline = [
    // Filter for connections that were accepted
    { $match: { 
      "Connected": true,
      "ConnectionTime": { $exists: true }
    }},
    // Extract time components
    { $project: {
      id: 1,
      connectionTime: "$ConnectionTime",
      dayOfWeek: { $dayOfWeek: "$ConnectionTime" },
      hour: { $hour: "$ConnectionTime" }
    }},
    // Group by day and hour
    { $group: {
      _id: { dayOfWeek: "$dayOfWeek", hour: "$hour" },
      count: { $sum: 1 },
      connections: { $push: "$id" }
    }},
    // Sort by count (highest first)
    { $sort: { count: -1 } }
  ];

  const timingAnalysis = await Visit.aggregate(pipeline);
  
  // Convert day numbers to names
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const result = timingAnalysis.map(item => ({
    dayOfWeek: dayNames[item._id.dayOfWeek - 1],
    hour: item._id.hour,
    count: item.count,
    connectionIds: item.connections
  }));
  
  return result;
}

module.exports = { analyzeConnectionTiming };