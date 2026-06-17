import { sanitizeProductImages } from './imageUtils';

export const categories = [
  { 
    id: 'c1', 
    name: 'Rice & Grains', 
    name_ta: 'அரிசி மற்றும் தானியங்கள்', 
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400', 
    color: '#FFF8F0', 
    icon: '🍚' 
  },
  { 
    id: 'c2', 
    name: 'Dal & Pulses', 
    name_ta: 'பருப்பு வகைகள்', 
    image_url: 'https://images.unsplash.com/photo-1515544837661-f3b70483c3f2?auto=format&fit=crop&q=80&w=400', 
    color: '#FFF5E6', 
    icon: '🥘' 
  },
  { 
    id: 'c3', 
    name: 'Oil & Ghee', 
    name_ta: 'எண்ணெய் மற்றும் நெய்', 
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400', 
    color: '#F0FFF4', 
    icon: '🍶' 
  },
  { 
    id: 'c4', 
    name: 'Flour & Baking', 
    name_ta: 'மாவு மற்றும் பேக்கிங்', 
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400', 
    color: '#FFFDE7', 
    icon: '🌾' 
  },
  { 
    id: 'c5', 
    name: 'Masalas & Spices', 
    name_ta: 'மசாலா மற்றும் வாசனைப் பொருட்கள்', 
    image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400', 
    color: '#FFF0F0', 
    icon: '🌶️' 
  },
  { 
    id: 'c6', 
    name: 'Sugar & Salt', 
    name_ta: 'சர்க்கரை மற்றும் உப்பு', 
    image_url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80&w=400', 
    color: '#F5F5FF', 
    icon: '🧂' 
  },
  { 
    id: 'c7', 
    name: 'Household Essentials', 
    name_ta: 'வீட்டு உபயோகப் பொருட்கள்', 
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400', 
    color: '#F0F8FF', 
    icon: '🏠' 
  },
  { 
    id: 'c8', 
    name: 'Cleaning Supplies', 
    name_ta: 'சுத்தம் செய்யும் பொருட்கள்', 
    image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400', 
    color: '#F0FFFF', 
    icon: '🧹' 
  },
  { 
    id: 'c9', 
    name: 'Personal Care', 
    name_ta: 'தனிநபர் பராமரிப்பு', 
    image_url: 'https://images.unsplash.com/photo-1535585209827-a15fefbc764a?auto=format&fit=crop&q=80&w=400', 
    color: '#FFF5FF', 
    icon: '🧴' 
  },
  { 
    id: 'c10', 
    name: 'Snacks & Biscuits', 
    name_ta: 'சிற்றுண்டிகள் மற்றும் பிஸ்கட்', 
    image_url: 'https://images.unsplash.com/photo-1590080874088-eec64895e423?auto=format&fit=crop&q=80&w=400', 
    color: '#FFFAF0', 
    icon: '🍪' 
  },
];

