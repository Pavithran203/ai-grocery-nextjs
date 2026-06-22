"use client";
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Sparkles, Plus, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '@/context/PreferencesContext';
import { useCart } from '@/context/CartContext';
import { getSmartPicks, getRecommendationReason } from '@/services/recommendationService';
import Link from 'next/link';
import SafeImage from '../SafeImage';
export default function SmartRecommendations({ allProducts = [] }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getUserProfile, trackProductView, trackCartAdd } = usePreferences();
  const { addToCart } = useCart();

  const generatePicks = useCallback(() => {
    if (!allProducts || allProducts.length === 0) {
      setLoading(false);
      return;
    }
    try {
      const profile = getUserProfile();
      const smartPicks = getSmartPicks(allProducts, profile, [], 10);
      setPicks(smartPicks);
    } catch (e) {
      console.error('SmartRecommendations error:', e);
    } finally {
      setLoading(false);
    }
  }, [allProducts, getUserProfile]);

  useEffect(() => {
    generatePicks();
  }, [generatePicks]);

  const handleAdd = useCallback((product) => {
    if (!product) return;
    addToCart(product, 1);
    if (product.category) trackCartAdd(product.category);
  }, [addToCart, trackCartAdd]);

  if (loading || picks.length === 0) return null;

  const profile = getUserProfile();
  const hasActivity = Object.keys(profile.orderedCategories).length > 0 || Object.keys(profile.viewedProducts).length > 0 || profile.searchedQueries.length > 0;

  return (
    <div className="mx-4 my-8 sm:my-12 rounded-[32px] sm:rounded-[48px] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 relative overflow-hidden shadow-2xl">
      <div className="relative z-10 flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/40 bg-orange-500 animate-pulse">
            <Sparkles size={24} className="text-white sm:size-28" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              {t('product.aiRecommendations', 'AI Recommendations')}
            </h2>
            <p className="text-sm font-bold uppercase tracking-widest mt-1 text-gray-500">
              {t('product.pickedForYou', 'Handpicked for you')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto no-scrollbar pb-10 gap-8 relative z-10 px-2">
        {picks.map((item) => (
          <div key={`rec-${item.id}`} className="min-w-[200px] sm:min-w-[240px] rounded-[32px] sm:rounded-[40px] p-5 sm:p-6 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 relative group transition-all hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] hover:-translate-y-3">
            {/* Product Card */}
            <div className="relative w-full aspect-square rounded-[32px] bg-gray-50 dark:bg-gray-800 mb-6 overflow-hidden shadow-inner group-hover:bg-white dark:group-hover:bg-gray-950 transition-colors">
              <SafeImage 
                src={item.image_url || item.image} 
                alt={item.name || 'Product Image'} 
                type="product"
                entityId={item.id}
                productName={item.name}
                componentName="SmartRecommendations"
                fill
                sizes="(max-width: 768px) 240px, 240px"
                className="p-4 transition-transform duration-700 group-hover:scale-110" 
                objectFit="cover"
              />
            </div>

            <div className="space-y-1 mb-6">
              <h3 className="text-base font-black line-clamp-2 leading-tight h-10 text-gray-900 dark:text-white">
                {item[`name_${language}`] || item.name}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t[item.unit] || item.unit}</p>
            </div>

            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-3xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 transition-colors">
              <div className="pl-3">
                <span className="text-xs text-gray-400 font-bold block leading-none mb-1">Price</span>
                <span className="text-xl font-black text-gray-900 dark:text-white">₹{item.price}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleAdd(item); }}
                className="w-14 h-14 rounded-[22px] flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:brightness-110 hover:rotate-90 transition-all active:scale-90 relative z-10"
              >
                <Plus size={28} strokeWidth={3} />
              </button>
            </div>

            {item.rating && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="text-xs font-black text-gray-900 dark:text-white">{item.rating}</span>
              </div>
            )}
            <Link href={`/product/${item.id}`} className="absolute inset-0 z-0" />
          </div>
        ))}
      </div>
      
      {/* Decorative Orbs */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/5 blur-[120px] rounded-full" />
    </div>
  );
}
