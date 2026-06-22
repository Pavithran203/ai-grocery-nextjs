"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getToken } from "@/services/api";
import { ArrowLeft, MapPin, Phone, Clock, TrendingUp, FileText, Package, Truck, CheckCircle2, X } from "lucide-react";

export default function OrderTrackingPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!getToken()) { router.push("/login"); return; }
        if (!id) return;

        api.getOrderById(id)
            .then(setOrder)
            .catch(() => setError("Order not found."))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-24 flex justify-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <p className="text-gray-500 text-lg mb-6">{error || "Order not found."}</p>
                <button
                    onClick={() => router.back()}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-600 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const statusColors = {
        placed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'text-blue-500', lightBg: 'bg-blue-50' },
        confirmed: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: 'text-indigo-500', lightBg: 'bg-indigo-50' },
        packed: { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'text-amber-500', lightBg: 'bg-amber-50' },
        out_for_delivery: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'text-purple-500', lightBg: 'bg-purple-50' },
        delivered: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-500', lightBg: 'bg-emerald-50' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: 'text-red-500', lightBg: 'bg-red-50' },
    };

    const statusLabels = {
        placed: 'Order Placed',
        confirmed: 'Confirmed',
        packed: 'Packed',
        out_for_delivery: 'Out for Delivery',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
    };

    const statusIcons = {
        placed: <Package className="w-5 h-5" />,
        confirmed: <CheckCircle2 className="w-5 h-5" />,
        packed: <Package className="w-5 h-5" />,
        out_for_delivery: <Truck className="w-5 h-5" />,
        delivered: <CheckCircle2 className="w-5 h-5" />,
        cancelled: <X className="w-5 h-5" />,
    };

    const colors = statusColors[order.orderStatus] || statusColors.placed;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors mb-8"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Orders</span>
            </button>

            {/* Order Header */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Order Number</p>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</h1>
                    </div>
                    <span className={`text-sm font-bold px-4 py-2 rounded-full ${colors.bg} ${colors.text}`}>
                        {statusLabels[order.orderStatus]}
                    </span>
                </div>
                <p className="text-gray-500">
                    Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Timeline Tracker */}
                    {order.orderStatus !== 'cancelled' && (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Delivery Status</h2>

                            {/* Tracking Events Timeline */}
                            <div className="space-y-6">
                                {order.trackingEvents && order.trackingEvents.length > 0 ? (
                                    order.trackingEvents.map((event, index) => {
                                        const eventColor = statusColors[event.status] || statusColors.placed;
                                        const isLast = index === order.trackingEvents.length - 1;

                                        return (
                                            <div key={index} className="flex gap-4">
                                                {/* Timeline dot and line */}
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${eventColor.bg} ${eventColor.icon} mb-2`}>
                                                        {statusIcons[event.status]}
                                                    </div>
                                                    {!isLast && (
                                                        <div className="w-1 h-12 bg-gray-200 dark:bg-gray-700" />
                                                    )}
                                                </div>

                                                {/* Event details */}
                                                <div className="pb-6">
                                                    <h3 className={`font-bold ${eventColor.text} mb-1`}>
                                                        {statusLabels[event.status]}
                                                    </h3>
                                                    {event.message && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{event.message}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(event.timestamp).toLocaleDateString('en-IN', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })} at {new Date(event.timestamp).toLocaleTimeString('en-IN', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        {event.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {event.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-sm">No tracking events yet.</p>
                                )}
                            </div>

                            {/* Estimated Delivery */}
                            {order.estimatedDelivery && order.orderStatus !== 'delivered' && (
                                <div className={`mt-6 p-4 rounded-xl ${colors.lightBg} border ${colors.bg}`}>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estimated Delivery</p>
                                    <p className={`text-lg font-bold ${colors.text}`}>
                                        {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}

                            {order.deliveredAt && (
                                <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Delivered On</p>
                                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                                        {new Date(order.deliveredAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })} at {new Date(order.deliveredAt).toLocaleTimeString('en-IN', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Delivery Partner Info */}
                    {order.deliveryPartner && (order.deliveryPartner.name || order.deliveryPartner.phone) && order.orderStatus === 'out_for_delivery' && (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Delivery Partner</h2>
                            <div className="space-y-3">
                                {order.deliveryPartner.name && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Name</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{order.deliveryPartner.name}</span>
                                    </div>
                                )}
                                {order.deliveryPartner.phone && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Contact</span>
                                        <a href={`tel:${order.deliveryPartner.phone}`} className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                            <Phone className="w-4 h-4" />
                                            {order.deliveryPartner.phone}
                                        </a>
                                    </div>
                                )}
                                {order.deliveryPartner.vehicleNumber && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Vehicle</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{order.deliveryPartner.vehicleNumber}</span>
                                    </div>
                                )}
                                {order.deliveryPartner.rating > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Rating</span>
                                        <span className="font-semibold text-amber-600">{'⭐'.repeat(Math.round(order.deliveryPartner.rating))} {order.deliveryPartner.rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Items */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order Items</h2>
                        <div className="space-y-3">
                            {order.items?.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price?.toFixed(2)}</p>
                                    </div>
                                    <p className="font-bold text-gray-900 dark:text-white">₹{(item.quantity * item.price).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Delivery Address */}
                    {order.deliveryAddress && (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-emerald-500" />
                                Delivery Address
                            </h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <p className="font-semibold text-gray-900 dark:text-white">{order.deliveryAddress.full_name}</p>
                                <p>{order.deliveryAddress.phone}</p>
                                <p>{order.deliveryAddress.line1}</p>
                                {order.deliveryAddress.line2 && <p>{order.deliveryAddress.line2}</p>}
                                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} – {order.deliveryAddress.pincode}</p>
                            </div>
                        </div>
                    )}

                    {/* Payment Method */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Payment Method</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-2">{order.paymentMethod}</p>
                        <p className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : order.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus === 'pending' ? 'Pending Payment' : 'Failed'}
                        </p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Price Details</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Tax (5%)</span>
                                <span>₹{order.tax?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Delivery</span>
                                <span>{order.deliveryFee === 0 ? <span className="text-emerald-600">Free</span> : `₹${order.deliveryFee}`}</span>
                            </div>
                            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3 flex justify-between font-bold text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span className="text-lg">₹{order.total?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
