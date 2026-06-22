"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function AdminDeliveriesPage() {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [filterStatus, setFilterStatus] = useState("");
    const [assigningPerson, setAssigningPerson] = useState(null);
    const [personDatas, setPersonData] = useState("");
    const [stats, setStats] = useState(null);
    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        fetchDeliveries();
        fetchStats();
    }, [filterStatus, page]);

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const { deliveries: data } = await api.getDeliveries(
                page,
                limit,
                filterStatus
            );
            setDeliveries(data || []);
        } catch (err) {
            console.error("Failed to fetch deliveries:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const statsData = await api.getDeliveryStats();
            setStats(statsData);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        }
    };

    const handleAssignPerson = async (deliveryId) => {
        if (!personDatas.trim()) {
            alert("Enter delivery person name and phone");
            return;
        }
        try {
            const [name, phone] = personDatas.split(",").map((s) => s.trim());
            await api.updateDelivery(deliveryId, {
                deliveryPersonName: name,
                deliveryPersonPhone: phone,
                status: "assigned",
            });
            setAssigningPerson(null);
            setPersonData("");
            fetchDeliveries();
        } catch (err) {
            console.error("Failed to assign delivery person:", err);
            alert("Error assigning delivery person");
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

    if (loading && deliveries.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                        🚚 Delivery Management
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Manage all deliveries and track shipments
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            📦 Total Deliveries
                        </p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                            {stats.totalDeliveries || 0}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            ✅ Delivered
                        </p>
                        <p className="text-3xl font-black text-green-600 mt-2">
                            {stats.deliveredCount || 0}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            🚗 In Transit
                        </p>
                        <p className="text-3xl font-black text-orange-600 mt-2">
                            {stats.inTransitCount || 0}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            ⭐ Avg Rating
                        </p>
                        <p className="text-3xl font-black text-blue-600 mt-2">
                            {stats.averageRating?.toFixed(1) || "N/A"}
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3">
                    Filter by Status:
                </label>
                <select
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setPage(1);
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="in_transit">In Transit</option>
                    <option value="out_for_delivery">Out For Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            {/* Deliveries Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {deliveries.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                            🚫 No deliveries found
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Delivery Person
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Est. Delivery
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveries.map((delivery) => (
                                    <tr
                                        key={delivery._id}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                            #{delivery.orderId?._id?.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(delivery.status)}`}>
                                                {getStatusIcon(delivery.status)}{" "}
                                                {getStatusLabel(delivery.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {delivery.deliveryPersonName || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                            ₹{delivery.orderId?.totalAmount?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {delivery.estimatedDeliveryDate
                                                ? new Date(
                                                    delivery.estimatedDeliveryDate
                                                ).toLocaleDateString()
                                                : "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() =>
                                                    setSelectedDelivery(
                                                        selectedDelivery?._id === delivery._id
                                                            ? null
                                                            : delivery
                                                    )
                                                }
                                                className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedDelivery && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                Delivery #{selectedDelivery.orderId?._id?.slice(-6).toUpperCase()}
                            </h2>
                            <button
                                onClick={() => setSelectedDelivery(null)}
                                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                    Current Status
                                </p>
                                <span
                                    className={`px-4 py-2 rounded-lg text-sm font-bold inline-block ${getStatusColor(
                                        selectedDelivery.status
                                    )}`}
                                >
                                    {getStatusIcon(selectedDelivery.status)}{" "}
                                    {getStatusLabel(selectedDelivery.status)}
                                </span>
                            </div>

                            {/* Delivery Person Assignment */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                                <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3">
                                    👤 Delivery Person
                                </p>
                                {selectedDelivery.deliveryPersonName ? (
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                            {selectedDelivery.deliveryPersonName}
                                        </p>
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            📞 {selectedDelivery.deliveryPersonPhone}
                                        </p>
                                    </div>
                                ) : assigningPerson === selectedDelivery._id ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Name, Phone"
                                            value={personDatas}
                                            onChange={(e) => setPersonData(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-blue-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleAssignPerson(selectedDelivery._id)
                                                }
                                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700"
                                            >
                                                Assign
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAssigningPerson(null);
                                                    setPersonData("");
                                                }}
                                                className="flex-1 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setAssigningPerson(selectedDelivery._id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700"
                                    >
                                        Assign Person
                                    </button>
                                )}
                            </div>

                            {/* Tracking History */}
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                                    📍 Tracking History
                                </p>
                                {selectedDelivery.trackingHistory &&
                                    selectedDelivery.trackingHistory.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedDelivery.trackingHistory
                                            .slice()
                                            .reverse()
                                            .map((event, i) => (
                                                <div key={i} className="flex gap-3">
                                                    <div className="flex flex-col items-center mt-1">
                                                        <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>
                                                        {i < selectedDelivery.trackingHistory.length - 1 && (
                                                            <div className="w-0.5 h-10 bg-gray-300 dark:bg-gray-600"></div>
                                                        )}
                                                    </div>
                                                    <div className="pb-2">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {event.status?.replace(/_/g, " ").toUpperCase()}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(event.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No tracking updates
                                    </p>
                                )}
                            </div>

                            {/* Delivery Address */}
                            {selectedDelivery.deliveryAddress && (
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                                        📍 Delivery Address
                                    </p>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {selectedDelivery.deliveryAddress.fullName}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                            {selectedDelivery.deliveryAddress.street}
                                            <br />
                                            {selectedDelivery.deliveryAddress.city},{" "}
                                            {selectedDelivery.deliveryAddress.state}{" "}
                                            {selectedDelivery.deliveryAddress.pincode}
                                        </p>
                                        {selectedDelivery.deliveryAddress.phone && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                                📞 {selectedDelivery.deliveryAddress.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Rating */}
                            {selectedDelivery.deliveryRating && (
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                                        ⭐ Customer Rating
                                    </p>
                                    <p className="text-lg">{"⭐".repeat(selectedDelivery.deliveryRating)}</p>
                                    {selectedDelivery.deliveryFeedback && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                            {selectedDelivery.deliveryFeedback}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {deliveries.length > 0 && (
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                        ← Previous
                    </button>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Page {page}
                    </p>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={deliveries.length < limit}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-emerald-700"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
