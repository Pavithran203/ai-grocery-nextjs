"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, X, ArrowLeft, User, Mail, Phone, MapPin, CreditCard,
  Truck, Clock3, CheckCircle2, ShoppingBag, FileText,
} from 'lucide-react';
import { adminFetch } from '@/lib/admin/adminFetch';
import { scanAllCustomerOrders, updateAdminOrderStatus, type CustomerOrder } from '@/lib/admin/customerOrderStore';

const fetchOrders = async () => {
  const res = await adminFetch('/api/admin/orders');
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
};

const updateOrderStatus = async ({ id, ...body }: { id: string; status: string }) => {
  const res = await adminFetch(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to update order' }));
    throw new Error(err.message);
  }
  return res.json();
};

const STATUS_OPTIONS = ['All', 'Pending', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'] as const;

const STATUS_STYLE: Record<string, string> = {
  Pending: 'bg-slate-100 text-slate-700',
  Packed: 'bg-amber-100 text-amber-800',
  'Out for Delivery': 'bg-sky-100 text-sky-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
};

function getNextStatuses(current: string): { status: string; label: string; variant: 'primary' | 'danger' | 'secondary' }[] {
  switch (current) {
    case 'Pending':
      return [
        { status: 'Packed', label: 'Mark Packed', variant: 'primary' },
        { status: 'Cancelled', label: 'Cancel Order', variant: 'danger' },
      ];
    case 'Packed':
      return [
        { status: 'Out for Delivery', label: 'Dispatch for Delivery', variant: 'primary' },
        { status: 'Cancelled', label: 'Cancel Order', variant: 'danger' },
      ];
    case 'Out for Delivery':
      return [{ status: 'Delivered', label: 'Mark Delivered', variant: 'primary' }];
    case 'Cancelled':
      return [{ status: 'Pending', label: 'Restore Order', variant: 'primary' }];
    default:
      return [];
  }
}

function OrderDetailModal({ order, onClose }: { order: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
  });

  const handleStatusChange = async (newStatus: string) => {
    setActionLoading(newStatus);
    try {
      // Update local storage first if it's a customer order
      updateAdminOrderStatus(order.id, newStatus);
      await mutation.mutateAsync({ id: order.id, status: newStatus });
    } finally {
      setActionLoading(null);
    }
  };

  const nextStatuses = getNextStatuses(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-8 pb-16 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-3xl rounded-[32px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-emerald-600">Order {order.id}</p>
              <p className="mt-1 text-sm text-slate-500">
                Placed {new Date(order.placedAt).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <span className={`inline-flex rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] ${STATUS_STYLE[order.status] || 'bg-slate-100 text-slate-700'}`}>
            {order.status}
          </span>
        </div>

        <div className="space-y-8 px-8 py-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                <User className="h-3.5 w-3.5" /> Customer
              </div>
              <p className="mt-3 text-lg font-black text-slate-900">{order.customer}</p>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {order.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {order.phone}</p>
              </div>
              {order.notes && (
                <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">{order.notes}</p>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                <MapPin className="h-3.5 w-3.5" /> Delivery Address
              </div>
              <p className="mt-3 text-sm text-slate-700">{order.address}</p>
              <div className="mt-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                <CreditCard className="h-3.5 w-3.5" /> {order.paymentMethod}
              </div>
              {order.assignedTo && order.assignedTo !== 'Unassigned' && (
                <div className="mt-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                  <Truck className="h-3.5 w-3.5" /> Partner: {order.assignedTo}
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                <Clock3 className="h-3.5 w-3.5 text-slate-400" /> ETA: {order.deliveryEta}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
              <ShoppingBag className="h-3.5 w-3.5" /> Items ({order.items?.length || 0})
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3 text-right">Qty</th>
                    <th className="px-5 py-3 text-right">Price</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0">
                      <td className="px-5 py-3 font-medium text-slate-900">{item.name}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{item.quantity}</td>
                      <td className="px-5 py-3 text-right text-slate-600">₹{item.price}</td>
                      <td className="px-5 py-3 text-right font-black text-slate-900">₹{item.quantity * item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
              <FileText className="h-3.5 w-3.5" /> Payment Summary
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                <div className="flex justify-between text-slate-600"><span>Delivery Fee</span><span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span></div>
                <div className="flex justify-between text-slate-600"><span>Tax</span><span>₹{order.tax}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-slate-900">
                  <span>Total</span><span>₹{order.amount}</span>
                </div>
              </div>
            </div>
          </div>

          {order.statusHistory?.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                <Clock3 className="h-3.5 w-3.5" /> Timeline
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="space-y-0">
                  {order.statusHistory.map((entry: any, idx: number) => {
                    const isLast = idx === order.statusHistory.length - 1;
                    const isCancelled = entry.status === 'Cancelled';
                    return (
                      <div key={idx} className="relative flex gap-4 pb-4 last:pb-0">
                        {!isLast && (
                          <div className={`absolute left-[7px] top-4 h-full w-px ${isCancelled ? 'bg-red-200' : 'bg-emerald-200'}`} />
                        )}
                        <div className="flex flex-col items-center">
                          <div className={`h-3.5 w-3.5 rounded-full border-2 ${
                            isLast
                              ? (isCancelled ? 'border-red-500 bg-red-100' : 'border-emerald-500 bg-emerald-100')
                              : (isCancelled ? 'border-red-300 bg-red-50' : 'border-emerald-300 bg-emerald-50')
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-black ${isLast ? (isCancelled ? 'text-red-700' : 'text-emerald-700') : 'text-slate-700'}`}>
                            {entry.status}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {new Date(entry.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {nextStatuses.length > 0 && (
            <div className="sticky bottom-0 -mx-8 -mb-6 mt-8 rounded-b-[32px] border-t border-slate-200 bg-white px-8 py-5">
              <div className="flex flex-wrap items-center justify-end gap-3">
                {nextStatuses.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => handleStatusChange(action.status)}
                    disabled={mutation.isPending && actionLoading === action.status}
                    className={`rounded-full px-6 py-3 text-[11px] font-black uppercase tracking-[0.25em] transition disabled:opacity-50 ${
                      action.variant === 'danger'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {mutation.isPending && actionLoading === action.status ? 'Updating...' : action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersManager() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['adminOrders'], queryFn: fetchOrders, staleTime: 1000 * 60 * 2 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Load real customer orders from localStorage
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  useEffect(() => {
    const load = () => setCustomerOrders(scanAllCustomerOrders());
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const mutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  // Merge mock orders + real customer orders (deduplicated)
  const orders = useMemo(() => {
    const mockOrders = data?.orders || [];
    const seenIds = new Set<string>();
    const merged: any[] = [];
    customerOrders.forEach(o => { const id = o.id || o._id || ''; if (id && !seenIds.has(id)) { seenIds.add(id); merged.push(o); } });
    mockOrders.forEach((o: any) => { const id = o.id || o._id || ''; if (id && !seenIds.has(id)) { seenIds.add(id); merged.push(o); } });
    merged.sort((a, b) => new Date(b.placedAt || b.createdAt || 0).getTime() - new Date(a.placedAt || a.createdAt || 0).getTime());
    return merged;
  }, [data, customerOrders]);

  const pendingCount = useMemo(() => orders.filter((o: any) => o.status === 'Pending').length, [orders]);
  const cancelledCount = useMemo(() => orders.filter((o: any) => o.status === 'Cancelled').length, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== 'All') {
      result = result.filter((o: any) => o.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o: any) =>
          (o.id || '').toLowerCase().includes(q) ||
          (o.customer || '').toLowerCase().includes(q) ||
          (o.assignedTo || '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [orders, search, statusFilter]);

  const handleQuickAction = (e: React.MouseEvent, order: any, status: string) => {
    e.stopPropagation();
    // Try updating in the customer order store too
    updateAdminOrderStatus(order.id, status);
    mutation.mutate({ id: order.id, status });
    // Refresh customer orders
    setCustomerOrders(scanAllCustomerOrders());
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-emerald-600">Order management</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Live order operations</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Track orders in real time, update statuses, assign deliveries, and review cancellations in one central command center.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-700">Pending orders: {pendingCount}</div>
            <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-red-700">Cancelled: {cancelledCount}</div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders by ID, customer, or partner..."
              className="w-full rounded-full border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'All' ? 'All' : status}
                {status !== 'All' && (
                  <span className="ml-1.5 opacity-60">({orders.filter((o: any) => o.status === status).length})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-[0.2em] text-[11px]">
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Partner</th>
                <th className="px-6 py-4">ETA</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">Loading orders...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-500">Unable to load orders.</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 font-black text-slate-900">{order.id}</td>
                    <td className="px-6 py-4 text-slate-600">{order.customer}</td>
                    <td className="px-6 py-4 font-black text-slate-900">₹{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] ${STATUS_STYLE[order.status] || 'bg-slate-100 text-slate-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{order.assignedTo || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-slate-600">{order.deliveryEta}</td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {order.status === 'Pending' && (
                          <>
                            <button
                              onClick={(e) => handleQuickAction(e, order, 'Packed')}
                              disabled={mutation.isPending}
                              className="rounded-full bg-slate-900 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-white transition hover:bg-slate-800 disabled:opacity-50"
                            >
                              Pack
                            </button>
                            <button
                              onClick={(e) => handleQuickAction(e, order, 'Cancelled')}
                              disabled={mutation.isPending}
                              className="rounded-full bg-red-100 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {order.status === 'Packed' && (
                          <button
                            onClick={(e) => handleQuickAction(e, order, 'Out for Delivery')}
                            disabled={mutation.isPending}
                            className="rounded-full bg-slate-900 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-white transition hover:bg-slate-800 disabled:opacity-50"
                          >
                            Dispatch
                          </button>
                        )}
                        {order.status === 'Out for Delivery' && (
                          <button
                            onClick={(e) => handleQuickAction(e, order, 'Delivered')}
                            disabled={mutation.isPending}
                            className="rounded-full bg-emerald-600 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Deliver
                          </button>
                        )}
                        {order.status === 'Cancelled' && (
                          <button
                            onClick={(e) => handleQuickAction(e, order, 'Pending')}
                            disabled={mutation.isPending}
                            className="rounded-full bg-slate-900 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-white transition hover:bg-slate-800 disabled:opacity-50"
                          >
                            Restore
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-full border border-slate-200 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 transition hover:bg-slate-100"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          { title: 'Fastest delivery', value: '12 min', icon: Truck, color: 'bg-slate-100 text-slate-900' },
          { title: 'Improved fulfillment', value: '98%', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
          { title: 'Pending approvals', value: `${pendingCount}`, icon: Clock3, color: 'bg-amber-100 text-amber-700' },
        ].map((card) => (
          <div key={card.title} className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm ${card.color}`}>
            <div className="flex items-center gap-3">
              <card.icon className="h-5 w-5" />
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{card.title}</p>
            </div>
            <p className="mt-6 text-4xl font-black text-slate-950">{card.value}</p>
          </div>
        ))}
      </section>

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => {
            setSelectedOrder(null);
            setCustomerOrders(scanAllCustomerOrders());
          }} 
        />
      )}
    </div>
  );
}
