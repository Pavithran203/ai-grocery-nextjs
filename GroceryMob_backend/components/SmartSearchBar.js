"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, ChevronRight } from "lucide-react";
import { api } from "@/services/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const HISTORY_KEY = "fk_search_history";
const MAX_HISTORY = 8;
const DEBOUNCE_MS = 300;

// ── Fuzzy scoring ──────────────────────────────────────────────────────────────
function fuzzyScore(str, query) {
  const s = str.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  if (s === q) return 300; // Exact match
  if (s.startsWith(q)) return 250; // Prefix match - highest priority
  if (s.includes(q)) return 100; // Substring match
  // token-level partial match
  let score = 0;
  const qTokens = q.split(/\s+/);
  const sTokens = s.split(/\s+/);
  for (const qt of qTokens) {
    for (const st of sTokens) {
      if (st.startsWith(qt)) score += 80; // Token prefix match
      else if (st.includes(qt)) score += 40; // Token substring match
    }
  }
  return score;
}

// ── Category prefix list ────────────────────────────────────────────────────────
const CATEGORY_PREFIXES = [
  "vegetables", "fruits", "dairy", "meat", "bakery", "snacks", "drinks",
  "oils", "grains", "spices", "condiments", "frozen", "personal care"
];

// ── Extract prefix suggestions ───────────────────────────────────────────────────
function getPrefixSuggestions(query) {
  const q = query.toLowerCase().trim();
  if (q.length < 1) return [];

  return CATEGORY_PREFIXES
    .filter(cat => cat.startsWith(q))
    .slice(0, 3)
    .map(cat => ({
      type: 'prefix',
      text: cat,
      prefix: q,
    }));
}

