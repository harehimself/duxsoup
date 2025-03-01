// scripts/queueProfiles.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const CAMPAIGN_ID = process.env.CAMPAIGN_ID || 'csv-import';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '50');

async function processCSVFile(filename, queueType) {
  return new Promise((resolve, reject) => {
    const results = [];
    const filepath = path.join(__dirname, '../data', filename);
    
    if (!fs.existsSync(filepath)) {
      console.log(`File not found: ${filepath}`);
      return resolve([]);
    }
    
    fs.createReadStream(filepath)
      .pipe(csv())
      .on('data', (data) => {
        // Extract profile URL - handle different possible column names
        const profileUrl = data.Profile || data.URL || data.ProfileURL || data['Profile URL'];
        if (profileUrl) {
          results.push(profileUrl);
        }
      })
      .on('end', () => {
        console.log(`Processed ${results.length} profiles from ${filename}`);
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function queueProfiles(profileUrls, queueType) {
  if (profileUrls.length === 0) {
    console.log(`No profiles to queue for ${queueType}`);
    return;
  }
  
  try {
    console.log(`Queueing ${profileUrls.length} profiles for ${queueType}...`);
    const endpoint = queueType === 'visit' ? 'queue/batch' : 'queue/batch';
    
    const response = await axios.post(`${API_URL}/${endpoint}`, {
      profileUrls,
      campaignId: CAMPAIGN_ID,
      batchSize: BATCH_SIZE
    });
    
    console.log(`${queueType} queue results:`, {
      total: response.data.data.total,
      queued: response.data.data.queued,
      failed: response.data.data.failed
    });
  } catch (error) {
    console.error(`Error queueing profiles for ${queueType}:`, error.message);
  }
}

async function main() {
  // Process visit profiles
  const visitProfiles = await processCSVFile('visitProfiles.csv', 'visit');
  await queueProfiles(visitProfiles, 'visit');
  
  // Process scan profiles
  const scanProfiles = await processCSVFile('scanProfiles.csv', 'scan');
  await queueProfiles(scanProfiles, 'scan');
  
  console.log('All queuing operations completed');
}

main().catch(error => {
  console.error('Error in main process:', error);
});