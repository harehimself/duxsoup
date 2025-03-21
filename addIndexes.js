// addIndexes.js
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./src/utils/logger');

async function createIndexes() {
  try {
    await mongoose.connect(config.mongo.uri, {
      dbName: config.mongo.dbName
    });
    console.log("MongoDB connected for index creation");
    
    // Get the collections
    const db = mongoose.connection.db;
    const visitsCollection = db.collection('visits');
    const scansCollection = db.collection('scans');
    
    // Create indexes for company searches
    await visitsCollection.createIndex({ Company: 1 });
    await visitsCollection.createIndex({ "positions.company": 1 });
    await scansCollection.createIndex({ Company: 1 });
    await scansCollection.createIndex({ "positions.company": 1 });
    
    console.log("Indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createIndexes();