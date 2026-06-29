const PLACEHOLDER_PATTERNS = [
  'res.cloudinary.com/demo/image/upload',
  'samples/food/spices.jpg',
  'samples/food/fish-vegetables.jpg',
  'images.unsplash.com/photo-1488459739032-a6983b720182',
];

const normalizeUrl = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const isValidHttpUrl = (value) => {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
};

// Export added for SafeImage.js component
export const isPlaceholderUrl = (value) => {
  const normalized = normalizeUrl(value).toLowerCase();
  if (!normalized) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern.toLowerCase()));
};

const simpleHash = (value) => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  }
  return Math.abs(hash);
};

export const buildUniqueOnlineImageUrl = (productName, productId, width = 400, height = 400, seedOffset = 0) => {
  const safeName = normalizeUrl(productName) || 'grocery product';
  const safeId = normalizeUrl(productId) || safeName;
  const seed = simpleHash(`${safeId}-${seedOffset}`) || 100;
  const prompt = `macro photography of uncooked ${safeName} grocery, high quality, studio lighting, isolated`;

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
};

export const getSafeProductImage = (product, preferredUrl = '', seedOffset = 0) => {
  const fallbackUrl = buildUniqueOnlineImageUrl(product?.name || 'grocery product', product?.id || product?.name || 'product', 400, 400, seedOffset);

  const normalized = normalizeUrl(preferredUrl || product?.image_url || product?.image);

  if (!normalized) return fallbackUrl;
  if (!isValidHttpUrl(normalized)) return fallbackUrl;
  if (isPlaceholderUrl(normalized)) return fallbackUrl;

  return normalized;
};

// Registry of verified matching product images
export const VERIFIED_PRODUCTS = {
  'p18': {
    brand: 'NearMart Premium',
    category: 'Rice & Grains',
    imageAltText: 'Ponni rice, 5 kg',
    isImageVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400'
  },
  'p19': {
    brand: 'India Gate',
    category: 'Rice & Grains',
    imageAltText: 'Basmati rice, 5 kg',
    isImageVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=400'
  },
  'p20': {
    brand: 'Aashirvaad',
    category: 'Flour & Baking',
    imageAltText: 'Wheat flour atta, 5 kg',
    isImageVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=400'
  },
  'p21': {
    brand: 'NearMart Organic',
    category: 'Dal & Pulses',
    imageAltText: 'Toor dal, 1 kg',
    isImageVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1585996387063-4a1599307d81?auto=format&fit=crop&q=80&w=400'
  },
  'p22': {
    brand: 'NearMart Organic',
    category: 'Dal & Pulses',
    imageAltText: 'Urad dal, 1 kg',
    isImageVerified: true,
    imageUrl: 'https://vedicnutraceuticals.com/wp-content/uploads/2022/11/Urad-Dal-Whole.jpg'
  },
  'p24': {
    brand: 'NearMart Organic',
    category: 'Dal & Pulses',
    imageAltText: 'Chana dal, 1 kg',
    isImageVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&q=80&w=400'
  },
  'p25': {
    brand: 'NearMart Organic',
    category: 'Dal & Pulses',
    imageAltText: 'Rajma red kidney beans, 1 kg',
    isImageVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&q=80&w=400'
  },
  'p26': {
    brand: 'NearMart Organic',
    category: 'Dal & Pulses',
    imageAltText: 'Chickpeas, 1 kg',
    isImageVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1585996387063-4a1599307d81?auto=format&fit=crop&q=80&w=400'
  },
  'p30': {
    brand: 'NearMart Organic',
    category: 'Masalas & Spices',
    imageAltText: 'Turmeric powder, 100 g',
    isImageVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=400'
  },
  'p38': {
    brand: 'NearMart Premium',
    category: 'Oil & Ghee',
    imageAltText: 'Pure cow ghee, 500 ml',
    isImageVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400'
  },
  'p39': {
    brand: 'Fortune',
    category: 'Oil & Ghee',
    imageAltText: 'Sunflower oil, 1 L',
    isImageVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400'
  }
};

export const sanitizeProductImages = (products = [], options = {}) => {
  const usedUrls = new Set();

  return products.map((product, index) => {
    const verified = VERIFIED_PRODUCTS[product.id];
    const isImageVerified = !!verified;
    
    // Choose appropriate brand name
    let brand = 'NearMart Organic';
    if (verified) {
      brand = verified.brand;
    } else if (product.name?.toLowerCase().includes('aashirvaad')) {
      brand = 'Aashirvaad';
    } else if (product.name?.toLowerCase().includes('mtr')) {
      brand = 'MTR';
    } else if (product.name?.toLowerCase().includes('saptham')) {
      brand = 'Saptham';
    } else if (product.name?.toLowerCase().includes('india gate')) {
      brand = 'India Gate';
    }

    const safeUrl = verified ? verified.imageUrl : getSafeProductImage(product, product.image_url || product.image, index + (options.seedOffset || 0));
    const finalUrl = usedUrls.has(safeUrl)
      ? buildUniqueOnlineImageUrl(product?.name || 'grocery product', `${product?.id || product?.name || 'product'}-${index}`, 400, 400, index + (options.seedOffset || 0) + 1000)
      : safeUrl;

    usedUrls.add(finalUrl);

    const category = verified ? verified.category : (product.category || 'Add Items');
    const unit = product.unit || '1 kg';
    const altText = verified ? verified.imageAltText : `${product.name}, ${unit}`;

    return {
      ...product,
      image: undefined,
      image_url: finalUrl,
      
      // Enriched standard fields
      productId: product.id,
      productName: product.name,
      brand,
      category,
      weightOrUnit: unit,
      price: product.price,
      imageUrl: finalUrl,
      imageAltText: altText,
      isImageVerified,
      storeId: product.storeId || null,
      storeName: product.storeName || null,
    };
  });
};
