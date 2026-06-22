require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');

async function deleteUserByName(nameToDelete) {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grocery_db');
    console.log('✅ Connected successfully!\n');

    // Delete from Users collection
    const userResult = await User.deleteMany({ name: nameToDelete });
    console.log(`🗑️ Deleted ${userResult.deletedCount} records from Users collection.`);

    // Delete from Customers collection (first name or full name match)
    const customerResult = await Customer.deleteMany({ 
      $or: [
        { firstName: nameToDelete },
        { fullName: nameToDelete }
      ]
    });
    console.log(`🗑️ Deleted ${customerResult.deletedCount} records from Customers collection.`);

    console.log('\n✅ User successfully removed from the actual database!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed.');
    process.exit(0);
  }
}

// Pass the name you want to delete here
deleteUserByName(/sanduru/i);
