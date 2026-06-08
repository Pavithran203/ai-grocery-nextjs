"use client";
import { Zap, ShieldCheck, Clock, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import AddToCartButton from "@/app/product/[id]/AddToCartButton";
import { useTranslation } from "react-i18next";
import Image from "next/image";

export default function ProductDetailContent({ product, isModal = false }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const productName = product[`name_${language}`] || product.name;

  return (
    <div className="flex flex-col lg:flex-row min-h-[500px]">
      {/* Image Section */}
      <div className={`w-full lg:w-[42%] bg-gray-50/30 dark:bg-gray-900/30 p-6 flex items-center justify-center relative border-b lg:border-b-0 lg:border-r border-gray-50 dark:border-gray-900 ${isModal ? 'bg-white dark:bg-gray-950' : ''}`}>
        <div className="relative w-full aspect-square max-w-[320px] group">
          <Image 
            src={(product.image_url || product.image || '').startsWith('http') || (product.image_url || product.image || '').startsWith('/') ? (product.image_url || product.image) : 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_600,h_600,q_auto,f_auto/samples/food/fish-vegetables.jpg'} 
            alt={productName || 'Product Image'} 
            fill
            sizes="(max-width: 768px) 320px, 320px"
            className="object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
          />
          {/* Premium Badge */}
          <div className="absolute top-0 left-0 z-20 flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl font-black text-[10px] tracking-widest shadow-xl border border-amber-200 dark:border-amber-900/50 uppercase">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400">{t('product.premiumChoice', 'Premium choice')}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full lg:w-[58%] p-6 lg:p-10 flex flex-col">
        {/* Breadcrumb / Category */}
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] mb-3 text-emerald-600">
           <span className="text-gray-400">FreshKart</span>
           <span className="w-1 h-1 rounded-full bg-gray-300"></span>
           <span className="text-gray-400">{t(`categories.${product.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`, product.category)}</span>
        </div>

        {/* Title & Rating */}
        <h1 className="text-2xl lg:text-4xl font-black mb-3 tracking-tighter leading-tight text-gray-900 dark:text-white">
          {productName}
        </h1>
        
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-900/50">
            <span className="text-amber-500 text-xs">★</span>
            <span className="text-[11px] font-black text-amber-800 dark:text-amber-300">{product.rating}</span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t('product.ratingsSold', '1.2k Ratings · 500+ Sold')}
          </span>
        </div>

        {/* Features / Highlights - Standardized for Mobile Parity */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-gray-100/50 dark:border-gray-800/50">
             <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                <Zap className="w-4 h-4" />
             </div>
             <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('product.superfast', 'Superfast')}</p>
                <p className="text-[11px] font-black text-emerald-900 dark:text-emerald-100">{t('product.etaTime', '10-15 mins')}</p>
             </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-gray-100/50 dark:border-gray-800/50">
             <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-4 h-4" />
             </div>
             <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('product.quality', 'Quality')}</p>
                <p className="text-[11px] font-black text-blue-900 dark:text-blue-100">{t('product.labTested', 'Lab Tested')}</p>
             </div>
          </div>
        </div>

        {/* Price & Action Container */}
        <div className="mt-auto p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('product.finalPrice', 'Final Price')}</span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter border border-emerald-200/50">{t('product.save25Percent', 'Save 25% OFF')}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black leading-none text-emerald-600">₹{product.price.toFixed(0)}</span>
                <span className="text-base text-gray-400 line-through font-bold mb-1">₹{(product.price * 1.25).toFixed(0)}</span>
              </div>
            </div>

            <div className="w-full sm:w-auto sm:min-w-[180px]">
              <AddToCartButton product={product} />
            </div>
          </div>

          {/* Guarantees */}
          <div className="flex flex-wrap gap-5 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {t('product.certifiedFresh', 'Certified Fresh')}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
              {t('product.easyReturn', 'Easy Return')}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              {t('checkout.expressDeliveryPromise', 'Express Delivery')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
