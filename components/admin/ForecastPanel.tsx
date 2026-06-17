"use client";

import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Zap, TrendingUp } from 'lucide-react';
import { adminFetch } from '@/lib/admin/adminFetch';

const fetchMetrics = async () => {
  const res = await adminFetch('/api/admin/metrics');
  if (!res.ok) throw new Error('Failed to load forecasting data');
  return res.json();
};

export default function ForecastPanel() {
  const { data, isLoading, error } = useQuery({ queryKey: ['adminForecast'], queryFn: fetchMetrics, staleTime: 1000 * 60 * 2 });

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-emerald-600">AI forecasting</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Demand prediction</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Sales forecasting, inventory prediction, and purchase behavior modeling for grocery operations.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl bg-emerald-50 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-emerald-800"><Zap className="h-4 w-4" /> AI engine</div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        {isLoading ? (
          <p className="text-slate-500">Loading forecast insights...</p>
        ) : error ? (
          <p className="text-red-500">Forecast service unavailable.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Behavior analytics</p>
              <p className="mt-4 text-3xl font-black text-slate-950">Customer purchase patterns increasing by 16%</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">Recommendation analytics identify high-conversion products and optimize category visibility for next-cycle promotions.</p>
            </div>
            <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
              <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-[0.25em] text-sm"><TrendingUp className="h-4 w-4 text-emerald-600" /> Demand forecast</div>
              <div className="mt-6 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.revenueSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 6" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                    <Legend />
                    <Bar dataKey="revenue" radius={[12, 12, 0, 0]} fill="#2563EB">
                      {data.revenueSeries.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563EB' : '#22C55E'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
