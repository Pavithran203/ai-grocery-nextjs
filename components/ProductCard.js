"use client";
import { Plus, Minus, Heart, Star, Sparkles, Zap, Tag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import SafeImage from "./SafeImage";

export default function ProductCard({ product }) {
  const router = useRouter();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [wishlist, setWishlist] = useState(false);
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const inCart = cartItems.find(item => item.id === product.id);
  const discount = product.discount || 0;
  const originalPrice = discount > 0
    ? Math.round(product.price / (1 - discount / 100))
    : null;

  const handleCardClick = () => {
    router.push(`/product/${product.id}`, { scroll: false });
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const buyNowItem = {
        ...product,
        quantity: 1
      };
      sessionStorage.setItem('nearmart_direct_buy_item', JSON.stringify(buyNowItem));
      router.push('/checkout?directBuy=true');
    }
  };

  // Structured fields with fallbacks
  const isImageVerified = product.isImageVerified || false;
  const productName = product.productName || product.name;
  const brand = product.brand || '';
  const unit = product.weightOrUnit || product.unit || '1 kg';
  const category = product.category || 'Grocery';
  const storeName = product.storeName || product.store?.name || 'NearMart';
  const rating = product.rating;

  return (
    <div 
      tabIndex={0}
      role="article"
      aria-label={`Product card for ${productName}`}
      onClick={handleCardClick}
      className="w-full h-full rounded-[28px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-2 active:scale-[0.99] transition-all duration-300 group flex flex-col overflow-hidden relative cursor-pointer"
    >
        {/* Wishlist */}
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            e.preventDefault(); 
            setWishlist(w => !w); 
          }}
          className={`absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-sm hover:scale-110 active:scale-95 ${wishlist ? '!opacity-100 text-red-500' : 'text-gray-400 hover:text-red-400'}`}
        >
          <Heart className={`w-4 h-4 ${wishlist ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Navigation Area (Image Container) */}
        <div 
          className="relative aspect-square w-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center overflow-hidden"
        >
          {/* Premium Badge */}
          {rating && parseFloat(rating) >= 4.8 && (
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-1 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-lg font-black text-[8px] tracking-widest shadow-lg shadow-amber-500/20 uppercase border border-white/20 animate-fadeIn">
                <Sparkles className="w-2.5 h-2.5" />
                Premium
              </div>
            </div>
          )}

            <div className="absolute inset-4 sm:inset-6">
              <SafeImage
                src={product.image || product.image_url || product.imageUrl}
                alt={product.imageAltText || `${productName}, ${unit}`}
                type="product"
                entityId={product.id}
                productName={productName}
                componentName="ProductCard"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="group-hover:scale-105 transition-transform duration-500 ease-out"
                objectFit={
                  (productName?.toLowerCase().includes('flour') || 
                   productName?.toLowerCase().includes('atta') || 
                   productName?.toLowerCase().includes('mix') || 
                   productName?.toLowerCase().includes('ghee') || 
                   productName?.toLowerCase().includes('oil') ||
                   productName?.toLowerCase().includes('jaggery')) 
                    ? 'contain' 
                    : 'cover'
                }
              />
            </div>
        </div>

        {/* Info & Cart Section */}
        <div className="flex-1 flex flex-col p-4 sm:p-5 justify-between">
          <div className="flex flex-col">
            {/* Brand Name */}
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 min-h-[15px]">
              {brand || 'NearMart Organic'}
            </span>

            {/* Name - Fixed height for alignment */}
            <div className="h-9 sm:h-10 mb-2 overflow-hidden">
              <h3 className="font-extrabold text-xs sm:text-[13px] text-gray-900 dark:text-white line-clamp-2 leading-tight transition-colors" suppressHydrationWarning>
                {product[`name_${language}`] || productName}
              </h3>
            </div>

            {/* Unit & Rating */}
            <div className="flex items-center justify-between mb-3 min-h-5">
              <span className="text-[10px] font-extrabold text-slate-500">
                {unit}
              </span>
              {rating && parseFloat(rating) > 0 && (
                <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded-md text-[10px] font-black text-amber-600 dark:text-amber-400">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  <span>{rating}</span>
                </div>
              )}
            </div>

            {/* Store Information Badge */}
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full max-w-full truncate" title={`Sold by: ${storeName}`}>
                <span className="shrink-0">🏪</span>
                <span className="truncate">Sold by: {storeName}</span>
              </span>
            </div>
          </div>

          {/* Price + Add Action (Pinned to Bottom) */}
          <div className="mt-auto pt-3 border-t border-gray-50 dark:border-gray-900/60 flex items-center justify-between gap-3 relative z-20">
            <div className="flex flex-col min-w-0">
              {originalPrice && (
                <span className="text-[10px] text-gray-400 line-through leading-none mb-1">₹{originalPrice}</span>
              )}
              <span className="font-black text-sm sm:text-base text-gray-900 dark:text-white tracking-tight">
                ₹{product.price}
              </span>
            </div>

            {inCart ? (
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <div 
                  className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/20 p-1 rounded-xl border border-rose-100 dark:border-rose-900/40 shadow-sm animate-fadeIn"
                >
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      updateQuantity(product.id, inCart.quantity - 1); 
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-sm text-rose-500 hover:bg-rose-50 active:scale-90 transition-all hover:text-rose-600"
                  >
                    <Minus className="w-4 h-4" strokeWidth={3} />
                  </button>
                  <span className="text-[13px] font-black w-6 text-center text-rose-700 dark:text-white">
                    {inCart.quantity}
                  </span>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      updateQuantity(product.id, inCart.quantity + 1); 
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500 text-white shadow-md active:scale-90 transition-all hover:brightness-110 hover:shadow-rose-500/20"
                  >
                    <Plus className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    addToCart(product); 
                  }}
                  className="h-9 px-4 rounded-xl font-black text-xs text-white bg-emerald-600 flex items-center gap-1 transition-all hover:scale-[1.05] hover:brightness-110 active:scale-95 shadow-md shadow-emerald-500/10"
                >
                  {t.add || 'ADD'} <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
