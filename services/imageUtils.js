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

export const sanitizeProductImages = (products = [], options = {}) => {
  const usedUrls = new Set();

  return products.map((product, index) => {
    const safeUrl = getSafeProductImage(product, product.image_url || product.image, index + (options.seedOffset || 0));

    if (usedUrls.has(safeUrl)) {
      const fallbackUrl = buildUniqueOnlineImageUrl(product?.name || 'grocery product', `${product?.id || product?.name || 'product'}-${index}`, 400, 400, index + (options.seedOffset || 0) + 1000);
      usedUrls.add(fallbackUrl);
      return {
        ...product,
        image: undefined,
        image_url: fallbackUrl,
      };
    }

    usedUrls.add(safeUrl);
    return {
      ...product,
      image: undefined,
      image_url: safeUrl,
    };
  });
};
