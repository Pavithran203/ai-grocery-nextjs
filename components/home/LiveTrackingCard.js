"use client";
import React from 'react';
import Link from 'next/link';
import { Bike } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTracking } from '../../context/TrackingContext';

export default function LiveTrackingCard() {
  const tracking = useTracking();
  const { t } = useTranslation();
  
  if (!tracking) return null;
  
  const { isTracking, currentStage, eta, distanceKm, getProximityMessage, activeOrderId } = tracking;

  if (!isTracking || currentStage === 'Delivered' || currentStage === 'Cancelled') {
    return null;
  }

  return (
    <div className="px-4 mt-2 mb-4">
      <Link 
        href={`/tracking?orderId=${activeOrderId}`}
        className="block bg-white dark:bg-gray-900 rounded-3xl p-5 border border-teal-500/20 shadow-[0_8px_30px_rgb(0,201,167,0.1)] hover:shadow-[0_12px_40px_rgb(0,201,167,0.15)] transition-all animate-fadeIn"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
              <Bike className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">{t('tracking.deliveryInProgress')}</h3>
              <p className="text-sm font-bold text-teal-500">{getProximityMessage()}</p>
            </div>
          </div>
          <div className="bg-teal-500 px-4 py-2 rounded-xl">
            <span className="text-white font-black text-sm whitespace-nowrap">{eta} {t('tracking.min')}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 font-semibold">
            {currentStage === 'Order Placed' || currentStage === 'Packed' 
               ? t('tracking.orderBeingPrepared', { id: activeOrderId?.slice(0,6) || 'N/A' }) 
               : t('tracking.distance', { dist: distanceKm < 1 ? Math.round(distanceKm * 1000) + 'm' : distanceKm.toFixed(1) + 'km' })
            }
          </p>
          <span className="text-sm font-black text-teal-500">{t('tracking.liveMap')} ➔</span>
        </div>
      </Link>
    </div>
  );
}
