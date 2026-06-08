"use client";
import React from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FILTER_OPTIONS = [
  { id: 'free_delivery', label: 'Free Delivery', icon: '🚚' },
  { id: 'pickup_only', label: 'Pickup Only', icon: '🛍️' },
  { id: 'delivery_available', label: 'Delivery Available', icon: '📦' },
  { id: 'long_distance', label: 'Long Distance (>20km)', icon: '🛣️' },
  { id: 'fast_delivery', label: 'Fast Delivery (<30m)', icon: '⚡' },
  { id: 'open_now', label: 'Open Now', icon: '🕒' },
  { id: 'top_rated_store', label: 'Top Rated Stores', icon: '⭐' },
];

export default function StoreFilters({ activeFilters, onFilterChange, onClearAll, showModal, setShowModal }) {
  const { t } = useTranslation();

  const toggleFilter = (id) => {
    if (activeFilters.includes(id)) {
      onFilterChange(activeFilters.filter(f => f !== id));
    } else {
      onFilterChange([...activeFilters, id]);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 items-center">
        <button 
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-black whitespace-nowrap transition-all ${
            activeFilters.length > 0 ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500'
          }`}
        >
          <Filter size={14} />
          <span>{t('filters.filters')} {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}</span>
          <ChevronDown size={14} />
        </button>

        {FILTER_OPTIONS.map(opt => {
          const isActive = activeFilters.includes(opt.id);
          return (
            <button 
              key={opt.id}
              onClick={() => toggleFilter(opt.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all ${
                isActive ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{t(`filters.${opt.id}`) || opt.label}</span>
              {isActive && <X size={14} className="ml-1" />}
            </button>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-950 w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl animate-slideUp border border-white/10">
            <div className="flex justify-between items-center p-8 border-b border-gray-100 dark:border-gray-900">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('filters.sortAndFilter')}</h2>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">{t('filters.deliveryPreferences')}</p>
              <div className="grid grid-cols-2 gap-4">
                {FILTER_OPTIONS.map(opt => {
                  const isActive = activeFilters.includes(opt.id);
                  return (
                    <button 
                      key={opt.id}
                      onClick={() => toggleFilter(opt.id)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${
                        isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-inner' : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-600 dark:text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <span className="text-xs font-black uppercase tracking-wider">{t(`filters.${opt.id}`) || opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 p-8 border-t border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50">
              <button 
                onClick={onClearAll}
                className="flex-1 py-4 rounded-[20px] border-2 border-gray-200 dark:border-gray-800 font-black text-xs text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-all"
              >
                {t('filters.clearAll')}
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="flex-[2] py-4 rounded-[20px] bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white font-black text-xs uppercase tracking-widest shadow-[0_8px_20px_rgba(22,163,74,0.2)] hover:brightness-110 active:scale-95 transition-all"
              >
                {t('filters.applyFilters')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
