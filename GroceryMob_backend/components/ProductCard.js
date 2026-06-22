"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";

// ── Keyword → curated Unsplash image ─────────────────────────────────────────
// Sorted longest-first so more specific keywords match before shorter ones
const PRODUCT_IMAGES = {
  // ── Fruits ──
  watermelon: "https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400&q=80&fit=crop&auto=format",
  pomegranate: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=400&q=80&fit=crop&auto=format",
  strawberry: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80&fit=crop&auto=format",
  pineapple: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80&fit=crop&auto=format",
  blueberry: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&q=80&fit=crop&auto=format",
  raspberry: "https://images.unsplash.com/photo-1568584711271-6bf38dbe5b83?w=400&q=80&fit=crop&auto=format",
  kiwifruit: "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400&q=80&fit=crop&auto=format",
  banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80&fit=crop&auto=format",
  grapes: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80&fit=crop&auto=format",
  grape: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80&fit=crop&auto=format",
  papaya: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400&q=80&fit=crop&auto=format",
  orange: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80&fit=crop&auto=format",
  mango: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&q=80&fit=crop&auto=format",
  apple: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80&fit=crop&auto=format",
  lemon: "https://images.unsplash.com/photo-1582287014914-1db9a1b7b44c?w=400&q=80&fit=crop&auto=format",
  guava: "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=400&q=80&fit=crop&auto=format",
  kiwi: "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400&q=80&fit=crop&auto=format",
  lime: "https://images.unsplash.com/photo-1582287014914-1db9a1b7b44c?w=400&q=80&fit=crop&auto=format",
  pear: "https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=400&q=80&fit=crop&auto=format",
  plum: "https://images.unsplash.com/photo-1590502160462-58b41354f588?w=400&q=80&fit=crop&auto=format",
  peach: "https://images.unsplash.com/photo-1595743825637-cdafc8ad4173?w=400&q=80&fit=crop&auto=format",
  fig: "https://images.unsplash.com/photo-1601379329542-31f09b5a6ff1?w=400&q=80&fit=crop&auto=format",

  // ── Vegetables ──
  cauliflower: "https://images.unsplash.com/photo-1568584711271-6bf38dbe5b83?w=400&q=80&fit=crop&auto=format",
  capsicum: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80&fit=crop&auto=format",
  broccoli: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80&fit=crop&auto=format",
  cucumber: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&q=80&fit=crop&auto=format",
  cabbage: "https://images.unsplash.com/photo-1594282486552-05b4460dca05?w=400&q=80&fit=crop&auto=format",
  spinach: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80&fit=crop&auto=format",
  tomato: "https://images.unsplash.com/photo-1546094096-0df4bcaad337?w=400&q=80&fit=crop&auto=format",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80&fit=crop&auto=format",
  carrot: "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400&q=80&fit=crop&auto=format",
  ginger: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=400&q=80&fit=crop&auto=format",
  garlic: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80&fit=crop&auto=format",
  onion: "https://images.unsplash.com/photo-1518977876232-b9b38c8a3a6a?w=400&q=80&fit=crop&auto=format",
  pepper: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80&fit=crop&auto=format",
  beans: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=400&q=80&fit=crop&auto=format",
  peas: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80&fit=crop&auto=format",
  corn: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80&fit=crop&auto=format",
  mushroom: "https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&q=80&fit=crop&auto=format",
  pumpkin: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400&q=80&fit=crop&auto=format",
  bitter: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=400&q=80&fit=crop&auto=format",
  ladies: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&q=80&fit=crop&auto=format",
  okra: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&q=80&fit=crop&auto=format",
  eggplant: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&q=80&fit=crop&auto=format",
  bringal: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&q=80&fit=crop&auto=format",

  // ── Dairy ──
  paneer: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80&fit=crop&auto=format",
  yogurt: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80&fit=crop&auto=format",
  cheese: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80&fit=crop&auto=format",
  butter: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80&fit=crop&auto=format",
  cream: "https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=400&q=80&fit=crop&auto=format",
  ghee: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80&fit=crop&auto=format",
  curd: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80&fit=crop&auto=format",
  milk: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80&fit=crop&auto=format",
  eggs: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80&fit=crop&auto=format",
  egg: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80&fit=crop&auto=format",

  // ── Staples ──
  noodles: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80&fit=crop&auto=format",
  noodle: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80&fit=crop&auto=format",
  pasta: "https://images.unsplash.com/photo-1551462147-37885acc36f1?w=400&q=80&fit=crop&auto=format",
  bread: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80&fit=crop&auto=format",
  maida: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80&fit=crop&auto=format",
  flour: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80&fit=crop&auto=format",
  wheat: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=400&q=80&fit=crop&auto=format",
  sugar: "https://images.unsplash.com/photo-1559181567-c3190b16bf4c?w=400&q=80&fit=crop&auto=format",
  lentil: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80&fit=crop&auto=format",
  oats: "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=400&q=80&fit=crop&auto=format",
  rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80&fit=crop&auto=format",
  atta: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80&fit=crop&auto=format",
  salt: "https://images.unsplash.com/photo-1563612116625-3012372fccce?w=400&q=80&fit=crop&auto=format",
  oil: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80&fit=crop&auto=format",
  dal: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80&fit=crop&auto=format",
  oat: "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=400&q=80&fit=crop&auto=format",

  // ── Beverages ──
  coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80&fit=crop&auto=format",
  juice: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80&fit=crop&auto=format",
  water: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80&fit=crop&auto=format",
  cola: "https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?w=400&q=80&fit=crop&auto=format",
  soda: "https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?w=400&q=80&fit=crop&auto=format",
  tea: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80&fit=crop&auto=format",

  // ── Snacks ──
  chocolate: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&q=80&fit=crop&auto=format",
  popcorn: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=400&q=80&fit=crop&auto=format",
  cashew: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&q=80&fit=crop&auto=format",
  almond: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80&fit=crop&auto=format",
  chips: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80&fit=crop&auto=format",
  cookie: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80&fit=crop&auto=format",
  biscuit: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80&fit=crop&auto=format",
  nuts: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80&fit=crop&auto=format",
  peanut: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&q=80&fit=crop&auto=format",
  wafer: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80&fit=crop&auto=format",
};

