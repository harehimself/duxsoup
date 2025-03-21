// src/analysis/geographicDistribution.js
const mongoose = require('mongoose');
const Visit = require('../models/visitsModel');
const Scan = require('../models/scansModel');

async function analyzeGeographicDistribution() {
  // Analyze location data from all connections
  const pipeline = [
    // Match records with location data
    { $match: { Location: { $exists: true, $ne: "" } } },
    // Extract location components
    { $project: {
      id: 1,
      fullLocation: "$Location",
      // Extract simple location components
      location: {
        $let: {
          vars: {
            parts: { $split: ["$Location", ", "] }
          },
          in: {
            city: { $arrayElemAt: ["$$parts", 0] },
            region: { 
              $cond: [
                { $gt: [{ $size: "$$parts" }, 1] },
                { $arrayElemAt: ["$$parts", 1] },
                ""
              ]
            },
            country: { 
              $cond: [
                { $gt: [{ $size: "$$parts" }, 2] },
                { $arrayElemAt: ["$$parts", 2] },
                { $cond: [
                  { $gt: [{ $size: "$$parts" }, 1] },
                  { $arrayElemAt: ["$$parts", 1] },
                  ""
                ]}
              ]
            }
          }
        }
      }
    }},
    // Group by normalized location
    { $group: {
      _id: "$location",
      count: { $sum: 1 },
      profiles: { $push: { id: "$id", fullLocation: "$fullLocation" } }
    }},
    // Sort by count
    { $sort: { count: -1 } }
  ];

  const locationData = await Visit.aggregate(pipeline);
  
  // Process for visualization 
  return locationData.map(location => ({
    city: location._id.city,
    region: location._id.region,
    country: location._id.country,
    count: location.count,
    profiles: location.profiles
  }));
}

module.exports = { analyzeGeographicDistribution };