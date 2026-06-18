"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Search, User, MapPin, ChevronDown, Leaf, Globe, Heart, ArrowLeft, X, Loader2, ClipboardList } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/context/StoreContext";
import { useLocation } from "@/context/LocationContext";
import { useAddress } from "@/context/AddressContext";
import { api } from "@/services/api";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { getCartCount, setIsCartOpen } = useCart();
  const { isAuthenticated, setLoginModalOpen } = useAuth();
  const { t, i18n } = useTranslation();
  const { selectedStore } = useStore();
  const { locationText, setLocationModalOpen, loading: locationLoading } = useLocation();
  const { getDefaultAddress } = useAddress();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], categories: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults({ products: [], categories: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.search(searchQuery.trim());
        setSearchResults(results || { products: [], categories: [] });
        setShowSearchDropdown(true);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults({ products: [], categories: [] });
    setShowSearchDropdown(false);
    if (pathname === '/products') {
      router.push('/products');
    }
  };

  const isHome = pathname === "/";

  const defaultAddr = getDefaultAddress();
  const displayLocation = defaultAddr
    ? [defaultAddr.city, defaultAddr.state].filter(Boolean).join(', ') || defaultAddr.line1
    : locationText || t('location.setYourLocation', 'Set your location');

  const displayLabel = defaultAddr?.label || '';

  return (
    <div className="sticky top-0 z-50 w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-900">
      {/* Main Nav */}
      <nav className="max-w-7xl mx-auto px-2 sm:px-4 py-2 md:py-0 h-16 md:h-20 flex flex-nowrap items-center justify-between gap-1 sm:gap-2 md:gap-4 lg:gap-8">
        
        {/* Back Button & Logo */}
        <div className="flex items-center shrink-0 gap-1 sm:gap-2 md:gap-3">
          {!isHome && (
            <button 
              onClick={() => router.back()}
              className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 hover:text-emerald-600 transition-all shadow-sm"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
            </button>
          )}
          <Link href="/" className="flex items-center gap-1 sm:gap-2 lg:gap-4 group">
            <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl lg:rounded-2xl bg-emerald-600 flex items-center justify-center rotate-2 group-hover:rotate-6 transition-all shadow-lg shrink-0">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm md:text-xl lg:text-2xl font-black tracking-tighter leading-none text-gray-900 dark:text-white" suppressHydrationWarning>
                {t('navbar.appName1')}<span className="text-emerald-600" suppressHydrationWarning>{t('navbar.appName2')}</span>
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 lg:block hidden" suppressHydrationWarning>{t('home.premiumGrocery', 'Premium Grocery')}</span>
            </div>
          </Link>
        </div>

        {/* Location Bar - Responsive Style */}
        <button
          onClick={() => setLocationModalOpen(true)}
          className="flex items-center gap-1 sm:gap-1.5 border border-gray-100 dark:border-gray-800 md:border-transparent lg:border-gray-100 lg:dark:border-gray-800 px-1 sm:px-2 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-xl lg:rounded-2xl transition-all shrink-0 max-w-[70px] sm:max-w-[120px] md:max-w-[180px] lg:max-w-[200px]"
        >
          <MapPin className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-emerald-600 shrink-0" />
          <div className="flex flex-col items-start overflow-hidden text-left">
            <span className="text-[9px] font-black text-emerald-600 uppercase leading-none hidden lg:block" suppressHydrationWarning>{displayLabel || t('location.home', 'Home')}</span>
            <span className="text-[8px] sm:text-[10px] lg:text-xs font-bold text-gray-500 truncate w-full" suppressHydrationWarning>{displayLocation}</span>
          </div>
          <ChevronDown size={14} className="text-emerald-600 hidden lg:block" />
        </button>

        {/* Search Bar - Responsive Size */}
        <div className="flex-1 min-w-0 max-w-2xl mx-1 sm:mx-2 md:mx-4" ref={searchRef}>
          <form className="relative group" onSubmit={handleSearchSubmit}>
            <div className="absolute inset-y-0 left-2 sm:left-3 lg:left-5 flex items-center pointer-events-none">
              <Search className={`w-3.5 h-3.5 lg:w-5 lg:h-5 ${showSearchDropdown ? 'text-emerald-500' : 'text-gray-400'} group-focus-within:text-emerald-500 transition-colors`} />
            </div>
            <input 
              type="text"
              placeholder={t('common.searchPlaceholder', 'Search...')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length >= 2) setShowSearchDropdown(true);
              }}
              onFocus={() => {
                if (searchQuery.length >= 2) setShowSearchDropdown(true);
              }}
              className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent rounded-lg sm:rounded-xl lg:rounded-2xl py-1 sm:py-2 lg:py-3.5 pl-6 sm:pl-9 lg:pl-14 pr-6 sm:pr-10 lg:pr-12 text-[9px] sm:text-xs lg:text-sm font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-400 transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-2 sm:right-3 flex items-center gap-1 sm:gap-2">
              {isSearching && <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />}
              {!isSearching && searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-0.5 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {showSearchDropdown && (searchQuery.length >= 2) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-[100] animate-fadeIn">
                <div className="max-h-[60vh] overflow-y-auto overscroll-contain no-scrollbar">
                  {searchResults?.categories?.length > 0 && (
                    <div className="p-2 border-b border-gray-50 dark:border-gray-800">
                      <div className="px-3 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categories</div>
                      {searchResults.categories.map((cat, idx) => (
                        <Link
                          key={idx}
                          href={`/products?category=${encodeURIComponent(cat.name)}`}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-lg">{cat.icon || '📦'}</div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults?.products?.length > 0 ? (
                    <div className="p-2">
                      <div className="px-3 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Products</div>
                      {searchResults.products.map(product => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => {
                            setShowSearchDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-white truncate">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-black text-emerald-600">₹{product.price}</span>
                              {product.originalPrice > product.price && (
                                <span className="text-[10px] font-semibold text-gray-400 line-through">₹{product.originalPrice}</span>
                              )}
                              <span className="text-[10px] text-gray-500 truncate">• {product.category}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    !isSearching && (
                      <div className="p-8 text-center">
                        <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No results found</h4>
                        <p className="text-xs text-gray-500">Try searching for something else</p>
                      </div>
                    )
                  )}
                </div>
                {searchResults?.products?.length > 0 && (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                    <Link
                      href={`/products?q=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="w-full flex items-center justify-center py-2.5 text-xs font-black text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-500 dark:bg-emerald-900/20 dark:hover:bg-emerald-500 rounded-xl transition-colors text-center uppercase tracking-widest"
                    >
                      View All Results
                    </Link>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 shrink-0">
          {/* Language Selector - Always Visible */}
          <div className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shrink-0">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
            <select 
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="bg-transparent text-[8px] sm:text-[10px] lg:text-xs font-black text-gray-500 dark:text-gray-400 focus:outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="ta">TA</option>
              <option value="te">TE</option>
              <option value="kn">KN</option>
              <option value="ml">ML</option>
              <option value="hi">HI</option>
            </select>
          </div>

          {!isAuthenticated ? (
            <button 
              onClick={() => setLoginModalOpen(true)}
              className="flex items-center group shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 group-hover:text-emerald-600 transition-all">
                <User className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest hidden lg:block ml-2" suppressHydrationWarning>{t('auth.signIn') || 'Login'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Link 
                href="/orders" 
                title="My Orders"
                className="p-1 sm:p-2 text-emerald-600 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-all"
              >
                <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
              </Link>
              <Link 
                href="/wishlist" 
                title="Wishlist"
                className="p-1 sm:p-2 text-rose-500 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-all"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
              </Link>
              <Link 
                href="/profile"
                title="My Profile"
                className="flex items-center group shrink-0"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 group-hover:text-emerald-600 transition-all">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                </div>
              </Link>
            </div>
          )}

          {/* Cart Button - Themed */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1 sm:gap-2 relative px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-all hover:bg-gray-100 shrink-0 shadow-sm"
          >
            <div className="relative">
              <ShoppingCart 
                className={`w-4 h-4 sm:w-6 sm:h-6 ${getCartCount() > 0 ? 'text-rose-500' : 'text-emerald-600'}`} 
                strokeWidth={2.5} 
              />
              {getCartCount() > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white text-[8px] sm:text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-md">
                  {getCartCount()}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest hidden lg:block" suppressHydrationWarning>
              {t('navbar.cart') || 'Cart'}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
