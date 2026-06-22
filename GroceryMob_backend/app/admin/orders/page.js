"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

const ORDER_STATUSES = ["placed", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"];

const STATUS_LABELS = {
  placed:           "Placed",
  confirmed:        "Confirmed",
  packed:           "Packed",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
};

const statusColors = {
  placed:           "bg-blue-100 text-blue-700",
  confirmed:        "bg-indigo-100 text-indigo-700",
  packed:           "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-yellow-100 text-yellow-700",
  delivered:        "bg-emerald-100 text-emerald-700",
  cancelled:        "bg-red-100 text-red-600",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // order id being updated
  const [error, setError] = useState("");
  const [toast, setToast] = useState(""); // success flash message

  useEffect(() => {
    api
      .getAllOrders()
      .then((data) => setOrders(data || []))
      .catch((err) => setError("Failed to load orders: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: updated.orderStatus } : o
        )
      );
      setToast(`Order #${orderId.slice(-6).toUpperCase()} → ${newStatus}`);
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setError("Failed to update order: " + err.message);
    } finally {
      setUpdating(null);
    }
  };

  // Summary counts
  const counts = {
    placed:           orders.filter((o) => o.orderStatus === "placed").length,
    out_for_delivery: orders.filter((o) => o.orderStatus === "out_for_delivery").length,
    delivered:        orders.filter((o) => o.orderStatus === "delivered").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Order &amp; Delivery Management
          </h1>
          <p className="text-sm text-gray-500">
            Track orders and update delivery status.
          </p>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-bold animate-pulse">
          ✅ {toast}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-2xl">
          <h3 className="text-blue-800 dark:text-blue-300 font-bold">
            New Orders (Placed)
          </h3>
          <p className="text-3xl font-black text-blue-900 dark:text-blue-400 mt-2">
            {loading ? "—" : counts.placed}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-2xl">
          <h3 className="text-yellow-800 dark:text-yellow-300 font-bold">
            In Transit (Shipped)
          </h3>
          <p className="text-3xl font-black text-yellow-900 dark:text-yellow-400 mt-2">
            {loading ? "—" : counts.shipped}
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-2xl">
          <h3 className="text-emerald-800 dark:text-emerald-300 font-bold">
            Delivered
          </h3>
          <p className="text-3xl font-black text-emerald-900 dark:text-emerald-400 mt-2">
            {loading ? "—" : counts.delivered}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="p-4 font-bold text-gray-900 dark:text-white">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold">
                        {order.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.user?.email || ""}
                      </p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          statusColors[order.orderStatus] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">
                      ₹{order.total?.toFixed(2)}
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="p-4 text-center">
                      {order.orderStatus === "delivered" ||
                      order.orderStatus === "cancelled" ? (
                        <span className="text-gray-400 text-xs italic">
                          Finalized
                        </span>
                      ) : (
                        <select
                          id={`order-status-${order._id}`}
                          value={order.orderStatus}
                          disabled={updating === order._id}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs px-2 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
