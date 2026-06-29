"use client";

import { useState } from 'react';
import { vendorApi } from '@/lib/vendor/vendorApi';
import { Search, Plus, Package, Check, Loader2 } from 'lucide-react';

export default function AddProductPage() {
  const [search, setSearch] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('100');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const data = await vendorApi.searchCatalog(search);
      if (data.success) setCatalog(data.catalog || []);
    } catch {}
    setSearching(false);
  };

  const handleSelect = (product) => {
    setSelectedProduct(product);
    setPrice('');
    setOriginalPrice('');
    setSuccess('');
    setError('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !price || !stock) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const data = await vendorApi.addListing({
        catalogProductId: selectedProduct._id,
        price: Number(price),
        originalPrice: Number(originalPrice) || Number(price),
        stock: Number(stock),
        lowStockThreshold: Number(lowStockThreshold) || 10,
      });

      if (data.success) {
        setSuccess(`${selectedProduct.name} added to your store!`);
        setSelectedProduct(null);
        setPrice('');
        setOriginalPrice('');
        setStock('100');
      } else {
        setError(data.message || 'Failed to add product.');
      }
    } catch {
      setError('Failed to add product. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8" suppressHydrationWarning>
      <div>
        <h1 className="text-xl font-black text-slate-900">Add Product</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Search the master catalog and add products to your store inventory.</p>
      </div>

      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-bold text-emerald-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      )}

      {/* Catalog Search */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Search Master Catalog</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name, brand, or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-700 transition disabled:opacity-50 shrink-0"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </button>
        </div>

        {/* Results */}
        {catalog.length > 0 && (
          <div className="mt-5 space-y-2 max-h-[400px] overflow-y-auto">
            {catalog.map(item => (
              <button
                key={item._id}
                onClick={() => handleSelect(item)}
                className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all hover:border-violet-300 hover:bg-violet-50/50 ${
                  selectedProduct?._id === item._id ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-500/20' : 'border-slate-100'
                }`}
              >
                <div className="h-11 w-11 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.brand} · {item.category} · {item.weight}</p>
                </div>
                {selectedProduct?._id === item._id && (
                  <Check className="h-5 w-5 text-violet-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add to Inventory Form */}
      {selectedProduct && (
        <form onSubmit={handleAdd} className="rounded-2xl bg-white border border-violet-200 p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{selectedProduct.name}</h3>
              <p className="text-xs text-slate-400">{selectedProduct.brand} · {selectedProduct.weight}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Selling Price (₹) *</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                required min="1"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Original / MRP (₹)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={e => setOriginalPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Available Stock *</label>
              <input
                type="number"
                value={stock}
                onChange={e => setStock(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                required min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Low Stock Alert At</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                min="0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3.5 text-sm font-black text-white uppercase tracking-wider shadow-lg shadow-violet-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {saving ? 'Adding...' : 'Add to My Store'}
          </button>
        </form>
      )}

      {/* Request New Product Link */}
      <div className="rounded-2xl bg-violet-50 border border-violet-100 p-6 text-center">
        <p className="text-sm text-violet-700 font-medium mb-2">Can&apos;t find a product in the catalog?</p>
        <a
          href="/vendor/product-requests"
          className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700 transition"
        >
          <Plus className="h-4 w-4" /> Request New Product
        </a>
      </div>
    </div>
  );
}
