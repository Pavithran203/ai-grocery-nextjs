"use client";
import React, { useState, useEffect } from 'react';
import { useOrders } from '@/context/OrdersContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  ShoppingBag, Search, ChevronRight, RefreshCw, Calendar, 
  MapPin, CreditCard, ShieldCheck, ArrowLeft, Star, FileText
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import SafeImage from '@/components/SafeImage';

export default function OrderHistoryPage() {
  const { orders, loadOrders } = useOrders();
  const { user, isAuthenticated, setLoginModalOpen } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reorderingId, setReorderingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-3xl font-black mb-4 uppercase tracking-tight text-gray-900 dark:text-white">{t('orders.accessTitle', { defaultValue: 'Order History' })}</h1>
        <p className="text-gray-555 dark:text-gray-405 mb-8 max-w-md mx-auto text-sm">{t('orders.accessDescHistory', { defaultValue: 'Please log in to view your complete order history, buy again, and print invoice statements.' })}</p>
        <button 
          onClick={() => setLoginModalOpen(true)}
          className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-wider text-xs"
        >
          {t('orders.signIn', { defaultValue: 'Sign In' })}
        </button>
      </div>
    );
  }

  // Filter for completed/cancelled orders
  const historyStatuses = ['delivered', 'cancelled', 'Delivered', 'Cancelled'];
  let historyOrders = orders.filter(o => 
    historyStatuses.includes(o.orderStatus || o.status)
  );

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    historyOrders = historyOrders.filter(o => 
      o.id?.toLowerCase().includes(q) ||
      o.items.some(item => item.name.toLowerCase().includes(q))
    );
  }

  const handleReorder = async (order, e) => {
    e.stopPropagation();
    setReorderingId(order.id || order._id);
    try {
      for (const item of order.items) {
        const productObj = {
          id: item.id || item.productId,
          name: item.name,
          price: item.price || 0,
          image_url: item.image_url
        };
        await addToCart(productObj, item.quantity);
      }
      showToast(t('orders.allAddedToCart', { defaultValue: 'All items added to cart!' }));
      setIsCartOpen(true);
    } catch (err) {
      showToast(t('orders.reorderError', { defaultValue: 'Error during reorder: ' }) + err.message);
    } finally {
      setReorderingId(null);
    }
  };

  const getStatusStyle = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'delivered') return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-100 dark:border-emerald-800/30';
    return 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border border-rose-100 dark:border-rose-800/30';
  };

  const formatStatusLabel = (status) => {
    const s = String(status).toLowerCase();
    const labels = {
      placed: t('orders.status.placed', { defaultValue: 'Order Placed' }),
      confirmed: t('orders.status.confirmed', { defaultValue: 'Order Confirmed' }),
      preparing: t('orders.status.preparing', { defaultValue: 'Being Prepared' }),
      packed: t('orders.status.packed', { defaultValue: 'Packed & Ready' }),
      out_for_delivery: t('orders.status.outOfDelivery', { defaultValue: 'Out for Delivery' }),
      delivered: t('orders.status.delivered', { defaultValue: 'Delivered' }),
      cancelled: t('orders.status.cancelled', { defaultValue: 'Cancelled' }),
    };
    return labels[s] || status;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3.5 rounded-2xl font-black shadow-2xl flex items-center gap-3 animate-fadeIn text-xs uppercase tracking-wider">
          <ShieldCheck className="text-emerald-500 w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb / Title */}
      <div className="mb-8">
        <Link href="/orders" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 mb-4 transition-colors">
          <ArrowLeft size={14} /> {t('orders.backToActive', { defaultValue: 'Back to active orders' })}
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">{t('orders.purchasingHistory', { defaultValue: 'Purchasing History' })}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{t('orders.purchasingHistorySubtitle', { defaultValue: 'Search and review your past orders, access invoice breakdowns, and buy again.' })}</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-155/80 dark:border-gray-805 p-5 shadow-sm mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-404 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('orders.searchPlaceholder', { defaultValue: 'Search history by order ID or product name...' })}
            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Main List */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {historyOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-12 text-center shadow-sm">
              <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">{t('orders.noPastOrders', { defaultValue: 'No past orders found' })}</h3>
              <p className="text-gray-400 dark:text-gray-550 mt-2 text-sm">{t('orders.noPastOrdersDesc', { defaultValue: 'Try checking your search spelling or shop new items.' })}</p>
            </div>
          ) : (
            historyOrders.map(order => (
              <div
                key={order.id || order._id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-850 p-6 shadow-sm hover:border-emerald-500/30 transition-all cursor-pointer group"
              >
                <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-850">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm uppercase text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {order.id || `ORD-${String(order._id).substring(0,8).toUpperCase()}`}
                      </span>
                      <span className={`badge ${getStatusStyle(order.status)}`}>
                        {formatStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5 font-semibold">
                      <Calendar size={12} /> {t('orders.placed', { defaultValue: 'Placed' })} {new Date(order.createdAt || order.placedAt).toLocaleDateString(i18n.language === 'en' ? 'en-IN' : i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('orders.amountPaid', { defaultValue: 'Amount Paid' })}</p>
                    <p className="text-lg font-black text-emerald-600">₹{order.amount}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="py-4 space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 overflow-hidden shrink-0">
                          <SafeImage 
                            src={item.image_url || item.image} 
                            alt={item[`name_${i18n.language}`] || item.name} 
                            type="product"
                            entityId={item.id}
                            productName={item[`name_${i18n.language}`] || item.name}
                            componentName="OrderHistoryFeed"
                            fill
                            sizes="40px"
                            objectFit="cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-800 dark:text-gray-205">{item[`name_${i18n.language}`] || item.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">{t('orders.quantity', { defaultValue: 'Quantity' })}: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-gray-500">₹{(item.price || 120) * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-gray-150 dark:border-gray-850 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <CreditCard size={12} /> {order.paymentMethod}
                  </span>
                  
                  <button
                    onClick={(e) => handleReorder(order, e)}
                    disabled={reorderingId === (order.id || order._id)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-600 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} className={reorderingId === (order.id || order._id) ? 'animate-spin' : ''} />
                    {t('orders.buyAgain', { defaultValue: 'Buy Again' })}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-155/85 dark:border-gray-805 p-6 shadow-sm">
            <h3 className="font-black text-lg uppercase tracking-tight text-gray-900 dark:text-white mb-4">{t('orders.historyAnalytics', { defaultValue: 'History Analytics' })}</h3>
            <div className="space-y-4 text-xs font-medium text-gray-550 dark:text-gray-400">
              <div className="flex justify-between pb-3 border-b border-gray-100 dark:border-gray-850">
                <span>{t('orders.totalDeliveredOrders', { defaultValue: 'Total Delivered Orders' })}</span>
                <span className="font-black text-gray-900 dark:text-white">
                  {orders.filter(o => ['delivered', 'Delivered'].includes(o.status)).length}
                </span>
              </div>
              <div className="flex justify-between pb-3 border-b border-gray-100 dark:border-gray-850">
                <span>{t('orders.cancelledRequests', { defaultValue: 'Cancelled Requests' })}</span>
                <span className="font-black text-rose-500">
                  {orders.filter(o => ['cancelled', 'Cancelled'].includes(o.status)).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('orders.totalWalletExpenses', { defaultValue: 'Total Wallet Expenses' })}</span>
                <span className="font-black text-emerald-600 text-sm">
                  ₹{orders.reduce((acc, curr) => acc + (['delivered', 'Delivered'].includes(curr.status) ? curr.amount : 0), 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm">
            <h3 className="font-black text-base uppercase tracking-tight text-gray-900 dark:text-white mb-3">{t('orders.shoppingGuarantee', { defaultValue: 'Shopping Guarantee' })}</h3>
            <p className="text-xs text-gray-450 leading-relaxed mb-4">{t('orders.shoppingGuaranteeDesc', { defaultValue: 'Every purchase on NearMart comes with fresh-lock verification and instant 10-minute hassle-free refunds in case of cancellations or returns.' })}</p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 tracking-wider">
              <ShieldCheck size={14} /> {t('orders.safeSecureStorefront', { defaultValue: 'Safe & Secure Storefront' })}
            </div>
          </div>
        </div>
      </div>

      {/* Details slide-out (shared code structure) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            <div onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity" />
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md animate-fadeIn">
                <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-100 dark:border-gray-800">
                  
                  <div className="px-6 py-6 bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{t('orders.pastPurchaseDetails', { defaultValue: 'Past Purchase Details' })}</span>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase mt-1">
                        {selectedOrder.id || `ORD-${String(selectedOrder._id).substring(0,8).toUpperCase()}`}
                      </h2>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-505 hover:text-red-550 transition-all">
                      <ArrowLeft size={18} />
                    </button>
                  </div>

                  <div className="py-6 px-6 space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-4 border border-gray-150 dark:border-gray-850 space-y-3.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-bold uppercase text-[10px]">{t('orders.orderDate', { defaultValue: 'Order Date' })}</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{new Date(selectedOrder.createdAt || selectedOrder.placedAt).toLocaleString(i18n.language === 'en' ? 'en-IN' : i18n.language)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-bold uppercase text-[10px]">{t('orders.orderStatus', { defaultValue: 'Order Status' })}</span>
                        <span className={`badge ${getStatusStyle(selectedOrder.status)}`}>{formatStatusLabel(selectedOrder.status)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 dark:border-gray-800 pt-3">
                        <span className="text-gray-450 font-black uppercase text-[10px]">{t('orders.totalBill', { defaultValue: 'Total Bill' })}</span>
                        <span className="font-black text-emerald-600 text-sm">₹{selectedOrder.amount}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">{t('orders.itemsSummary', { defaultValue: 'Items Summary' })}</h3>
                      <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center gap-3 bg-white dark:bg-gray-900">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 overflow-hidden shrink-0">
                              <SafeImage 
                                src={item.image_url || item.image} 
                                alt={item[`name_${i18n.language}`] || item.name} 
                                type="product"
                                entityId={item.id}
                                productName={item[`name_${i18n.language}`] || item.name}
                                componentName="OrderHistoryDetails"
                                fill
                                sizes="48px"
                                objectFit="cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-black text-gray-850 dark:text-gray-200 truncate">{item[`name_${i18n.language}`] || item.name}</h4>
                              <p className="text-[10px] text-gray-400 mt-1 font-bold">₹{item.price || 120} × {item.quantity}</p>
                            </div>
                            <p className="text-xs font-black text-gray-905 dark:text-gray-150 shrink-0">₹{(item.price || 120) * item.quantity}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 p-4 rounded-2xl text-xs space-y-2 leading-relaxed">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t('orders.shipToAddress', { defaultValue: 'Ship To Address' })}</span>
                      <p className="font-medium text-gray-650 dark:text-gray-300">{selectedOrder.address}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 p-4 rounded-2xl text-xs space-y-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t('orders.paymentDetail', { defaultValue: 'Payment Detail' })}</span>
                      <p className="font-bold text-gray-700 dark:text-gray-200">{selectedOrder.paymentMethod}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        handleReorder(selectedOrder, e);
                        setSelectedOrder(null);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={14} /> {t('orders.buyAgainNow', { defaultValue: 'Buy Again Now' })}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
