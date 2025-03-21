// config.js
require('dotenv').config();

module.exports = {
  // MongoDB connection settings
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/duxsoup',
    dbName: process.env.MONGO_DB_NAME || 'duxsoup',
    collectionName: process.env.MONGO_COLLECTION_NAME || 'visits',
    scanCollectionName: process.env.SCAN_COLLECTION_NAME || 'scans'
  },
  
  duxsoup: {
    userId: process.env.DUXSOUP_USER_ID,
    apiKey: process.env.DUXSOUP_API_KEY,
    baseUrl: 'https://app.dux-soup.com/xapi'
  },
  
  // Application settings
  app: {
    port: process.env.PORT || 3000,
    fetchInterval: parseInt(process.env.FETCH_INTERVAL) || 3600000 // Default 1 hour
  }
};