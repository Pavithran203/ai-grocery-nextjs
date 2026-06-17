"use client";

import { useState } from 'react';
import { settings as defaultSettings } from '@/lib/admin/mockData';
import { Cog, CreditCard, Percent, ShieldCheck } from 'lucide-react';

export default function SettingsPanel() {
  const [settings, setSettings] = useState(defaultSettings);

  const updateField = (field: keyof typeof defaultSettings, value: string | number | boolean) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-emerald-600">Platform settings</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Store configuration</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Configure payment gateways, tax rules, delivery charges, and defaults for enterprise operations.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-700">System preferences</div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
          <div className="flex items-center gap-3 text-slate-500">
            <Cog className="h-4 w-4" /> <span className="text-sm font-black uppercase tracking-[0.2em]">General</span>
          </div>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-black uppercase tracking-[0.2em] text-slate-600">Payment gateway</label>
            <input
              value={settings.paymentGateway}
              onChange={(e) => updateField('paymentGateway', e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none"
            />
            <label className="block text-sm font-black uppercase tracking-[0.2em] text-slate-600">Tax rate (%)</label>
            <input
              type="number"
              value={settings.taxRate}
              onChange={(e) => updateField('taxRate', Number(e.target.value))}
              className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none"
            />
            <label className="block text-sm font-black uppercase tracking-[0.2em] text-slate-600">Delivery charge</label>
            <input
              type="number"
              value={settings.deliveryCharge}
              onChange={(e) => updateField('deliveryCharge', Number(e.target.value))}
              className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none"
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
          <div className="flex items-center gap-3 text-slate-500">
            <CreditCard className="h-4 w-4" /> <span className="text-sm font-black uppercase tracking-[0.2em]">Payments & compliance</span>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Currency</span>
                <span className="font-black text-slate-950">{settings.currency}</span>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Low stock threshold</span>
                <span className="font-black text-slate-950">{settings.lowStockThreshold}</span>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-4">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Dark mode</span>
              <button
                type="button"
                onClick={() => updateField('darkMode', !settings.darkMode)}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white"
              >
                {settings.darkMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em] text-slate-500">
          <Percent className="h-4 w-4 text-emerald-500" /> Pricing & tax rules
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Use the settings pane to update pricing logic, gateway defaults, and tax calculations for enterprise checkout flows.</p>
      </section>
    </div>
  );
}
