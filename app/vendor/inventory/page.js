"use client";

import { useEffect, useState } from 'react';
import { vendorApi } from '@/lib/vendor/vendorApi';
import { Warehouse, Save, Search, Loader2 } from 'lucide-react';

export default function InventoryPage() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchListings = () => {
    vendorApi.getListings()
      .then(data => {
        if (data.success) setListings(data.listings || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, []);

  const handleFieldChange = (id, field, value) => {
    setEdits(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), id, [field]: value },
    }));
  };

  const handleSaveAll = async () => {
    const updates = Object.values(edits).filter(e => e.id);
    if (updates.length === 0) return;

    setSaving(true);
    setMessage('');

    try {
      const data = await vendorApi.bulkUpdate(updates);
      if (data.success) {
        setMessage(`Updated ${data.updatedCount} items successfully.`);
        setEdits({});
        fetchListings();
      } else {
        setMessage('Update failed. ' + (data.message || ''));
      }
    } catch {
      setMessage('Update failed. Please try again.');
    }
    setSaving(false);
  };

  const filtered = listings.filter(l => {
    const name = l.catalogProduct?.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const hasEdits = Object.keys(edits).length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Inventory Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Update stock levels and pricing for your products.</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={!hasEdits || saving}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
            hasEdits
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20 hover:brightness-110'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Changes
        </button>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-bold text-emerald-700">{message}</div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by product name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition"
        />
      </div>

      {/* Inventory Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
          <Warehouse className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-black text-slate-400">No inventory items</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(listing => {
            const product = listing.catalogProduct || {};
            const edit = edits[listing._id] || {};
            const currentPrice = edit.price !== undefined ? edit.price : listing.price;
            const currentStock = edit.stock !== undefined ? edit.stock : listing.stock;
            const stockStatus = currentStock <= 0 ? 'out' : currentStock <= (listing.lowStockThreshold || 10) ? 'low' : 'ok';
            const isEdited = !!edits[listing._id];

            return (
              <div
                key={listing._id}
                className={`rounded-2xl bg-white border p-5 transition-all ${
                  isEdited ? 'border-violet-300 ring-2 ring-violet-500/10 shadow-lg shadow-violet-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    stockStatus === 'out' ? 'bg-red-100 text-red-600' :
                    stockStatus === 'low' ? 'bg-amber-100 text-amber-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    <Warehouse className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.brand} · {product.weight}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={currentPrice}
                      onChange={e => handleFieldChange(listing._id, 'price', Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-violet-400 transition"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Stock</label>
                    <input
                      type="number"
                      value={currentStock}
                      onChange={e => handleFieldChange(listing._id, 'stock', Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-violet-400 transition"
                      min="0"
                    />
                  </div>
                </div>

                <div className={`mt-3 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg text-center ${
                  stockStatus === 'out' ? 'bg-red-100 text-red-600' :
                  stockStatus === 'low' ? 'bg-amber-100 text-amber-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {stockStatus === 'out' ? 'Out of Stock' : stockStatus === 'low' ? 'Low Stock' : 'In Stock'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
