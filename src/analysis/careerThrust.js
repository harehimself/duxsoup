// src/analysis/careerThrust.js
const mongoose = require('mongoose');
const Visit = require('../models/visitsModel');

async function identifyRisingLeaders(domainOrCompanies = [], timeframe = 24) {
  // Calculate date threshold (e.g., last 24 months)
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - timeframe);
  
  // Create company filter if provided
  let companyFilter = {};
  if (domainOrCompanies.length > 0) {
    companyFilter = {
      $or: [
        { Company: { $in: domainOrCompanies.map(c => new RegExp(c, 'i')) } },
        { "positions.company": { $in: domainOrCompanies.map(c => new RegExp(c, 'i')) } }
      ]
    };
  }
  
  // Find profiles with multiple position changes in timeframe
  const pipeline = [
    // Match profiles with positions
    { $match: {
      positions: { $exists: true, $ne: [] },
      ...companyFilter
    }},
    // Add calculated fields for career progression analysis
    { $project: {
      id: 1,
      fullName: { $concat: ["$First Name", " ", "$Last Name"] },
      currentTitle: "$Title",
      currentCompany: "$Company",
      profile: "$Profile",
      positions: 1,
      positionCount: { $size: "$positions" },
      // Calculate promotion speed
      recentPositions: {
        $filter: {
          input: "$positions",
          as: "position",
          cond: { 
            $or: [
              { $eq: ["$$position.to", "Present"] },
              { $gte: [{ $dateFromString: { dateString: "$$position.from" } }, threshold] }
            ]
          }
        }
      }
    }},
    // Filter to those with multiple recent positions
    { $match: {
      "recentPositions.0": { $exists: true }
    }},
    // Calculate career velocity score
    { $addFields: {
      careerVelocity: { $size: "$recentPositions" },
      titleProgression: {
        $reduce: {
          input: "$recentPositions",
          initialValue: 0,
          in: {
            // Simple heuristic: +1 for each management term in titles
            $add: [
              "$$value", 
              { $cond: [
                { $regexMatch: { input: "$$this.title", regex: /manager|director|vp|chief|head|lead/i } },
                1,
                0
              ]}
            ]
          }
        }
      }
    }},
    // Sort by career velocity and title progression
    { $sort: { careerVelocity: -1, titleProgression: -1 } },
    // Limit results
    { $limit: 100 }
  ];

  const risingLeaders = await Visit.aggregate(pipeline);
  return risingLeaders;
}

module.exports = { identifyRisingLeaders };