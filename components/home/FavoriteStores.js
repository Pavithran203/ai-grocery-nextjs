"use client";
import React, { useMemo } from 'react';
import { Heart, Star } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useFavorites } from '@/context/FavoriteContext';
import { storeService } from '@/services/storeService';
import { translations } from '@/services/translations';
import Link from 'next/link';

export default function FavoriteStores() {
  const { language } = useLanguage();
  const t = translations[language] || translations.EN;
  const { favorites, toggleFavorite } = useFavorites();

  // Default coords (Chennai Central)
  const coords = { latitude: 13.0827, longitude: 80.2707 };

  const favoriteStores = useMemo(() => {
    if (!favorites || favorites.length === 0) return [];
    
    return favorites
      .map(id => storeService.getStoreById(id, coords?.latitude, coords?.longitude))
      .filter(s => s !== null);
  }, [favorites]);

  if (favoriteStores.length === 0) return null;

  return (
    <div className="mt-8 mb-4">
      <div className="flex justify-between items-center px-4 mb-4">
        <div className="flex items-center gap-2">
          <Heart size={20} className="text-rose-500 fill-rose-500" />
          <h2 className="text-lg font-black text-gray-900 dark:text-white">
            {t['yourFavoriteStores'] || 'Your Favorite Stores'}
          </h2>
        </div>
        <Link href="/stores" className="text-sm font-bold text-teal-500 hover:underline">
          {t['seeAll'] || 'See All'}
        </Link>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-4">
        {favoriteStores.map((store) => {
          const status = store.status;
          const isClosed = status.type === 'CLOSED' || status.type === 'CLOSED_TODAY';

          return (
            <div 
              key={store.id}
              className={`min-w-[160px] max-w-[160px] bg-white dark:bg-gray-900 rounded-3xl p-3 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all ${isClosed ? 'opacity-70 grayscale-[0.5]' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-2xl">
                  {store.emoji}
                </div>
                <button 
                  onClick={() => toggleFavorite(store.id)}
                  className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <Heart size={14} className="text-rose-500 fill-rose-500" />
                </button>
              </div>

              <h3 className="text-sm font-black text-gray-900 dark:text-white truncate mb-1">
                {store.name}
              </h3>
              
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex items-center gap-0.5">
                  <Star size={10} className="text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-black text-gray-900 dark:text-white">{store.rating}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                <span className="text-[10px] text-gray-400 font-bold">{store.distance} km</span>
              </div>

              <div className="flex items-center gap-1 px-2 py-1 rounded-lg self-start" style={{ backgroundColor: status.bgColor }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                <span className="text-[9px] font-black" style={{ color: status.color }}>
                  {t[status.label] || status.label}
                </span>
              </div>
              
              {!isClosed && (
                <Link href={`/store/${store.id}`} className="absolute inset-0 z-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
