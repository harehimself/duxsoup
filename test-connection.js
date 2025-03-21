// test-connection.js
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log("Connected successfully to MongoDB Atlas!");
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Available collections:");
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Count documents in collections
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`Collection ${collection.name}: ${count} documents`);
    }
  } catch (error) {
    console.error("Connection error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

testConnection();