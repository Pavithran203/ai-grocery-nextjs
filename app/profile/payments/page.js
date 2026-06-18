"use client";

import { 
  CreditCard, 
  Smartphone, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2,
  Info
} from "lucide-react";
import { useState } from "react";

export default function PaymentsPage() {
  const [methods, setMethods] = useState([
    { id: 1, type: 'card', label: 'HDFC Bank Credit Card', last4: '4242', expiry: '09/28', brand: 'Visa', isDefault: true },
    { id: 2, type: 'upi', label: 'Google Pay', handle: 'user@okaxis', isDefault: false },
  ]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">Payment Methods</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Manage your saved cards and UPI IDs</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-600/20">
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.map((method) => (
          <div key={method.id} className={`bg-white dark:bg-gray-900 rounded-[32px] border-2 transition-all p-6 relative overflow-hidden group ${
            method.isDefault ? 'border-emerald-500 shadow-md shadow-emerald-500/5' : 'border-gray-100 dark:border-gray-800 shadow-sm'
          }`}>
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-10 rounded-xl flex items-center justify-center border ${
                  method.isDefault ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-400'
                }`}>
                  {method.type === 'card' ? <CreditCard size={24} /> : <Smartphone size={24} />}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">{method.label}</h3>
                  {method.isDefault && <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1 block">Primary</span>}
                </div>
              </div>
              <button className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl">
                <Trash2 size={18} />
              </button>
            </div>

            {method.type === 'card' ? (
              <div className="space-y-1">
                <p className="text-xl font-black text-gray-900 dark:text-white tracking-[0.3em]">•••• •••• •••• {method.last4}</p>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Expires</p>
                    <p className="text-xs font-black text-gray-700 dark:text-gray-300">{method.expiry}</p>
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase italic">{method.brand}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-lg font-black text-emerald-600 tracking-tight">{method.handle}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-4">Instant UPI Payment</p>
              </div>
            )}

            {!method.isDefault && (
              <button className="mt-6 w-full py-3 rounded-xl border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                Set as Primary
              </button>
            )}
          </div>
        ))}

        {/* Info Card */}
        <div className="md:col-span-2 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-[32px] p-8 flex gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-blue-900 dark:text-blue-200 tracking-tight mb-2 flex items-center gap-2">
              Secure Storage <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </h3>
            <p className="text-sm font-medium text-blue-700/70 dark:text-blue-400/70 leading-relaxed max-w-2xl">
              NearMart uses industry-standard 256-bit encryption to secure your payment information. We never store your CVV numbers or full card details. Payments are processed through PCI-DSS compliant partners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
