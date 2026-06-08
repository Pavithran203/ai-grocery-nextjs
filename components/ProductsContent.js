"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search, ArrowUpDown, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

// Derive sub-categories from product names since mockData uses "Add Items" for all
const SUB_CATEGORIES = [
  { key: 'all', label: 'All Items', icon: '🛒' },
  { key: 'rice', label: 'Rice & Grains', icon: '🍚', match: (p) => /rice|basmati|ponni/i.test(p.name) },
  { key: 'dal', label: 'Dal & Pulses', icon: '🥘', match: (p) => /dal|rajma|chickpea|moong|urad|chana|toor/i.test(p.name) },
  { key: 'flour', label: 'Flour & Rava', icon: '🌾', match: (p) => /flour|atta|sooji|rava|maida|corn/i.test(p.name) },
  { key: 'spices', label: 'Spices', icon: '🌶️', match: (p) => /turmeric|chilli|cumin|mustard|coriander|masala|garam/i.test(p.name) },
  { key: 'sugar_salt', label: 'Sugar & Salt', icon: '🧂', match: (p) => /sugar|salt|jaggery|sakkarai|karupatti|vellam/i.test(p.name) },
  { key: 'oil_ghee', label: 'Oil & Ghee', icon: '🍶', match: (p) => /oil|ghee/i.test(p.name) },
];

const SORT_OPTIONS = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'price_low', label: 'Price: Low to High' },
  { key: 'price_high', label: 'Price: High to Low' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'name', label: 'Name A-Z' },
];

