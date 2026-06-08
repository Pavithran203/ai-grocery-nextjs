"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getActiveCampaigns, PROMO_BANNERS } from '@/data/campaigns';
import Link from 'next/link';

const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    setTimeLeft(getTimeRemaining(targetDate));
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(targetDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

function getTimeRemaining(endDate) {
  const total = new Date(endDate) - new Date();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  return { days, hours, minutes, expired: false };
}

function CountdownPill({ endsAt, noPill = false }) {
  const timeLeft = useCountdown(endsAt);
  if (!timeLeft) {
    if (noPill) return <span className="text-sm text-white font-black uppercase tracking-wider">&nbsp;</span>;
    return (
      <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg self-start mb-3">
        <span className="text-[10px] text-white font-bold uppercase tracking-wider">&nbsp;</span>
      </div>
    );
  }
  const { days, hours, minutes, expired } = timeLeft;
  if (expired) {
    if (noPill) return <span className="text-[10px] text-white/60 font-black uppercase tracking-wider">Offer Expired</span>;
    return (
      <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg self-start mb-3">
        <span className="text-[10px] text-white font-bold uppercase tracking-wider">Expired</span>
      </div>
    );
  }
  if (noPill) {
    return (
      <span className="text-sm text-white font-black uppercase tracking-wider">
        Ends in: {days > 0 ? `${days}d ` : ''}{hours}h {minutes}m
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg self-start mb-3">
      <Timer size={12} className="text-white" />
      <span className="text-[10px] text-white font-bold uppercase tracking-wider">
        {days > 0 ? `${days}d ` : ''}{hours}h {minutes}m left
      </span>
    </div>
  );
}

export default function PromoBanners() {
  const { t } = useTranslation();
  const campaigns = getActiveCampaigns();
  const allSlides = [...campaigns, ...PROMO_BANNERS];
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (allSlides.length <= 1) return;
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % allSlides.length;
      setCurrentSlide(nextSlide);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          left: nextSlide * scrollRef.current.offsetWidth,
          behavior: 'smooth'
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide, allSlides.length]);

  const getBannerTitle = (item) => {
    if (item.type === 'promo') {
      return item.id === 'free-delivery-promo'
        ? t('home.freeDelivery', 'Free Delivery')
        : t('home.bestLocalStores', 'Best Local Stores');
    }

    return item.title === 'Monthly Savings'
      ? t('home.monthlySavings', 'Monthly Savings')
      : t('home.kitchenEssentials', 'Kitchen Essentials');
  };

  const getBannerCta = (item) => {
    if (item.type === 'promo') {
      return item.id === 'free-delivery-promo'
        ? t('home.orderNow', 'Order Now')
        : t('home.findStores', 'Find Stores');
    }

    return item.title === 'Monthly Savings'
      ? t('home.shopNow', 'Shop Now')
      : t('home.exploreNow', 'Explore Now');
  };

  const getBannerHref = (item) => {
    if (item.type === 'promo') {
      if (item.id === 'free-delivery-promo') return '/products?promo=free-delivery';
      if (item.id === 'local-stores-promo') return '/stores';
      return '/products';
    }

    return `/campaign/${item.id}`;
  };

  if (allSlides.length === 0) return null;

  return (
    <div className="relative group px-4 mt-6">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-6 rounded-[40px]"
        onScroll={(e) => {
          const index = Math.round(e.currentTarget.scrollLeft / e.currentTarget.offsetWidth);
          if (index !== currentSlide) setCurrentSlide(index);
        }}
      >
        {allSlides.map((item) => {
          const [colorStart, colorEnd] = item.bannerBg;
          const isPromo = item.type === 'promo';

          return (
            <div 
              key={item.id}
              className="min-w-full snap-center rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[200px] sm:min-h-[240px] lg:min-h-[260px]"
              style={{ backgroundColor: colorStart }}
            >
              {/* Offer Tag */}
              <div className="absolute top-0 right-0 bg-black/30 backdrop-blur-md px-6 py-2.5 rounded-bl-3xl font-black text-[11px] text-white uppercase tracking-[0.2em] z-10 border-l border-b border-white/10">
                {isPromo ? t('home.localStores', '🏪 Local Stores') : t('home.groceryOffer', '🛒 Grocery Offer')}
              </div>

              <div className="relative z-10 flex justify-between items-center gap-8 h-full">
                <div className="flex-1 flex flex-col justify-center">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl mb-4 border border-white/20 shadow-2xl">
                    {item.icon}
                  </div>
                  
                  <h2 className="text-3xl lg:text-4xl font-black text-white mb-2 leading-tight tracking-tighter">
                    {getBannerTitle(item)}
                  </h2>
                  <p className="text-lg text-white/90 font-bold mb-6 max-w-[400px] leading-snug">
                    {item.subtitle}
                  </p>
                  
                  {!isPromo && (
                    <div className="flex items-center gap-3 mb-6 bg-black/20 self-start px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-sm">
                      <Timer size={16} className="text-emerald-400 animate-pulse" />
                      <CountdownPill endsAt={item.endsAt} noPill={true} />
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {!isPromo && (
                      <div className="bg-emerald-500 px-5 py-2.5 rounded-2xl shadow-xl shadow-emerald-500/30 border border-emerald-400/50">
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          FLAT {item.discountPercent}% OFF
                        </span>
                      </div>
                    )}
                    <Link 
                      href={getBannerHref(item)}
                      className="bg-white px-10 py-4 rounded-[24px] flex items-center gap-3 shadow-[0_15px_45px_rgba(0,0,0,0.2)] hover:scale-[1.05] active:scale-[0.98] transition-all group border-b-4 border-black/10"
                      style={{ color: colorStart }}
                    >
                      <span className="text-base font-black uppercase tracking-tight">
                        {getBannerCta(item)}
                      </span>
                      <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1.5 transition-transform" />
                    </Link>
                  </div>
                </div>

                <div className="hidden lg:block shrink-0">
                  <div className="w-64 h-64 rounded-[48px] overflow-hidden border-[12px] border-white/10 relative shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500" style={{ backgroundColor: colorEnd }}>
                    <img src={item.bannerImage || 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_800,h_400,q_auto,f_auto/samples/food/fish-vegetables.jpg'} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_800,h_400,q_auto,f_auto/samples/food/fish-vegetables.jpg'; }} />
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-gradient-to-tr from-black/10 to-transparent blur-3xl pointer-events-none" />
            </div>
          );
        })}
      </div>

      {allSlides.length > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          {allSlides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => {
                setCurrentSlide(i);
                scrollRef.current.scrollTo({ left: i * scrollRef.current.offsetWidth, behavior: 'smooth' });
              }}
              className={`h-2 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-12 bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'w-2 bg-gray-200 dark:bg-gray-800 hover:bg-emerald-200'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
