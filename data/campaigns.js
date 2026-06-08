export const CAMPAIGNS = [
  {
    id: 'monthly-savings-2026',
    title: 'Monthly Savings',
    subtitle: 'Save big on your monthly grocery shopping!',
    description: 'Get the best prices on rice, dal, oil, and all your monthly cooking essentials from nearby Kirana stores.',
    icon: '🛒',
    categories: ['Rice & Grains', 'Dal & Pulses', 'Oil & Ghee'],
    discountPercent: 15,
    bannerBg: ['#2D6A4F', '#40916C'],
    bannerImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
    ctaText: 'Shop Now',
    endsAt: '2026-05-31T23:59:59',
    active: true,
  },
  /*
  {
    id: 'festival-grocery-2026',
    title: 'Festival Grocery Offers',
    subtitle: 'Stock up for the festive season!',
    description: 'Special prices on masalas, sweets ingredients, ghee, and festive cooking essentials.',
    icon: '🪔',
    categories: ['Masalas & Spices', 'Oil & Ghee', 'Sugar & Salt'],
    discountPercent: 20,
    bannerBg: ['#C96A22', '#E07A2F'],
    bannerImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400',
    ctaText: 'Grab Deals',
    endsAt: '2026-06-15T23:59:59',
    active: true,
  },
  */
  {
    id: 'kitchen-essentials-2026',
    title: 'Kitchen Essentials',
    subtitle: 'Everything your kitchen needs, discounted!',
    description: 'From atta to spices, get all your cooking essentials at the best prices from local stores.',
    icon: '🍳',
    categories: ['Flour & Baking Essentials', 'Masalas & Spices', 'Oil & Ghee'],
    discountPercent: 10,
    bannerBg: ['#5B4A3F', '#7C6656'],
    bannerImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=400',
    ctaText: 'Explore Now',
    endsAt: '2026-05-20T23:59:59',
    active: true,
  },
];

export const PROMO_BANNERS = [
  {
    id: 'free-delivery-promo',
    title: 'Free Delivery',
    subtitle: 'On all orders above ₹999 from local stores 🎉',
    icon: '🚚',
    bannerBg: ['#1A4731', '#2D6A4F'],
    bannerImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=400',
    ctaText: 'Order Now',
    type: 'promo',
  },
  {
    id: 'local-stores-promo',
    title: 'Best Local Stores',
    subtitle: 'Discover trusted Kirana stores near you',
    icon: '🏪',
    bannerBg: ['#276749', '#40916C'],
    bannerImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=400',
    ctaText: 'Find Stores',
    type: 'promo',
  },
];

export const getActiveCampaigns = () => CAMPAIGNS.filter(c => c.active);

export const getCampaignForCategory = (category) => {
  return CAMPAIGNS.find(c => c.active && c.categories.includes(category)) || null;
};
