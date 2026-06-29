"use client";

import { useEffect, useState } from 'react';
import { vendorApi } from '@/lib/vendor/vendorApi';
import { Package, Search, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function VendorProductsPage() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchListings = () => {
    vendorApi.getListings()
      .then(data => {
        if (data.success) setListings(data.listings || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, []);

  const handleToggle = async (listing) => {
    await vendorApi.updateListing(listing._id, { isAvailable: !listing.isAvailable });
    fetchListings();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this product from your store?')) return;
    await vendorApi.deleteListing(id);
    fetchListings();
  };

  const filtered = listings.filter(l => {
    const name = l.catalogProduct?.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

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
          <h1 className="text-xl font-black text-slate-900">My Products</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{listings.length} products in your store</p>
        </div>
        <a
          href="/vendor/add-product"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:brightness-110 transition"
        >
          <Package className="h-4 w-4" /> Add Product
        </a>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search your products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition"
        />
      </div>

      {/* Product Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-black text-slate-400">No products yet</p>
          <p className="text-sm text-slate-400 mt-1">Add products from the master catalog to get started.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Product</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Price</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Stock</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(listing => {
                  const product = listing.catalogProduct || {};
                  const stockStatus = listing.stock <= 0 ? 'out' : listing.stock <= (listing.lowStockThreshold || 10) ? 'low' : 'ok';
                  return (
                    <tr key={listing._id} className="border-b border-slate-50 hover:bg-violet-50/30 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                            <Package className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                            <p className="text-xs text-slate-400">{product.brand} · {product.weight}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-500">{product.category}</td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-black text-slate-900">₹{listing.price}</span>
                        {listing.originalPrice > listing.price && (
                          <span className="ml-2 text-xs text-slate-400 line-through">₹{listing.originalPrice}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                          stockStatus === 'out' ? 'bg-red-100 text-red-600' :
                          stockStatus === 'low' ? 'bg-amber-100 text-amber-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {listing.stock} units
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleToggle(listing)} className="transition">
                          {listing.isAvailable ? (
                            <ToggleRight className="h-6 w-6 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <a href={`/vendor/inventory?edit=${listing._id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-violet-600 transition">
                            <Edit2 className="h-4 w-4" />
                          </a>
                          <button onClick={() => handleDelete(listing._id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
