"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function DeliveriesPage() {
    const { user } = useAuth();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDelivery, setSelectedDelivery] = useState(null);

    useEffect(() => {
        if (user?._id) {
            fetchDeliveries();
        }
    }, [user?._id]);

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const { deliveries: data } = await api.getDeliveries(1, 20, "", user._id);
            setDeliveries(data || []);
        } catch (err) {
            console.error("Failed to fetch deliveries:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
            assigned: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
            picked_up:
                "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
            in_transit:
                "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300",
            out_for_delivery:
                "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
            delivered:
                "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
            failed: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
            returned: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
        };
        return colors[status] || colors.pending;
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: "📦",
            assigned: "🚚",
            picked_up: "📍",
            in_transit: "🚗",
            out_for_delivery: "🏃",
            delivered: "✅",
            failed: "❌",
            returned: "↩️",
        };
        return icons[status] || "📦";
    };

    const getStatusLabel = (status) => {
        return status.replace(/_/g, " ").toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                        🚚 My Deliveries
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Track your orders and delivery status in real-time
                    </p>
                </div>

                {/* Deliveries List */}
                {deliveries.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                            📭 No deliveries yet
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                            Your orders will appear here once they are dispatched
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {deliveries.map((delivery) => (
                            <div
                                key={delivery._id}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Delivery Header */}
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                Order #{delivery.orderId?._id?.slice(-6).toUpperCase()}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                ₹{delivery.orderId?.totalAmount?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <button
                                                onClick={() =>
                                                    setSelectedDelivery(
                                                        selectedDelivery?._id === delivery._id ? null : delivery
                                                    )
                                                }
                                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${getStatusColor(
                                                    delivery.status
                                                )}`}
                                            >
                                                {getStatusIcon(delivery.status)}{" "}
                                                {getStatusLabel(delivery.status)}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Details */}
                                <div className="p-6">
                                    {/* Timeline */}
                                    <div className="mb-6">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                            📍 Tracking Timeline
                                        </p>
                                        {delivery.trackingHistory && delivery.trackingHistory.length > 0 ? (
                                            <div className="space-y-3">
                                                {delivery.trackingHistory.slice().reverse().map((event, i) => (
                                                    <div key={i} className="flex gap-4">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                                                            {i < delivery.trackingHistory.length - 1 && (
                                                                <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-600"></div>
                                                            )}
                                                        </div>
                                                        <div className="pb-4">
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                {event.status?.replace(/_/g, " ").toUpperCase()}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {new Date(event.timestamp).toLocaleDateString()}{" "}
                                                                {new Date(event.timestamp).toLocaleTimeString()}
                                                            </p>
                                                            {event.location && (
                                                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                                                    📍 {event.location}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                No tracking updates yet
                                            </p>
                                        )}
                                    </div>

                                    {/* Delivery Address */}
                                    {delivery.deliveryAddress && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                                📍 Delivery Address
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {delivery.deliveryAddress.fullName}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                {delivery.deliveryAddress.street}
                                                <br />
                                                {delivery.deliveryAddress.city},{" "}
                                                {delivery.deliveryAddress.state}{" "}
                                                {delivery.deliveryAddress.pincode}
                                            </p>
                                        </div>
                                    )}

                                    {/* Estimated Delivery */}
                                    {delivery.estimatedDeliveryDate && (
                                        <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                            <div>
                                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">
                                                    ⏱️ Estimated Delivery
                                                </p>
                                                <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mt-1">
                                                    {new Date(
                                                        delivery.estimatedDeliveryDate
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {delivery.daysRemaining !== null && (
                                                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                    {delivery.daysRemaining > 0
                                                        ? `${delivery.daysRemaining} days left`
                                                        : "Today"}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Expand Button */}
                                {selectedDelivery?._id === delivery._id && (
                                    <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="space-y-4">
                                            {delivery.deliveryPersonName && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                                        👤 Delivery Agent
                                                    </p>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                                        {delivery.deliveryPersonName}
                                                    </p>
                                                    {delivery.deliveryPersonPhone && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                                            📞 {delivery.deliveryPersonPhone}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {delivery.status === "delivered" && !delivery.deliveryRating && (
                                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                                    <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">
                                                        ⭐ Rate Your Delivery
                                                    </p>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                onClick={() => {
                                                                    api.rateDelivery(delivery._id, star);
                                                                    fetchDeliveries();
                                                                }}
                                                                className="text-2xl hover:scale-110 transition-transform"
                                                            >
                                                                ⭐
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {delivery.deliveryRating && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                                        Your Rating
                                                    </p>
                                                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                        {"⭐".repeat(delivery.deliveryRating)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
