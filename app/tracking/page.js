"use client";
import React, { Suspense } from 'react';
import { ArrowLeft, Bike, ShieldCheck, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useTracking } from '../../context/TrackingContext';

function TrackingContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const tracking = useTracking();
  const orderId = searchParams.get('orderId') || tracking?.activeOrderId;

  const { isTracking, currentStage, eta, distanceKm, getProximityMessage } = tracking || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 lg:py-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <Link href="/" className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 hover:text-emerald-500 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{t('tracking.liveMap')}</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
            {orderId ? `${t('profile.orderNumber', { id: orderId.slice(0, 8) })}` : t('tracking.noActiveOrder')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Main Status */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Bike size={120} className="rotate-12" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {currentStage || 'Connecting...'}
              </div>

              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-4">
                {getProximityMessage ? getProximityMessage() : 'Locating your rider...'}
              </h2>
              
              <div className="flex items-center gap-6 mt-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('tracking.eta')}</span>
                  <span className="text-3xl font-black text-emerald-500 tracking-tighter">{eta || '--'} {t('tracking.min')}</span>
                </div>
                <div className="w-px h-10 bg-gray-100 dark:bg-gray-800" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('tracking.distance')}</span>
                  <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {distanceKm ? (distanceKm < 1 ? Math.round(distanceKm * 1000) + 'm' : distanceKm.toFixed(1) + 'km') : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Safety & Trust */}
          <div className="bg-emerald-500 rounded-[32px] p-6 text-white flex items-center gap-5 shadow-lg shadow-emerald-500/20">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">{t('checkout.sslSecure')}</p>
              <p className="text-[10px] font-medium text-emerald-100 uppercase tracking-wider">{t('checkout.farmFreshDesc')}</p>
            </div>
          </div>
        </div>

        {/* Steps Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest mb-8">{t('tracking.deliveryMilestones')}</h3>
          
          <div className="space-y-8 relative">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-50 dark:bg-gray-800" />
            
            {[
              { stage: 'Order Placed', label: t('tracking.orderPlaced'), icon: MapPin },
              { stage: 'Packed', label: t('tracking.orderPacked'), icon: ShieldCheck },
              { stage: 'Out for Delivery', label: t('tracking.riderOnWay'), icon: Bike },
              { stage: 'Arriving Soon', label: t('tracking.riderNearby'), icon: Clock },
              { stage: 'Delivered', label: t('tracking.orderDelivered'), icon: ShieldCheck },
            ].map((step, i) => {
              const stages = ['Order Placed', 'Packed', 'Out for Delivery', 'Arriving Soon', 'Delivered'];
              const currentIdx = stages.indexOf(currentStage);
              const stepIdx = stages.indexOf(step.stage);
              const isPast = currentIdx > stepIdx;
              const isActive = currentIdx === stepIdx;

              return (
                <div key={i} className={`flex items-center gap-6 relative z-10 transition-all duration-500 ${isPast || isActive ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isPast ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                    isActive ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 scale-110 shadow-xl' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    <step.icon size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className={`text-sm font-black ${isActive ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                      {step.label}
                    </p>
                    {isActive && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('common.live')}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-emerald-500 uppercase tracking-widest transition-all">
          <ArrowLeft size={14} /> {t('common.backToHome')}
        </Link>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="font-black animate-pulse">Loading Map...</p></div>}>
      <TrackingContent />
    </Suspense>
  );
}
