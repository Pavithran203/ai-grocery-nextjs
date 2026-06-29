require('dotenv').config();
const mongoose = require('mongoose');
const Store = require('./models/Store');
const Product = require('./models/Product');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nearmart');
  const stores = await Store.find().lean();
  console.log('--- STORES ---');
  stores.forEach(s => console.log(`Store ID: ${s._id}, Name: "${s.name}"`));

  const products = await Product.find().limit(5).populate('store').lean();
  console.log('--- SAMPLE PRODUCTS ---');
  products.forEach(p => {
    console.log(`Product ID: ${p._id}, Name: "${p.name}", Store Ref: ${p.store ? p.store.name : 'null'}`);
  });

  await mongoose.disconnect();
}
run();