export default function ProductsContent({ products: initialProducts, category, store: storeOverride, initialQuery = '' }) {
  const { selectedStore, getShopProducts } = useStore();
  
  const products = useMemo(() => {
    const activeStore = storeOverride || selectedStore;
    return getShopProducts(initialProducts || [], activeStore);
  }, [initialProducts, selectedStore, storeOverride, getShopProducts]);

  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const [selectedSub, setSelectedSub] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [maxPrice, setMaxPrice] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Sync initialQuery when it changes via URL
  useEffect(() => {
    if (initialQuery !== undefined) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ price: true, category: true });

  const priceBounds = useMemo(() => {
    if (!products.length) return [0, 1000];
    const prices = products.map(p => p.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  const effectiveMaxPrice = maxPrice ?? priceBounds[1];

  // Count products per sub-category
  const subCategoryCounts = useMemo(() => {
    const counts = {};
    SUB_CATEGORIES.forEach(sub => {
      if (sub.key === 'all') {
        counts[sub.key] = products.length;
      } else {
        counts[sub.key] = products.filter(sub.match).length;
      }
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        const localizedName = (p[`name_${language}`] || p.name).toLowerCase();
        return localizedName.includes(q) || 
               (p.tag || '').toLowerCase().includes(q) ||
               (p.category || '').toLowerCase().includes(q) ||
               (p.store || '').toLowerCase().includes(q);
      });
    }

    // Sub-category
    if (selectedSub !== 'all') {
      const subCat = SUB_CATEGORIES.find(s => s.key === selectedSub);
      if (subCat?.match) result = result.filter(subCat.match);
    }

    // Price
    result = result.filter(p => p.price >= priceBounds[0] && p.price <= effectiveMaxPrice);

    // Sort
    switch (sortBy) {
      case 'price_low': result.sort((a, b) => a.price - b.price); break;
      case 'price_high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'name': result.sort((a, b) => {
        const nameA = a[`name_${language}`] || a.name;
        const nameB = b[`name_${language}`] || b.name;
        return nameA.localeCompare(nameB);
      }); break;
    }

    return result;
  }, [products, searchQuery, selectedSub, effectiveMaxPrice, sortBy, priceBounds]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearFilters = () => {
    setSelectedSub('all');
    setMaxPrice(null);
    setSearchQuery('');
    setSortBy('relevance');
  };

  const hasActiveFilters = selectedSub !== 'all' || maxPrice !== null || searchQuery.trim() || sortBy !== 'relevance';

  // Filter sidebar content (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-1">
      {/* Search within products */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search in results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</span>
          {expandedSections.price ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {expandedSections.price && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">₹{priceBounds[0]}</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">₹{effectiveMaxPrice}</span>
            </div>
            <input
              type="range"
              min={priceBounds[0]}
              max={priceBounds[1]}
              value={effectiveMaxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer filter-range-slider"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-400 font-semibold">Min: ₹{priceBounds[0]}</span>
              <span className="text-[10px] text-gray-400 font-semibold">Max: ₹{priceBounds[1]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</span>
          {expandedSections.category ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {expandedSections.category && (
          <div className="px-4 pb-4 space-y-1">
            {SUB_CATEGORIES.filter(sub => subCategoryCounts[sub.key] > 0).map(sub => (
              <button
                key={sub.key}
                onClick={() => setSelectedSub(sub.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  selectedSub === sub.key
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                }`}
              >
                <span className="text-base">{sub.icon}</span>
                <span className={`text-xs font-bold flex-1 ${
                  selectedSub === sub.key
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-600 dark:text-gray-300'
                }`} suppressHydrationWarning>
                  {t(`categories.${sub.key === 'rice' ? 'rice-grains' : sub.key === 'dal' ? 'dal-pulses' : sub.key === 'flour' ? 'flour-baking' : sub.key === 'spices' ? 'masalas-spices' : sub.key === 'sugar_salt' ? 'sugar-salt' : sub.key === 'oil_ghee' ? 'oil-ghee' : sub.key === 'all' ? 'all' : sub.key}`, sub.label)}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedSub === sub.key
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}>
                  {subCategoryCounts[sub.key]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={clearFilters}
            className="w-full py-2.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );

  const getCategoryKey = (catName) => {
    if (!catName) return '';
    const mapping = {
      'rice & grains': 'rice-grains',
      'dal & pulses': 'dal-pulses',
      'oil & ghee': 'oil-ghee',
      'flour & baking': 'flour-baking',
      'masalas & spices': 'masalas-spices',
      'sugar & salt': 'sugar-salt',
      'household essentials': 'household',
      'cleaning supplies': 'cleaning',
      'personal care': 'personal-care',
      'snacks & biscuits': 'snacks'
    };
    return mapping[catName.toLowerCase()] || catName;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Page Header - Improved Vertical Rhythm */}
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-3xl lg:text-5xl font-black tracking-tighter leading-tight text-gray-900 dark:text-white" suppressHydrationWarning>
          {category ? t(`categories.${getCategoryKey(category)}`, category) : t('common.viewAll', 'All')} <span className="text-emerald-600">{t('cart.items', 'Products')}</span>
        </h1>
        <p className="text-sm lg:text-base font-bold mt-2 uppercase tracking-widest text-gray-500">
          {filteredProducts.length} Premium items available
        </p>
      </div>

      {/* Sub-category Chips - Professional Spacing */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
        {SUB_CATEGORIES.filter(sub => subCategoryCounts[sub.key] > 0).map(sub => (
          <button
            key={sub.key}
            onClick={() => setSelectedSub(sub.key)}
            className={`shrink-0 flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider border-2 transition-all ${selectedSub === sub.key ? 'text-white bg-emerald-600 border-emerald-600 shadow-xl shadow-emerald-600/30 scale-105' : 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-gray-500 hover:opacity-80'}`}
          >
            <span className="text-sm">{sub.icon}</span>
            <span suppressHydrationWarning>{t(`categories.${sub.key === 'rice' ? 'rice-grains' : sub.key === 'dal' ? 'dal-pulses' : sub.key === 'flour' ? 'flour-baking' : sub.key === 'spices' ? 'masalas-spices' : sub.key === 'sugar_salt' ? 'sugar-salt' : sub.key === 'oil_ghee' ? 'oil-ghee' : sub.key === 'all' ? 'all' : sub.key}`, sub.label)}</span>
          </button>
        ))}
      </div>

      {/* Mobile: Filter & Sort Bar - Balanced Layout */}
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <button
          onClick={() => setShowMobileFilter(true)}
          className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider border-2 transition-all ${hasActiveFilters ? 'bg-emerald-500/10 border-emerald-600 text-emerald-600' : 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-gray-500'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter & Sort
          {hasActiveFilters && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
        </button>
      </div>

      {/* Main Layout - Optimized Column Ratios */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Desktop Sidebar - Clean & Integrated */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-28 space-y-6">
            <div className="rounded-[32px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm p-2">
              <div className="px-4 py-4 border-b border-gray-50 dark:border-gray-900 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <SlidersHorizontal className="w-3 h-3" />
                  Preferences
                </h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">
                    Reset
                  </button>
                )}
              </div>

              {/* Sort - Professional Hierarchy */}
              <div className="p-4 border-b border-gray-50 dark:border-gray-900">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Arrange By</label>
                <div className="grid grid-cols-1 gap-1">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSortBy(opt.key)}
                      className={`text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                        sortBy === opt.key
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800'
                          : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <FilterContent />
            </div>

            {/* Quality Badge Card */}
            <div className="bg-gradient-to-br from-[#10B981] to-[#059669] p-6 rounded-[32px] text-white shadow-xl shadow-emerald-500/30 relative overflow-hidden group border border-emerald-400/20">
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-emerald-100">Quality First</p>
                 <h4 className="text-xl font-black mb-1 text-white">100% Organic</h4>
                 <p className="text-xs font-medium text-emerald-50 leading-relaxed mb-4">Sourced directly from certified farmers.</p>
                 <ShieldCheck className="w-16 h-16 opacity-20 absolute -bottom-4 -right-2 rotate-12 group-hover:scale-125 transition-transform duration-500 text-white" />
               </div>
            </div>
          </div>
        </aside>

        {/* Product Grid - Premium Spacing & Aspect Ratios */}
        <div className="flex-1 min-w-0">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-32 bg-white dark:bg-gray-950 rounded-[40px] border border-gray-100 dark:border-gray-900 border-dashed">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No items found</h3>
              <p className="text-gray-400 font-bold mb-8 uppercase tracking-widest text-xs">Try clearing your selection</p>
              <button
                onClick={clearFilters}
                className="px-8 py-4 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 lg:gap-10">
              {filteredProducts.map(product => (
                <div key={product.id} className="flex justify-center">
                   <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer - Premium Slide-up */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fadeIn" onClick={() => setShowMobileFilter(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-[40px] max-h-[85vh] flex flex-col animate-slideUp shadow-2xl border-t border-white/20 bg-white dark:bg-gray-950">
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-4 shrink-0" />
            <div className="flex items-center justify-between px-8 py-6 shrink-0">
              <h3 className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">Filters & Sorting</h3>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-full hover:rotate-90 transition-transform"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-800">
                <FilterContent />
              </div>
            </div>
            <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 shrink-0 backdrop-blur-md">
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full py-5 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[24px] shadow-xl shadow-emerald-500/40 active:scale-95 transition-all bg-gradient-to-br from-emerald-500 to-emerald-600"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