// ── Keyword highlight ─────────────────────────────────────────────────────────
function Highlight({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded px-0.5 font-bold not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── History helpers ────────────────────────────────────────────────────────────
function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}
function saveToHistory(term) {
  const h = getHistory().filter(t => t !== term);
  h.unshift(term);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, MAX_HISTORY)));
}
function deleteFromHistory(term) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(getHistory().filter(t => t !== term)));
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function SmartSearchBar({ className = "", placeholder }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [prefixSuggestions, setPrefixSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setHistory(getHistory());
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Debounced autocomplete fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();

    // Get prefix suggestions immediately
    setPrefixSuggestions(getPrefixSuggestions(q));

    if (q.length < 2) { setSuggestions([]); setLoading(false); return; }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await api.searchProducts(q);
        const scored = (results || [])
          .map(p => ({ ...p, _score: fuzzyScore(p.name || "", q) }))
          .filter(p => p._score > 0)
          .sort((a, b) => b._score - a._score)
          .slice(0, 7);
        setSuggestions(scored);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleFocus = () => {
    setHistory(getHistory());
    setOpen(true);
    setActiveIdx(-1);
  };

  const navigate = useCallback((term) => {
    if (!term?.trim()) return;
    saveToHistory(term.trim());
    setQuery(term.trim());
    setOpen(false);
    router.push(`/products?search=${encodeURIComponent(term.trim())}`);
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(query.trim());
  };

  const clearInput = () => {
    setQuery("");
    setSuggestions([]);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    const hasPrefixSuggestions = prefixSuggestions.length > 0 && query.trim().length > 0;
    const isSuggesting = query.trim().length >= 2 && suggestions.length > 0;
    const allItems = [
      ...prefixSuggestions,
      ...suggestions
    ];
    const items = hasPrefixSuggestions || isSuggesting ? allItems : history;

    if (!open || items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      const item = items[activeIdx];
      if (item.type === 'prefix') {
        // Auto-complete prefix
        setQuery(item.text);
        inputRef.current?.focus();
      } else if (item && item.name) {
        navigate(item.name);
      } else {
        navigate(typeof item === "string" ? item : "");
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  const showSuggestions = open && query.trim().length >= 2;
  const showPrefixes = open && query.trim().length > 0 && query.trim().length < 2 && prefixSuggestions.length > 0;
  const showHistory = open && query.trim().length < 2 && history.length > 0 && prefixSuggestions.length === 0;
  const showDropdown = showSuggestions || showPrefixes || showHistory;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* ── Input ── */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-white/60 group-focus-within:text-white transition-colors" />
          )}
        </div>
        <input
          ref={inputRef}
          id="smart-search-input"
          type="text"
          autoComplete="off"
          value={query}
          onChange={e => { setQuery(e.target.value); setActiveIdx(-1); }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Search groceries, brands… (Ctrl+K)"}
          className="block w-full pl-12 pr-20 py-2.5 border-none rounded-lg bg-white/90 dark:bg-gray-800 placeholder-gray-500 font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white dark:focus:bg-gray-900 transition-all sm:text-sm"
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
          {query && (
            <button
              type="button"
              onClick={clearInput}
              className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 select-none">
            Ctrl K
          </kbd>
        </div>
      </form>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div className="search-dropdown absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-gray-100 dark:border-gray-800 overflow-hidden z-200">

          {/* Prefix Suggestions */}
          {showPrefixes && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Categories
              </p>
              {prefixSuggestions.map((prefix, i) => (
                <button
                  key={`prefix-${prefix.text}`}
                  onClick={() => {
                    setQuery(prefix.text);
                    inputRef.current?.focus();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === i
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-sm shrink-0">
                    📁
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{prefix.prefix}</span>
                      <span className="text-gray-600 dark:text-gray-400">{prefix.text.slice(prefix.prefix.length)}</span>
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">→</span>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {loading ? "Searching…" : suggestions.length > 0 ? "Suggestions" : "No results"}
              </p>

              {suggestions.length > 0 ? (
                <>
                  {suggestions.map((product, i) => {
                    const globalIdx = prefixSuggestions.length + i;
                    return (
                      <button
                        key={product._id || product.id || i}
                        onClick={() => navigate(product.name)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === globalIdx
                          ? "bg-indigo-50 dark:bg-indigo-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                          }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-base shrink-0">
                          🛒
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                            <Highlight text={product.name || ""} query={query.trim()} />
                          </p>
                          {product.category && (
                            <p className="text-xs text-gray-400 truncate capitalize">{product.category}</p>
                          )}
                        </div>
                        {product.price != null && (
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            ₹{Number(product.price).toFixed(0)}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* "See all" footer */}
                  <div className="px-4 py-2.5 border-t border-gray-50 dark:border-gray-800">
                    <button
                      onClick={() => navigate(query.trim())}
                      className="w-full flex items-center gap-2 text-sm font-semibold text-[#5C61F2] hover:underline"
                    >
                      <Search className="w-4 h-4" />
                      See all results for &quot;{query}&quot;
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                  </div>
                </>
              ) : !loading && (
                <div className="px-4 py-4 text-sm text-gray-400 text-center">
                  No products found for &quot;{query}&quot;
                </div>
              )}
            </div>
          )}

          {/* Search History */}
          {showHistory && (
            <div>
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Recent Searches
                </p>
                <button
                  onClick={() => { localStorage.removeItem(HISTORY_KEY); setHistory([]); }}
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-600 transition-colors"
                >
                  Clear all
                </button>
              </div>
              {history.map((term, i) => (
                <div
                  key={`hist-${i}`}
                  className={`flex items-center gap-3 px-4 py-2.5 group/item transition-colors ${activeIdx === i
                    ? "bg-indigo-50 dark:bg-indigo-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    }`}
                >
                  <Clock className="w-4 h-4 text-gray-300 shrink-0" />
                  <button
                    onClick={() => navigate(term)}
                    className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {term}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFromHistory(term);
                      setHistory(getHistory());
                    }}
                    className="opacity-0 group-hover/item:opacity-100 p-1 rounded-md text-gray-300 hover:text-rose-400 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
