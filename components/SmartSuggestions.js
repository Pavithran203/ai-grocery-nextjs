"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { api } from "@/services/api";
import ProductCard from "./ProductCard";
import { useTranslation } from "react-i18next";
import { BrainCircuit, Package, ChevronRight, Sparkles, ShoppingBag } from "lucide-react";
import Image from "next/image";

export default function SmartSuggestions() {
  const { cartItems, addToCart } = useCart();
  const { t, i18n } = useTranslation();
  const [suggestions, setSuggestions] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [activeTab, setActiveTab] = useState("ai"); // "ai" | "bundles"

  useEffect(() => {
    const fetchSuggestions = async () => {
      const ids = cartItems.map(item => item.id);
      const [res, bundleRes] = await Promise.all([
        api.getSmartSuggestions(ids),
        api.getBundleSuggestions(),
      ]);

      // Extract current store prefix from the first cart item
      const storePrefix = cartItems.length > 0 && cartItems[0].id.includes('__') 
        ? cartItems[0].id.split('__')[0] + '__' 
        : '';

      // Re-apply the store prefix to maintain cart isolation
      const prefixedSuggestions = res ? res.map(p => ({ ...p, id: storePrefix + (p.id.includes('__') ? p.id.split('__')[1] : p.id) })) : [];
      const prefixedBundles = bundleRes ? bundleRes.map(b => ({
        ...b,
        items: b.items.map(p => ({ ...p, id: storePrefix + (p.id.includes('__') ? p.id.split('__')[1] : p.id) }))
      })) : [];

      setSuggestions(prefixedSuggestions);
      setBundles(prefixedBundles);
    };

    if (cartItems.length > 0) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setBundles([]);
    }
  }, [cartItems]);

  if (suggestions.length === 0 && bundles.length === 0) return null;

  const cartItemIds = new Set(cartItems.map(i => i.id));

  return (
    <div className="mt-8 bg-white/70 dark:bg-gray-950/70 backdrop-blur-3xl rounded-[32px] border border-indigo-200/50 dark:border-indigo-800/30 shadow-[0_32px_80px_rgba(79,70,229,0.12)] overflow-hidden transition-all duration-700 hover:shadow-[0_40px_100px_rgba(79,70,229,0.18)]">
      
      {/* Header */}
      <div className="px-8 pt-8 pb-0 relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] animate-pulse" />
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 animate-chatPing">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-2xl text-gray-900 dark:text-white tracking-tight">{t('product.aiSmartPicks')}</h3>
            <div className="flex items-center gap-2">
               <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
               <p className="text-sm font-bold text-gray-500 uppercase tracking-widest opacity-80">{t('product.recommendationsForCart')}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-0 relative z-10">
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-6 py-3 rounded-t-2xl text-sm font-black transition-all border-b-4 ${
              activeTab === "ai"
                ? "border-indigo-500 text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            {t('product.pairsWellWith')}
          </button>
          <button
            onClick={() => setActiveTab("bundles")}
            className={`px-6 py-3 rounded-t-2xl text-sm font-black transition-all border-b-4 ${
              activeTab === "bundles"
                ? "border-purple-500 text-purple-700 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50"
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            {t('product.bundleDeals')}
          </button>
        </div>
      </div>

      <div className="p-8 pt-6">
        {/* AI Suggestions Tab */}
        {activeTab === "ai" && suggestions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fadeIn">
            {suggestions.map(p => (
              <ProductCard key={`sug-${p.id}`} product={p} />
            ))}
          </div>
        )}

        {/* Bundle Deals Tab */}
        {activeTab === "bundles" && bundles.length > 0 && (
          <div className="space-y-6 animate-fadeIn">
            {bundles.map((bundle, i) => {
              const bundleTotal = bundle.items.reduce((sum, p) => sum + p.price, 0);
              const discountedTotal = Math.max(0, bundleTotal - bundle.discount);
              const allInCart = bundle.items.every(p => cartItemIds.has(p.id));

              return (
                <div key={i} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          <Package className="w-5 h-5" />
                       </div>
                       <h4 className="font-black text-gray-900 dark:text-white text-lg tracking-tight">
                         {i18n.language === 'ta' && bundle.title_ta ? bundle.title_ta :
                          i18n.language === 'te' && bundle.title_te ? bundle.title_te :
                          i18n.language === 'kn' && bundle.title_kn ? bundle.title_kn :
                          i18n.language === 'ml' && bundle.title_ml ? bundle.title_ml :
                          i18n.language === 'hi' && bundle.title_hi ? bundle.title_hi :
                          bundle.title}
                       </h4>
                    </div>
                    <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                      ₹{bundle.discount} OFF
                    </span>
                  </div>
                    <div className="flex gap-3 mb-6 flex-wrap">
                      {bundle.items.map(p => {
                        const itemName = i18n.language === 'ta' && p.name_ta ? p.name_ta :
                                       i18n.language === 'te' && p.name_te ? p.name_te :
                                       i18n.language === 'kn' && p.name_kn ? p.name_kn :
                                       i18n.language === 'ml' && p.name_ml ? p.name_ml :
                                       i18n.language === 'hi' && p.name_hi ? p.name_hi :
                                       p.name;
                        const fallbackImage = 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_200,h_200,q_auto,f_auto/samples/food/fish-vegetables.jpg';
                        const getValidImage = () => {
                          const img = p.image || p.image_url;
                          if (!img || img === 'undefined' || img === 'null') return fallbackImage;
                          if (img.startsWith('http') || img.startsWith('/')) return img;
                          return fallbackImage;
                        };

                        return (
                          <div key={p.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-3 py-1.5 shadow-sm">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                              <Image 
                                src={getValidImage()} 
                                alt={itemName || 'Item'} 
                                fill
                                sizes="32px"
                                className="object-cover" 
                              />
                            </div>
                            <span className="text-xs font-black text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{itemName}</span>
                          </div>
                        );
                      })}
                    </div>
                  <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-400 line-through">₹{bundleTotal}</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-2xl tracking-tighter">₹{discountedTotal}</span>
                    </div>
                    <button
                      onClick={() => bundle.items.forEach(p => { if (!cartItemIds.has(p.id)) addToCart(p); })}
                      disabled={allInCart}
                      className={`flex items-center gap-2 px-8 py-4 rounded-[18px] font-black text-sm transition-all ${
                        allInCart
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white shadow-xl shadow-emerald-600/30 hover:-translate-y-1 active:translate-y-0 active:scale-95'
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5" strokeWidth={3} />
                      {allInCart ? t('common.added') : t('product.addCombo')}
                      {!allInCart && <ChevronRight className="w-5 h-5" strokeWidth={3} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
