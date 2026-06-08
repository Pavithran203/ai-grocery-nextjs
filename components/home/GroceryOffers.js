"use client";
import React, { useRef } from 'react';
import { Tag, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

const GROCERY_OFFERS = [
  {
    id: 'offer-1',
    titleKey: 'buy5kgRice',
    title: 'Buy 5kg Rice',
    highlightKey: 'get50Off',
    highlight: 'Get ₹50 OFF',
    descriptionKey: 'buy5kgRiceDescription',
    description: 'On any 5kg rice pack from local stores',
    emoji: '🍚',
    bgColor: '#2D6A4F',
  },
  {
    id: 'offer-2',
    titleKey: 'cookingOilCombo',
    title: 'Cooking Oil Combo',
    highlightKey: 'save80',
    highlight: 'Save ₹80',
    descriptionKey: 'cookingOilComboDescription',
    description: 'Buy 2L oil + 500g ghee combo',
    emoji: '🫒',
    bgColor: '#C96A22',
  },
  /*
  {
    id: 'offer-3',
    titleKey: 'festivalGrocery',
    title: 'Festival Grocery',
    highlightKey: 'upTo20Off',
    highlight: 'Up to 20% OFF',
    descriptionKey: 'festivalGroceryDescription',
    description: 'On masalas, ghee & sweets ingredients',
    emoji: '🪔',
    bgColor: '#7C3AED',
  },
  */
  {
    id: 'offer-4',
    titleKey: 'attaDalPack',
    title: 'Atta + Dal Pack',
    highlightKey: 'flat100Off',
    highlight: 'Flat ₹100 OFF',
    descriptionKey: 'attaDalPackDescription',
    description: 'Buy 5kg Atta + 2kg Dal together',
    emoji: '🌾',
    bgColor: '#5B4A3F',
  },
];

export default function GroceryOffers() {
  const { t } = useTranslation();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-8 mb-8 relative group">
      <div className="flex justify-between items-center px-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500 shadow-xl shadow-orange-500/20">
            <Tag size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">{t('product.trendingNearYou') || 'Trending Products'}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('product.inSeason') || 'Trending Near You'}</p>
          </div>
        </div>
        <div className="hidden md:flex gap-2">
          <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div ref={scrollRef} className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-4 scroll-smooth">
          {GROCERY_OFFERS.map((offer) => (
            <Link 
              key={offer.id} 
              href="/products"
              className="min-w-[180px] rounded-[32px] p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-transform hover:scale-105"
              style={{ backgroundColor: offer.bgColor }}
            >
              <div className="relative z-10">
                <span className="text-4xl mb-3 block">{offer.emoji}</span>
                <h3 className="text-lg font-black text-white mb-2 leading-tight">
                  {t(`home.${offer.titleKey}`, offer.title)}
                </h3>
                <div className="bg-white/20 px-3 py-1.5 rounded-xl inline-block mb-3">
                  <span className="text-xs font-black text-white whitespace-nowrap">{t(`home.${offer.highlightKey}`, offer.highlight)}</span>
                </div>
                <p className="text-xs text-white/80 font-medium mb-4 leading-relaxed">
                  {t(`home.${offer.descriptionKey}`, offer.description)}
                </p>
                <div className="flex items-center justify-between bg-white/20 px-4 py-2.5 rounded-2xl group-hover:bg-white/30 transition-all">
                  <span className="text-xs font-black text-white uppercase tracking-tight">{t('home.shopNow') || 'Shop Now'}</span>
                  <ChevronRight size={16} strokeWidth={3} className="text-white" />
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-white/10" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
