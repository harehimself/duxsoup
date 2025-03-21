// config.js
require('dotenv').config();

module.exports = {
  // MongoDB connection settings
  mongo: {
    uri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/duxsoup',
    dbName: process.env.MONGO_DB_NAME || process.env.DB_NAME || 'duxsoup',
    collectionName: process.env.MONGO_COLLECTION_NAME || process.env.COLLECTION_NAME || 'visits',
    scanCollectionName: process.env.SCAN_COLLECTION_NAME || 'scans'
  },
  
  // DuxSoup API configuration
  duxsoup: {
    userId: process.env.DUXSOUP_USER_ID,
    apiKey: process.env.DUXSOUP_API_KEY,
    clientId: process.env.DUXSOUP_CLIENT_ID,
    baseUrl: process.env.DUXSOUP_REMOTE_CONTROL_URL || 'https://app.dux-soup.com/xapi'
  },
  
  // Application settings
  app: {
    port: process.env.PORT || 3000,
    fetchInterval: parseInt(process.env.FETCH_INTERVAL) || 3600000 // Default 1 hour
  }
};