export const products = [
  // ── Rice, Flour & Pulses ──────────────────────────────────
  { id: 'p18', name: 'Ponni Rice 5kg', name_ta: 'பொன்னி அரிசி 5கி', name_te: 'పొన్ని బియ్యం 5కి', name_kn: 'ಪೊನ್ನಿ ಅಕ್ಕಿ 5ಕೆಜಿ', name_ml: 'പൊന്നി അരി 5കിലോ', name_hi: 'पोन्नी चावल 5किलो', price: 345, rating: 4.9, reviews: 2100, category: 'Add Items', unit: '5 kg', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
  { id: 'p19', name: 'Basmati Rice 5kg', name_ta: 'பாசுமதி அரிசி 5கி', name_te: 'బాస్మతి బియ్యం 5కి', name_kn: 'ಬಾಸ್ಮತಿ ಅಕ್ಕಿ 5ಕೆಜಿ', name_ml: 'ബാസ്മതി അരി 5കിലോ', name_hi: 'बासमती चावल 5किलो', price: 550, rating: 4.9, reviews: 1500, category: 'Add Items', unit: '5 kg', image_url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=400' },
  { id: 'p20', name: 'Wheat Flour - Atta 5kg', name_ta: 'கோதுமை மாவு 5கி', name_te: 'గోధుమ పిండి 5కి', name_kn: 'ಗೋಧಿ ಹಿಟ್ಟು 5ಕೆಜಿ', name_ml: 'ഗോതമ്പ് പൊടി 5കിലോ', name_hi: 'गेहूं का आटा 5किलो', price: 245, rating: 4.8, reviews: 3500, category: 'Add Items', unit: '5 kg', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400' },
  { id: 'p21', name: 'Toor Dal', name_ta: 'துவரம் பருப்பு', name_te: 'కందిపప్పు', name_kn: 'ತೊಗರಿ ಬೇಳೆ', name_ml: 'തുവര പരിപ്പ്', name_hi: 'अरहर दाल', price: 160, rating: 4.7, reviews: 1800, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'p22', name: 'Urad Dal', name_ta: 'உளுத்தம் பருப்பு', name_te: 'మినపప్పు', name_kn: 'ಉದ್ದಿನ ಬೇಳೆ', name_ml: 'ഉഴുന്ന് പരിപ്പ്', name_hi: 'उड़द दाल', price: 140, rating: 4.5, reviews: 430, category: 'Add Items', unit: '1 kg', image_url: 'https://vedicnutraceuticals.com/wp-content/uploads/2022/11/Urad-Dal-Whole.jpg' },
  { id: 'p23', name: 'Moong Dal', name_ta: 'பாசிப் பருப்பு', name_te: 'పెసరపప్పు', name_kn: 'ಹೆಸರು ಬೇಳೆ', name_ml: 'ചെറുപയർ പരിപ്പ്', name_hi: 'मूंग दाल', price: 130, rating: 4.6, reviews: 540, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/fish-vegetables.jpg' },
  { id: 'p24', name: 'Chana Dal', name_ta: 'கடலை பருப்பு', name_te: 'శనగపప్పు', name_kn: 'ಕಡಲೆ ಬೇಳೆ', name_ml: 'കടല പരിപ്പ്', name_hi: 'चना दाल', price: 100, rating: 4.7, reviews: 620, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/fish-vegetables.jpg' },
  { id: 'p25', name: 'Rajma - Red Kidney Beans', name_ta: 'ராஜ்மா', name_te: 'రాజ్మా', name_kn: 'ರಾಜ್ಮಾ', name_ml: 'രാജ്മ', name_hi: 'राजमा', price: 150, rating: 4.7, reviews: 670, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/fish-vegetables.jpg' },
  { id: 'p26', name: 'Chickpeas', name_ta: 'வெள்ளை மூக்கடலை', name_te: 'సెనగలు', name_kn: 'ಕಡಲೆಕಾಲು', name_ml: 'വെള്ളക്കടല', name_hi: 'छोले', price: 140, rating: 4.8, reviews: 950, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/fish-vegetables.jpg' },
  { id: 'p27', name: 'Sooji / Rava 500g', name_ta: 'ரவை 500கி', name_te: 'రవ్వ 500కి', name_kn: 'ರವೆ 500ಗ್ರಾಂ', name_ml: 'റവ 500ഗ്രാം', name_hi: 'रवा 500ग्राम', price: 35, rating: 4.6, reviews: 890, category: 'Add Items', unit: '500 g', image_url: 'https://admin.saptham.com/packageImage/Upma%2520Rava.png' },
  { id: 'p28', name: 'Maida', name_ta: 'மைதா', name_te: 'మైదా', name_kn: 'ಮೈದಾ ಹಿಟ್ಟು', name_ml: 'മൈദ', name_hi: 'मैदा', price: 30, rating: 4.5, reviews: 560, category: 'Add Items', unit: '500 g', image_url: 'https://globalhubexports.com/wp-content/uploads/2025/07/301.jpg' },
  { id: 'p29', name: 'Corn Flour', name_ta: 'சோள மாவு', name_te: 'మొక్కజొన్న పిండి', name_kn: 'ಮೆಕ್ಕೆಜೋಳದ ಹಿಟ್ಟು', name_ml: 'ചോളം പൊടി', name_hi: 'कॉर्न फ्लोर', price: 45, rating: 4.4, reviews: 230, category: 'Add Items', unit: '500 g', image_url: 'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2023/3/14/corn-flour-in-wooden-bowl.jpg.rend.hgtvcom.1280.960.85.suffix/1678827982737.webp' },
  { id: 'p56', name: 'Jaggery Block - Achu Vellam', name_ta: 'அச்சு வெல்லம்', name_te: 'బెల్లం ముక్కలు', name_kn: 'ಅಚ್ಚು ಬೆಲ್ಲ', name_ml: 'അച്ചു ശർക്കര', name_hi: 'गुड़ की डली', price: 65, rating: 4.8, reviews: 1200, category: 'Add Items', unit: '500 g', image_url: 'https://www.nutriwellmart.com/shop/wp-content/uploads/2024/11/IMG_7829-scaled.jpg' },
  { id: 'p57', name: 'Jaggery Powder - Nattu Sakkarai', name_ta: 'நாட்டுச் சர்க்கரை', name_te: 'బెల్లం పొడి', name_kn: 'ಬೆಲ್ಲದ ಪುಡಿ', name_ml: 'ശർക്കര പൊടി', name_hi: 'गुड़ पाउडर', price: 85, rating: 4.9, reviews: 3500, category: 'Add Items', unit: '500 g', image_url: 'https://cdn.shopify.com/s/files/1/0901/3375/8246/files/NaattuSakkaraiFront.png?v=1760345657' },
  { id: 'p58', name: 'Palm Jaggery - Karupatti', name_ta: 'கருப்பட்டி', name_te: 'తాటి బెల్లం', name_kn: 'ಓಲೆ ಬೆಲ್ಲ', name_ml: 'കരിപ്പെട്ടി', name_hi: 'ताड़ का गुड़', price: 180, rating: 4.9, reviews: 890, category: 'Add Items', unit: '250 g', image_url: 'https://5.imimg.com/data5/SELLER/Default/2025/6/519448255/UC/NB/NW/104695777/palm-jaggery-karupatti.jpg' },

  // ── Spices ────────────────────────────────────────────────
  { id: 'p30', name: 'Turmeric Powder', name_ta: 'மஞ்சள் தூள்', name_te: 'పసుపు పొడి', name_kn: 'ಅರಿಶಿನ ಪುಡಿ', name_ml: 'മഞ്ഞൾ പൊടി', name_hi: 'हल्दी पाउडर', price: 35, rating: 4.9, reviews: 1200, category: 'Add Items', unit: '100 g', image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=400' },
  { id: 'p31', name: 'Red Chilli Powder', name_ta: 'மிளகாய் தூள்', name_te: 'కారం పొడి', name_kn: 'ಖಾರದ ಪುಡಿ', name_ml: 'മുളക് പൊടി', name_hi: 'लाल मिर्च पाउडर', price: 45, rating: 4.7, reviews: 850, category: 'Add Items', unit: '100 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'p32', name: 'Cumin Seeds', name_ta: 'சீரகம்', name_te: 'జీలకర్ర', name_kn: 'ಜೀರಿಗೆ', name_ml: 'ജീരകം', name_hi: 'जीरा', price: 65, rating: 4.8, reviews: 980, category: 'Add Items', unit: '100 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'p33', name: 'Mustard Seeds', name_ta: 'கடுகு', name_te: 'ఆవాలు', name_kn: 'ಸಾಸಿವೆ', name_ml: 'കടുക്', name_hi: 'सरसों', price: 25, rating: 4.5, reviews: 310, category: 'Add Items', unit: '100 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'p34', name: 'Coriander Powder', name_ta: 'மல்லித் தூள்', name_te: 'ధనియాల పొడి', name_kn: 'ಕೊತ್ತಂಬರಿ ಪುಡಿ', name_ml: 'മല്ലിപ്പൊടി', name_hi: 'धनिया पाउडर', price: 30, rating: 4.6, reviews: 420, category: 'Add Items', unit: '100 g', image_url: 'https://tiimg.tistatic.com/fp/1/009/713/coriander-powder-019.jpg' },
  { id: 'p35', name: 'Garam Masala 50g', name_ta: 'கரம் மசாலா 50கி', name_te: 'గరం మసాలా 50కి', name_kn: 'ಗರಂ ಮಸಾಲಾ 50ಗ್ರಾಂ', name_ml: 'ഗരം മസാല 50ഗ്രാം', name_hi: 'गरम मसाला 50ग्राम', price: 55, rating: 4.9, reviews: 640, category: 'Add Items', unit: '50 g', image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400', tag: 'Spicy' },
  { id: 'p36', name: 'Salt 1kg', name_ta: 'உப்பு 1கி', name_te: 'ఉప్పు 1కి', name_kn: 'ಉಪ್ಪು 1ಕೆಜಿ', name_ml: 'ഉപ്പ് 1കിലോ', name_hi: 'नमक 1किलो', price: 20, rating: 4.9, reviews: 5000, category: 'Add Items', unit: '1 kg', image_url: 'https://assets.clevelandclinic.org/m/132eedab4e7a01c8/webimage-TooMuchSodiuml-1051727580-770x533-1_jpg.png' },
  { id: 'p37', name: 'Sugar 1kg', name_ta: 'சர்க்கரை 1கி', name_te: 'చక్కెర 1కి', name_kn: 'ಸಕ್ಕರೆ 1ಕೆಜಿ', name_ml: 'പഞ്ചസാര 1കിലോ', name_hi: 'चीनी 1किलो', price: 48, rating: 4.7, reviews: 2500, category: 'Add Items', unit: '1 kg', image_url: 'https://irp.cdn-website.com/cbf48001/dms3rep/multi/shutterstock_2463705563.jpg' },

  // ── Oil & Ghee ────────────────────────────────────────────
  { id: 'p38', name: 'Pure Cow Ghee', name_ta: 'பசு நெய்', name_te: 'ఆవు నెయ్యి', name_kn: 'ಹಸುವಿನ ತುಪ್ಪ', name_ml: 'പശുവിൻ നെയ്യ്', name_hi: 'शुद्ध गाय का घी', price: 350, rating: 4.9, reviews: 2100, category: 'Add Items', unit: '500 ml', image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400' },
  { id: 'p39', name: 'Sunflower Oil 1L', name_ta: 'சூரியகாந்தி எண்ணெய் 1லி', name_te: 'సన్‌ఫ్లవర్ ఆయిల్ 1లీ', name_kn: 'ಸೂರ್ಯಕಾಂತಿ ಎಣ್ಣೆ 1ಲೀ', name_ml: 'സൺഫ്ലവർ ഓയിൽ 1ലി', name_hi: 'सूरजमुखी तेल 1ली', price: 145, rating: 4.7, reviews: 1540, category: 'Add Items', unit: '1 L', image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400' },
  { id: 'p40', name: 'Coconut Oil', name_ta: 'தேங்காய் எண்ணெய்', name_te: 'కొబ్బరి నూనె', name_kn: 'ತೆಂಗಿನ ಎಣ್ಣೆ', name_ml: 'വെളിച്ചെണ്ണ', name_hi: 'नारियल तेल', price: 190, rating: 4.8, reviews: 780, category: 'Add Items', unit: '500 ml', image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400' },

  // ── Backend product translations (lookup entries) ──────────────────────────
  { id: 'b1', name: 'Ponni Raw Rice', name_ta: 'பொன்னி அரிசி', name_te: 'పొన్ని బియ్యం', name_kn: 'ಪೊನ್ನಿ ಅಕ್ಕಿ', name_ml: 'പൊന്നി അരി', name_hi: 'पोन्नी चावल', price: 399, category: 'Add Items', unit: '5 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b2', name: 'Basmati Rice', name_ta: 'பாசுமதி அரிசி', name_te: 'బాస్మతి బియ్యం', name_kn: 'ಬಾಸ್ಮತಿ ಅಕ್ಕಿ', name_ml: 'ബാസ്മതി അരി', name_hi: 'बासमती चावल', price: 199, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b3', name: 'Sona Masoori Rice', name_ta: 'சோனா மசூரி அரிசி', name_te: 'సోనా మసూరి బియ్యం', name_kn: 'ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ', name_ml: 'സോണ മസൂരി അരി', name_hi: 'सोना मसूरी चावल', price: 280, category: 'Add Items', unit: '5 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b4', name: 'Idly Rice', name_ta: 'இட்லி அரிசி', name_te: 'ఇడ్లీ బియ్యం', name_kn: 'ಇಡ್ಲಿ ಅಕ್ಕಿ', name_ml: 'ഇഡ്ലി അരി', name_hi: 'इडली चावल', price: 320, category: 'Add Items', unit: '5 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b5', name: 'India Gate Basmati Rice', name_ta: 'இந்தியா கேட் பாசுமதி', name_te: 'ఇండియా గేట్ బాస్మతి', name_kn: 'ಇಂಡಿಯಾ ಗೇಟ್ ಬಾಸ್ಮತಿ', name_ml: 'ഇന്ത്യ ഗേറ്റ് ബാസ്മതി', name_hi: 'इंडिया गेट बासमती', price: 590, category: 'Add Items', unit: '5 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b6', name: 'Wheat (Whole)', name_ta: 'கோதுமை (முழு)', name_te: 'గోధుమలు (మొత్తం)', name_kn: 'ಗೋಧಿ (ಸಂಪೂರ್ಣ)', name_ml: 'ഗോതമ്പ് (മുഴുവൻ)', name_hi: 'गेहूं (साबुत)', price: 55, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b7', name: 'Ragi (Finger Millet)', name_ta: 'கேழ்வரகு', name_te: 'రాగి', name_kn: 'ರಾಗಿ', name_ml: 'റാഗി', name_hi: 'रागी', price: 75, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b8', name: 'Masoor Dal', name_ta: 'மசூர் பருப்பு', name_te: 'మసూర్ పప్పు', name_kn: 'ಮಸೂರ್ ಬೇಳೆ', name_ml: 'മസൂർ പരിപ്പ്', name_hi: 'मसूर दाल', price: 100, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b9', name: 'Wheat Flour (Atta)', name_ta: 'கோதுமை மாவு (ஆட்டா)', name_te: 'గోధుమ పిండి (ఆటా)', name_kn: 'ಗೋಧಿ ಹಿಟ್ಟು (ಆಟಾ)', name_ml: 'ഗോതമ്പ് പൊടി (ആട്ട)', name_hi: 'गेहूं का आटा', price: 65, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b10', name: 'Aashirvaad Atta', name_ta: 'ஆஷிர்வாத் ஆட்டா', name_te: 'ఆశీర్వాద్ ఆటా', name_kn: 'ಆಶೀರ್ವಾದ್ ಆಟಾ', name_ml: 'ആശീർവ്വാദ് ആട്ട', name_hi: 'आशीर्वाद आटा', price: 230, category: 'Add Items', unit: '5 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b11', name: 'Ragi Flour', name_ta: 'கேழ்வரகு மாவு', name_te: 'రాగి పిండి', name_kn: 'ರಾಗಿ ಹಿಟ್ಟು', name_ml: 'റാഗി പൊടി', name_hi: 'रागी का आटा', price: 85, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b12', name: 'Rice Flour', name_ta: 'அரிசி மாவு', name_te: 'బియ్యం పిండి', name_kn: 'ಅಕ್ಕಿ ಹಿಟ್ಟು', name_ml: 'അരി പൊടി', name_hi: 'चावल का आटा', price: 45, category: 'Add Items', unit: '500 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b13', name: 'Besan (Gram Flour)', name_ta: 'கடலை மாவு', name_te: 'శనగ పిండి', name_kn: 'ಕಡಲೆ ಹಿಟ್ಟು', name_ml: 'കടല മാവ്', name_hi: 'बेसन', price: 70, category: 'Add Items', unit: '500 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b14', name: 'Sunflower Oil', name_ta: 'சூரியகாந்தி எண்ணெய்', name_te: 'సన్‌ఫ్లవర్ ఆయిల్', name_kn: 'ಸೂರ್ಯಕಾಂತಿ ಎಣ್ಣೆ', name_ml: 'സൺഫ്ലവർ ഓയിൽ', name_hi: 'सूरजमुखी तेल', price: 160, category: 'Add Items', unit: '1 L', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b15', name: 'Groundnut Oil', name_ta: 'வேர்க்கடலை எண்ணெய்', name_te: 'వేరుశెనగ నూనె', name_kn: 'ಕಡಲೆ ಎಣ್ಣೆ', name_ml: 'നിലക്കടല എണ്ണ', name_hi: 'मूंगफली का तेल', price: 210, category: 'Add Items', unit: '1 L', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b16', name: 'Gingelly Oil (Sesame)', name_ta: 'நல்லெண்ணெய்', name_te: 'నువ్వుల నూనె', name_kn: 'ಎಳ್ಳೆಣ್ಣೆ', name_ml: 'എള്ളെണ്ണ', name_hi: 'तिल का तेल', price: 195, category: 'Add Items', unit: '500 ml', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b17', name: 'Pure Ghee', name_ta: 'தூய நெய்', name_te: 'స్వచ్ఛమైన నెయ్యి', name_kn: 'ಶುದ್ಧ ತುಪ್ಪ', name_ml: 'ശുദ്ധ നെയ്യ്', name_hi: 'शुद्ध घी', price: 280, category: 'Add Items', unit: '500 ml', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b18', name: 'Chilli Powder', name_ta: 'மிளகாய் தூள்', name_te: 'కారం పొడి', name_kn: 'ಖಾರದ ಪುಡಿ', name_ml: 'മുളക് പൊടി', name_hi: 'लाल मिर्च पाउडर', price: 75, category: 'Add Items', unit: '200 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b19', name: 'Garam Masala', name_ta: 'கரம் மசாலா', name_te: 'గరం మసాలా', name_kn: 'ಗರಂ ಮಸಾಲಾ', name_ml: 'ഗരം മസാല', name_hi: 'गरम मसाला', price: 90, category: 'Add Items', unit: '100 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b20', name: 'Black Pepper', name_ta: 'மிளகு', name_te: 'మిరియాలు', name_kn: 'ಕಾಳು ಮೆಣಸು', name_ml: 'കുരുമുളക്', name_hi: 'काली मिर्च', price: 120, category: 'Add Items', unit: '100 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b21', name: 'Cumin Seeds (Jeera)', name_ta: 'சீரகம்', name_te: 'జీలకర్ర', name_kn: 'ಜೀರಿಗೆ', name_ml: 'ജീരകം', name_hi: 'जीरा', price: 85, category: 'Add Items', unit: '200 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b22', name: 'Fenugreek Seeds', name_ta: 'வெந்தயம்', name_te: 'మెంతులు', name_kn: 'ಮೆಂತ್ಯ', name_ml: 'ഉലുവ', name_hi: 'मेथी के बीज', price: 35, category: 'Add Items', unit: '100 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b23', name: 'Sugar', name_ta: 'சர்க்கரை', name_te: 'చక్కెర', name_kn: 'ಸಕ್ಕರೆ', name_ml: 'പഞ്ചസാര', name_hi: 'चीनी', price: 48, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b24', name: 'Iodized Salt', name_ta: 'அயோடைஸ்டு உப்பு', name_te: 'అయోడైజ్డ్ ఉప్పు', name_kn: 'ಅಯೋಡಿನ್ ಉಪ್ಪು', name_ml: 'അയോഡൈസ്ഡ് ഉപ്പ്', name_hi: 'आयोडीन नमक', price: 22, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b25', name: 'Rock Salt', name_ta: 'இந்துப்பு', name_te: 'రాతి ఉప్పు', name_kn: 'ಕಲ್ಲುಪ್ಪು', name_ml: 'കല്ലുപ്പ്', name_hi: 'सेंधा नमक', price: 35, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b26', name: 'Brown Sugar', name_ta: 'பழுப்பு சர்க்கரை', name_te: 'బ్రౌన్ చక్కెర', name_kn: 'ಕಂದು ಸಕ್ಕರೆ', name_ml: 'ബ്രൗൺ ഷുഗർ', name_hi: 'ब्राउन शुगर', price: 65, category: 'Add Items', unit: '500 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b27', name: 'Jaggery Powder', name_ta: 'வெல்லத்தூள்', name_te: 'బెల్లం పొడి', name_kn: 'ಬೆಲ್ಲದ ಪುಡಿ', name_ml: 'ശർക്കര പൊടി', name_hi: 'गुड़ पाउडर', price: 95, category: 'Add Items', unit: '500 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b28', name: 'Rava (Sooji)', name_ta: 'ரவை (சோஜி)', name_te: 'రవ్వ (సూజి)', name_kn: 'ರವೆ (ಸೂಜಿ)', name_ml: 'റവ (സൂജി)', name_hi: 'रवा (सूजी)', price: 55, category: 'Add Items', unit: '1 kg', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b29', name: 'Vermicelli', name_ta: 'சேமியா', name_te: 'సేమ్యా', name_kn: 'ಶೇವಿಗೆ', name_ml: 'സേമ്യ', name_hi: 'सेवई', price: 35, category: 'Add Items', unit: '200 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b30', name: 'Tamarind', name_ta: 'புளி', name_te: 'చింతపండు', name_kn: 'ಹುಣಸೆ', name_ml: 'പുളി', name_hi: 'इमली', price: 60, category: 'Add Items', unit: '250 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b31', name: 'Jaggery (Block)', name_ta: 'வெல்லம்', name_te: 'బెల్లం', name_kn: 'ಬೆಲ್ಲ', name_ml: 'ശർക്കര', name_hi: 'गुड़', price: 80, category: 'Add Items', unit: '500 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b32', name: 'Dry Red Chillies', name_ta: 'உலர் சிவப்பு மிளகாய்', name_te: 'ఎండుమిర్చి', name_kn: 'ಒಣ ಕೆಂಪು ಮೆಣಸು', name_ml: 'ഉണക്ക മുളക്', name_hi: 'सूखी लाल मिर्च', price: 45, category: 'Add Items', unit: '100 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b33', name: 'Curry Leaves (Dried)', name_ta: 'உலர் கறிவேப்பிலை', name_te: 'ఆరిన కరివేపాకు', name_kn: 'ಒಣಗಿದ ಕರಿಬೇವು', name_ml: 'ഉണക്ക കറിവേപ്പ്', name_hi: 'सूखी करी पत्ता', price: 25, category: 'Add Items', unit: '50 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b34', name: 'Papad', name_ta: 'அப்பளம்', name_te: 'అప్పడం', name_kn: 'ಪಾಪಡ್', name_ml: 'അപ്പളം', name_hi: 'पापड़', price: 45, category: 'Add Items', unit: '200 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b35', name: 'Mango Pickle', name_ta: 'மாங்காய் ஊறுகாய்', name_te: 'మామిడికాయ ఊరగాయ', name_kn: 'ಮಾವಿನಕಾಯಿ ಉಪ್ಪಿನಕಾಯಿ', name_ml: 'മാങ്ങ അച്ചാർ', name_hi: 'आम का अचार', price: 85, category: 'Add Items', unit: '300 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b36', name: 'MTR Rava Idli Mix', name_ta: 'MTR ரவை இட்லி மிக்ஸ்', name_te: 'MTR రవ్వ ఇడ్లీ మిక్స్', name_kn: 'MTR ರವೆ ಇಡ್ಲಿ ಮಿಕ್ಸ್', name_ml: 'MTR റവ ഇഡ്ലി മിക്സ്', name_hi: 'MTR रवा इडली मिक्स', price: 55, category: 'Add Items', unit: '200 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
  { id: 'b37', name: 'MTR Gulab Jamun Mix', name_ta: 'MTR குலாப் ஜாமூன் மிக்ஸ்', name_te: 'MTR గులాబ్ జామున్ మిక్స్', name_kn: 'MTR ಗುಲಾಬ್ ಜಾಮೂನ್ ಮಿಕ್ಸ್', name_ml: 'MTR ഗുലാബ് ജാമൂൻ മിക്സ്', name_hi: 'MTR गुलाब जामुन मिक्स', price: 65, category: 'Add Items', unit: '200 g', image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
];

const sanitizedProducts = sanitizeProductImages(products);
products.splice(0, products.length, ...sanitizedProducts);

export const orders = [
  {
    _id: 'o1', id: 'ORD-A1B2C3D4E', customer: 'You', amount: 695, status: 'Delivered', orderStatus: 'delivered',
    createdAt: '2026-06-08T10:12:00Z', placedAt: '2026-06-08 10:12',
    deliveryFee: 0, tax: 35, subtotal: 660,
    paymentMethod: 'UPI (Google Pay)', address: '42, Lake View Apartments, Sector 12, Chennai',
    deliveryPartner: { name: 'Ravi Kumar', phone: '+91 98765 43210', rating: 4.9 },
    deliveredAt: '2026-06-08T10:38:00Z',
    items: [
      { id: 'p19', name: 'Basmati Rice 5kg', quantity: 1, price: 550, image_url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=400' },
      { id: 'p39', name: 'Sunflower Oil 1L', quantity: 1, price: 145, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400' },
    ],
    timeline: [
      { status: 'placed', label: 'Order Placed', time: '2026-06-08T10:12:00Z' },
      { status: 'confirmed', label: 'Order Confirmed', time: '2026-06-08T10:14:00Z' },
      { status: 'packed', label: 'Packed & Ready', time: '2026-06-08T10:22:00Z' },
      { status: 'out_for_delivery', label: 'Out for Delivery', time: '2026-06-08T10:28:00Z' },
      { status: 'delivered', label: 'Delivered', time: '2026-06-08T10:38:00Z' },
    ],
  },
  {
    _id: 'o2', id: 'ORD-F5G6H7I8J', customer: 'You', amount: 1290, status: 'Out for Delivery', orderStatus: 'out_for_delivery',
    createdAt: '2026-06-11T09:05:00Z', placedAt: '2026-06-11 09:05',
    deliveryFee: 35, tax: 55, subtotal: 1200,
    paymentMethod: 'Card (Visa)', address: '7, Sunshine Colony, Sector 5, Chennai',
    deliveryPartner: { name: 'Priya Sharma', phone: '+91 98765 12345', rating: 4.7 },
    items: [
      { id: 'p56', name: 'Jaggery Block - Achu Vellam', quantity: 2, price: 65, image_url: 'https://www.nutriwellmart.com/shop/wp-content/uploads/2024/11/IMG_7829-scaled.jpg' },
      { id: 'p38', name: 'Pure Cow Ghee', quantity: 1, price: 350, image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400' },
      { id: 'p21', name: 'Toor Dal', quantity: 3, price: 160, image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
      { id: 'p30', name: 'Turmeric Powder', quantity: 2, price: 35, image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=400' },
    ],
    timeline: [
      { status: 'placed', label: 'Order Placed', time: '2026-06-11T09:05:00Z' },
      { status: 'confirmed', label: 'Order Confirmed', time: '2026-06-11T09:08:00Z' },
      { status: 'packed', label: 'Packed & Ready', time: '2026-06-11T09:20:00Z' },
      { status: 'out_for_delivery', label: 'Out for Delivery', time: '2026-06-11T09:35:00Z' },
    ],
  },
  {
    _id: 'o3', id: 'ORD-K9L0M1N2O', customer: 'You', amount: 640, status: 'Preparing', orderStatus: 'preparing',
    createdAt: '2026-06-11T11:42:00Z', placedAt: '2026-06-11 11:42',
    deliveryFee: 30, tax: 30, subtotal: 580,
    paymentMethod: 'UPI (PhonePe)', address: '15, Green Park Residency, Sector 8, Chennai',
    items: [
      { id: 'p22', name: 'Urad Dal', quantity: 2, price: 140, image_url: 'https://vedicnutraceuticals.com/wp-content/uploads/2022/11/Urad-Dal-Whole.jpg' },
      { id: 'p30', name: 'Turmeric Powder', quantity: 1, price: 35, image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=400' },
      { id: 'p18', name: 'Ponni Rice 5kg', quantity: 1, price: 345, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
    ],
    timeline: [
      { status: 'placed', label: 'Order Placed', time: '2026-06-11T11:42:00Z' },
      { status: 'confirmed', label: 'Order Confirmed', time: '2026-06-11T11:44:00Z' },
      { status: 'preparing', label: 'Being Prepared', time: '2026-06-11T11:50:00Z' },
    ],
  },
  {
    _id: 'o4', id: 'ORD-P3Q4R5S6T', customer: 'You', amount: 320, status: 'Placed', orderStatus: 'placed',
    createdAt: '2026-06-11T14:30:00Z', placedAt: '2026-06-11 14:30',
    deliveryFee: 0, tax: 20, subtotal: 300,
    paymentMethod: 'COD', address: '42, Lake View Apartments, Sector 12, Chennai',
    items: [
      { id: 'p23', name: 'Moong Dal', quantity: 1, price: 130, image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/fish-vegetables.jpg' },
      { id: 'p37', name: 'Sugar 1kg', quantity: 2, price: 48, image_url: 'https://irp.cdn-website.com/cbf48001/dms3rep/multi/shutterstock_2463705563.jpg' },
      { id: 'p34', name: 'Coriander Powder', quantity: 1, price: 30, image_url: 'https://tiimg.tistatic.com/fp/1/009/713/coriander-powder-019.jpg' },
    ],
    timeline: [
      { status: 'placed', label: 'Order Placed', time: '2026-06-11T14:30:00Z' },
    ],
  },
  {
    _id: 'o5', id: 'ORD-U7V8W9X0Y', customer: 'You', amount: 1850, status: 'Delivered', orderStatus: 'delivered',
    createdAt: '2026-06-01T08:30:00Z', placedAt: '2026-06-01 08:30',
    deliveryFee: 0, tax: 80, subtotal: 1770,
    paymentMethod: 'Card (Mastercard)', address: '42, Lake View Apartments, Sector 12, Chennai',
    deliveryPartner: { name: 'Karan Singh', phone: '+91 98765 67890', rating: 4.8 },
    deliveredAt: '2026-06-01T09:05:00Z',
    items: [
      { id: 'p18', name: 'Ponni Rice 5kg', quantity: 2, price: 345, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
      { id: 'p38', name: 'Pure Cow Ghee', quantity: 1, price: 350, image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400' },
      { id: 'p40', name: 'Coconut Oil', quantity: 2, price: 190, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400' },
      { id: 'p35', name: 'Garam Masala 50g', quantity: 1, price: 55, image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400' },
    ],
    timeline: [
      { status: 'placed', label: 'Order Placed', time: '2026-06-01T08:30:00Z' },
      { status: 'confirmed', label: 'Order Confirmed', time: '2026-06-01T08:32:00Z' },
      { status: 'packed', label: 'Packed & Ready', time: '2026-06-01T08:45:00Z' },
      { status: 'out_for_delivery', label: 'Out for Delivery', time: '2026-06-01T08:52:00Z' },
      { status: 'delivered', label: 'Delivered', time: '2026-06-01T09:05:00Z' },
    ],
  },
  {
    _id: 'o6', id: 'ORD-Z1A2B3C4D', customer: 'You', amount: 480, status: 'Cancelled', orderStatus: 'cancelled',
    createdAt: '2026-05-28T16:20:00Z', placedAt: '2026-05-28 16:20',
    deliveryFee: 30, tax: 25, subtotal: 425,
    paymentMethod: 'UPI (Google Pay)', address: '7, Sunshine Colony, Sector 5, Chennai',
    cancelReason: 'Changed my mind about the order',
    items: [
      { id: 'p20', name: 'Wheat Flour - Atta 5kg', quantity: 1, price: 245, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400' },
      { id: 'p32', name: 'Cumin Seeds', quantity: 2, price: 65, image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
    ],
    timeline: [
      { status: 'placed', label: 'Order Placed', time: '2026-05-28T16:20:00Z' },
      { status: 'cancelled', label: 'Cancelled', time: '2026-05-28T16:35:00Z' },
    ],
  },
  {
    _id: 'o7', id: 'ORD-E5F6G7H8I', customer: 'You', amount: 965, status: 'Delivered', orderStatus: 'delivered',
    createdAt: '2026-05-20T12:15:00Z', placedAt: '2026-05-20 12:15',
    deliveryFee: 0, tax: 45, subtotal: 920,
    paymentMethod: 'Card (Visa)', address: '42, Lake View Apartments, Sector 12, Chennai',
    deliveryPartner: { name: 'Ravi Kumar', phone: '+91 98765 43210', rating: 4.9 },
    deliveredAt: '2026-05-20T12:42:00Z',
    items: [
      { id: 'p39', name: 'Sunflower Oil 1L', quantity: 2, price: 145, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400' },
      { id: 'p21', name: 'Toor Dal', quantity: 2, price: 160, image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
      { id: 'p36', name: 'Salt 1kg', quantity: 3, price: 20, image_url: 'https://assets.clevelandclinic.org/m/132eedab4e7a01c8/webimage-TooMuchSodiuml-1051727580-770x533-1_jpg.png' },
      { id: 'p58', name: 'Palm Jaggery - Karupatti', quantity: 1, price: 180, image_url: 'https://5.imimg.com/data5/SELLER/Default/2025/6/519448255/UC/NB/NW/104695777/palm-jaggery-karupatti.jpg' },
    ],
    timeline: [
      { status: 'placed', label: 'Order Placed', time: '2026-05-20T12:15:00Z' },
      { status: 'confirmed', label: 'Order Confirmed', time: '2026-05-20T12:17:00Z' },
      { status: 'packed', label: 'Packed & Ready', time: '2026-05-20T12:28:00Z' },
      { status: 'out_for_delivery', label: 'Out for Delivery', time: '2026-05-20T12:35:00Z' },
      { status: 'delivered', label: 'Delivered', time: '2026-05-20T12:42:00Z' },
    ],
  },
];
export const recommendedProducts = products.filter(p => p.tag === 'Recommended');
export const trendingProducts = products.filter(p => p.tag === 'Trending');
export const megaDeals = products.slice(0, 12);
export const newArrivals = products.slice(-6);
export const smartSuggestionsMap = {};
const getDynamicBundles = () => {
  const currentMonth = new Date().getMonth(); // 0 = Jan, 11 = Dec
  const currentHour = new Date().getHours();
  
  const dynamicBundles = [];
  
  // Summer (Mar - May)
  if (currentMonth >= 2 && currentMonth <= 4) {
    dynamicBundles.push({
      title: 'Summer Refreshment Combo',
      title_ta: 'கோடை கால குளிர்ச்சி',
      badge: 'Summer Special',
      discount: 45,
      gradient: 'linear-gradient(135deg, #E0F7FA 0%, #00BCD4 100%)',
      items: [
        { id: 'p50', name: 'Lemon 250g', price: 30, image_url: 'https://images.unsplash.com/photo-1590502593747-42298799482c?auto=format&fit=crop&q=80&w=200' },
        { id: 'p36', name: 'Salt 1kg', price: 20, image_url: 'https://assets.clevelandclinic.org/m/132eedab4e7a01c8/webimage-TooMuchSodiuml-1051727580-770x533-1_jpg.png' },
        { id: 'p25', name: 'Sugar 1kg', price: 45, image_url: 'https://images.unsplash.com/photo-1581428982868-e410dd4fc358?auto=format&fit=crop&q=80&w=200' }
      ]
    });
  }
  
  // Monsoon (Jun - Sep)
  if (currentMonth >= 5 && currentMonth <= 8) {
    dynamicBundles.push({
      title: 'Monsoon Immunity Pack',
      badge: 'Rainy Season',
      discount: 55,
      gradient: 'linear-gradient(135deg, #E8F5E9 0%, #4CAF50 100%)',
      items: [
        { id: 'p30', name: 'Turmeric Powder', price: 35, image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=200' },
        { id: 'p1', name: 'Ginger 250g', price: 25, image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=200' },
        { id: 'p56', name: 'Jaggery Block', price: 65, image_url: 'https://www.nutriwellmart.com/shop/wp-content/uploads/2024/11/IMG_7829-scaled.jpg' }
      ]
    });
  }
  
  // Winter (Oct - Feb)
  if (currentMonth >= 9 || currentMonth <= 1) {
    dynamicBundles.push({
      title: 'Winter Warmth Combo',
      badge: 'Winter Special',
      discount: 60,
      gradient: 'linear-gradient(135deg, #EFEBE9 0%, #795548 100%)',
      items: [
        { id: 'p38', name: 'Pure Cow Ghee', price: 350, image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=200' },
        { id: 'p20', name: 'Wheat Flour - Atta 5kg', price: 245, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200' }
      ]
    });
  }

  // Festival - Diwali (Usually October/November)
  if (currentMonth === 9 || currentMonth === 10) {
    dynamicBundles.push({
      title: 'Diwali Puja Special',
      title_ta: 'தீபாவளி பூஜை சிறப்பு',
      badge: 'Festival Offer',
      discount: 150,
      gradient: 'linear-gradient(135deg, #FFECB3 0%, #FFB300 100%)',
      items: [
        { id: 'p56', name: 'Jaggery Block', price: 65, image_url: 'https://www.nutriwellmart.com/shop/wp-content/uploads/2024/11/IMG_7829-scaled.jpg' },
        { id: 'p38', name: 'Pure Cow Ghee', price: 350, image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=200' },
        { id: 'p40', name: 'Coconut Oil', price: 190, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=200' }
      ]
    });
  }
  
  // Daily logic: Morning Breakfast (5 AM - 11 AM)
  if (currentHour >= 5 && currentHour <= 11) {
    dynamicBundles.push({
      title: 'Good Morning Breakfast',
      badge: 'Morning Deal',
      discount: 25,
      gradient: 'linear-gradient(135deg, #FFF3E0 0%, #FF9800 100%)',
      items: [
        { id: 'p4', name: 'Farm Fresh Eggs - 6 pcs', price: 55, image_url: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&q=80&w=200' },
        { id: 'p18', name: 'Ponni Rice 5kg', price: 345, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200' }
      ]
    });
  }
  
  // Standard everyday bundles
  const standardBundles = [
    {
      title: 'Sambar Master Kit',
      title_ta: 'சாம்பார் மாஸ்டர் கிட்',
      title_te: 'సాంబార్ మాస్టర్ కిట్',
      title_kn: 'ಸಾಂಬಾರ್ ಮಾಸ್ಟರ್ ಕಿಟ್',
      title_ml: 'സാമ്പാർ മാസ്റ്റർ കിറ്റ്',
      title_hi: 'सांबर मास्टर किट',
      badge: 'Nearby Buying',
      discount: 50,
      gradient: 'linear-gradient(135deg, #FFCCBC 0%, #FF7043 100%)',
      items: [
        { id: 'p21', name: 'Toor Dal', price: 160, image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
        { id: 'p30', name: 'Turmeric Powder', price: 35, image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=200' },
        { id: 'p33', name: 'Mustard Seeds', price: 25, image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' }
      ]
    },
    {
      title: 'Rice & Dal Combo',
      title_ta: 'அரிசி மற்றும் பருப்பு காம்போ',
      title_te: 'బియ్యం మరియు పప్పు కాంబో',
      title_kn: 'ಅಕ್ಕಿ ಮತ್ತು ಬೇಳೆ ಕಾಂಬೊ',
      title_ml: 'അരിയും പരിപ്പും കോംബോ',
      title_hi: 'चावल और दाल कॉम्बो',
      badge: 'Best Seller',
      discount: 80,
      gradient: 'linear-gradient(135deg, #FFF9C4 0%, #FFF176 100%)',
      items: [
        { id: 'p18', name: 'Ponni Rice 5kg', price: 345, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200' },
        { id: 'p21', name: 'Toor Dal', price: 160, image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
        { id: 'p20', name: 'Wheat Flour - Atta 5kg', price: 245, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200' }
      ]
    },
    {
      title: 'Spice Box Essentials',
      title_ta: 'மசாலா பெட்டி எசென்ஷியல்ஸ்',
      title_te: 'మసాలా బాక్స్ ఎసెన్షియల్స్',
      title_kn: 'ಮಸಾಲೆ ಬಾಕ್ಸ್ ಎಸೆನ್ಷಿಯಲ್ಸ್',
      title_ml: 'സ്പൈസ് ബോക്സ് എസൻഷ്യൽസ്',
      title_hi: 'मसाला बॉक्स आवश्यक वस्तुएं',
      badge: 'Fast Moving',
      discount: 40,
      gradient: 'linear-gradient(135deg, #F8BBD0 0%, #F06292 100%)',
      items: [
        { id: 'p30', name: 'Turmeric Powder', price: 35, image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=200' },
        { id: 'p31', name: 'Red Chilli Powder', price: 45, image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
        { id: 'p35', name: 'Garam Masala 50g', price: 55, image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=200' }
      ]
    }
  ];
  
  return [...dynamicBundles, ...standardBundles];
};

// export const bundleSuggestions = getDynamicBundles();

export const bundleSuggestions = [
  {
    title: 'Sambar Master Kit',
    title_ta: 'சாம்பார் மாஸ்டர் கிட்',
    title_te: 'సాంబార్ మాస్టర్ కిట్',
    title_kn: 'ಸಾಂಬಾರ್ ಮಾಸ್ಟರ್ ಕಿಟ್',
    title_ml: 'സാമ്പാർ മാസ്റ്റർ കിറ്റ്',
    title_hi: 'सांबर मास्टर किट',
    badge: 'Nearby Buying',
    discount: 50, // Rs 50 off
    gradient: 'linear-gradient(135deg, #FFCCBC 0%, #FF7043 100%)',
    items: [
      { id: 'p21', name: 'Toor Dal', price: 160, image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
      { id: 'p30', name: 'Turmeric Powder', price: 35, image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=200' },
      { id: 'p33', name: 'Mustard Seeds', price: 25, image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' }
    ]
  },
  /*
  {
    title: 'Festival Puja Special',
    title_ta: 'திருவிழா பூஜை சிறப்பு',
    title_te: 'పండుగ పూజ స్పెషల్',
    title_kn: 'ಹಬ್ಬದ ಪೂಜೆ ವಿಶೇಷ',
    title_ml: 'ഉത്സവ പൂജ സ്പെഷ്യൽ',
    title_hi: 'त्यौहार पूजा स्पेशल',
    badge: 'Festival Offer',
    // Example: This offer is only valid from Jan 1, 2026 to Dec 31, 2026
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    discount: 150, // Rs 150 off
    gradient: 'linear-gradient(135deg, #FFECB3 0%, #FFB300 100%)',
    items: [
      { id: 'p56', name: 'Jaggery Block', price: 65, image_url: 'https://www.nutriwellmart.com/shop/wp-content/uploads/2024/11/IMG_7829-scaled.jpg' },
      { id: 'p38', name: 'Pure Cow Ghee', price: 350, image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=200' },
      { id: 'p40', name: 'Coconut Oil', price: 190, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=200' }
    ]
  },
  {
    title: 'Summer Refreshment Combo',
    title_ta: 'கோடை கால குளிர்ச்சி',
    badge: 'Limited Time',
    // This offer expires soon (or dynamically)
    startDate: new Date(Date.now() - 86400000).toISOString(), // started yesterday
    endDate: new Date(Date.now() + 86400000 * 5).toISOString(), // ends in 5 days
    discount: 45,
    gradient: 'linear-gradient(135deg, #E0F7FA 0%, #00BCD4 100%)',
    items: [
      { id: 'p50', name: 'Lemon 250g', price: 30, image_url: 'https://images.unsplash.com/photo-1590502593747-42298799482c?auto=format&fit=crop&q=80&w=200' },
      { id: 'p36', name: 'Salt 1kg', price: 20, image_url: 'https://assets.clevelandclinic.org/m/132eedab4e7a01c8/webimage-TooMuchSodiuml-1051727580-770x533-1_jpg.png' },
      { id: 'p25', name: 'Sugar 1kg', price: 45, image_url: 'https://images.unsplash.com/photo-1581428982868-e410dd4fc358?auto=format&fit=crop&q=80&w=200' }
    ]
  },
  {
    title: 'Expired Winter Deal (Hidden)',
    badge: 'Expired',
    startDate: '2025-12-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z', // Expired
    discount: 100,
    gradient: 'linear-gradient(135deg, #EEEEEE 0%, #BDBDBD 100%)',
    items: [
      { id: 'p40', name: 'Coconut Oil', price: 190, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=200' }
    ]
  },
  */
  {
    title: 'Rice & Dal Combo',
    title_ta: 'அரிசி மற்றும் பருப்பு காம்போ',
    title_te: 'బియ్యం మరియు పప్పు కాంబో',
    title_kn: 'ಅಕ್ಕಿ ಮತ್ತು ಬೇಳೆ ಕಾಂಬೊ',
    title_ml: 'അരിയും പരിപ്പും കോംബോ',
    title_hi: 'चावल और दाल कॉम्बो',
    badge: 'Best Seller',
    discount: 80, // Rs 80 off
    gradient: 'linear-gradient(135deg, #FFF9C4 0%, #FFF176 100%)',
    items: [
      { id: 'p18', name: 'Ponni Rice 5kg', price: 345, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200' },
      { id: 'p21', name: 'Toor Dal', price: 160, image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
      { id: 'p20', name: 'Wheat Flour - Atta 5kg', price: 245, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200' }
    ]
  },
  {
    title: 'Spice Box Essentials',
    title_ta: 'மசாலா பெட்டி எசென்ஷியல்ஸ்',
    title_te: 'మసాలా బాక్స్ ఎసెన్షియల్స్',
    title_kn: 'మసాలె బాక్స్ ఎసెన్షియల్స్',
    title_ml: 'സ്പൈസ് ബോക്സ് എസൻഷ്യൽസ്',
    title_hi: 'मसाला बॉक्स आवश्यक वस्तुएं',
    badge: 'Fast Moving',
    discount: 40, // Rs 40 off
    gradient: 'linear-gradient(135deg, #F8BBD0 0%, #F06292 100%)',
    items: [
      { id: 'p30', name: 'Turmeric Powder', price: 35, image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=200' },
      { id: 'p31', name: 'Red Chilli Powder', price: 45, image_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg' },
      { id: 'p35', name: 'Garam Masala 50g', price: 55, image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=200' }
    ]
  }
];
