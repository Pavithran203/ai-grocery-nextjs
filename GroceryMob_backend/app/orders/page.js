"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getToken } from "@/services/api";
import { Package, ChevronRight, ArrowLeft, ShoppingBag, XCircle } from "lucide-react";

const STATUS_STEPS = ["placed", "packed", "out_for_delivery", "delivered"];

const statusColor = (s) => ({
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  packed: "bg-amber-100 text-amber-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
}[s] || "bg-gray-100 text-gray-600");

const statusLabel = (s) => ({
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
}[s] || s);

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    api.getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    if (!confirm("Cancel this order?")) return;
    setCancelling(orderId);
    try {
      await api.cancelOrder(orderId);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: "cancelled" } : o));
    } catch (e) {
      alert(e.message || "Could not cancel order.");
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-24 flex justify-center">
      <div className="w-10 h-10 border-4 border-[#5C61F2] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
          <Link href="/" className="bg-[#5C61F2] text-white px-8 py-3 rounded-full font-bold hover:bg-[#4b50d9] transition-colors">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isExpanded = expanded === order._id;
            const stepIndex = STATUS_STEPS.indexOf(order.orderStatus);
            const canCancel = order.orderStatus === "placed";

            return (
              <div key={order._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : order._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#5C61F2]/10 rounded-2xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-[#5C61F2]" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor(order.orderStatus)}`}>
                      {statusLabel(order.orderStatus)}
                    </span>
                    <span className="font-black text-gray-900 dark:text-white">₹{order.total?.toFixed(2)}</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-800 p-5 space-y-5">
                    {/* Track Order Button */}
                    <button
                      onClick={() => router.push(`/orders/${order._id}`)}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-colors"
                    >
                      <Package className="w-5 h-5" />
                      Track Order
                    </button>

                    {/* Progress tracker */}
                    {order.orderStatus !== "cancelled" && (
                      <div className="flex items-center gap-0">
                        {STATUS_STEPS.map((step, i) => (
                          <div key={step} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i <= stepIndex
                                  ? 'bg-[#5C61F2] border-[#5C61F2] text-white'
                                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400'
                                }`}>
                                {i < stepIndex ? '✓' : i + 1}
                              </div>
                              <span className={`text-[10px] font-semibold ${i <= stepIndex ? 'text-[#5C61F2]' : 'text-gray-400'}`}>{statusLabel(step)}</span>
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < stepIndex ? 'bg-[#5C61F2]' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-3">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-50" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price?.toFixed(2)}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">₹{(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm space-y-2">
                      <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{order.subtotal?.toFixed(2)}</span></div>
                      <div className="flex justify-between text-gray-500"><span>Tax (5%)</span><span>₹{order.tax?.toFixed(2)}</span></div>
                      <div className="flex justify-between text-gray-500"><span>Delivery</span><span>{order.deliveryFee === 0 ? <span className="text-emerald-500">Free</span> : `₹${order.deliveryFee}`}</span></div>
                      <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                        <span>Total</span><span>₹{order.total?.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Delivery address */}
                    {order.deliveryAddress && (
                      <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Delivery Address</p>
                        <p>{order.deliveryAddress.full_name} · {order.deliveryAddress.phone}</p>
                        <p>{order.deliveryAddress.line1}{order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ''}</p>
                        <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} – {order.deliveryAddress.pincode}</p>
                      </div>
                    )}

                    {/* Cancel button */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(order._id)}
                        disabled={cancelling === order._id}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-bold disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        {cancelling === order._id ? "Cancelling..." : "Cancel Order"}
                      </button>
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
