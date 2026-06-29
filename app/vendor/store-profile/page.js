"use client";

import { useState } from 'react';
import { useVendorAuth } from '@/lib/vendor/useVendorAuth';
import { vendorApi } from '@/lib/vendor/vendorApi';
import { StoreIcon, Save, Loader2, MapPin, Clock, Phone, Mail } from 'lucide-react';

export default function StoreProfilePage() {
  const { store, setStore } = useVendorAuth();
  const [form, setForm] = useState({
    name: store?.name || '',
    emoji: store?.emoji || '🏪',
    address: store?.address || '',
    city: store?.city || '',
    area: store?.area || '',
    zipCode: store?.zipCode || '',
    openTime: store?.openTime || '08:00',
    closeTime: store?.closeTime || '22:00',
    contactPhone: store?.contactDetails?.phone || '',
    contactEmail: store?.contactDetails?.email || '',
    isClosedToday: store?.isClosedToday || false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const data = await vendorApi.updateProfile({
        name: form.name,
        emoji: form.emoji,
        address: form.address,
        city: form.city,
        area: form.area,
        zipCode: form.zipCode,
        openTime: form.openTime,
        closeTime: form.closeTime,
        isClosedToday: form.isClosedToday,
        contactDetails: {
          phone: form.contactPhone,
          email: form.contactEmail,
        },
      });

      if (data.success) {
        setMessage('Store profile updated successfully!');
        if (data.store) setStore(data.store);
      } else {
        setMessage(data.message || 'Update failed.');
      }
    } catch {
      setMessage('Update failed. Please try again.');
    }
    setSaving(false);
  };

  if (!store) {
    return <StoreOnboarding />;
  }

  return (
    <div className="max-w-3xl space-y-6" suppressHydrationWarning>
      <div>
        <h1 className="text-xl font-black text-slate-900">Store Profile</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Update your store information visible to customers.</p>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-bold text-emerald-700">{message}</div>
      )}

      <form onSubmit={handleSave} className="rounded-2xl bg-white border border-slate-200 p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Store Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Store Emoji</label>
            <input
              value={form.emoji}
              onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
              maxLength={4}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Zip Code</label>
            <input
              value={form.zipCode}
              onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Location</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Full Address"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <input
                value={form.area}
                onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                placeholder="Area"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <input
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="City"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Operating Hours</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Open Time</label>
              <input
                type="time"
                value={form.openTime}
                onChange={e => setForm(f => ({ ...f, openTime: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Close Time</label>
              <input
                type="time"
                value={form.closeTime}
                onChange={e => setForm(f => ({ ...f, closeTime: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
              />
            </div>
          </div>
          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isClosedToday}
              onChange={e => setForm(f => ({ ...f, isClosedToday: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm font-medium text-slate-600">Mark as closed today</span>
          </label>
        </div>

        {/* Contact */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Phone className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Contact</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.contactPhone}
              onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
              placeholder="Phone Number"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
            />
            <input
              value={form.contactEmail}
              onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
              placeholder="Email Address"
              type="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3.5 text-sm font-black text-white uppercase tracking-wider shadow-lg shadow-violet-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

function StoreOnboarding() {
  const { setStore } = useVendorAuth();
  const [form, setForm] = useState({
    name: '', address: '', city: 'Chennai', area: '', zipCode: '',
    openTime: '08:00', closeTime: '22:00',
    contactPhone: '', contactEmail: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address) {
      setError('Store name and address are required.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const data = await vendorApi.registerStore({
        name: form.name,
        address: form.address,
        city: form.city,
        area: form.area,
        zipCode: form.zipCode,
        openTime: form.openTime,
        closeTime: form.closeTime,
        contactDetails: {
          phone: form.contactPhone,
          email: form.contactEmail,
        },
      });

      if (data.success && data.store) {
        setStore(data.store);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch {
      setError('Registration failed. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" suppressHydrationWarning>
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-2xl shadow-xl shadow-violet-500/20 mb-4">
          🏪
        </div>
        <h1 className="text-2xl font-black text-slate-900">Register Your Store</h1>
        <p className="mt-2 text-sm text-slate-500 font-medium">Submit your store details for Admin approval to start selling on NearMart.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-bold text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Store Name *</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Address *</label>
          <input
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400"
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Area" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400" />
          <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400" />
          <input value={form.zipCode} onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))} placeholder="Pin Code" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="Phone" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400" />
          <input value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="Email" type="email" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400" />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3.5 text-sm font-black text-white uppercase tracking-wider shadow-lg shadow-violet-500/20 hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <StoreIcon className="h-4 w-4" />}
          {saving ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
}
