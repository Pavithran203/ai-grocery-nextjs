const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

const dumpDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const categories = await Category.find().lean();
    const products = await Product.find().lean();
    const users = await User.find().select('-password').lean();

    const output = {
      Overview: {
        TotalUsers: users.length,
        TotalCategories: categories.length,
        TotalProducts: products.length
      },
      Categories: categories.map(c => c.name),
      SampleUsers: users.map(u => ({ name: u.name, email: u.email, role: u.role })),
      SampleProducts: products.slice(0, 3).map(p => ({
        name: p.name,
        price: p.price,
        category: p.category,
        stock_status: p.inStock ? 'In Stock' : 'Out of Stock'
      }))
    };

    console.log(JSON.stringify(output, null, 2));

    // Save to artifact so Antigravity can read it clearly without terminal chopping
    fs.writeFileSync(path.resolve(__dirname, '../../db_dump.json'), JSON.stringify(output, null, 2));
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error fetching data:', err.message);
    process.exit(1);
  }
};

dumpDB();
