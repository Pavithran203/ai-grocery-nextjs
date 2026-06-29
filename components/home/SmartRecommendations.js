"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '@/context/PreferencesContext';
import { getSmartPicks } from '@/services/recommendationService';
import ProductCard from '../ProductCard';

export default function SmartRecommendations({ allProducts = [] }) {
  const { t } = useTranslation();
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getUserProfile } = usePreferences();

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

  if (loading || picks.length === 0) return null;

  return (
    <div id="picked-for-you" className="scroll-mt-28 mx-4 my-8 sm:my-12 rounded-[32px] sm:rounded-[48px] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 relative overflow-hidden shadow-2xl">
      <div className="relative z-10 flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/40 bg-orange-500 animate-pulse">
            <Sparkles size={24} className="text-white" />
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
          <div key={`rec-${item.id}`} className="min-w-[220px] sm:min-w-[260px] flex-shrink-0 flex">
            <ProductCard product={item} />
          </div>
        ))}
      </div>
      
      {/* Decorative Orbs */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/5 blur-[120px] rounded-full" />
    </div>
  );
}
