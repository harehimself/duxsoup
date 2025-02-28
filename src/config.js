require('dotenv').config();

module.exports = {
  mongo: {
    uri: process.env.MONGO_URI,
    dbName: process.env.MONGO_DB_NAME,
    collectionName: process.env.MONGO_COLLECTION_NAME
  },
  duxsoup: {
    apiKey: process.env.DUXSOUP_API_KEY,
    baseUrl: 'https://api.duxsoup.com/v1'
  },
  app: {
    fetchInterval: parseInt(process.env.FETCH_INTERVAL) || 3600000 // Default 1 hour
  }
};