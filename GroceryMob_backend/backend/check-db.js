require('dotenv').config();
const mongoose = require('mongoose');

// Import your models
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const Category = require('./models/Category');

async function checkDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Use the exact MONGO_URI from your .env file
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nearmart');
    console.log('✅ Connected successfully!\n');

    const fs = require('fs');

    // Fetch ALL records from the collections
    const products = await Product.find().select('-__v').lean();
    const users = await User.find().select('-password -__v').lean();
    const categories = await Category.find().select('-__v').lean();
    const orders = await Order.find().select('-__v').lean();

    const dbDump = {
      summary: {
        totalProducts: products.length,
        totalUsers: users.length,
        totalCategories: categories.length,
        totalOrders: orders.length
      },
      categories,
      users,
      products,
      orders
    };

    // Save everything to a JSON file in the backend folder
    fs.writeFileSync('db-data.json', JSON.stringify(dbDump, null, 2));

    console.log(`✅ Success! Extracted all data.`);
    console.log(`📦 Saved ${products.length} products`);
    console.log(`👥 Saved ${users.length} users`);
    console.log(`📁 Saved ${categories.length} categories`);
    console.log(`\n➡️ Open the newly created "db-data.json" file in your editor to see all the data!`);

  } catch (error) {
    console.error('❌ Error connecting or reading DB:', error.message);
  } finally {
    // Always close the connection
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  }
}

checkDatabase();
