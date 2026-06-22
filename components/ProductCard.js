"use client";
import { Plus, Minus, Heart, Star, Sparkles } from "lucide-react";
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

  return (
    <div 
      tabIndex={0}
      role="article"
      aria-label={`Product card for ${product.name}`}
      onClick={handleCardClick}
      className="w-full rounded-[28px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-2 active:scale-[0.99] transition-all duration-300 group flex flex-col overflow-hidden relative cursor-pointer"
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

        {/* Navigation Area (Image) */}
        <div 
          className="relative aspect-square w-full bg-gray-50/50 dark:bg-gray-900/50 p-4 sm:p-6 flex items-center justify-center overflow-hidden"
        >
          {/* Rating Badge */}
          {product.rating && (
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <div className="flex items-center gap-1 bg-white/95 dark:bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm border border-gray-100/50 dark:border-white/10">
                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-black text-gray-900 dark:text-white">{product.rating}</span>
              </div>
              {parseFloat(product.rating) >= 4.8 && (
                <div className="flex items-center gap-1 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-lg font-black text-[8px] tracking-widest shadow-lg shadow-amber-500/20 uppercase border border-white/20 animate-fadeIn">
                  <Sparkles className="w-2.5 h-2.5" />
                  Premium
                </div>
              )}
            </div>
          )}

          <SafeImage
            src={product.image || product.image_url}
            alt={product.name || 'Product Image'}
            type="product"
            entityId={product.id}
            productName={product.name}
            componentName="ProductCard"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="p-4 group-hover:scale-110 transition-transform duration-500"
            objectFit="contain"
          />
        </div>

        {/* Info & Cart Section */}
        <div className="flex-1 flex flex-col p-4 sm:p-5">
          {/* Navigation Area (Text) */}
          <div className="flex flex-col">
            {/* Name - Fixed height for alignment */}
            <div className="h-9 sm:h-10 mb-1 overflow-hidden">
              <h3 className="font-extrabold text-xs sm:text-[13px] text-gray-900 dark:text-white line-clamp-2 leading-tight transition-colors" suppressHydrationWarning>
                {product[`name_${language}`] || product.name}
              </h3>
            </div>

            {/* Unit */}
            <span className="text-[10px] font-bold text-gray-400 mb-3 block uppercase tracking-[0.1em]">
              {product.unit || '1 kg'}
            </span>

            {/* Divider */}
            <div className="h-px w-full bg-gray-50 dark:bg-gray-800 mb-4" />
          </div>

          {/* Price + Add Action (Isolated from Nav) */}
          <div className="mt-auto flex items-center justify-between gap-3 relative z-20">
            <div className="flex flex-col min-w-0">
              {originalPrice && (
                <span className="text-[10px] text-gray-400 line-through leading-none mb-1">₹{originalPrice}</span>
              )}
              <span className="font-black text-sm sm:text-base text-gray-900 dark:text-white tracking-tight">
                ₹{product.price}
              </span>
            </div>

            {inCart ? (
              <div 
                className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/20 p-1 rounded-xl border border-rose-100 dark:border-rose-900/40 shadow-sm animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
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
            ) : (
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  addToCart(product); 
                }}
                className="h-10 px-5 rounded-xl font-black text-[13px] text-white bg-emerald-600 flex items-center gap-2 transition-all hover:scale-[1.05] hover:brightness-110 active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                {t.add || 'ADD'} <Plus className="w-4 h-4" strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </div>
  );
}
