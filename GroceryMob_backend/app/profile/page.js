"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import {
  User, MapPin, Plus, Trash2, LogOut, Save,
  Loader2, Package, ChevronRight, ChevronDown,
  Phone, Mail, ShoppingBag, XCircle, CheckCircle2,
  Truck, Archive
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_META = {
  placed: { label: "Placed", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: <ShoppingBag className="w-3 h-3" /> },
  confirmed: { label: "Confirmed", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", icon: <CheckCircle2 className="w-3 h-3" /> },
  packed: { label: "Packed", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: <Archive className="w-3 h-3" /> },
  out_for_delivery: { label: "Out for Delivery", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: <Truck className="w-3 h-3" /> },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: <XCircle className="w-3 h-3" /> },
};
const STATUS_STEPS = ["placed", "packed", "out_for_delivery", "delivered"];

const inputCls = "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C61F2]/50 text-sm transition";

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isLoggedIn, loading: authLoading, logout } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState("regular");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success" });

  // addresses
  const [addresses, setAddresses] = useState([]);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "Home", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
  const [addrSaving, setAddrSaving] = useState(false);

  // orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push("/login");
  }, [authLoading, isLoggedIn, router]);

  // Populate form from authUser
  useEffect(() => {
    if (authUser) {
      setName(authUser.name || "");
      setPhone(authUser.phone || "");
      setAccountType(authUser.accountType || "regular");
      setAddresses(authUser.addresses || []);
    }
  }, [authUser]);

  // Fetch orders
  useEffect(() => {
    if (!isLoggedIn) return;
    api.getMyOrders()
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [isLoggedIn]);

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "success" }), 3000);
  };

  // ── Save profile ────────────────────────────────────────────────
  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ name, phone, accountType });
      flash("Profile updated successfully!");
    } catch (e) {
      flash(e.message || "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Add address ─────────────────────────────────────────────────
  const addAddress = async () => {
    if (!newAddr.full_name || !newAddr.line1 || !newAddr.city || !newAddr.pincode) {
      flash("Please fill all required fields.", "error"); return;
    }
    setAddrSaving(true);
    try {
      const updated = await api.addAddress(newAddr);
      setAddresses(updated?.addresses || updated?.user?.addresses || [...addresses, newAddr]);
      setShowAddAddr(false);
      setNewAddr({ label: "Home", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
      flash("Address added!");
    } catch (e) {
      flash(e.message || "Failed to add address.", "error");
    } finally {
      setAddrSaving(false);
    }
  };

  // ── Delete address ──────────────────────────────────────────────
  const deleteAddress = async (id) => {
    if (!confirm("Remove this address?")) return;
    try {
      const updated = await api.deleteAddress(id);
      setAddresses(updated?.addresses || updated?.user?.addresses || addresses.filter(a => a._id !== id));
      flash("Address removed.");
    } catch (e) {
      flash(e.message || "Failed.", "error");
    }
  };

  // ── Logout ──────────────────────────────────────────────────────
  const handleLogout = () => { logout(); router.push("/login"); };

  // ── Loading state ───────────────────────────────────────────────
  if (authLoading) return (
    <div className="flex justify-center py-32">
      <div className="w-10 h-10 border-4 border-[#5C61F2] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isLoggedIn) return null;

  const initials = authUser?.name
    ? authUser.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#5C61F2] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-300/30">
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{authUser?.name || "My Profile"}</h1>
            {authUser && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${(authUser?.accountType || 'regular') === 'vip'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : (authUser?.accountType || 'regular') === 'premium'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                {(authUser?.accountType || 'regular') === 'vip' && '👑 VIP'}
                {(authUser?.accountType || 'regular') === 'premium' && '⭐ Premium'}
                {(authUser?.accountType || 'regular') === 'regular' && '🎯 Regular'}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> {authUser?.email}
          </p>
        </div>
      </div>

      {/* ── Flash message ── */}
      {msg.text && (
        <div className={`p-3.5 rounded-xl text-sm font-medium border flex items-center gap-2 ${msg.type === "error"
          ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900"
          : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
          }`}>
          {msg.type === "error" ? "⚠️" : "✅"} {msg.text}
        </div>
      )}

      {/* ════════ 1. Personal Info ════════ */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-[#5C61F2]" /> Personal Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              className={inputCls}
            />
          </div>
          <div>
            <label className="flex text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide items-center gap-1">
              <Phone className="w-3 h-3" /> Phone
            </label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Account Type</label>
            <select
              value={accountType}
              onChange={e => setAccountType(e.target.value)}
              className={inputCls}
            >
              <option value="regular">🎯 Regular</option>
              <option value="premium">⭐ Premium</option>
              <option value="vip">👑 VIP</option>
            </select>
            <p className="text-[10px] text-gray-400 mt-2">
              {accountType === 'regular' && 'Standard customer account'}
              {accountType === 'premium' && 'Premium benefits with exclusive discounts'}
              {accountType === 'vip' && 'VIP treatment with priority service'}
            </p>
          </div>
        </div>

        <div>
          <label className="flex text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide items-center gap-1">
            <Mail className="w-3 h-3" /> Email
          </label>
          <input value={authUser?.email || ""} disabled className={inputCls + " opacity-50 cursor-not-allowed"} />
          <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed.</p>
        </div>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="flex items-center gap-2 bg-[#5C61F2] hover:bg-[#4b50d9] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </section>

      {/* ════════ 2. Saved Addresses ════════ */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#5C61F2]" /> Saved Addresses
          </h2>
          <button
            onClick={() => setShowAddAddr(!showAddAddr)}
            className="flex items-center gap-1 text-sm font-bold text-[#5C61F2] hover:underline"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>

        {addresses.length === 0 && !showAddAddr && (
          <div className="text-center py-6 text-gray-400">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No saved addresses yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr._id} className="flex items-start justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#5C61F2] bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mb-2">
                  {addr.label || "Home"}
                </span>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{addr.fullName || addr.full_name}</p>
                {addr.phone && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{addr.phone}</p>}
                <p className="text-xs text-gray-500 mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                <p className="text-xs text-gray-500">{addr.city}, {addr.state} – {addr.pincode}</p>
              </div>
              <button onClick={() => deleteAddress(addr._id)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add address form */}
        {showAddAddr && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Label</label>
                <select value={newAddr.label} onChange={e => setNewAddr(p => ({ ...p, label: e.target.value }))} className={inputCls}>
                  <option>Home</option><option>Work</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Full Name *</label>
                <input value={newAddr.full_name} onChange={e => setNewAddr(p => ({ ...p, full_name: e.target.value }))} className={inputCls} placeholder="Recipient name" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Phone</label>
              <input value={newAddr.phone} onChange={e => setNewAddr(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="Mobile number" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Address Line 1 *</label>
              <input value={newAddr.line1} onChange={e => setNewAddr(p => ({ ...p, line1: e.target.value }))} className={inputCls} placeholder="Flat / Street" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Address Line 2</label>
              <input value={newAddr.line2} onChange={e => setNewAddr(p => ({ ...p, line2: e.target.value }))} className={inputCls} placeholder="Area / Landmark" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">City *</label>
                <input value={newAddr.city} onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))} className={inputCls} placeholder="Chennai" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">State</label>
                <input value={newAddr.state} onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))} className={inputCls} placeholder="Tamil Nadu" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Pincode *</label>
                <input value={newAddr.pincode} onChange={e => setNewAddr(p => ({ ...p, pincode: e.target.value }))} className={inputCls} placeholder="600001" maxLength={6} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={addAddress} disabled={addrSaving} className="bg-[#5C61F2] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#4b50d9] disabled:opacity-60 transition-colors">
                {addrSaving ? "Saving…" : "Save Address"}
              </button>
              <button onClick={() => setShowAddAddr(false)} className="px-5 py-2 rounded-xl font-bold text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ════════ 3. Order History ════════ */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-[#5C61F2]" /> Order History
          {orders.length > 0 && (
            <span className="ml-auto text-xs font-bold bg-[#5C61F2]/10 text-[#5C61F2] px-2.5 py-0.5 rounded-full">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          )}
        </h2>

        {ordersLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 border-3 border-[#5C61F2] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No orders placed yet.</p>
            <Link href="/products" className="inline-block mt-3 text-sm font-bold text-[#5C61F2] hover:underline">
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const isOpen = expanded === order._id;
              const meta = STATUS_META[order.orderStatus] || STATUS_META.placed;
              const stepIdx = STATUS_STEPS.indexOf(order.orderStatus);
              const canCancel = order.orderStatus === "placed";

              return (
                <div key={order._id} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                  {/* Row */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : order._id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-[#5C61F2]/10 rounded-xl flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-[#5C61F2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        &nbsp;·&nbsp;{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.color}`}>
                        {meta.icon} {meta.label}
                      </span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">₹{order.total?.toFixed(0)}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isOpen && (
                    <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-4 bg-gray-50/50 dark:bg-gray-800/30">

                      {/* Progress bar */}
                      {order.orderStatus !== "cancelled" && (
                        <div className="flex items-center">
                          {STATUS_STEPS.map((step, i) => (
                            <div key={step} className="flex items-center flex-1 last:flex-none">
                              <div className="flex flex-col items-center gap-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${i <= stepIdx
                                  ? "bg-[#5C61F2] border-[#5C61F2] text-white"
                                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400"
                                  }`}>
                                  {i < stepIdx ? "✓" : i + 1}
                                </div>
                                <span className={`text-[9px] font-bold ${i <= stepIdx ? "text-[#5C61F2]" : "text-gray-400"}`}>{STATUS_META[step]?.label || step}</span>
                              </div>
                              {i < STATUS_STEPS.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-1 mb-4 rounded ${i < stepIdx ? "bg-[#5C61F2]" : "bg-gray-200 dark:bg-gray-700"}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-900 p-3 rounded-xl">
                            {item.image
                              ? <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" onError={e => { e.target.style.display = 'none'; }} />
                              : <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-lg">🛒</div>
                            }
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                              <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price?.toFixed(2)}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">₹{(item.quantity * item.price).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center bg-white dark:bg-gray-900 rounded-xl px-4 py-3 font-bold text-sm text-gray-900 dark:text-white">
                        <span>Total Paid</span>
                        <span className="text-[#5C61F2]">₹{order.total?.toFixed(2)}</span>
                      </div>

                      {/* Cancel */}
                      {canCancel && (
                        <button
                          onClick={async () => {
                            if (!confirm("Cancel this order?")) return;
                            try {
                              await api.cancelOrder(order._id);
                              setOrders(prev => prev.map(o => o._id === order._id ? { ...o, orderStatus: "cancelled" } : o));
                            } catch (e) { alert(e.message || "Could not cancel."); }
                          }}
                          className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-bold"
                        >
                          <XCircle className="w-4 h-4" /> Cancel Order
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ════════ 4. Logout ════════ */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-rose-500 font-bold text-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </div>
          Sign Out of FreshKart
          <ChevronRight className="w-4 h-4 ml-auto text-red-300" />
        </button>
      </section>

    </div>
  );
}
