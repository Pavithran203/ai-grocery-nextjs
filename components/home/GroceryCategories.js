"use client";
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const GROCERY_CATEGORIES = [
  { id: 'rice-grains', name: 'Rice & Grains', emoji: '🍚', bgColor: '#FFF8F0', textColor: '#8B4513' },
  { id: 'dal-pulses', name: 'Dal & Pulses', emoji: '🥜', bgColor: '#FFF5E6', textColor: '#A0522D' },
  { id: 'oil-ghee', name: 'Oil & Ghee', emoji: '🍶', bgColor: '#F0FFF4', textColor: '#2D6A4F' },
  { id: 'flour-baking', name: 'Flour & Baking', emoji: '🌾', bgColor: '#FFFDE7', textColor: '#7C6600' },
  { id: 'masalas-spices', name: 'Masalas & Spices', emoji: '🌶️', bgColor: '#FFF0F0', textColor: '#CC3333' },
];

export default function GroceryCategories() {
  const { t } = useTranslation();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-4 relative group">
      <div className="flex justify-between items-center px-4 mb-3">
        <h2 className="text-[20px] font-extrabold text-gray-900 dark:text-white">
          {t('categories.shopByCategory') || 'Shop by Category'}
        </h2>
        <div className="hidden md:flex gap-2">
          <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <div className="relative">
        <div ref={scrollRef} className="flex overflow-x-auto no-scrollbar gap-3 px-4 pb-4 scroll-smooth">
          {GROCERY_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.id)}`}
              className="flex flex-col items-center min-w-[78px] group/item"
            >
              <div 
                className="w-[68px] h-[68px] rounded-[22px] flex items-center justify-center text-[28px] shadow-sm transition-transform active:scale-95 group-hover/item:-translate-y-1"
                style={{ backgroundColor: category.bgColor }}
              >
                 {category.emoji}
              </div>
              
              <span 
                className="text-[11px] font-bold text-center mt-2 leading-[14px] line-clamp-2 px-1"
                style={{ color: category.textColor }}
                suppressHydrationWarning
              >
                {t(`categories.${category.id}`) || category.name}
              </span>
            </Link>
          ))}

          <Link
            href="/products"
            className="flex flex-col items-center min-w-[78px] group/item"
          >
            <div className="w-[68px] h-[68px] rounded-[22px] bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-[11px] font-black text-emerald-600 transition-all group-hover/item:bg-emerald-600 group-hover/item:text-white group-hover/item:border-emerald-600 shadow-sm group-hover/item:-translate-y-1" suppressHydrationWarning>
              {t('common.viewAll') || 'View All'}
            </div>
            <span className="opacity-0">.</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
