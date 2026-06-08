"use client";
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { storeService } from '../../services/storeService';
import Link from 'next/link';
import { MapPin, Star, Clock, Search, X, Navigation, LocateFixed, Store, Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { useFavorites } from '../../context/FavoriteContext';
import { useLocation } from '../../context/LocationContext';
import StoreFilters from '../../components/home/StoreFilters';

export default function StoresPage() {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { coords: userCoords, hasLocation, requestLocation, permissionStatus } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('nearby');
  const [zipInput, setZipInput] = useState('');
  const [zipStores, setZipStores] = useState([]);
  const [requesting, setRequesting] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const coords = userCoords || { latitude: 13.0071, longitude: 80.2200 };

  const nearbyStores = useMemo(() => {
    return storeService.getNearbyStores(coords.latitude, coords.longitude, 100);
  }, [coords.latitude, coords.longitude]);

  const allStores = useMemo(() => {
    return storeService.getAllStores(coords.latitude, coords.longitude);
  }, [coords.latitude, coords.longitude]);

  const activeStores = filterMode === 'nearby' ? nearbyStores : filterMode === 'zip' ? zipStores : allStores;

  const displayStores = useMemo(() => {
    let result = storeService.searchStores(searchQuery, activeStores);
    result = storeService.filterStores(result, activeFilters);
    return result;
  }, [activeStores, searchQuery, activeFilters]);

  const clearFilters = () => setActiveFilters([]);

  const handleNearbyPress = async () => {
    setFilterMode('nearby');
    if (!hasLocation) {
      setRequesting(true);
      await requestLocation();
      setRequesting(false);
    }
  };

  const handleAllPress = () => {
    setFilterMode('all');
  };

  const handleZipSubmit = () => {
    if (zipInput.length >= 5) {
      const results = storeService.getStoresByZip(zipInput);
      setZipStores(results);
      setFilterMode('zip');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black">
            {filterMode === 'all' ? t['allStores'] || 'All Stores' : 
             filterMode === 'zip' ? 'Stores by ZIP' : 
             'Nearby Stores'}
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Discover trusted local grocery stores</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 mb-6 shadow-sm border border-gray-100 dark:border-gray-800 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
        <Search size={18} className="text-gray-400 mr-3" />
        <input 
          type="text"
          placeholder="Search stores, areas..."
          className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery.length > 0 && (
          <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={18} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Mode Toggles */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button 
          onClick={handleNearbyPress}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${filterMode === 'nearby' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          {requesting ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
          Nearby
        </button>
        <button 
          onClick={() => setFilterMode('zip')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${filterMode === 'zip' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <MapPin size={16} />
          ZIP Code
        </button>
        <button 
          onClick={handleAllPress}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${filterMode === 'all' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <Store size={16} />
          All
        </button>
      </div>

      {/* ZIP Code Input Row */}
      {filterMode === 'zip' && (
        <div className="flex gap-3 mb-6 animate-fadeIn">
          <div className="flex-1 flex items-center bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-800 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
            <MapPin size={18} className="text-emerald-500 mr-3" />
            <input 
              type="text"
              placeholder="Enter 6-digit PIN code"
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white font-bold"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              onKeyDown={(e) => e.key === 'Enter' && handleZipSubmit()}
            />
            {zipInput.length > 0 && (
              <button onClick={() => { setZipInput(''); setZipStores([]); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X size={18} className="text-gray-400" />
              </button>
            )}
          </div>
          <button 
            onClick={handleZipSubmit}
            disabled={zipInput.length < 5}
            className="bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            Find Stores
          </button>
        </div>
      )}

      {/* Store Filters */}
      <StoreFilters 
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        onClearAll={clearFilters}
        showModal={showFilterModal}
        setShowModal={setShowFilterModal}
      />

      {/* Count */}
      {displayStores.length > 0 && (
        <p className="text-sm font-bold text-gray-400 mb-6 px-1">
          {displayStores.length} stores found
          {filterMode === 'nearby' && hasLocation ? ' • nearby' : ''}
        </p>
      )}

      {/* Store Grid */}
      {displayStores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayStores.map((store) => {
            const isFav = isFavorite(store.id);
            const status = store.status;
            return (
              <div 
                key={store.id}
                className="bg-white dark:bg-gray-950 rounded-[32px] p-6 border border-gray-100 dark:border-gray-900 shadow-xl shadow-gray-100/50 dark:shadow-none hover:shadow-2xl transition-all relative group flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-[24px] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-4xl">
                    {store.logo || store.emoji}
                  </div>
                  <button 
                    onClick={() => toggleFavorite(store.id)}
                    className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-lg border border-gray-50 dark:border-gray-800 group-hover:scale-110 transition-transform"
                  >
                    <Heart 
                      size={20} 
                      className={isFav ? "text-rose-500 fill-rose-500" : "text-gray-300"} 
                    />
                  </button>
                </div>

                <h3 className="text-xl font-black text-gray-900 dark:text-white truncate mb-1">{store.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t[store.storeType] || store.storeType}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-gray-900 dark:text-white">{store.rating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 flex-1">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-emerald-500" />
                    <span>{store.distance} km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} className={status.type === 'OPEN' ? "text-emerald-500" : status.type === 'CLOSING_SOON' ? "text-amber-500" : "text-rose-500"} />
                    <span className={status.type === 'OPEN' ? "text-emerald-600 dark:text-emerald-400" : status.type === 'CLOSING_SOON' ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400 font-bold"}>
                      {status.label}
                    </span>
                  </div>
                  <div className="w-full mt-1">
                     <p className="text-xs font-bold text-gray-400 tracking-wide line-clamp-1">{store.address}</p>
                  </div>
                </div>

                <Link 
                  href={`/store/${store.id}`}
                  className="w-full bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white rounded-2xl py-3.5 font-black text-center block hover:brightness-110 active:scale-95 transition-all shadow-[0_8px_20px_rgba(22,163,74,0.2)] mt-auto"
                >
                  Visit Store
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty States matching mobile app */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          {activeFilters.length > 0 ? (
            <>
              <span className="text-6xl mb-4">🔍</span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No stores match filters</h3>
              <p className="text-gray-500 mb-8 max-w-sm">Try removing some filters to see more stores.</p>
              <button 
                onClick={clearFilters}
                className="bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-emerald-500/30 hover:brightness-110 transition-all"
              >
                Clear All Filters
              </button>
            </>
          ) : filterMode === 'nearby' && !hasLocation ? (
            <>
              <span className="text-6xl mb-4">📍</span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Location access needed</h3>
              <p className="text-gray-500 mb-8 max-w-sm">
                {permissionStatus === 'denied' 
                  ? 'Location was denied. Please enable it in your browser settings, or use ZIP code.' 
                  : 'Allow location access to discover nearby stores.'}
              </p>
              <button 
                onClick={handleNearbyPress}
                className="flex items-center gap-2 bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-emerald-500/30 hover:brightness-110 transition-all"
              >
                {requesting ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} />}
                Enable Location
              </button>
            </>
          ) : filterMode === 'zip' && zipInput.length < 5 ? (
            <>
              <span className="text-6xl mb-4">🔍</span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Enter a ZIP code</h3>
              <p className="text-gray-500 max-w-sm">Type a 6-digit PIN code above and tap Find Stores to see local options.</p>
            </>
          ) : (
            <>
              <span className="text-6xl mb-4">🏪</span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No stores found</h3>
              <p className="text-gray-500 max-w-sm">Try a different ZIP code or switch to Nearby mode.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
