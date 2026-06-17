"use client";

import { useQuery } from '@tanstack/react-query';
import { Download, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { adminFetch } from '@/lib/admin/adminFetch';

const fetchMetrics = async () => {
  const res = await adminFetch('/api/admin/metrics');
  if (!res.ok) throw new Error('Failed to load reports');
  return res.json();
};

export default function ReportsPanel() {
  const { data, isLoading, error } = useQuery({ queryKey: ['adminReports'], queryFn: fetchMetrics, staleTime: 1000 * 60 * 2 });

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-emerald-600">Reports & export</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Executive insights</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Generate PDF and Excel-ready reports for finance, inventory, customer loyalty, and delivery performance.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"><FileText className="h-4 w-4" /> Download PDF</button>
            <button className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-900 transition hover:bg-slate-50"><Download className="h-4 w-4" /> Export Excel</button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {[
          { title: 'Sales report', value: data?.metrics?.revenueToday ? `₹${data.metrics.revenueToday}` : '—', icon: Sparkles, badge: 'Daily' },
          { title: 'Inventory report', value: data?.metrics?.lowStock != null ? `${data.metrics.lowStock} items` : '—', icon: ShieldCheck, badge: 'Low stock' },
          { title: 'Customer report', value: data?.metrics?.activeUsers ? `${data.metrics.activeUsers} active` : '—', icon: FileText, badge: 'Active users' },
        ].map((card) => (
          <div key={card.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-400">
              <card.icon className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.3em]">{card.badge}</span>
            </div>
            <p className="mt-6 text-3xl font-black text-slate-950">{card.value}</p>
            <p className="mt-3 text-sm text-slate-500">Detailed report ready for download and executive review.</p>
          </div>
        ))}
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        {isLoading ? (
          <p className="text-slate-500">Compiling reports...</p>
        ) : error ? (
          <p className="text-red-500">Unable to compile reports.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Revenue trend</p>
              <p className="mt-3 text-2xl font-black text-slate-950">{data.revenueSeries?.length ? `₹${data.revenueSeries[data.revenueSeries.length - 1].revenue}` : '—'}</p>
            </div>
            <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Order pulse</p>
              <p className="mt-3 text-2xl font-black text-slate-950">{data.orderTrends?.length ? `${data.orderTrends[data.orderTrends.length - 1].orders} orders` : '—'}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
