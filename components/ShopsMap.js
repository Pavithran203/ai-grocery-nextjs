"use client";
import { MapPin, Navigation, ShoppingBag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useTranslation } from 'react-i18next';

export default function ShopsMap() {
  const { nearbyStores, userLocation, selectedStore, selectStore } = useStore();
  const { t } = useTranslation();

  if (!userLocation) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t('location.nearbyShopsMap', 'Nearby Shops Map')}</h2>
          <p className="text-gray-500 mt-1">{t('location.nearbyShopsMapDesc', 'Showing verified shops within 30km of your location')}</p>
        </div>
      </div>

      <div className="relative w-full h-[400px] sm:h-[500px] rounded-[40px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl">
        {/* Mock Map Background (since we don't have API keys, we use a styled placeholder that looks like a map) */}
        <div className="absolute inset-0 bg-[#e5e3df] dark:bg-[#242f3e]">
          <div className="absolute inset-0 opacity-30 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
        </div>

        {/* User Location Marker */}
        <div 
          className="absolute z-20 transition-all duration-1000 flex flex-col items-center"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-xl animate-pulse ring-8 ring-blue-500/20">
            <Navigation className="w-6 h-6 fill-current" />
          </div>
          <span className="mt-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-[10px] font-black shadow-lg">{t('location.you', 'YOU')}</span>
        </div>

        {/* Shop Markers */}
        {nearbyStores.map((store, idx) => {
          // Calculate visual position relative to user (center)
          // Scale distance for visualization (30km = 45% offset)
          const latDiff = (store.coordinates.lat - userLocation.lat) * 200;
          const lngDiff = (store.coordinates.lng - userLocation.lng) * 200;
          
          const isSelected = selectedStore?.id === store.id;

          return (
            <div 
              key={store.id}
              className={`absolute z-10 transition-all duration-500 flex flex-col items-center cursor-pointer group`}
              style={{ 
                top: `${50 + latDiff}%`, 
                left: `${50 + lngDiff}%`, 
                transform: 'translate(-50%, -50%)' 
              }}
              onClick={() => selectStore(store)}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isSelected ? 'bg-emerald-500 text-white scale-125 shadow-emerald-500/50' : 'bg-white dark:bg-gray-800 text-emerald-500 shadow-lg group-hover:scale-110'
              } shadow-xl`}>
                <ShoppingBag className="w-5 h-5" />
              </div>
              
              <div className={`mt-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl shadow-2xl border transition-all ${
                isSelected ? 'border-emerald-500 opacity-100' : 'border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100'
              }`}>
                <p className="text-[10px] font-black whitespace-nowrap text-gray-900 dark:text-white uppercase">{store.name}</p>
                <p className="text-[8px] text-gray-500 font-bold whitespace-nowrap">{store.distance} {t('location.kmAway', 'KM AWAY')}</p>
              </div>
            </div>
          );
        })}

        {/* Map Legend/Controls */}
        <div className="absolute bottom-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-none">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl flex items-center gap-4 pointer-events-auto">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('location.liveGpsActive', 'Live GPS Active')}</span>
             </div>
             <div className="h-4 w-px bg-gray-200"></div>
             <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('location.shopsFoundCount', '{{count}} Shops Found', { count: nearbyStores.length })}</span>
             </div>
          </div>
          
          <button 
            className="bg-emerald-500 text-white p-4 rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-all pointer-events-auto"
            onClick={() => window.location.reload()}
          >
            <Navigation className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
