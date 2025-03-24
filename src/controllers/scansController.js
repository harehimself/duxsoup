const Scan = require('../models/scansModel');
const logger = require('../utils/logger');
const { collectionExists } = require('../utils/collectionUtils');

class ScansController {
  async processScans(scanData) {
    try {
      // Enhanced logging to see exactly what fields are being received
      logger.info('Processing scan event details', { 
        profileId: scanData.id,
        availableFields: Object.keys(scanData),
        firstName: scanData['First Name'],
        lastName: scanData['Last Name'],
        title: scanData['Title'],
        company: scanData['Company'],
        // Log presence of structured data fields
        hasStructuredData: {
          positions: !!scanData['Position-0-Company'],
          education: !!scanData['School-0-Name'],
          skills: !!scanData['Skill-0']
        }
      });

      // Ensure 'scans' collection exists
      const collectionFound = await collectionExists(Scan);
      if (!collectionFound) {
        logger.error("MongoDB collection 'scans' does not exist");
        return { error: "Collection 'scans' does not exist" };
      }

      // Check if this profile already exists in our database
      const existingScan = await Scan.findOne({ id: scanData.id });

      if (existingScan) {
        // Log before transformation
        logger.debug('Existing scan before update', {
          id: existingScan.id,
          fieldCount: Object.keys(existingScan._doc).length
        });
        
        // Update existing record
        Object.assign(existingScan, scanData);
        await existingScan.save();
        
        // Log after transformation
        logger.debug('Scan after update', {
          id: existingScan.id,
          hasPositions: Array.isArray(existingScan.positions) && existingScan.positions.length > 0,
          hasSchools: Array.isArray(existingScan.schools) && existingScan.schools.length > 0,
          hasSkills: Array.isArray(existingScan.skills) && existingScan.skills.length > 0
        });
        
        logger.info(`Updated scan: ${scanData.id}`);
        return { status: 'updated', id: scanData.id };
      } else {
        // Create new record
        const scan = new Scan({ ...scanData, ScanTime: new Date(scanData.ScanTime) });
        
        // Log before save to see what might be transformed
        logger.debug('New scan before save', {
          id: scan.id,
          fieldCount: Object.keys(scan._doc).length,
          sampleFields: Object.keys(scan._doc).slice(0, 10)
        });
        
        await scan.save();
        
        // Log after save to confirm data transformation
        logger.debug('New scan after save', {
          id: scan.id,
          hasPositions: Array.isArray(scan.positions) && scan.positions.length > 0,
          hasSchools: Array.isArray(scan.schools) && scan.schools.length > 0,
          hasSkills: Array.isArray(scan.skills) && scan.skills.length > 0
        });
        
        logger.info(`Added new scan: ${scanData.id}`);
        return { status: 'added', id: scanData.id };
      }
    } catch (error) {
      logger.error('Error in processScans', { 
        error: error.message, 
        stack: error.stack,
        profileId: scanData?.id 
      });
      throw error;
    }
  }

  async getStoredScans(query = {}) {
    try {
      const scans = await Scan.find(query).lean();
      return scans;
    } catch (error) {
      logger.error('Error fetching stored scans', { error: error.message });
      throw error;
    }
  }
}

module.exports = new ScansController();