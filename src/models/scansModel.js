const mongoose = require('mongoose');
const config = require('../config');

// Create a schema for scan events
const scansSchema = new mongoose.Schema({
  // Required fields
  id: { type: String, required: true, unique: true },
  ScanTime: { type: Date, required: true },
  Profile: { type: String, required: true },
  'First Name': { type: String, required: true },
  'Last Name': { type: String, required: true },
  
  // Optional fields that may be present in scan data
  'Middle Name': { type: String },
  Title: { type: String },
  SalesProfile: { type: String },
  PublicProfile: { type: String },
  Industry: { type: String },
  Company: { type: String },
  CompanyID: { type: String },
  Location: { type: String },
  Thumbnail: { type: String },
  
  // Structured data containers
  positions: [{ 
    company: String,
    location: String,
    title: String,
    description: String,
    from: String,
    to: String
  }],
  
  schools: [{
    name: String,
    degree: String,
    field: String,
    from: String,
    to: String
  }],
  
  skills: [String],
  
  // All other fields are optional and will be dynamically added
}, { 
  strict: false, // Allow any fields not defined in the schema
  timestamps: true 
});

// Group the data for positions, schools, and skills into structured arrays
scansSchema.pre('save', function(next) {
  const scan = this;
  
  // Group positions
  const positions = [];
  for (let i = 0; i < 36; i++) {
    const prefix = `Position-${i}`;
    if (scan[`${prefix}-Company`]) {
      positions.push({
        company: scan[`${prefix}-Company`],
        location: scan[`${prefix}-Location`],
        title: scan[`${prefix}-Title`],
        description: scan[`${prefix}-Description`],
        from: scan[`${prefix}-From`],
        to: scan[`${prefix}-To`]
      });
      
      // Remove the individual fields
      delete scan[`${prefix}-Company`];
      delete scan[`${prefix}-Location`];
      delete scan[`${prefix}-Title`];
      delete scan[`${prefix}-Description`];
      delete scan[`${prefix}-From`];
      delete scan[`${prefix}-To`];
    }
  }
  
  if (positions.length > 0) {
    scan.positions = positions;
  }
  
  // Group schools
  const schools = [];
  for (let i = 0; i < 20; i++) {
    const prefix = `School-${i}`;
    if (scan[`${prefix}-Name`]) {
      schools.push({
        name: scan[`${prefix}-Name`],
        degree: scan[`${prefix}-Degree`],
        field: scan[`${prefix}-Field`],
        from: scan[`${prefix}-From`],
        to: scan[`${prefix}-To`]
      });
      
      // Remove the individual fields
      delete scan[`${prefix}-Name`];
      delete scan[`${prefix}-Degree`];
      delete scan[`${prefix}-Field`];
      delete scan[`${prefix}-From`];
      delete scan[`${prefix}-To`];
    }
  }
  
  if (schools.length > 0) {
    scan.schools = schools;
  }
  
  // Group skills
  const skills = [];
  for (let i = 0; i < 20; i++) {
    const field = `Skill-${i}`;
    if (scan[field]) {
      skills.push(scan[field]);
      delete scan[field];
    }
  }
  
  if (skills.length > 0) {
    scan.skills = skills;
  }
  
  next();
});

// Create and export the model
const Scan = mongoose.model('Scan', scansSchema, 'scans');

module.exports = Scan;