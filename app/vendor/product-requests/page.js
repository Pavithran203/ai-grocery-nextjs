"use client";

import { useState } from 'react';
import { vendorApi } from '@/lib/vendor/vendorApi';
import { FileQuestion, Send, Check, Loader2 } from 'lucide-react';

export default function ProductRequestsPage() {
  const [form, setForm] = useState({
    name: '', brand: '', category: '', weight: '1 kg',
    description: '', barcode: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      setError('Product name and category are required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const data = await vendorApi.requestProduct(form);
      if (data.success) {
        setSuccess(`Product "${form.name}" submitted for Admin review!`);
        setForm({ name: '', brand: '', category: '', weight: '1 kg', description: '', barcode: '' });
      } else {
        setError(data.message || 'Request failed.');
      }
    } catch {
      setError('Request failed. Please try again.');
    }
    setSaving(false);
  };

  const categories = [
    'Rice & Grains', 'Dal & Pulses', 'Flour & Powders', 'Oil & Ghee',
    'Masalas & Spices', 'Sugar & Salt', 'Dry Items & Cooking Essentials', 'Packed Grocery'
  ];

  return (
    <div className="max-w-2xl space-y-6" suppressHydrationWarning>
      <div>
        <h1 className="text-xl font-black text-slate-900">Request New Product</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Can&apos;t find a product in the master catalog? Submit a request and Admin will review it.
        </p>
      </div>

      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-bold text-emerald-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-bold text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Product Name *</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Organic Brown Rice"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Brand</label>
            <input
              value={form.brand}
              onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
              placeholder="e.g. India Gate"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Category *</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
              required
            >
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Weight / Unit</label>
            <input
              value={form.weight}
              onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
              placeholder="e.g. 5 kg"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Barcode / SKU</label>
            <input
              value={form.barcode}
              onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
              placeholder="Optional"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief product description..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3.5 text-sm font-black text-white uppercase tracking-wider shadow-lg shadow-violet-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {saving ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      <div className="rounded-2xl bg-violet-50/50 border border-violet-100 p-5">
        <div className="flex items-center gap-2 mb-2">
          <FileQuestion className="h-4 w-4 text-violet-500" />
          <p className="text-xs font-black text-violet-700 uppercase tracking-wider">How it works</p>
        </div>
        <ol className="text-sm text-violet-700 space-y-1 list-decimal list-inside font-medium">
          <li>Submit your product details here.</li>
          <li>Admin reviews and approves the product into the Master Catalog.</li>
          <li>Once approved, you can add it to your store from the <strong>Add Product</strong> page.</li>
        </ol>
      </div>
    </div>
  );
}
