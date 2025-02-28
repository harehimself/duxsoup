const mongoose = require('mongoose');
const config = require('../config');

// Create a schema that automatically matches all possible DuxSoup fields
// This is a more flexible approach than strictly defining each field
const visitsSchema = new mongoose.Schema({
  // Required fields
  id: { type: String, required: true, unique: true },
  VisitTime: { type: Date, required: true },
  Profile: { type: String, required: true },
  SalesProfile: { type: String, required: true },
  Degree: { type: String, required: true },
  'First Name': { type: String, required: true },
  
  // All other fields are optional and will be dynamically added
}, { 
  strict: false, // Allow any fields not defined in the schema
  timestamps: true 
});

// Group the data for positions, schools, and skills into structured arrays
visitsSchema.pre('save', function(next) {
  const visit = this;
  
  // Group positions
  const positions = [];
  for (let i = 0; i < 36; i++) {
    const prefix = `Position-${i}`;
    if (visit[`${prefix}-Company`]) {
      positions.push({
        company: visit[`${prefix}-Company`],
        location: visit[`${prefix}-Location`],
        title: visit[`${prefix}-Title`],
        description: visit[`${prefix}-Description`],
        from: visit[`${prefix}-From`],
        to: visit[`${prefix}-To`]
      });
      
      // Remove the individual fields
      delete visit[`${prefix}-Company`];
      delete visit[`${prefix}-Location`];
      delete visit[`${prefix}-Title`];
      delete visit[`${prefix}-Description`];
      delete visit[`${prefix}-From`];
      delete visit[`${prefix}-To`];
    }
  }
  
  if (positions.length > 0) {
    visit.positions = positions;
  }
  
  // Group schools
  const schools = [];
  for (let i = 0; i < 20; i++) {
    const prefix = `School-${i}`;
    if (visit[`${prefix}-Name`]) {
      schools.push({
        name: visit[`${prefix}-Name`],
        degree: visit[`${prefix}-Degree`],
        field: visit[`${prefix}-Field`],
        from: visit[`${prefix}-From`],
        to: visit[`${prefix}-To`]
      });
      
      // Remove the individual fields
      delete visit[`${prefix}-Name`];
      delete visit[`${prefix}-Degree`];
      delete visit[`${prefix}-Field`];
      delete visit[`${prefix}-From`];
      delete visit[`${prefix}-To`];
    }
  }
  
  if (schools.length > 0) {
    visit.schools = schools;
  }
  
  // Group skills
  const skills = [];
  for (let i = 0; i < 20; i++) {
    const field = `Skill-${i}`;
    if (visit[field]) {
      skills.push(visit[field]);
      delete visit[field];
    }
  }
  
  if (skills.length > 0) {
    visit.skills = skills;
  }
  
  next();
});

// Initialize MongoDB connection
mongoose.connect(config.mongo.uri, {
  dbName: config.mongo.dbName
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Create and export the model
const Visit = mongoose.model('Visit', visitsSchema, config.mongo.collectionName);

module.exports = Visit;