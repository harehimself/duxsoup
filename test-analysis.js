// test-analysis.js
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./config');

async function testConnection() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    console.log(`URI: ${config.mongo.uri}`);
    console.log(`DB Name: ${config.mongo.dbName}`);
    
    await mongoose.connect(config.mongo.uri, {
      dbName: config.mongo.dbName
    });
    
    console.log("Connected successfully to MongoDB Atlas!");
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\nAvailable collections:");
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Sample data from visits collection
    if (collections.some(c => c.name === config.mongo.collectionName)) {
      const visits = await mongoose.connection.db.collection(config.mongo.collectionName).find().limit(1).toArray();
      console.log("\nSample document from visits collection:");
      console.log(JSON.stringify(visits[0], null, 2));
    }
    
  } catch (error) {
    console.error("Connection error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

testConnection();