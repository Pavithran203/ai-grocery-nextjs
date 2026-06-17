"use client";

import { useState } from 'react';
import { customers } from '@/lib/admin/mockData';
import { Ban, ShieldCheck, Star } from 'lucide-react';

export default function UsersManager() {
  const [customerData, setCustomerData] = useState(customers);

  const toggleStatus = (id: string) => {
    setCustomerData((current) => current.map((customer) => {
      if (customer.id !== id) return customer;
      return { ...customer, status: customer.status === 'Blocked' ? 'Active' : 'Blocked' };
    }));
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-emerald-600">Customer operations</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Customer profiles</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Monitor loyalty points, complaints, and profile status to maintain customer retention and compliance.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-700">Active relationships</div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          {customerData.map((customer) => (
            <div key={customer.id} className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-black text-slate-950">{customer.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{customer.email}</p>
                </div>
                <span className={`rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.25em] ${customer.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {customer.status}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm">
                  <p className="font-black text-slate-950">{customer.orders}</p>
                  <p className="mt-1 uppercase tracking-[0.2em] text-slate-500">Orders</p>
                </div>
                <div className="rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm">
                  <p className="font-black text-slate-950">{customer.loyaltyPoints}</p>
                  <p className="mt-1 uppercase tracking-[0.2em] text-slate-500">Loyalty pts</p>
                </div>
                <div className="rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm">
                  <p className="font-black text-slate-950">{customer.status === 'Blocked' ? 'Review' : 'Healthy'}</p>
                  <p className="mt-1 uppercase tracking-[0.2em] text-slate-500">Profile health</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => toggleStatus(customer.id)}
                  className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-slate-800"
                >
                  <Ban className="h-4 w-4" /> {customer.status === 'Blocked' ? 'Unblock user' : 'Block user'}
                </button>
                <button type="button" className="inline-flex items-center gap-2 rounded-3xl bg-emerald-50 px-4 py-3 text-xs font-black uppercase tracking-[0.25em] text-emerald-900 transition hover:bg-emerald-100">
                  <ShieldCheck className="h-4 w-4" /> View profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em] text-slate-500">
          <Star className="h-4 w-4 text-amber-500" /> Customer loyalty summary
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Manage complaints, loyalty tiers, and service interventions from a single customer operations dashboard.</p>
      </section>
    </div>
  );
}
