const Category = require('../models/Category');
const Product = require('../models/Product');
const Combo = require('../models/Combo');

// ─── GROCERY-ONLY CATEGORIES ─────────────────────────────────
const categories = [
  { name: 'Rice & Grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400', sortOrder: 1 },
  { name: 'Dal & Pulses', image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400', sortOrder: 2 },
  { name: 'Flour & Powders', image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=400', sortOrder: 3 },
  { name: 'Oil & Ghee', image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400', sortOrder: 4 },
  { name: 'Masalas & Spices', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', sortOrder: 5 },
  { name: 'Sugar & Salt', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400', sortOrder: 6 },
  { name: 'Dry Items & Cooking Essentials', image: 'https://images.unsplash.com/photo-1590080876351-941da357a4e4?w=400', sortOrder: 7 },
  { name: 'Packed Grocery', image: 'https://images.unsplash.com/photo-1604514813560-1e4f0c783c64?w=400', sortOrder: 8 },
];

// ─── IMAGE MAP ───────────────────────────────────────────────
const RICE_IMG = 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400/samples/food/fish-vegetables.jpg';
const DAL_IMG = 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400/samples/food/spices.jpg';
const FLOUR_IMG = 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400/samples/food/dessert.jpg';
const OIL_IMG = 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400/samples/food/potatoes.jpg';
const SPICE_IMG = 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400/samples/food/spices.jpg';
const SUGAR_IMG = 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400/samples/food/dessert.jpg';

const IMAGE_MAP = {
  'Ponni Raw Rice': RICE_IMG,
  'Basmati Rice': RICE_IMG,
  'Sona Masoori Rice': RICE_IMG,
  'Idly Rice': RICE_IMG,
  'India Gate Basmati Rice': RICE_IMG,
  'Wheat (Whole)': FLOUR_IMG,
  'Ragi (Finger Millet)': FLOUR_IMG,
  'Toor Dal': DAL_IMG,
  'Urad Dal': DAL_IMG,
  'Moong Dal': DAL_IMG,
  'Chana Dal': DAL_IMG,
  'Masoor Dal': DAL_IMG,
  'Wheat Flour (Atta)': FLOUR_IMG,
  'Maida': FLOUR_IMG,
  'Ragi Flour': FLOUR_IMG,
  'Rice Flour': FLOUR_IMG,
  'Besan (Gram Flour)': FLOUR_IMG,
  'Aashirvaad Atta': FLOUR_IMG,
  'Sunflower Oil': OIL_IMG,
  'Groundnut Oil': OIL_IMG,
  'Gingelly Oil (Sesame)': OIL_IMG,
  'Pure Ghee': OIL_IMG,
  'Coconut Oil': OIL_IMG,
  'Turmeric Powder': SPICE_IMG,
  'Chilli Powder': SPICE_IMG,
  'Coriander Powder': SPICE_IMG,
  'Garam Masala': SPICE_IMG,
  'Black Pepper': SPICE_IMG,
  'Cumin Seeds (Jeera)': SPICE_IMG,
  'Mustard Seeds': SPICE_IMG,
  'Fenugreek Seeds': SPICE_IMG,
  'Sugar': SUGAR_IMG,
  'Iodized Salt': SUGAR_IMG,
  'Rock Salt': SUGAR_IMG,
  'Brown Sugar': SUGAR_IMG,
  'Jaggery Powder': SUGAR_IMG,
  'Rava (Sooji)': FLOUR_IMG,
  'Vermicelli': FLOUR_IMG,
  'Tamarind': SPICE_IMG,
  'Jaggery (Block)': SUGAR_IMG,
  'Papad': DAL_IMG,
  'Mango Pickle': SPICE_IMG,
  'MTR Rava Idli Mix': FLOUR_IMG,
  'MTR Gulab Jamun Mix': FLOUR_IMG,
};

const CATEGORY_FALLBACKS = {
  'Rice & Grains': RICE_IMG,
  'Dal & Pulses': DAL_IMG,
  'Flour & Powders': FLOUR_IMG,
  'Oil & Ghee': OIL_IMG,
  'Masalas & Spices': SPICE_IMG,
  'Sugar & Salt': SUGAR_IMG,
  'Dry Items & Cooking Essentials': DAL_IMG,
  'Packed Grocery': DAL_IMG,
};

// [name, price, origPrice, rating, reviews, category, unit, brand, isTrending, isRecommended, stock, description, tags]
const rawData = [
  // ── Rice & Grains ──
  ['Ponni Raw Rice', 399, 450, 4.8, 420, 'Rice & Grains', '5 kg', 'Local', true, true, 80, 'Premium Ponni raw rice ideal for daily cooking', ['rice','ponni','staples']],
  ['Basmati Rice', 199, 240, 4.7, 260, 'Rice & Grains', '1 kg', 'India Gate', false, true, 90, 'Long grain aromatic basmati rice', ['basmati','rice','biryani']],
  ['Sona Masoori Rice', 280, 320, 4.6, 310, 'Rice & Grains', '5 kg', 'Local', true, false, 75, 'Lightweight Sona Masoori rice for everyday meals', ['sona masoori','rice']],
  ['Idly Rice', 320, 380, 4.7, 260, 'Rice & Grains', '5 kg', 'Local', false, true, 60, 'Short grain rice perfect for idli and dosa batter', ['idly','rice','dosa']],
  ['India Gate Basmati Rice', 590, 650, 4.8, 290, 'Rice & Grains', '5 kg', 'India Gate', false, true, 65, 'Premium long grain basmati for biryani', ['basmati','premium','biryani']],
  ['Wheat (Whole)', 55, 65, 4.5, 120, 'Rice & Grains', '1 kg', 'Local', false, false, 100, 'Whole wheat grains for grinding or cooking', ['wheat','grains']],
  ['Ragi (Finger Millet)', 75, 90, 4.6, 95, 'Rice & Grains', '1 kg', 'Local', false, true, 70, 'Nutritious finger millet for porridge and flour', ['ragi','millet']],

  // ── Dal & Pulses ──
  ['Toor Dal', 145, 170, 4.7, 380, 'Dal & Pulses', '1 kg', 'Tata Sampann', true, true, 100, 'Split pigeon pea dal for sambar and rasam', ['toor','dal','arhar']],
  ['Urad Dal', 130, 155, 4.6, 220, 'Dal & Pulses', '1 kg', 'Local', false, true, 80, 'Black gram dal for vada and idli batter', ['urad','dal','vada']],
  ['Moong Dal', 110, 130, 4.7, 290, 'Dal & Pulses', '1 kg', 'Local', true, false, 90, 'Green gram dal for light cooking', ['moong','dal']],
  ['Chana Dal', 90, 110, 4.5, 200, 'Dal & Pulses', '500 g', 'Local', false, false, 80, 'Bengal gram split dal for sundal and kootu', ['chana','dal']],
  ['Masoor Dal', 100, 120, 4.6, 200, 'Dal & Pulses', '1 kg', 'Local', false, true, 70, 'Red lentils that cook quickly', ['masoor','dal','lentils']],

  // ── Flour & Powders ──
  ['Wheat Flour (Atta)', 65, 75, 4.8, 510, 'Flour & Powders', '1 kg', 'Local', true, true, 200, 'Fresh stone-ground wheat flour for chapati', ['atta','flour','chapati']],
  ['Aashirvaad Atta', 230, 260, 4.8, 410, 'Flour & Powders', '5 kg', 'Aashirvaad', true, true, 150, 'Premium whole wheat flour', ['atta','aashirvaad','flour']],
  ['Maida', 40, 50, 4.4, 180, 'Flour & Powders', '500 g', 'Local', false, false, 120, 'Refined flour for baking and sweets', ['maida','flour']],
  ['Ragi Flour', 85, 100, 4.7, 140, 'Flour & Powders', '1 kg', 'Local', false, true, 70, 'Finger millet flour rich in calcium', ['ragi','flour','millet']],
  ['Rice Flour', 45, 55, 4.5, 160, 'Flour & Powders', '500 g', 'Local', false, false, 90, 'Fine rice flour for appam and murukku', ['rice flour','appam']],
  ['Besan (Gram Flour)', 70, 85, 4.5, 200, 'Flour & Powders', '500 g', 'Local', false, false, 90, 'Chickpea flour for pakoda and sweets', ['besan','gram flour','pakoda']],

  // ── Oil & Ghee ──
  ['Sunflower Oil', 160, 190, 4.6, 340, 'Oil & Ghee', '1 L', 'Fortune', true, true, 120, 'Healthy refined sunflower cooking oil', ['oil','sunflower','cooking']],
  ['Groundnut Oil', 210, 250, 4.8, 280, 'Oil & Ghee', '1 L', 'Local', false, true, 80, 'Cold-pressed groundnut oil', ['oil','groundnut','cold pressed']],
  ['Gingelly Oil (Sesame)', 195, 230, 4.7, 190, 'Oil & Ghee', '500 ml', 'Idhayam', false, true, 60, 'Traditional sesame oil for South Indian cooking', ['gingelly','sesame','oil']],
  ['Pure Ghee', 280, 330, 4.9, 410, 'Oil & Ghee', '500 ml', 'Arokya', true, true, 60, 'Pure cow ghee for cooking and sweets', ['ghee','cow','cooking']],
  ['Coconut Oil', 140, 165, 4.6, 250, 'Oil & Ghee', '500 ml', 'Parachute', false, false, 100, 'Pure coconut oil for cooking and hair', ['coconut','oil']],

  // ── Masalas & Spices ──
  ['Turmeric Powder', 65, 80, 4.8, 380, 'Masalas & Spices', '200 g', 'Everest', true, true, 150, 'Pure turmeric powder for daily cooking', ['turmeric','manjal','haldi']],
  ['Chilli Powder', 75, 90, 4.7, 350, 'Masalas & Spices', '200 g', 'Everest', true, false, 120, 'Hot red chilli powder', ['chilli','mirchi','powder']],
  ['Coriander Powder', 55, 70, 4.6, 270, 'Masalas & Spices', '200 g', 'MDH', false, true, 100, 'Aromatic ground coriander for curries', ['coriander','dhania']],
  ['Garam Masala', 90, 110, 4.8, 320, 'Masalas & Spices', '100 g', 'Everest', true, true, 90, 'Classic blend of warm spices', ['garam masala','spice mix']],
  ['Black Pepper', 120, 145, 4.7, 210, 'Masalas & Spices', '100 g', 'Local', false, true, 70, 'Whole black pepper for grinding', ['pepper','kali mirch']],
  ['Cumin Seeds (Jeera)', 85, 100, 4.6, 240, 'Masalas & Spices', '200 g', 'Local', false, false, 100, 'Whole cumin seeds for tempering', ['jeera','cumin']],
  ['Mustard Seeds', 30, 40, 4.5, 180, 'Masalas & Spices', '200 g', 'Local', false, false, 130, 'Black mustard seeds for tadka', ['mustard','kadugu']],
  ['Fenugreek Seeds', 35, 45, 4.4, 120, 'Masalas & Spices', '100 g', 'Local', false, false, 80, 'Methi seeds for pickles and tempering', ['fenugreek','methi']],

  // ── Sugar & Salt ──
  ['Sugar', 48, 55, 4.6, 600, 'Sugar & Salt', '1 kg', 'Local', true, true, 300, 'White crystalline sugar', ['sugar','sweet']],
  ['Iodized Salt', 22, 28, 4.9, 520, 'Sugar & Salt', '1 kg', 'Tata', true, false, 250, 'Refined iodized table salt', ['salt','iodized','tata']],
  ['Rock Salt', 35, 45, 4.5, 150, 'Sugar & Salt', '1 kg', 'Local', false, false, 100, 'Natural Himalayan rock salt', ['rock salt','sendha namak']],
  ['Brown Sugar', 65, 80, 4.4, 90, 'Sugar & Salt', '500 g', 'Local', false, false, 60, 'Unrefined brown sugar', ['brown sugar']],
  ['Jaggery Powder', 95, 115, 4.6, 180, 'Sugar & Salt', '500 g', 'Local', false, true, 80, 'Natural jaggery powder for sweets', ['jaggery','gur','vellam']],

  // ── Dry Items & Cooking Essentials ──
  ['Rava (Sooji)', 55, 65, 4.6, 250, 'Dry Items & Cooking Essentials', '1 kg', 'Local', false, true, 110, 'Fine semolina for upma and halwa', ['rava','sooji','semolina']],
  ['Vermicelli', 35, 45, 4.5, 180, 'Dry Items & Cooking Essentials', '200 g', 'Bambino', false, false, 90, 'Thin roasted vermicelli for payasam', ['vermicelli','semiya']],
  ['Tamarind', 60, 75, 4.6, 200, 'Dry Items & Cooking Essentials', '250 g', 'Local', false, true, 70, 'Seedless tamarind for sambar and rasam', ['tamarind','puli']],
  ['Jaggery (Block)', 80, 95, 4.5, 130, 'Dry Items & Cooking Essentials', '500 g', 'Local', false, false, 60, 'Traditional block jaggery for pongal', ['jaggery','vellam','block']],
  ['Dry Red Chillies', 45, 55, 4.5, 150, 'Dry Items & Cooking Essentials', '100 g', 'Local', false, false, 100, 'Sun-dried red chillies for chutneys', ['dry chilli','red chilli']],
  ['Curry Leaves (Dried)', 25, 35, 4.3, 90, 'Dry Items & Cooking Essentials', '50 g', 'Local', false, false, 80, 'Dried curry leaves for tempering', ['curry leaves','kadi patta']],

  // ── Packed Grocery ──
  ['Papad', 45, 55, 4.5, 200, 'Packed Grocery', '200 g', 'Lijjat', true, false, 100, 'Crispy urad dal papad', ['papad','appalam']],
  ['Mango Pickle', 85, 100, 4.6, 180, 'Packed Grocery', '300 g', 'Mother\'s Recipe', false, true, 70, 'Spicy mango pickle in oil', ['pickle','achar','mango']],
  ['MTR Rava Idli Mix', 55, 65, 4.5, 140, 'Packed Grocery', '200 g', 'MTR', false, false, 90, 'Instant rava idli mix — just add water', ['instant mix','idli','mtr']],
  ['MTR Gulab Jamun Mix', 65, 80, 4.7, 170, 'Packed Grocery', '200 g', 'MTR', false, true, 80, 'Ready-to-make gulab jamun mix', ['instant mix','sweet','gulab jamun']],
];

const products = rawData.map((val, index) => {
  const [name, price, originalPrice, rating, reviewCount, category, unit, brand, isTrending, isRecommended, stock, description, tags] = val;
  const prompt = `macro photography of uncooked ${name} grocery, high quality, studio lighting, isolated`;
  const image = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=400&nologo=true&seed=${index + 500}`;
  const stockStatus = stock === 0 ? 'OUT_OF_STOCK' : stock <= 10 ? 'LIMITED' : 'IN_STOCK';
  return { name, price, originalPrice, rating, reviewCount, category, image, unit, brand, isTrending, isRecommended, stock, stockStatus, description, tags };
});

const seedDatabase = async (force = false) => {
  try {
    if (!force) {
      const categoryCount = await Category.countDocuments();
      const productCount = await Product.countDocuments();
      if (categoryCount > 0 || productCount > 0) {
        console.log('🌱 Database already contains data. Skipping auto-seed to preserve user changes.');
        return;
      }
    }
    console.log('🧹 Clearing old database...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Combo.deleteMany({});

    console.log('🌱 Seeding grocery categories...');
    await Category.insertMany(categories);
    
    console.log('🌱 Seeding grocery products...');
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products!`);
    
    console.log('🌱 Seeding combos...');
    const allProducts = await Product.find();
    const findProduct = (name) => allProducts.find(p => p.name === name);

    const comboDefinitions = [
      {
        title: 'Daily Essentials Pack',
        description: 'Rice, dal, oil & atta — everything for daily cooking.',
        productNames: ['Ponni Raw Rice', 'Toor Dal', 'Sunflower Oil', 'Wheat Flour (Atta)'],
        discount: 0.78,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=600&q=80',
        type: 'Family'
      },
      {
        title: 'Spice Box Combo',
        description: 'All essential spices — turmeric, chilli, coriander & more.',
        productNames: ['Turmeric Powder', 'Chilli Powder', 'Coriander Powder', 'Garam Masala', 'Cumin Seeds (Jeera)'],
        discount: 0.75,
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80',
        type: 'Family'
      },
      {
        title: 'Monthly Grocery Pack',
        description: 'Rice, dal, sugar, salt & oil for the whole month.',
        productNames: ['Ponni Raw Rice', 'Toor Dal', 'Sugar', 'Iodized Salt', 'Sunflower Oil'],
        discount: 0.80,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=600&q=80',
        type: 'Family'
      }
    ];

    const combosToInsert = [];
    for (const def of comboDefinitions) {
      const comboProducts = def.productNames.map(n => findProduct(n)).filter(Boolean);
      if (comboProducts.length < 2) continue;
      const originalPrice = comboProducts.reduce((sum, p) => sum + p.price, 0);
      const comboPrice = Math.round(originalPrice * def.discount);
      combosToInsert.push({
        title: def.title, description: def.description,
        products: comboProducts.map(p => p._id),
        originalPrice, comboPrice, image: def.image,
        type: def.type, isActive: true
      });
    }

    if (combosToInsert.length > 0) {
      await Combo.insertMany(combosToInsert);
      console.log(`✅ Seeded ${combosToInsert.length} combos!`);
    }
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
};

module.exports = seedDatabase;
