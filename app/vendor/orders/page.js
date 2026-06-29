"use client";

import { useEffect, useState } from 'react';
import { vendorApi } from '@/lib/vendor/vendorApi';
import { ShoppingBag, ChevronDown, Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  placed: { label: 'Placed', color: 'bg-blue-100 text-blue-700', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-violet-100 text-violet-700', icon: CheckCircle },
  packed: { label: 'Packed', color: 'bg-indigo-100 text-indigo-700', icon: Package },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-amber-100 text-amber-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const TRANSITIONS = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = () => {
    vendorApi.getOrders()
      .then(data => {
        if (data.success) setOrders(data.orders || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    const data = await vendorApi.updateOrderStatus(orderId, newStatus);
    if (data.success) fetchOrders();
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.orderStatus === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div>
        <h1 className="text-xl font-black text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage and fulfill customer orders for your store.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === status
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600'
            }`}
          >
            {status === 'all' ? 'All' : STATUS_CONFIG[status]?.label || status}
            {status !== 'all' && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({orders.filter(o => o.orderStatus === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-black text-slate-400">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const statusConf = STATUS_CONFIG[order.orderStatus] || { label: order.orderStatus, color: 'bg-slate-100 text-slate-700' };
            const StatusIcon = statusConf.icon || Clock;
            const isExpanded = expandedId === order._id;
            const nextStatuses = TRANSITIONS[order.orderStatus] || [];

            return (
              <div key={order._id} className="rounded-2xl bg-white border border-slate-200 overflow-hidden transition-shadow hover:shadow-md">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">#{order.orderNumber || order._id?.slice(-6)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {order.user?.name || 'Customer'} · ₹{order.total}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusConf.color}`}>
                      {statusConf.label}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                    {/* Order Items */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Items</p>
                      <div className="space-y-2">
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                            <span className="text-sm font-medium text-slate-700">{item.name} × {item.quantity}</span>
                            <span className="text-sm font-bold text-slate-900">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Payment</p>
                        <p className="font-bold text-slate-700 mt-1">{order.paymentMethod || 'COD'}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Placed At</p>
                        <p className="font-bold text-slate-700 mt-1">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Status Actions */}
                    {nextStatuses.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {nextStatuses.map(ns => {
                            const conf = STATUS_CONFIG[ns] || {};
                            return (
                              <button
                                key={ns}
                                onClick={() => handleStatusUpdate(order._id, ns)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                  ns === 'cancelled'
                                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                                    : 'border-violet-200 text-violet-600 hover:bg-violet-50'
                                }`}
                              >
                                Mark as {conf.label || ns}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
