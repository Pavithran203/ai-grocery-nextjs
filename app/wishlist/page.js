"use client";

import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  Star, 
  ArrowLeft,
  ShoppingBasket
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Image from "next/image";

export default function WishlistPage() {
  const { wishlistItems = [], removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { i18n } = useTranslation();
  const language = i18n.language;

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white dark:border-gray-900 shadow-xl">
          <Heart className="w-10 h-10 text-rose-500 fill-rose-500/20" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Your wishlist is empty</h1>
        <p className="text-gray-600 dark:text-gray-400 font-bold uppercase text-xs tracking-widest max-w-sm mx-auto leading-relaxed mb-10">
          Save items you love to your wishlist and they'll show up here so you can find them later.
        </p>
        <Link 
          href="/" 
          style={{ 
            backgroundColor: '#10B981', 
            color: '#FFFFFF', 
            padding: '20px 40px', 
            borderRadius: '24px', 
            fontWeight: '900', 
            fontSize: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)',
            textDecoration: 'none'
          }}
          className="hover:brightness-110 active:scale-95 transition-all"
        >
          Explore Products <ShoppingBag className="w-6 h-6" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <Link href="/" className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-4">
              My Wishlist 
              <span className="text-sm bg-rose-500 text-white px-3 py-1 rounded-full">{wishlistItems.length}</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-1">Saved for later</p>
          </div>
        </div>
        <button 
          onClick={clearWishlist}
          className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-[10px] font-black text-rose-500 hover:bg-rose-100 uppercase tracking-widest transition-all border border-rose-100 dark:border-rose-900"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {wishlistItems.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-4 shadow-sm group hover:border-emerald-200 transition-all flex flex-col relative">
            <div className="relative aspect-square rounded-[24px] overflow-hidden bg-gray-50 dark:bg-gray-800 mb-6">
              <Image 
                src={(product.image_url || product.image || '').startsWith('http') || (product.image_url || product.image || '').startsWith('/') ? (product.image_url || product.image) : 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/samples/food/spices.jpg'} 
                alt={product.name || 'Product Image'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <button 
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md flex items-center justify-center text-rose-500 shadow-lg hover:scale-110 active:scale-90 transition-all z-10"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                  {product.category || 'Fresh'}
                </span>
                {product.rating && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-amber-500">
                    <Star size={10} className="fill-amber-500" /> {product.rating}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight line-clamp-1" suppressHydrationWarning>{product[`name_${language}`] || product.name}</h3>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{product.weight || '500g'}</p>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">₹{product.price}</p>
              </div>
              <button 
                onClick={() => addToCart(product)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                <ShoppingCart size={18} strokeWidth={3} />
                <span>Add</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
