"use client";
import React, { useState, useEffect } from 'react';
import { useOrders, isOrderCancellable } from '@/context/OrdersContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  ShoppingBag, Clock, CheckCircle2, XCircle, ArrowLeft, 
  ChevronRight, RefreshCw, MapPin, CreditCard, Calendar,
  AlertCircle, ShieldCheck, Phone, Star, Package
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import SafeImage from '@/components/SafeImage';

export default function OrdersPage() {
  const { orders, cancelOrder, loadOrders } = useOrders();
  const { t, i18n } = useTranslation();

  // Human-friendly status label
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
  const { user, isAuthenticated, setLoginModalOpen, masterKey } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [decryptedDetails, setDecryptedDetails] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [reorderingId, setReorderingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const decryptOrder = async () => {
      if (!selectedOrder) {
        setDecryptedDetails(null);
        return;
      }
      
      // Decrypt address and notes if E2EE parameters and masterKey are present
      if (selectedOrder.encryptedAddress && selectedOrder.customerKeyBlob && masterKey) {
        try {
          const { unwrapOrderKeyWithPassword, decryptSymmetric } = await import('@/services/e2ee');
          
          // 1. Unwrap order key
          const orderKey = await unwrapOrderKeyWithPassword(
            selectedOrder.customerKeyBlob.ciphertext,
            selectedOrder.customerKeyBlob.iv,
            masterKey
          );
          
          // 2. Decrypt address
          const decryptedAddrObj = await decryptSymmetric(
            selectedOrder.encryptedAddress.ciphertext,
            selectedOrder.encryptedAddress.iv,
            orderKey
          );
          
          // 3. Decrypt notes if present
          let decryptedNotesObj = null;
          if (selectedOrder.encryptedNotes) {
            decryptedNotesObj = await decryptSymmetric(
              selectedOrder.encryptedNotes.ciphertext,
              selectedOrder.encryptedNotes.iv,
              orderKey
            );
          }
          
          const formattedAddress = `${decryptedAddrObj.line1}, ${decryptedAddrObj.line2}, ${decryptedAddrObj.pincode}`;
          
          setDecryptedDetails({
            address: formattedAddress,
            notes: decryptedNotesObj ? decryptedNotesObj.notes : selectedOrder.notes,
            isDecrypted: true
          });
        } catch (err) {
          console.error("Failed to decrypt E2EE order details:", err);
          setDecryptedDetails({
            address: "🔒 Decryption Failed (Invalid Key/Credentials)",
            notes: "🔒 Decryption Failed",
            isDecrypted: false
          });
        }
      } else {
        // Plaintext fallback
        const rawAddr = selectedOrder.address || (selectedOrder.deliveryAddress ? `${selectedOrder.deliveryAddress.line1}, ${selectedOrder.deliveryAddress.pincode}` : 'No address set');
        setDecryptedDetails({
          address: rawAddr,
          notes: selectedOrder.notes || selectedOrder.instruction || '',
          isDecrypted: false
        });
      }
    };
    decryptOrder();
  }, [selectedOrder, masterKey]);

  // Show a toast message helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  // Auto-open a specific order when navigated with ?orderId=XXX
  const activeStatuses = ['placed', 'confirmed', 'preparing', 'packed', 'out_for_delivery', 'Pending', 'Preparing', 'Packed', 'Out for Delivery'];
  const historyStatuses = ['delivered', 'cancelled', 'Delivered', 'Cancelled'];

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && orders.length > 0 && !selectedOrder) {
      const found = orders.find(o => o.id === orderId || o._id === orderId);
      if (found) {
        // Switch to the correct tab
        const status = (found.orderStatus || found.status || '').toLowerCase();
        if (historyStatuses.map(s => s.toLowerCase()).includes(status)) {
          setActiveTab('history');
        } else {
          setActiveTab('active');
        }
        // Open the detail panel
        setSelectedOrder(found);
      }
    }
  }, [searchParams, orders]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30">
          <ShoppingBag size={48} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tight">{t('orders.accessTitle', { defaultValue: 'Access Your Orders' })}</h1>
        <p className="text-gray-550 dark:text-gray-400 mb-8 max-w-md mx-auto text-sm">{t('orders.accessDesc', { defaultValue: 'Please log in to view your active orders, order history, track deliveries, and manage returns.' })}</p>
        <button 
          onClick={() => setLoginModalOpen(true)}
          className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-wider text-xs"
        >
          {t('orders.signInRegister', { defaultValue: 'Sign In / Register' })}
        </button>
      </div>
    );
  }

  const activeOrders = orders.filter(o => 
    activeStatuses.includes(o.orderStatus || o.status)
  );

  const historyOrders = orders.filter(o => 
    historyStatuses.includes(o.orderStatus || o.status)
  );

  const handleCancelOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId || o._id === orderId);
    if (order && !isOrderCancellable(order)) {
      showToast(t('orders.cancellationExpired', { defaultValue: '⏰ Cancellation window expired. Orders can only be cancelled within 5 minutes of placing.' }));
      return;
    }
    if (window.confirm(t('orders.confirmCancel', { defaultValue: 'Are you sure you want to cancel this order?' }))) {
      setCancellingId(orderId);
      try {
        await cancelOrder(orderId);
        showToast(t('orders.cancelSuccess', { defaultValue: 'Order cancelled successfully' }));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: 'cancelled', orderStatus: 'cancelled' }));
        }
      } catch (err) {
        showToast(err.message || t('orders.cancelFailed', { defaultValue: 'Failed to cancel order' }));
      } finally {
        setCancellingId(null);
      }
    }
  };

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

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'delivered') return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-100 dark:border-emerald-800/30';
    if (s === 'cancelled') return 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border border-rose-100 dark:border-rose-800/30';
    if (s === 'out_for_delivery') return 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 border border-sky-100 dark:border-sky-800/30 animate-pulse';
    return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 border border-amber-100 dark:border-amber-800/30';
  };

  const formatOrderDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(i18n.language === 'en' ? 'en-IN' : i18n.language, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3.5 rounded-2xl font-black shadow-2xl flex items-center gap-3 animate-fadeIn text-sm">
          <ShieldCheck className="text-emerald-500 w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('orders.title', { defaultValue: 'Your Orders' })}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{t('orders.subtitle', { defaultValue: 'Track real-time updates of active orders and review your purchasing history.' })}</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl w-full md:w-auto shrink-0 border border-gray-200/50 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
              activeTab === 'active'
                ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm border border-gray-200/10'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Clock size={16} />
            {t('orders.active', { defaultValue: 'Active' })} ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm border border-gray-200/10'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <ShoppingBag size={16} />
            {t('orders.history', { defaultValue: 'History' })} ({historyOrders.length})
          </button>
        </div>
      </div>

      {/* List Container */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Orders Feed */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'active' ? (
            activeOrders.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-12 text-center shadow-sm">
                <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('orders.noActive', { defaultValue: 'No Active Orders' })}</h3>
                <p className="text-gray-404 dark:text-gray-500 mt-2 mb-6 max-w-sm mx-auto text-sm">{t('orders.noActiveDesc', { defaultValue: 'Everything you order is delivered fast. Start browsing products to place your first order.' })}</p>
                <Link href="/products" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-emerald-700 shadow-lg shadow-emerald-500/10">
                  {t('orders.shopNow', { defaultValue: 'Shop Now' })}
                </Link>
              </div>
            ) : (
              activeOrders.map(order => (
                <div 
                  key={order.id || order._id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:border-emerald-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-850">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-sm uppercase text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {order.id || `ORD-${String(order._id).substring(0,8).toUpperCase()}`}
                        </span>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {formatStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5 font-semibold">
                        <Calendar size={12} /> {t('orders.placed', { defaultValue: 'Placed' })} {formatOrderDate(order.createdAt || order.placedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('orders.totalAmount', { defaultValue: 'Total Amount' })}</p>
                      <p className="text-lg font-black text-emerald-600">₹{order.amount || order.total || 0}</p>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="py-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 shrink-0 bg-gray-50 dark:bg-gray-950 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-300 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img src={item.image_url || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=100'} alt={item[`name_${i18n.language}`] || item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-xs max-w-[120px]">
                          <p
                            onClick={(e) => { e.stopPropagation(); router.push(`/product/${item.id}`); }}
                            className="font-black text-gray-800 dark:text-gray-250 truncate cursor-pointer hover:text-emerald-600 transition-colors"
                          >{item[`name_${i18n.language}`] || item.name}</p>
                          <p className="text-gray-404 font-bold mt-0.5">{t('orders.qty', { defaultValue: 'Qty' })}: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tracking Bar */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-black uppercase tracking-wider">
                        {t('orders.liveTracking', { defaultValue: 'Live Tracking' })}: {formatStatusLabel(order.status)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {isOrderCancellable(order) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelOrder(order.id || order._id);
                          }}
                          disabled={cancellingId === (order.id || order._id)}
                          className="px-4 py-2 rounded-xl border-2 border-rose-100 hover:border-rose-500 text-rose-500 hover:bg-rose-50/50 text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                          {cancellingId === (order.id || order._id) ? t('orders.cancelling', { defaultValue: 'Cancelling...' }) : t('orders.cancelOrder', { defaultValue: 'Cancel Order' })}
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                        className="px-4 py-2 rounded-xl bg-gray-950 text-white dark:bg-gray-800 dark:hover:bg-gray-750 text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                      >
                        {t('orders.trackStatus', { defaultValue: 'Track Status' })} <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            historyOrders.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-12 text-center shadow-sm">
                <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('orders.noHistory', { defaultValue: 'No Order History' })}</h3>
                <p className="text-gray-400 dark:text-gray-550 mt-2 mb-6 max-w-sm mx-auto text-sm">{t('orders.noHistoryDesc', { defaultValue: "You haven't completed any orders yet. Once delivered, they will appear in your archive here." })}</p>
                <Link href="/products" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-emerald-700 shadow-lg shadow-emerald-500/10">
                  {t('orders.browseStore', { defaultValue: 'Browse Store' })}
                </Link>
              </div>
            ) : (
              historyOrders.map(order => (
                <div 
                  key={order.id || order._id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:border-emerald-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-850">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-sm uppercase text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {order.id || `ORD-${String(order._id).substring(0,8).toUpperCase()}`}
                        </span>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {formatStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5 font-semibold">
                        <Calendar size={12} /> {t('orders.placed', { defaultValue: 'Placed' })} {formatOrderDate(order.createdAt || order.placedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('orders.totalPaid', { defaultValue: 'Total Paid' })}</p>
                      <p className="text-lg font-black text-emerald-600">₹{order.amount || order.total || 0}</p>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="py-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 shrink-0 bg-gray-50 dark:bg-gray-950 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-300 transition-all">
                        <div className="relative w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                          <SafeImage 
                            src={item.image_url || item.image} 
                            alt={item[`name_${i18n.language}`] || item.name} 
                            type="product"
                            entityId={item.id}
                            productName={item[`name_${i18n.language}`] || item.name}
                            componentName="OrdersFeed"
                            fill
                            sizes="40px"
                            objectFit="cover"
                          />
                        </div>
                        <div className="text-xs max-w-[120px]">
                          <p
                            onClick={(e) => { e.stopPropagation(); router.push(`/product/${item.id}`); }}
                            className="font-black text-gray-800 dark:text-gray-250 truncate cursor-pointer hover:text-emerald-600 transition-colors"
                          >{item[`name_${i18n.language}`] || item.name}</p>
                          <p className="text-gray-400 font-bold mt-0.5">{t('orders.qty', { defaultValue: 'Qty' })}: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* History Actions */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between">
                    <p className="text-[10px] text-gray-404 font-bold uppercase tracking-wider">
                      {order.items.length} {order.items.length === 1 ? t('orders.item', { defaultValue: 'item' }) : t('orders.items', { defaultValue: 'items' })}
                    </p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                        className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-750 text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                      >
                        {t('orders.viewDetails', { defaultValue: 'View Details' })} <ChevronRight size={12} />
                      </button>
                      <button
                        onClick={(e) => handleReorder(order, e)}
                        disabled={reorderingId === (order.id || order._id)}
                        className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-600 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw size={12} className={reorderingId === (order.id || order._id) ? 'animate-spin' : ''} />
                        {reorderingId === (order.id || order._id) ? t('orders.adding', { defaultValue: 'Adding...' }) : t('orders.buyAgain', { defaultValue: 'Buy Again' })}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Right Col: Orders Insight & Quick Stats */}
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <h3 className="font-black text-lg uppercase tracking-tight text-gray-900 dark:text-white mb-4">{t('orders.insight', { defaultValue: 'Orders Insight' })}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-850">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{t('orders.totalOrders', { defaultValue: 'Total Orders' })}</span>
                <span className="text-2xl font-black text-gray-900 dark:text-white block mt-1">{orders.length}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-850">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{t('orders.delivered', { defaultValue: 'Delivered' })}</span>
                <span className="text-2xl font-black text-emerald-600 block mt-1">
                  {orders.filter(o => ['delivered', 'Delivered'].includes(o.status)).length}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 dark:border-gray-850 pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
                  <Star size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">{t('orders.expressDelivery', { defaultValue: 'Express Delivery' })}</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">{t('orders.expressDesc', { defaultValue: 'Average delivery in 12–18 mins' })}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 flex items-center justify-center border border-orange-100 dark:border-orange-900/30">
                  <Package size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">{t('orders.organicProducts', { defaultValue: '100% Organic Products' })}</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">{t('orders.organicDesc', { defaultValue: 'Directly sourced fresh items' })}</p>
                </div>
              </div>
            </div>
          </div>


        </div>

      </div>

      {/* Order Details Slide-over Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Overlay */}
            <div 
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-900 shadow-2xl animate-fadeIn border-l border-gray-150 dark:border-gray-800">
                  
                  {/* Panel Header */}
                  <div className="px-6 py-6 bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{t('orders.detailsTitle', { defaultValue: 'Order Details' })}</span>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase mt-1">
                        {selectedOrder.id || `ORD-${String(selectedOrder._id).substring(0,8).toUpperCase()}`}
                      </h2>
                    </div>
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 transition-all"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  </div>

                  {/* Panel Body */}
                  <div className="flex-1 py-6 px-6 space-y-8">
                    
                    {/* Status Tracking Timeline */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">{t('orders.trackStatus', { defaultValue: 'Track Status' })}</h3>
                      <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850 p-4 space-y-5">
                        
                        {/* Time-based tracking timeline */}
                        {(() => {
                          const orderStatusLower = String(selectedOrder.orderStatus || selectedOrder.status).toLowerCase();
                          const placedAt = new Date(selectedOrder.createdAt || selectedOrder.placedAt || 0);
                          const elapsedMin = (new Date() - placedAt) / (1000 * 60);

                          // Build timeline steps based on whether order is cancelled or not
                          const isCancelled = orderStatusLower === 'cancelled';
                          
                          // Lifecycle thresholds in minutes (must match OrdersContext)
                          const thresholds = { placed: 0, confirmed: 2, preparing: 5, packed: 15, out_for_delivery: 20, delivered: 45 };

                          const steps = isCancelled
                            ? [
                                { status: 'placed', label: t('orders.status.placed', { defaultValue: 'Order Placed' }), minuteOffset: 0 },
                                { status: 'cancelled', label: t('orders.status.cancelled', { defaultValue: 'Order Cancelled' }), minuteOffset: Math.min(elapsedMin, 5) },
                              ]
                            : [
                                { status: 'placed', label: t('orders.status.placed', { defaultValue: 'Order Placed' }), minuteOffset: thresholds.placed },
                                { status: 'confirmed', label: t('orders.status.confirmed', { defaultValue: 'Confirmed' }), minuteOffset: thresholds.confirmed },
                                { status: 'preparing', label: t('orders.status.preparing', { defaultValue: 'Being Prepared' }), minuteOffset: thresholds.preparing },
                                { status: 'packed', label: t('orders.status.packed', { defaultValue: 'Packed & Ready' }), minuteOffset: thresholds.packed },
                                { status: 'out_for_delivery', label: t('orders.status.outOfDelivery', { defaultValue: 'Out for Delivery' }), minuteOffset: thresholds.out_for_delivery },
                                { status: 'delivered', label: t('orders.status.delivered', { defaultValue: 'Delivered' }), minuteOffset: thresholds.delivered },
                              ];

                          const statusOrder = ['placed', 'confirmed', 'preparing', 'packed', 'out_for_delivery', 'delivered'];
                          const currentStatusIdx = statusOrder.indexOf(orderStatusLower);

                          return steps.map((step, idx, arr) => {
                            const stepIdx = statusOrder.indexOf(step.status);
                            let isCompleted = false;
                            let isActive = false;

                            if (isCancelled) {
                              isCompleted = true;
                              isActive = step.status === 'cancelled';
                            } else {
                              isCompleted = stepIdx <= currentStatusIdx && stepIdx !== -1;
                              isActive = step.status === orderStatusLower;
                            }

                            // Compute the estimated time for this step
                            const stepTime = new Date(placedAt.getTime() + step.minuteOffset * 60 * 1000);
                            const showTime = isCompleted || isActive;

                            return (
                              <div key={idx} className="flex gap-4 relative">
                                {idx < arr.length - 1 && (
                                  <div className={`absolute left-3.5 top-7 w-0.5 h-6 ${
                                    isCompleted && !isActive ? 'bg-emerald-500' : 
                                    isCancelled && step.status === 'placed' ? 'bg-rose-400' :
                                    'bg-gray-200 dark:bg-gray-800'
                                  }`} />
                                )}
                                
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                  isCancelled && step.status === 'cancelled'
                                    ? 'bg-rose-500 border-rose-500 text-white'
                                    : isCompleted 
                                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400'
                                }`}>
                                  {isCompleted ? (
                                    isCancelled && step.status === 'cancelled' 
                                      ? <XCircle size={14} />
                                      : <CheckCircle2 size={14} />
                                  ) : (
                                    <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                                  )}
                                </div>
                                
                                <div>
                                  <h4 className={`text-xs font-black uppercase ${
                                    isCancelled && step.status === 'cancelled' ? 'text-rose-600' :
                                    isActive ? 'text-emerald-600' : isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-450 dark:text-gray-500'
                                  }`}>
                                    {step.label}
                                  </h4>
                                  {showTime ? (
                                    <p className="text-[10px] text-gray-450 mt-0.5 font-bold">
                                      {stepTime.toLocaleTimeString(i18n.language === 'en' ? 'en-IN' : i18n.language, { hour: '2-digit', minute: '2-digit' })}
                                      {' · '}
                                      {stepTime.toLocaleDateString(i18n.language === 'en' ? 'en-IN' : i18n.language, { day: 'numeric', month: 'short' })}
                                    </p>
                                  ) : (
                                    <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-0.5 font-bold">{t('orders.estimated', { defaultValue: 'Estimated' })}</p>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}

                      </div>
                    </div>

                    {/* Delivery Partner Details */}
                    {selectedOrder.deliveryPartner && (
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl p-4">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('orders.deliveryExecutive', { defaultValue: 'Delivery Executive' })}</h4>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                              {selectedOrder.deliveryPartner.name[0]}
                            </div>
                            <div>
                              <p className="text-xs font-black text-gray-800 dark:text-gray-250">{selectedOrder.deliveryPartner.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold mt-0.5">⭐ {selectedOrder.deliveryPartner.rating} {t('orders.ratingLabel', { defaultValue: 'rating' })}</p>
                            </div>
                          </div>
                          <a 
                            href={`tel:${selectedOrder.deliveryPartner.phone}`}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center border border-emerald-150/40 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          >
                            <Phone size={16} />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Items Purchased */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">{t('orders.itemsSummary', { defaultValue: 'Items Summary' })}</h3>
                      <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center gap-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
                            <div 
                              onClick={() => { setSelectedOrder(null); router.push(`/product/${item.id}`); }}
                              className="relative w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-400 transition-all"
                            >
                              <SafeImage 
                                src={item.image_url || item.image} 
                                alt={item[`name_${i18n.language}`] || item.name} 
                                type="product"
                                entityId={item.id}
                                productName={item[`name_${i18n.language}`] || item.name}
                                componentName="OrderDetails"
                                fill
                                sizes="48px"
                                objectFit="cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 
                                onClick={() => { setSelectedOrder(null); router.push(`/product/${item.id}`); }}
                                className="text-xs font-black text-gray-800 dark:text-gray-200 truncate cursor-pointer hover:text-emerald-600 transition-colors"
                              >{item[`name_${i18n.language}`] || item.name}</h4>
                              <p className="text-[10px] text-gray-400 mt-1 font-bold">₹{item.price || 120} × {item.quantity}</p>
                            </div>
                            <p className="text-xs font-black text-gray-905 dark:text-gray-150 shrink-0">₹{(item.price || 120) * item.quantity}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Payment Info */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 p-4 rounded-2xl relative overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                              <MapPin size={12} /> {t('orders.address', { defaultValue: 'Address' })}
                            </span>
                            {decryptedDetails?.isDecrypted && (
                              <span className="text-[8px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <ShieldCheck size={8} /> E2EE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-650 dark:text-gray-300 mt-2 leading-relaxed font-medium">
                            {decryptedDetails ? decryptedDetails.address : selectedOrder.address}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 p-4 rounded-2xl">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard size={12} /> {t('orders.payment', { defaultValue: 'Payment' })}
                          </span>
                          <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-2 font-bold">{selectedOrder.paymentMethod}</p>
                        </div>
                      </div>

                      {decryptedDetails?.notes && (
                        <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 p-4 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                              📝 {t('checkout.deliveryInstructions', { defaultValue: 'Instructions' })}
                            </span>
                            {decryptedDetails?.isDecrypted && (
                              <span className="text-[8px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <ShieldCheck size={8} /> E2EE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-2 font-medium">
                            {decryptedDetails.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bill Breakdown */}
                    <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-2xl p-4 space-y-2.5 text-xs">
                      <div className="flex justify-between text-gray-500">
                        <span>{t('orders.itemsSubtotal', { defaultValue: 'Items Subtotal' })}</span>
                        <span>₹{selectedOrder.subtotal || (selectedOrder.amount || selectedOrder.total || 0) - 35}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>{t('orders.deliveryFee', { defaultValue: 'Delivery Fee' })}</span>
                        <span>{selectedOrder.deliveryFee === 0 ? t('common.free', { defaultValue: 'FREE' }) : `₹${selectedOrder.deliveryFee || 35}`}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>{t('orders.taxCharges', { defaultValue: 'Taxes & Charges' })}</span>
                        <span>₹{selectedOrder.tax || 15}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-800 pt-2.5 flex justify-between font-black text-gray-900 dark:text-white">
                        <span>{t('orders.totalBill', { defaultValue: 'Total Bill' })}</span>
                        <span className="text-sm text-emerald-600">₹{selectedOrder.amount || selectedOrder.total || 0}</span>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    {isOrderCancellable(selectedOrder) ? (
                      <button
                        onClick={() => handleCancelOrder(selectedOrder.id || selectedOrder._id)}
                        disabled={cancellingId === (selectedOrder.id || selectedOrder._id)}
                        className="w-full bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border border-rose-100 dark:border-rose-900/30"
                      >
                        {cancellingId === (selectedOrder.id || selectedOrder._id) ? t('orders.cancellingOrder', { defaultValue: 'Cancelling Order...' }) : t('orders.cancelOrder', { defaultValue: 'Cancel Order' })}
                      </button>
                    ) : (
                      !['delivered', 'cancelled'].includes(String(selectedOrder.status).toLowerCase()) && (
                        <div className="w-full bg-gray-50 dark:bg-gray-950 text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-wider text-center border border-gray-100 dark:border-gray-800">
                          {t('orders.cancellationExpiredShort', { defaultValue: '⏰ Cancellation window expired' })}
                        </div>
                      )
                    )}

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
