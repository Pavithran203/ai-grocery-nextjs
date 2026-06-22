const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Combo = require('../models/Combo');

dotenv.config();

const seedCombos = async () => {
  try {
    const uri = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshkart').replace('localhost', '127.0.0.1');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    await Combo.deleteMany({});
    console.log('Cleared existing combos');

    const products = await Product.find().limit(10);
    if (products.length < 3) {
      console.log('Not enough products to create combos. Run product seed first.');
      process.exit(1);
    }

    // Breakfast Combo
    const breakfastProducts = [products[0], products[1]]; // Assume bread, milk etc
    const breakfastOriginal = breakfastProducts.reduce((sum, p) => sum + p.price, 0);
    const breakfastComboPrice = Math.round(breakfastOriginal * 0.8); // 20% off

    // Family Combo
    const familyProducts = [products[2], products[3], products[4]]; 
    const familyOriginal = familyProducts.reduce((sum, p) => sum + p.price, 0);
    const familyComboPrice = Math.round(familyOriginal * 0.75); // 25% off

    const combos = [
      {
        title: 'Morning Breakfast Saver',
        description: 'Start your day with essential nutrients at a great price.',
        products: breakfastProducts.map(p => p._id),
        originalPrice: breakfastOriginal,
        comboPrice: breakfastComboPrice,
        image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80',
        type: 'Breakfast',
        isActive: true
      },
      {
        title: 'Weekend Family Pack',
        description: 'Everything you need for a complete family meal.',
        products: familyProducts.map(p => p._id),
        originalPrice: familyOriginal,
        comboPrice: familyComboPrice,
        image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&q=80',
        type: 'Family',
        isActive: true
      }
    ];

    await Combo.insertMany(combos);
    console.log('Successfully seeded combos');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding combos:', error);
    process.exit(1);
  }
};

seedCombos();
