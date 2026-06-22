"use client";
import React from 'react';
import { Package, Clock, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import SafeImage from '../SafeImage';

export default function ComboOffers({ bundles }) {
  const { addToCart, setIsCartOpen } = useCart();
  
  // Filter active bundles based on start and end dates
  const activeBundles = (bundles || []).filter(bundle => {
    const now = new Date();
    if (bundle.startDate && new Date(bundle.startDate) > now) return false;
    if (bundle.endDate && new Date(bundle.endDate) < now) return false;
    return true;
  });

  if (!activeBundles.length) return null;

  const handleAddBundle = (bundle) => {
    // Add all items in the bundle to the cart
    bundle.items.forEach(item => {
      addToCart({
        ...item,
        // Optional: apply a proportional discount to the items or pass a combo flag
        price: item.price,
      });
    });
    // In a real app, you might add a single "Bundle" item rather than individual items
    setIsCartOpen(true);
  };

  return (
    <div className="pt-8">
      <div className="flex items-center justify-between mb-6 px-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-500" />
            Limited Time Combos
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">Special festival & seasonal offers</p>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:px-0">
        {activeBundles.map((bundle, idx) => {
          // Calculate total price vs discounted price
          const originalTotal = bundle.items.reduce((sum, item) => sum + item.price, 0);
          const discountedTotal = originalTotal - (bundle.discount || 0);

          return (
            <div 
              key={idx} 
              className="min-w-[300px] w-[85vw] md:w-auto snap-center shrink-0 rounded-[32px] overflow-hidden relative group"
              style={{ background: bundle.gradient || 'linear-gradient(135deg, #FFECB3 0%, #FFB300 100%)' }}
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl -ml-10 -mb-10" />

              <div className="p-6 relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-white/30 backdrop-blur-md text-slate-900 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl">
                    {bundle.badge || 'Special Offer'}
                  </span>
                  {bundle.endDate && (
                    <span className="bg-rose-500 text-white flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl animate-pulse">
                      <Clock size={12} />
                      Ends Soon
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">
                  {bundle.title}
                </h3>
                
                <div className="flex -space-x-4 mb-4 mt-2">
                  {bundle.items.map((item, i) => (
                    <div key={i} className="relative w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-white shrink-0">
                      <SafeImage 
                        src={item.image_url} 
                        alt={item.name} 
                        type="product"
                        entityId={item.id}
                        productName={item.name}
                        componentName="ComboOffers"
                        fill
                        sizes="48px"
                        objectFit="cover"
                      />
                    </div>
                  ))}
                  {bundle.items.length > 3 && (
                    <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      +{bundle.items.length - 3}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 flex items-end justify-between">
                  <div>
                    <p className="text-slate-700 text-xs font-bold line-through mb-0.5">₹{originalTotal}</p>
                    <p className="text-2xl font-black text-slate-900">₹{discountedTotal}</p>
                  </div>
                  <button 
                    onClick={() => handleAddBundle(bundle)}
                    className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                  >
                    <Package size={14} />
                    Add Combo
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
