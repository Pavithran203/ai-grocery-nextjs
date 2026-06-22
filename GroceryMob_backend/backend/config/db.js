const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedDatabase = require('../utils/seed');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nearmart';
    
    // Connect mongoose to persistent DB with 3s timeout
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ MongoDB Connected persistently: ${conn.connection.host}!`);

    // Auto-seed with categories and products only if database is empty
    await seedDatabase();
  } catch (error) {
    console.log(`⚠️ Physical MongoDB Connection Error: ${error.message}`);
    console.log('⚡ Attempting fallback to MongoMemoryServer...');
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ Connected to MongoMemoryServer: ${conn.connection.host}!`);
      
      // Auto-seed the in-memory database
      await seedDatabase();
    } catch (fallbackError) {
      console.error(`❌ Fallback MongoDB Connection Error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