// ── Category-level fallback images ────────────────────────────────────────────
const CATEGORY_IMAGES = {
  fruits: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80&fit=crop&auto=format",
  vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80&fit=crop&auto=format",
  dairy: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80&fit=crop&auto=format",
  staples: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80&fit=crop&auto=format",
  beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80&fit=crop&auto=format",
  snacks: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80&fit=crop&auto=format",
  default: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80&fit=crop&auto=format",
};

// ── Smart image resolver ──────────────────────────────────────────────────────
function getSmartImage(product) {
  // 1. Use existing image if present
  if (product.image) return product.image;

  // 2. Match product name tokens against keyword map
  const name = (product.name || "").toLowerCase();
  for (const [keyword, url] of Object.entries(PRODUCT_IMAGES)) {
    if (name.includes(keyword)) return url;
  }

  // 3. Category-level fallback
  const cat = (product.category || "").toLowerCase().trim();
  return CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.default;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [imgSrc, setImgSrc] = useState(() => getSmartImage(product));
  const [imgError, setImgError] = useState(false);

  const pId = product._id || product.id;
  const inCart = cartItems.find(item => (item._id || item.id) === pId);

  // If both primary and smart image fail, try category fallback
  const handleError = () => {
    const cat = (product.category || "").toLowerCase().trim();
    const catFb = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.default;
    if (imgSrc !== catFb) {
      setImgSrc(catFb);
    } else {
      setImgError(true);
    }
  };

  return (
    <div className="shrink-0 snap-start w-45 sm:w-50 md:w-60 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 group flex flex-col h-full overflow-hidden">

      {/* Image Container */}
      <Link href={`/product/${pId}`} className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-2">
        {imgError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <span className="text-4xl select-none">🛒</span>
          </div>
        ) : (
          <picture>
            <img
              src={imgSrc}
              alt={product.name}
              onError={handleError}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </picture>
        )}

        {/* Discount Badge - Flipkart style */}
        <div className="absolute top-2 right-2 bg-[#F1A800] text-white text-[11px] font-bold px-2 py-1 rounded shadow-md z-10">
          -20% OFF
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col px-3 py-2">
        {/* Brand/Category */}
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{product.category || "Grocery"}</span>

        {/* Product Name */}
        <Link href={`/product/${pId}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 leading-snug group-hover:text-[#1F4A8E] transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs font-bold text-gray-900 dark:text-white">4.0</span>
          <span className="text-xs text-amber-500">★</span>
          <span className="text-xs text-gray-500">(128)</span>
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            ₹{Math.round(product.price * 0.8)}
          </span>
          <span className="text-xs text-gray-500 line-through">
            ₹{product.price}
          </span>
        </div>

        {/* Add to Cart Button */}
        {inCart ? (
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
            <button
              onClick={() => updateQuantity(pId, inCart.quantity - 1)}
              className="flex-1 flex items-center justify-center py-1 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="flex-1 text-center text-sm font-bold text-gray-900 dark:text-white">{inCart.quantity}</span>
            <button
              onClick={() => updateQuantity(pId, inCart.quantity + 1)}
              className="flex-1 flex items-center justify-center py-1 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(product)}
            className="w-full bg-[#1F4A8E] hover:bg-[#16355e] text-white py-2 rounded-lg font-bold text-sm transition-colors active:scale-95"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
