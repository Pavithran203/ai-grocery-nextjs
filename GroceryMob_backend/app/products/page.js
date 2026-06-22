"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/services/api";
import ProductCard from "@/components/ProductCard";
import SmartSearchBar from "@/components/SmartSearchBar";
import { SlidersHorizontal, X, ChevronDown, Star, Package } from "lucide-react";

// ── Config ────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { label: "Relevance",         value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Top Rated",         value: "rating" },
  { label: "Popularity",        value: "trending" },
];

const CATEGORIES = ["Fruits", "Vegetables", "Dairy", "Staples", "Beverages", "Snacks"];

// ── Keyword Highlight ─────────────────────────────────────────────────────────
function HighlightedProductCard({ product, query }) {
  if (!query?.trim()) return <ProductCard product={product} />;

  // Inject highlighted name via a wrapper that overrides the rendered name
  const highlighted = product.name?.toLowerCase().includes(query.toLowerCase())
    ? { ...product, _highlight: query }
    : product;

  return (
    <div className="relative">
      <ProductCard product={highlighted} />
      {highlighted._highlight && (
        <div className="absolute top-2 right-2 z-10 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
          match
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  // Filter state
  const [allProducts,  setAllProducts]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [query,        setQuery]        = useState(searchParams.get("search") || "");
  const [category,     setCategory]     = useState(searchParams.get("category") || "");
  const [sort,         setSort]         = useState("");
  const [maxPrice,     setMaxPrice]     = useState("");
  const [minRating,    setMinRating]    = useState("");
  const [inStockOnly,  setInStockOnly]  = useState(false);
  const [showFilters,  setShowFilters]  = useState(false);

  // Infinite scroll sentinel
  const sentinelRef = useRef(null);

  // Sync query from URL on load
  useEffect(() => {
    const s = searchParams.get("search") || "";
    const c = searchParams.get("category") || "";
    setQuery(s);
    setCategory(c);
    setVisibleCount(PAGE_SIZE);
  }, [searchParams]);

  // Fetch & filter products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setVisibleCount(PAGE_SIZE);
    try {
      let results = query
        ? await api.searchProducts(query)
        : await api.getProducts(category || null);

      // Fuzzy rank: keep exact / partial matches at top for query searches
      if (query) {
        const q = query.toLowerCase();
        results = results
          .map(p => {
            const name = (p.name || "").toLowerCase();
            let score = 0;
            if (name === q)          score = 300;
            else if (name.startsWith(q)) score = 200;
            else if (name.includes(q))   score = 100;
            else {
              for (const token of q.split(/\s+/)) {
                if (name.includes(token)) score += 40;
              }
            }
            return { ...p, _score: score };
          })
          .sort((a, b) => b._score - a._score);
      }

      // Client-side filters
      if (inStockOnly) results = results.filter(p => p.stock == null || p.stock > 0);
      if (minRating)   results = results.filter(p => (p.rating || 0) >= parseFloat(minRating));
      if (maxPrice)    results = results.filter(p => p.price <= parseFloat(maxPrice));

      // Sort
      if (sort === "price_asc")  results = [...results].sort((a, b) => a.price - b.price);
      if (sort === "price_desc") results = [...results].sort((a, b) => b.price - a.price);
      if (sort === "rating")     results = [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      if (sort === "trending")   results = [...results].sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));

      setAllProducts(results);
    } catch {
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, category, sort, maxPrice, minRating, inStockOnly]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          setVisibleCount(c => Math.min(c + PAGE_SIZE, allProducts.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, allProducts.length]);

  const clearFilters = () => {
    setQuery(""); setCategory(""); setSort(""); setMaxPrice(""); setMinRating(""); setInStockOnly(false);
    router.push("/products");
  };

  const hasFilters = query || category || sort || maxPrice || minRating || inStockOnly;
  const visibleProducts = allProducts.slice(0, visibleCount);
  const hasMore = visibleCount < allProducts.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Search bar ── */}
      <SmartSearchBar
        className="mb-6"
        placeholder="Search products, brands, categories…"
      />

      {/* ── Category chips ── */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => setCategory("")}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
            !category
              ? "bg-[#5C61F2] text-white shadow-md shadow-indigo-200"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >All</button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat.toLowerCase())}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
              category === cat.toLowerCase()
                ? "bg-[#5C61F2] text-white shadow-md shadow-indigo-200"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >{cat}</button>
        ))}
      </div>

      {/* ── Sort + Filter bar ── */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500 font-medium">
            {loading ? "Loading…" : `${allProducts.length} products`}
            {visibleCount < allProducts.length && (
              <span className="text-gray-400"> · showing {visibleCount}</span>
            )}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-rose-500 font-bold hover:underline">
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 border-none focus:outline-none focus:ring-2 focus:ring-[#5C61F2]/50 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              showFilters
                ? "bg-[#5C61F2] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {(maxPrice || minRating || inStockOnly) && (
              <span className="bg-white/30 dark:bg-white/10 text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {[maxPrice, minRating, inStockOnly].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border border-gray-100 dark:border-gray-700 animate-fade-in">
          {/* Max Price */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
              Max Price (₹)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              placeholder="e.g. 500"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C61F2]/50"
            />
          </div>

          {/* Min Rating */}
          <div>
            <label className="flex text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide items-center gap-1">
              <Star className="w-3 h-3" /> Min Rating
            </label>
            <div className="relative">
              <select
                value={minRating}
                onChange={e => setMinRating(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C61F2]/50 appearance-none cursor-pointer"
              >
                <option value="">Any</option>
                <option value="4.5">⭐ 4.5+</option>
                <option value="4">⭐ 4+</option>
                <option value="3.5">⭐ 3.5+</option>
                <option value="3">⭐ 3+</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* In Stock toggle */}
          <div>
            <label className="flex text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide items-center gap-1">
              <Package className="w-3 h-3" /> Availability
            </label>
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                inStockOnly
                  ? "border-[#5C61F2] bg-indigo-50 dark:bg-indigo-900/20 text-[#5C61F2]"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300"
              }`}
            >
              In Stock Only
              <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${inStockOnly ? "bg-[#5C61F2]" : "bg-gray-200 dark:bg-gray-700"}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${inStockOnly ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ── Products grid ── */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#5C61F2] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : allProducts.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg font-medium mb-2">No products found.</p>
          <p className="text-gray-400 text-sm mb-6">Try adjusting your search or filters.</p>
          <button onClick={clearFilters} className="text-[#5C61F2] font-bold hover:underline text-sm">
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {visibleProducts.map((product, i) => (
              <HighlightedProductCard
                key={product._id || product.id || i}
                product={{ ...product, id: product.id || product._id }}
                query={query}
              />
            ))}
          </div>

          {/* ── Infinite scroll sentinel / Load More ── */}
          <div ref={sentinelRef} className="mt-10 flex flex-col items-center gap-3 py-4">
            {hasMore && (
              <>
                {/* Visual load-more button as fallback */}
                <button
                  onClick={() => setVisibleCount(c => Math.min(c + PAGE_SIZE, allProducts.length))}
                  className="px-8 py-3 rounded-2xl bg-[#5C61F2] text-white font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:bg-[#4b50d9] active:scale-95 transition-all"
                >
                  Load more ({allProducts.length - visibleCount} remaining)
                </button>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </>
            )}
            {!hasMore && allProducts.length > PAGE_SIZE && (
              <p className="text-sm text-gray-400 font-medium">You&apos;ve seen all {allProducts.length} products ✓</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
