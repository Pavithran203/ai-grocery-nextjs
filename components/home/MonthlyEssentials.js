"use client";
import React, { useRef } from 'react';
import { Package, Plus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';

const MONTHLY_PACKS = [
  {
    id: 'pack-1',
    titleKey: 'monthlyFamilyGroceryPack',
    title: 'Monthly Family Grocery Pack',
    emoji: '🛒',
    itemKeys: ['rice5kg', 'dal2kg', 'oil2L', 'atta5kg', 'sugar2kg'],
    originalPrice: 1999,
    offerPrice: 1699,
    discountKey: 'discount15Off',
    discount: '15% OFF',
    bgColor: '#F0FFF4',
    accentColor: '#2D6A4F',
  },
  {
    id: 'pack-2',
    titleKey: 'cookingEssentialsCombo',
    title: 'Cooking Essentials Combo',
    emoji: '🍳',
    itemKeys: ['turmeric200g', 'chilliPowder200g', 'cumin100g', 'mustard100g', 'salt1kg'],
    originalPrice: 599,
    offerPrice: 449,
    discountKey: 'discount25Off',
    discount: '25% OFF',
    bgColor: '#FFF8F0',
    accentColor: '#C96A22',
  },
  {
    id: 'pack-3',
    titleKey: 'riceDalCombo',
    title: 'Rice & Dal Combo',
    emoji: '🍚',
    itemKeys: ['basmatiRice5kg', 'toorDal1kg', 'moongDal1kg'],
    originalPrice: 999,
    offerPrice: 799,
    discountKey: 'discount20Off',
    discount: '20% OFF',
    bgColor: '#FFFDE7',
    accentColor: '#7C6600',
  },
  {
    id: 'pack-4',
    titleKey: 'householdCareBundle',
    title: 'Household Care Bundle',
    emoji: '🏠',
    itemKeys: ['dishSoap500ml', 'floorCleaner1L', 'laundryDetergent1kg'],
    originalPrice: 449,
    offerPrice: 349,
    discountKey: 'discount22Off',
    discount: '22% OFF',
    bgColor: '#F0F8FF',
    accentColor: '#336699',
  },
];

export default function MonthlyEssentials() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAddPack = (pack) => {
    addToCart({
      id: pack.id,
      name: t(`home.${pack.titleKey}`, pack.title),
      price: pack.offerPrice,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
    }, 1);
  };

  return (
    <div className="mt-12 px-4 relative group">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[22px] sm:rounded-[28px] flex items-center justify-center shadow-xl shadow-emerald-500/20 bg-gradient-to-br from-emerald-500 to-emerald-600 relative group/icon overflow-hidden">
            <ShoppingBag size={24} className="text-white sm:w-8 sm:h-8 relative z-10" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/icon:opacity-100 transition-opacity" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('home.monthlySavings', 'Monthly Essentials')}</h2>
            <p className="text-sm font-bold uppercase tracking-[0.2em] mt-1 text-gray-500">{t('home.curatedBundles', 'Bundle & Save Big')}</p>
          </div>
        </div>
        <div className="hidden md:flex gap-2">
          <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div ref={scrollRef} className="flex overflow-x-auto no-scrollbar gap-4 pb-4 scroll-smooth">
          {MONTHLY_PACKS.map((pack) => {
            const savings = pack.originalPrice - pack.offerPrice;
            return (
              <div 
                key={pack.id} 
                className="min-w-[260px] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow"
                style={{ backgroundColor: pack.bgColor }}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-4xl">{pack.emoji}</span>
                  <div 
                    className="px-3 py-1.5 rounded-xl font-black text-[10px] text-white"
                    style={{ backgroundColor: pack.accentColor }}
                  >
                    {t(`home.${pack.discountKey}`, pack.discount)}
                  </div>
                </div>

                <h3 className="text-lg font-black text-gray-900 mb-3 leading-tight h-10 line-clamp-2">
                  {t(`home.${pack.titleKey}`, pack.title)}
                </h3>

                <div className="mb-6">
                  {pack.itemKeys.slice(0, 3).map((itemKey) => (
                    <p key={itemKey} className="text-xs text-gray-500 font-medium mb-1">• {t(`home.${itemKey}`, itemKey)}</p>
                  ))}
                  {pack.itemKeys.length > 3 && (
                    <p className="text-[10px] text-gray-400 font-bold italic mt-1">
                      {t('home.moreItems', { count: pack.itemKeys.length - 3 })}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs text-gray-400 line-through mb-0.5">₹{pack.originalPrice}</p>
                    <p className="text-2xl font-black" style={{ color: pack.accentColor }}>₹{pack.offerPrice}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAddPack(pack); }}
                    className="flex items-center gap-3 px-6 py-4 rounded-[20px] text-white font-black text-base shadow-[0_10px_25px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-all brightness-110 relative z-10"
                    style={{ backgroundColor: pack.accentColor }}
                  >
                    <Plus size={20} strokeWidth={3} />
                    <span>{t('common.add', 'Add')}</span>
                  </button>
                </div>

                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: pack.accentColor }}>
                  {t('cart.savingsLabel', { amount: savings })}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
