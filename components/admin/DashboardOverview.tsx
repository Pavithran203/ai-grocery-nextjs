"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, BarChart3, Box, Package, ShoppingBag, Sparkles, User, Zap, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { adminFetch } from '@/lib/admin/adminFetch';
import { scanAllCustomerOrders, type CustomerOrder } from '@/lib/admin/customerOrderStore';
import Link from 'next/link';

const fetchMetrics = async () => {
  const res = await adminFetch('/api/admin/metrics');
  if (!res.ok) throw new Error('Failed to load dashboard metrics');
  return res.json();
};

const fetchMockOrders = async () => {
  const res = await adminFetch('/api/admin/orders');
  if (!res.ok) throw new Error('Failed to load dashboard orders');
  return res.json();
};

const formatter = new Intl.NumberFormat('en-IN');

export default function DashboardOverview() {
  const { data: metricsData, isLoading: metricsLoading, error: metricsError } = useQuery({ 
    queryKey: ['adminMetrics'], 
    queryFn: fetchMetrics, 
    staleTime: 1000 * 60 * 2 
  });

  const { data: mockOrdersData, isLoading: mockOrdersLoading } = useQuery({
    queryKey: ['adminOrdersList'],
    queryFn: fetchMockOrders,
    staleTime: 1000 * 30
  });

  // Load real customer orders from localStorage
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  
  useEffect(() => {
    const loadCustomerOrders = () => {
      const orders = scanAllCustomerOrders();
      setCustomerOrders(orders);
    };
    loadCustomerOrders();
    // Re-scan periodically to catch new orders
    const interval = setInterval(loadCustomerOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Merge mock orders + real customer orders (deduplicated)
  const allOrders = useMemo(() => {
    const mockOrders = mockOrdersData?.orders || [];
    const seenIds = new Set<string>();
    const merged: any[] = [];

    // Customer orders first (most recent)
    customerOrders.forEach(o => {
      const id = o.id || o._id || '';
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        merged.push(o);
      }
    });

    // Then mock orders
    mockOrders.forEach((o: any) => {
      const id = o.id || o._id || '';
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        merged.push(o);
      }
    });

    // Sort newest first
    merged.sort((a, b) => {
      const dateA = new Date(a.placedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.placedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return merged;
  }, [mockOrdersData, customerOrders]);

  // Compute live metrics from all orders
  const liveMetrics = useMemo(() => {
    if (!metricsData?.metrics) return null;
    const base = metricsData.metrics;

    const customerOrderCount = customerOrders.length;
    const customerRevenue = customerOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    return {
      ...base,
      totalOrders: base.totalOrders + customerOrderCount,
      revenueToday: base.revenueToday + customerRevenue,
    };
  }, [metricsData, customerOrders]);

  const recentOrders = allOrders.slice(0, 8);

  if (metricsLoading) {
    return <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center text-slate-600">Loading dashboard data...</div>;
  }

  if (metricsError || !liveMetrics) {
    return <div className="rounded-[32px] border border-red-100 bg-red-50 p-10 text-center text-red-700">Unable to load dashboard metrics.</div>;
  }

  const statTiles = [
    { key: 'totalOrders', label: 'Total Orders', icon: ShoppingBag, accent: 'from-emerald-500 to-teal-400', value: liveMetrics.totalOrders },
    { key: 'revenueToday', label: 'Revenue Today', icon: BarChart3, accent: 'from-sky-500 to-violet-500', value: `₹${formatter.format(liveMetrics.revenueToday)}` },
    { key: 'activeUsers', label: 'Active Users', icon: User, accent: 'from-fuchsia-500 to-pink-500', value: liveMetrics.activeUsers },
    { key: 'activePartners', label: 'Active Partners', icon: Box, accent: 'from-amber-500 to-orange-500', value: liveMetrics.activePartners },
  ];

  // Compute order status breakdown
  const statusBreakdown = allOrders.reduce((acc: Record<string, number>, o: any) => {
    const s = String(o.status || 'Pending');
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const getStatusBadge = (status: string) => {
    const s = String(status).toLowerCase();
    if (s === 'delivered') return 'bg-emerald-100 text-emerald-800';
    if (s === 'cancelled') return 'bg-red-100 text-red-800';
    if (s === 'pending' || s === 'placed') return 'bg-amber-100 text-amber-800';
    if (s === 'packed') return 'bg-blue-100 text-blue-800';
    if (s === 'out for delivery') return 'bg-sky-100 text-sky-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Executive Summary */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/20">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-emerald-600">Executive summary</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Operations dashboard</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Real-time performance indicators from orders, inventory, delivery, and user activity with enterprise-grade visibility.</p>
          </div>
          <div className="flex items-center gap-3">
            {customerOrders.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black uppercase tracking-[0.25em] text-emerald-700 shadow-sm">
                <TrendingUp className="h-4 w-4" />
                {customerOrders.length} Live orders
              </div>
            )}
            <div className="inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black uppercase tracking-[0.25em] text-slate-700 shadow-sm">AI Forecasting Live</div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div key={tile.key} className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className={`inline-flex items-center gap-3 rounded-full bg-gradient-to-r ${tile.accent} px-4 py-3 text-white`}>
                  <Icon className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.35em]">{tile.label}</span>
                </div>
                <p className="mt-6 text-4xl font-black tracking-tight text-slate-950">{tile.value}</p>
                <p className="mt-3 text-sm text-slate-500">Latest snapshot from the operations feed.</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Order Status Breakdown */}
      {Object.keys(statusBreakdown).length > 0 && (
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-500">Order breakdown</p>
              <h3 className="mt-3 text-2xl font-black text-slate-950">Status Distribution</h3>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700">
              {allOrders.length} total
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { label: 'Pending', color: 'from-amber-400 to-orange-400', bg: 'bg-amber-50', text: 'text-amber-800' },
              { label: 'Packed', color: 'from-blue-400 to-indigo-400', bg: 'bg-blue-50', text: 'text-blue-800' },
              { label: 'Out for Delivery', color: 'from-sky-400 to-cyan-400', bg: 'bg-sky-50', text: 'text-sky-800' },
              { label: 'Delivered', color: 'from-emerald-400 to-teal-400', bg: 'bg-emerald-50', text: 'text-emerald-800' },
              { label: 'Cancelled', color: 'from-red-400 to-rose-400', bg: 'bg-red-50', text: 'text-red-800' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border border-slate-100 ${s.bg} p-5`}>
                <div className={`inline-flex rounded-full bg-gradient-to-r ${s.color} px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white mb-3`}>
                  {s.label}
                </div>
                <p className={`text-3xl font-black ${s.text}`}>{statusBreakdown[s.label] || 0}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Demand Curve & Stock Alerts */}
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-500">Order trends</p>
              <h3 className="mt-3 text-2xl font-black text-slate-950">Weekly demand curve</h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-emerald-700">Forecast ready</div>
          </div>

          <div className="mt-8 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsData.orderTrends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 24, border: '1px solid #E2E8F0' }} />
                <Line type="monotone" dataKey="orders" stroke="#059669" strokeWidth={3} dot={false} />
                <Area type="monotone" dataKey="revenue" stroke="none" fill="url(#lineRevenue)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-500">Low stock alerts</p>
                <h3 className="mt-3 text-xl font-black text-slate-950">Inventory risk list</h3>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-700">Watchlist</div>
            </div>
            <div className="mt-6 space-y-3">
              {metricsData.lowStockProducts.map((item: any) => (
                <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-black text-slate-950">{item.name}</p>
                      <p className="mt-1 text-sm uppercase tracking-[0.2em] text-slate-500">{item.category}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-amber-700">{item.stock} left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-500">Inventory actions</p>
                <h3 className="mt-3 text-xl font-black text-slate-950">Auto restocking insights</h3>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700"><Zap className="h-4 w-4 text-emerald-600" /> AI suggestions</div>
            </div>
            <div className="mt-6 space-y-4">
              {metricsData.inventoryAlerts.map((alert: any) => (
                <div key={alert.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <p className="font-black text-slate-950">{alert.product}</p>
                  <p className="mt-1 text-sm text-slate-500">{alert.issue} in {alert.warehouse} — Qty: {alert.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Orders Feed Section */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-500">Real-time status</p>
            <h3 className="mt-3 text-2xl font-black text-slate-950">Recent Customer Orders</h3>
            <p className="mt-1 text-sm text-slate-500">Showing all orders including customer checkouts from the web app.</p>
          </div>
          <Link 
            href="/admin/orders" 
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700 hover:bg-emerald-100 transition"
          >
            Manage all orders <ArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-slate-500">No recent orders placed.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Placed At</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {recentOrders.map((order: any) => {
                  const placedDate = order.placedAt || order.createdAt;
                  const formattedDate = placedDate ? new Date(placedDate).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  }) : 'N/A';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-black text-slate-900">{String(order.id).substring(0, 16)}</td>
                      <td className="py-4 px-4">{order.customer}</td>
                      <td className="py-4 px-4 flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Clock className="h-3.5 w-3.5" /> {formattedDate}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </td>
                      <td className="py-4 px-4 font-black text-emerald-600">₹{order.amount}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link 
                          href="/admin/orders" 
                          className="text-xs font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-800"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Revenue Forecast Area & Shortcuts */}
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-500">Sales pulse</p>
              <h3 className="mt-3 text-2xl font-black text-slate-950">Monthly revenue forecast</h3>
            </div>
          </div>
          <div className="mt-8 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsData.revenueSeries} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 24, border: '1px solid #E2E8F0' }} formatter={(value: number) => `₹${formatter.format(value)}`} />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-500">Quick actions</p>
              <h3 className="mt-3 text-2xl font-black text-slate-950">Operations shortcuts</h3>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700">Priority</div>
          </div>
          <div className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Create flash sale', description: 'Launch limited-time offers by category.' },
                { label: 'Assign delivery', description: 'Quickly reroute nearby partners.' },
              ].map((tile) => (
                <div key={tile.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                  <p className="font-black text-slate-950">{tile.label}</p>
                  <p className="mt-2 text-sm text-slate-500">{tile.description}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-950 to-slate-900 px-5 py-6 text-white shadow-lg">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">AI product recommendation</p>
              <p className="mt-3 text-2xl font-black">Boost cross-sell conversion by 18%.</p>
              <p className="mt-4 text-sm text-slate-200">The recommendation engine uses order histories and inventory velocity to suggest optimal bundle and pricing updates for high-performing categories.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
