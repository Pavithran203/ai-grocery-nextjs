"use client";

import { useAddress } from "@/context/AddressContext";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Home, 
  Briefcase, 
  Navigation,
  Loader2,
  CheckCircle2,
  X
} from "lucide-react";
import { useState } from "react";

export default function AddressesPage() {
  const { addresses, addAddress, removeAddress, updateAddress, setDefaultAddress } = useAddress();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateAddress(editingId, formData);
    } else {
      addAddress(formData);
    }
    setIsAdding(false);
    setEditingId(null);
    setFormData({ label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
  };

  const startEdit = (addr) => {
    setFormData(addr);
    setEditingId(addr.id);
    setIsAdding(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">My Addresses</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Manage your delivery locations</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-gray-900 rounded-[32px] border-2 border-emerald-500 shadow-xl p-8 relative animate-slideDown">
          <button 
            onClick={() => setIsAdding(false)}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <MapPin className="w-5 h-5" />
            </div>
            {editingId ? 'Edit Address' : 'New Address'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-3 mb-6">
              {['Home', 'Work', 'Other'].map(l => (
                <button 
                  key={l}
                  type="button"
                  onClick={() => setFormData({...formData, label: l})}
                  className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${
                    formData.label === l 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:border-emerald-200'
                  }`}
                >
                  {l === 'Home' ? '🏠 ' : l === 'Work' ? '💼 ' : '📍 '}{l}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                className="checkout-input" 
                placeholder="Full Name *" 
                required
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
              <input 
                className="checkout-input" 
                placeholder="Mobile Number *" 
                required
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g,'').slice(0,10)})}
              />
              <input 
                className="checkout-input md:col-span-2" 
                placeholder="Flat, House no., Building, Apartment *" 
                required
                value={formData.line1}
                onChange={e => setFormData({...formData, line1: e.target.value})}
              />
              <input 
                className="checkout-input md:col-span-2" 
                placeholder="Area, Street, Sector, Village" 
                value={formData.line2}
                onChange={e => setFormData({...formData, line2: e.target.value})}
              />
              <input 
                className="checkout-input" 
                placeholder="City *" 
                required
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
              />
              <input 
                className="checkout-input" 
                placeholder="Pincode *" 
                required
                value={formData.pincode}
                onChange={e => setFormData({...formData, pincode: e.target.value.replace(/\D/g,'').slice(0,6)})}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded-lg border-2 border-gray-200 text-emerald-600 focus:ring-emerald-500"
                checked={formData.isDefault}
                onChange={e => setFormData({...formData, isDefault: e.target.checked})}
              />
              <span className="text-sm font-black text-gray-600 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">Set as default address</span>
            </label>

            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                className="flex-1 bg-emerald-600 text-white py-5 rounded-[24px] font-black text-lg shadow-lg shadow-emerald-600/20 hover:brightness-110 active:scale-95 transition-all"
              >
                {editingId ? 'Save Changes' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.length === 0 && !isAdding ? (
          <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800">
            <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No saved addresses</h3>
            <p className="text-sm text-gray-300 font-bold mt-2">Add your first address to get started</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className={`bg-white dark:bg-gray-900 rounded-[32px] border-2 transition-all p-6 group relative overflow-hidden ${
              addr.isDefault ? 'border-emerald-500 shadow-md shadow-emerald-500/5' : 'border-gray-100 dark:border-gray-800 shadow-sm'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    addr.isDefault ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {addr.label === 'Home' ? <Home size={20} /> : addr.label === 'Work' ? <Briefcase size={20} /> : <MapPin size={20} />}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">{addr.label}</h3>
                    {addr.isDefault && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full uppercase tracking-widest">Default</span>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(addr)}
                    className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 rounded-xl transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => removeAddress(addr.id)}
                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-black text-gray-800 dark:text-gray-100">{addr.fullName}</p>
                <p className="text-xs font-bold text-gray-500">{addr.line1}, {addr.line2 && addr.line2 + ','}</p>
                <p className="text-xs font-bold text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-xs font-black text-gray-400 mt-2">📱 +91 {addr.phone}</p>
              </div>

              {!addr.isDefault && (
                <button 
                  onClick={() => setDefaultAddress(addr.id)}
                  className="mt-6 w-full py-3 rounded-xl border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                >
                  Set as Default
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
