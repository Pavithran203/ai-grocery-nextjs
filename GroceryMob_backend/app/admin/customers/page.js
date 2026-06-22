"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [resetPassword, setResetPassword] = useState("");
    const [resetError, setResetError] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [page, search, filter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch customers
            const { customers: data, pagination: p } = await api.getCustomers(
                page,
                limit,
                search,
                filter === "status" ? "" : "",
                filter === "premium" || filter === "vip" ? filter : ""
            );
            setCustomers(data || []);
            setPagination(p);

            // Fetch stats
            const statsData = await api.getCustomerStats();
            setStats(statsData);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this customer?")) return;
        try {
            await api.deleteCustomer(id);
            setCustomers(customers.filter((c) => c._id !== id));
            setSelectedCustomer(null);
        } catch (err) {
            alert("Failed to delete customer: " + err.message);
        }
    };

    const handleResetPassword = async () => {
        setResetError("");

        if (!resetPassword || resetPassword.length < 6) {
            setResetError("Password must be at least 6 characters long.");
            return;
        }

        setResetLoading(true);
        try {
            await api.resetCustomerPassword(selectedCustomer._id, resetPassword);
            alert("Password reset successfully!");
            setShowPasswordReset(false);
            setResetPassword("");
            setSelectedCustomer(null);
        } catch (err) {
            setResetError("Failed to reset password: " + err.message);
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                    👥 Customers
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage and view all customer details, orders, and loyalty points
                </p>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500 mb-2">Total Customers</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">
                            {stats.totalCustomers}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            {stats.activeCustomers} active
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500 mb-2">Premium Users</p>
                        <p className="text-3xl font-black text-emerald-600">
                            {stats.premiumCustomers}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            {stats.vipCustomers} VIP
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500 mb-2">Avg Order Value</p>
                        <p className="text-3xl font-black text-blue-600">
                            ₹{stats.avgOrderValue?.toFixed(0) || 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Per customer</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500 mb-2">Total Revenue</p>
                        <p className="text-3xl font-black text-green-600">
                            ₹{(stats.totalRevenue || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">From all customers</p>
                    </div>
                </div>
            )}

            {/* Search & Filter */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex gap-4 flex-col md:flex-row">
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={search}
                        onChange={handleSearch}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <select
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">All Account Types</option>
                        <option value="premium">Premium Only</option>
                        <option value="vip">VIP Only</option>
                        <option value="regular">Regular Only</option>
                    </select>
                </div>
            </div>

            {/* Customers Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            ) : customers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl text-center border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No customers found</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Orders
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Spent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Password
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr
                                        key={customer._id}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {customer.firstName} {customer.lastName}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {customer.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {customer.phone}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${customer.accountType === "vip"
                                                    ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                                                    : customer.accountType === "premium"
                                                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                    }`}
                                            >
                                                {customer.accountType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                            {customer.totalOrders}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                            ₹{customer.totalSpent?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${customer.status === "active"
                                                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                                    : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                                                    }`}
                                            >
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${customer.password
                                                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                                : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                                                }`}>
                                                {customer.password ? "✓ Set" : "Not Set"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedCustomer(customer)}
                                                className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Page {pagination.page} of {pagination.pages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                                    disabled={page === pagination.pages}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">{selectedCustomer.email}</p>
                            </div>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Phone</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {selectedCustomer.phone}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Account Type</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {selectedCustomer.accountType}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Status</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {selectedCustomer.status}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Joined</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Stats */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                                    Order Statistics
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Total Orders</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                                            {selectedCustomer.totalOrders}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Total Spent</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                                            ₹{selectedCustomer.totalSpent?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Avg Order Value</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                                            ₹{selectedCustomer.averageOrderValue?.toFixed(0) || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Loyalty Points</p>
                                        <p className="text-2xl font-black text-emerald-600">
                                            {selectedCustomer.loyaltyPoints || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Primary Address */}
                            {selectedCustomer.primaryAddress && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                                        Primary Address
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedCustomer.primaryAddress.street}
                                        <br />
                                        {selectedCustomer.primaryAddress.city},{" "}
                                        {selectedCustomer.primaryAddress.state}{" "}
                                        {selectedCustomer.primaryAddress.pincode}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedCustomer(null)}
                                    className="flex-1 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => setShowPasswordReset(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                                >
                                    Reset Password
                                </button>
                                <button
                                    onClick={() => {
                                        handleDelete(selectedCustomer._id);
                                    }}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordReset && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                            Reset Password
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            for {selectedCustomer.firstName} {selectedCustomer.lastName}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={resetPassword}
                                    onChange={(e) => {
                                        setResetPassword(e.target.value);
                                        setResetError("");
                                    }}
                                    placeholder="Enter new password (min 6 characters)"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {resetError && (
                                <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                                    {resetError}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowPasswordReset(false);
                                        setResetPassword("");
                                        setResetError("");
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
                                    disabled={resetLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={resetLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {resetLoading ? "Resetting..." : "Reset Password"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
