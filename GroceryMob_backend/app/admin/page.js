"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch customer stats
      const customerStats = await api.getCustomerStats();
      setStats(customerStats);

      // Fetch products
      const prods = await api.getProducts();
      setProducts(prods.slice(0, 4) || []);

      // Fetch orders
      const ords = await api.getAllOrders();
      setOrders(ords.slice(0, 5) || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/50 text-yellow-600";
      case "confirmed":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50 text-blue-600";
      case "dispatched":
        return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50 text-emerald-600";
      case "delivered":
        return "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/50 text-green-600";
      case "cancelled":
        return "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50 text-red-600";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-900/50 text-gray-600";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your core business metrics at a glance.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 mb-1">
                  Total Revenue
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  ₹{(stats.totalRevenue || 0).toLocaleString()}
                </p>
                <div className="mt-4 flex items-center text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 w-max px-2 py-1 rounded-md font-bold">
                  From {stats.totalCustomers} customers
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 mb-1">
                  Total Customers
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {stats.totalCustomers || 0}
                </p>
                <div className="mt-4 flex items-center text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 w-max px-2 py-1 rounded-md font-bold">
                  {stats.activeCustomers || 0} active
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 mb-1">
                  Premium Customers
                </p>
                <p className="text-3xl font-black text-blue-600">
                  {stats.premiumCustomers || 0}
                </p>
                <div className="mt-4 flex items-center text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 w-max px-2 py-1 rounded-md font-bold">
                  {stats.vipCustomers || 0} VIP
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 mb-1">
                  Avg Order Value
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  ₹{(stats.avgOrderValue || 0).toFixed(0)}
                </p>
                <div className="mt-4 flex items-center text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 w-max px-2 py-1 rounded-md font-bold">
                  Per customer
                </div>
              </div>
            </div>
          )}

          {/* Products & Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  📦 Latest Products
                </h2>
                <a
                  href="/admin/products"
                  className="text-sm text-emerald-600 font-semibold hover:underline"
                >
                  View All
                </a>
              </div>
              {products.length === 0 ? (
                <p className="text-sm text-gray-500">No products found</p>
              ) : (
                <ul className="space-y-4">
                  {products.map((product, i) => (
                    <li
                      key={product._id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                            {product.name}
                          </span>
                          <p className="text-xs text-gray-500">
                            ₹{product.price?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 whitespace-nowrap ml-2">
                        {product.category}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  📋 Recent Orders
                </h2>
                <a
                  href="/admin/orders"
                  className="text-sm text-emerald-600 font-semibold hover:underline"
                >
                  Manage
                </a>
              </div>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-500">No orders found</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className={`flex justify-between p-4 border rounded-xl ${getOrderStatusColor(
                        order.orderStatus || "pending"
                      )}`}
                    >
                      <div>
                        <p className="text-sm font-bold">#{order._id?.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          ₹{order.totalAmount?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold bg-white dark:bg-gray-800 px-2 py-1 rounded-md">
                          {(order.orderStatus || "pending").toUpperCase()}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
