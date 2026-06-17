"use client";

import type { FormEvent } from 'react';
import { useState } from 'react';
import { ShieldCheck, Lock, ServerCog, Sparkles } from 'lucide-react';
import { useAdminAuth } from '@/lib/admin/useAdminAuth';

const accounts = [
  { label: 'Super Admin', email: 'superadmin@nearmart.com', password: 'Super123!' },
  { label: 'Admin Lead', email: 'admin@nearmart.com', password: 'Admin123!' },
  { label: 'Store Manager', email: 'manager@nearmart.com', password: 'Manager123!' },
  { label: 'Inventory Manager', email: 'inventory@nearmart.com', password: 'Inventory123!' },
  { label: 'Delivery Manager', email: 'delivery@nearmart.com', password: 'Delivery123!' },
];

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@nearmart.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const loginState = useAdminAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginState.login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-emerald-400/90">NearMart Admin Portal</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">Secure operations for grocery commerce.</h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300/90">Sign in with your admin credentials to review orders, manage inventory, oversee delivery, and run AI-backed forecasting.</p>
          </div>
          <div className="rounded-3xl bg-slate-950/80 border border-slate-800 px-5 py-4 text-sm text-slate-300">
            <div className="font-black text-emerald-300 uppercase tracking-[0.2em] text-xs">Demo accounts</div>
            <div className="mt-4 space-y-3">
              {accounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    setError('');
                  }}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-left text-white transition hover:border-emerald-500/70"
                >
                  <div className="font-black">{account.label}</div>
                  <div className="mt-1 text-xs text-slate-400">{account.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-8">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-black uppercase tracking-[0.25em] text-slate-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-5 py-4 text-white outline-none transition focus:border-emerald-400"
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-black uppercase tracking-[0.25em] text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-5 py-4 text-white outline-none transition focus:border-emerald-400"
            />
          </div>
          {error && <div className="mb-6 rounded-3xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-red-300">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-3xl bg-emerald-500 px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Verifying...' : 'Continue with JWT'}
          </button>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="flex items-center gap-3 text-emerald-400"><ShieldCheck size={18} /><span className="text-xs uppercase tracking-[0.25em]">JWT Security</span></div>
              <p className="mt-3 text-sm text-slate-400">Each session uses a signed token for secure role-based access control.</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="flex items-center gap-3 text-slate-300"><Lock size={18} /><span className="text-xs uppercase tracking-[0.25em]">Audit trail</span></div>
              <p className="mt-3 text-sm text-slate-400">Authentication events and permission changes are recorded for compliance.</p>
            </div>
          </div>
        </form>

        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 text-slate-400">
          <div className="flex items-center gap-3 text-slate-200"><ServerCog size={18} /><span className="font-black uppercase tracking-[0.2em]">Platform overview</span></div>
          <p className="mt-4 text-sm leading-7">Admin, product, inventory, delivery, coupon, analytics, and settings modules are built on a unified operations shell. This portal is designed for high-volume grocery management workflows.</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-xs uppercase tracking-[0.25em] text-emerald-200"><Sparkles size={14} /> AI-enabled recommendations & forecasting</div>
        </div>
      </div>
    </div>
  );
}
