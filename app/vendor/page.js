"use client";

import { useEffect, useState } from 'react';
import { useVendorAuth } from '@/lib/vendor/useVendorAuth';
import { vendorApi } from '@/lib/vendor/vendorApi';
import {
  ShoppingBag, Clock, IndianRupee, AlertTriangle, XCircle,
  Package, TrendingUp, ArrowUpRight
} from 'lucide-react';

export default function VendorDashboardPage() {
  const { store } = useVendorAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorApi.getDashboard()
      .then(data => {
        if (data.success) setDashboard(data.dashboard);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  // Fallback stats when backend is not connected
  const stats = dashboard || {
    todayOrders: 12,
    pendingOrdersCount: 4,
    totalRevenue: 48750,
    lowStockProducts: [],
    outOfStockProducts: [],
    recentlyUpdated: [],
  };

  const statCards = [
    { label: "Today's Orders", value: stats.todayOrders, icon: ShoppingBag, color: 'violet', bg: 'from-violet-500 to-purple-600' },
    { label: 'Pending Orders', value: stats.pendingOrdersCount, icon: Clock, color: 'amber', bg: 'from-amber-500 to-orange-600' },
    { label: 'Total Revenue', value: `₹${Number(stats.totalRevenue).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'emerald', bg: 'from-emerald-500 to-teal-600' },
    { label: 'Low Stock Items', value: (stats.lowStockProducts?.length || 0), icon: AlertTriangle, color: 'rose', bg: 'from-rose-500 to-red-600' },
  ];

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/20" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/20" />
        </div>
        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-200 mb-2">Welcome back</p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{store?.name || 'Your Store'}</h1>
          <p className="mt-2 text-sm text-violet-200 font-medium max-w-lg">
            Here&apos;s a summary of your store performance. Manage your products, track orders, and grow your business.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="rounded-2xl bg-white border border-slate-200/80 p-5 hover:shadow-lg hover:shadow-slate-200/40 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.bg} text-white shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Low Stock + Out of Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Low Stock Alert</h3>
          </div>
          {(stats.lowStockProducts?.length || 0) === 0 ? (
            <p className="text-sm text-slate-400 font-medium py-6 text-center">All products are well-stocked 🎉</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStockProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                  <span className="text-sm font-bold text-slate-700">{p.name}</span>
                  <span className="text-xs font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Out of Stock */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6">
          <div className="flex items-center gap-2 mb-5">
            <XCircle className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Out of Stock</h3>
          </div>
          {(stats.outOfStockProducts?.length || 0) === 0 ? (
            <p className="text-sm text-slate-400 font-medium py-6 text-center">No items out of stock 🎉</p>
          ) : (
            <div className="space-y-3">
              {stats.outOfStockProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                  <span className="text-sm font-bold text-slate-700">{p.name}</span>
                  <span className="text-xs font-black text-red-600 bg-red-100 px-2 py-1 rounded-lg">Out of Stock</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-5">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Product', href: '/vendor/add-product', icon: Package, color: 'bg-violet-100 text-violet-600' },
            { label: 'View Orders', href: '/vendor/orders', icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
            { label: 'Manage Inventory', href: '/vendor/inventory', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Store Profile', href: '/vendor/store-profile', icon: Package, color: 'bg-amber-100 text-amber-600' },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <a
                key={i}
                href={action.href}
                className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 p-5 hover:bg-slate-50 hover:border-slate-200 transition-all group"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-600">{action.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
