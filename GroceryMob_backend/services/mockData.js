export const categories = [
  { id: '1', name: 'Fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400' },
  { id: '2', name: 'Vegetables', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=400' },
  { id: '3', name: 'Dairy', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=400' },
  { id: '4', name: 'Staples', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
  { id: '5', name: 'Beverages', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400' },
];

export const products = [
  { id: '101', name: 'Fresh Kashmiri Apples 1kg', price: 240, rating: 4.8, category: 'Fruits', image: '/kashmiri_apple.png' },
  { id: '102', name: 'Organic Robusta Bananas 1kg', price: 60, rating: 4.5, category: 'Fruits', image: '/robusta_banana.png' },
  { id: '103', name: 'Farm Fresh Tomatoes 1kg', price: 40, rating: 4.7, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400' },
  { id: '104', name: 'Amul Taaza Toned Milk 1L', price: 68, rating: 4.9, category: 'Dairy', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400' },
  { id: '105', name: 'Britannia 100% Whole Wheat Bread', price: 50, rating: 4.6, category: 'Staples', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400' },
  { id: '106', name: 'Tropicana Orange Juice 1L', price: 120, rating: 4.4, category: 'Beverages', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=400' },
  { id: '107', name: 'Farm Fresh Eggs (6 pcs)', price: 45, rating: 4.8, category: 'Dairy', image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=400' },
  { id: '108', name: 'India Gate Basmati Rice 5kg', price: 850, rating: 4.9, category: 'Staples', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
  { id: '109', name: 'Bhari Date Palm 500g', price: 180, rating: 4.7, category: 'Fruits', image: '/bhari_date_palm.png' },
];

export const recommendedProducts = [
  products[0], // Apples
  products[3], // Milk
  products[4], // Bread
  products[6], // Eggs
];

export const trendingProducts = [
  products[7], // Rice
  products[5], // OJ
  products[2], // Tomatoes
];

export const megaDeals = [
  products[4], // Bread
  products[7], // Rice
];

// Smart logic mock based on what you add
export const smartSuggestionsMap = {
  '104': [products[4], products[6]], // Milk -> bread & eggs
  '105': [products[3], products[6]], // Bread -> milk & eggs
  '107': [products[4], products[3]], // Eggs -> bread & milk
};
