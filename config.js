// src/config.js
require('dotenv').config();

module.exports = {
  // MongoDB connection settings
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/duxsoup',
    dbName: process.env.DB_NAME || 'duxsoup',
    collectionName: process.env.COLLECTION_NAME || 'visits',
    scanCollectionName: process.env.SCAN_COLLECTION_NAME || 'scans'
  },
  
  // DuxSoup API configuration
  duxsoup: {
    userId: process.env.DUXSOUP_USER_ID,
    apiKey: process.env.DUXSOUP_API_KEY,
    baseUrl: 'https://app.dux-soup.com/xapi'
  }
};