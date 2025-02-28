require('dotenv').config();

module.exports = {
  mongo: {
    uri: process.env.MONGO_URI,
    dbName: process.env.MONGO_DB_NAME,
    collectionName: process.env.MONGO_COLLECTION_NAME
  },
  duxsoup: {
    apiKey: process.env.DUXSOUP_API_KEY,
    userId: process.env.DUXSOUP_USER_ID,
    clientId: process.env.DUXSOUP_CLIENT_ID,
    remoteControlUrl: process.env.DUXSOUP_REMOTE_CONTROL_URL
  },
  app: {
    fetchInterval: parseInt(process.env.FETCH_INTERVAL) || 3600000 // Default 1 hour
  }
};