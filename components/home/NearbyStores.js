"use client";
import React, { useMemo, useState } from 'react';
import { MapPin, Star, Clock, Truck, ChevronRight, Navigation, LocateFixed, Map as MapIcon, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '@/context/FavoriteContext';
import { storeService } from '@/services/storeService';
import { useLocation } from '@/context/LocationContext';
import StoreFilters from './StoreFilters';
import Link from 'next/link';

export default function NearbyStores() {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite, favorites } = useFavorites();

  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { coords: userCoords } = useLocation();
  const coords = userCoords || { latitude: 13.0071, longitude: 80.2200 };

  const allStores = useMemo(() => {
    return storeService.getNearbyStores(coords.latitude, coords.longitude, 100, []);
  }, [coords.latitude, coords.longitude]);

  const nearbyStoresList = useMemo(() => {
    let result = storeService.getNearbyStores(
      coords.latitude,
      coords.longitude,
      100,
      favorites
    );
    result = storeService.filterStores(result, activeFilters);
    return result;
  }, [coords.latitude, coords.longitude, favorites, activeFilters]);

  const clearFilters = () => setActiveFilters([]);

  const getStatusLabel = (status) => {
    if (status.type === 'CLOSED_TODAY') return t('home.closedToday', 'Closed Today');
    if (status.type === 'CLOSED') return t('home.closedNow', 'Closed Now');
    if (status.type === 'CLOSING_SOON') return t('home.closingSoon', 'Closing Soon');
    return t('home.openNow', 'Open Now');
  };

  const getStoreTypeLabel = (storeType) => {
    const keyMap = {
      'Kirana Store': 'kiranaStore',
      'Provision Store': 'provisionStore',
      'Malligai Kadai': 'malligaiKadai',
      'Supermarket': 'supermarket',
      'Departmental Store': 'departmentalStore',
    };

    const key = keyMap[storeType] || null;
    return key ? t(`home.${key}`, storeType) : storeType;
  };

  const getDeliveryLabel = (delInfo) => {
    if (!delInfo) return t('home.pickupOnly', 'Pickup Only');
    if (delInfo.isWithinFreeDistance) return t('home.freeDelivery', 'Free Delivery');
    if (!delInfo.isDeliverable) return t('home.pickupOnly', 'Pickup Only');
    return delInfo.message;
  };

  if (nearbyStoresList.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="flex justify-between items-center px-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[22px] sm:rounded-[28px] flex items-center justify-center shadow-xl shadow-emerald-500/20 bg-gradient-to-br from-emerald-500 to-emerald-600 relative group overflow-hidden">
            <MapPin size={24} className="text-white sm:w-8 sm:h-8 relative z-10" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('home.nearbyStores', 'Nearby Stores')}</h2>
            <p className="text-sm font-bold uppercase tracking-widest mt-1 text-gray-500">
              {t('home.premiumShopsOpenNow', { count: allStores.length })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/map" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-black text-sm shadow-lg shadow-emerald-500/20 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:brightness-110 active:scale-95 transition-all">
            <MapIcon size={18} strokeWidth={3} />
            <span>{t('home.mapView', 'Map View')}</span>
          </Link>
          <Link href="/stores" className="font-black text-sm hover:underline flex items-center gap-1 text-emerald-600">
            {t('common.viewAll', 'View All')} <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      <StoreFilters 
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        onClearAll={clearFilters}
        showModal={showFilterModal}
        setShowModal={setShowFilterModal}
      />

      <div className="flex overflow-x-auto no-scrollbar gap-6 px-4 pb-12">
        {nearbyStoresList.map((store) => {
          const isFav = isFavorite(store.id);
          const delInfo = store.deliveryInfo;
          const status = store.status;
          const isClosed = status.type === 'CLOSED' || status.type === 'CLOSED_TODAY';
          const deliveryLabel = getDeliveryLabel(delInfo);
          const storeTypeLabel = getStoreTypeLabel(store.storeType);

          return (
            <div 
              key={store.id}
              className={`min-w-[260px] sm:min-w-[300px] rounded-[32px] sm:rounded-[40px] p-5 sm:p-6 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xl hover:shadow-2xl transition-all relative group ${isClosed ? 'opacity-70 grayscale' : ''}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-4xl shadow-inner ${isClosed ? 'bg-gray-100 dark:bg-gray-800' : 'bg-emerald-50 dark:bg-emerald-500/10'}`}>
                  {store.logo || store.emoji}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button 
                    onClick={() => toggleFavorite(store.id)}
                    className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-lg border border-gray-50 dark:border-gray-800 group-hover:scale-110 transition-transform"
                  >
                    <Heart 
                      size={20} 
                      className={isFav ? "text-rose-500 fill-rose-500" : "text-gray-300"} 
                    />
                  </button>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black" style={{ backgroundColor: status.bgColor, color: status.color }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
                    {getStatusLabel(status)}
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-black truncate mb-1 text-gray-900 dark:text-white">{store.name}</h3>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{storeTypeLabel}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-gray-900 dark:text-white">{store.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-2xl">
                  <Navigation size={16} className="text-emerald-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Dist</span>
                    <span className="text-xs font-black text-gray-900 dark:text-white">{store.distance} km</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-2xl">
                  <Clock size={16} className="text-orange-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Time</span>
                    <span className="text-xs font-black text-gray-900 dark:text-white">10-15m</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {delInfo && delInfo.isDeliverable && store.deliveryAvailable ? (
                  <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-2xl">
                    <Truck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">
                      {deliveryLabel}
                    </span>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-2xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                      {t('home.pickupOnly', 'Pickup Only')}
                    </span>
                  </div>
                )}
                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>

              {!isClosed && <Link href={`/store/${store.id}`} className="absolute inset-0 z-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
