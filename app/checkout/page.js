"use client";
import { useCart } from "@/context/CartContext";
import DeliveryTracker from "@/components/DeliveryTracker";
import { api } from "@/services/api";
import {
  CheckCircle2, CreditCard, Smartphone, Banknote,
  Lock, ShieldCheck, Loader2, ChevronRight, MapPin,
  Zap, User2, Tag, Gift, ChevronDown, ChevronUp,
  Star, MessageSquare, Bike, Clock, BadgePercent,
  Heart, Leaf, AlertCircle, Info, ArrowLeft, Truck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrdersContext";
import { useTranslation } from "react-i18next";
import { useAddress } from "@/context/AddressContext";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

// ─────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────
function StepBadge({ step, current }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 transition-all ${
      done   ? 'bg-emerald-500 text-white shadow-md shadow-emerald-400/30'
      : active ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 ring-4 ring-gray-200 dark:ring-gray-700'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
    }`}>
      {done ? <CheckCircle2 className="w-4 h-4" /> : step}
    </div>
  );
}

// ─────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────
function Section({ title, icon, children, step, current, onEdit, collapsible = false }) {
  const [open, setOpen] = useState(true);
  const isComplete = current > step;
  const isActive   = current === step;

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl border transition-all ${
      isActive ? 'border-emerald-300 dark:border-emerald-700 shadow-lg shadow-emerald-500/10' : 'border-gray-100 dark:border-gray-800 shadow-sm'
    }`}>
      <div
        className={`flex items-center justify-between p-5 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={() => collapsible && setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <StepBadge step={step} current={current} />
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{icon}</span>
            <h3 className={`font-black text-base ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isComplete && onEdit && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline">Edit</button>
          )}
          {collapsible && (open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />)}
        </div>
      </div>
      {(!collapsible || open) && isActive && (
        <div className="px-5 pb-6 pt-0 border-t border-gray-100 dark:border-gray-800">{children}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { cartItems, clearCart, getCartTotal } = useCart();
  const { addresses, getDefaultAddress } = useAddress();
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const PAYMENT_METHODS = useMemo(() => [
    { id: 'upi',  label: t('checkout.upiLabel'),       sub: t('checkout.upiSub'), icon: <Smartphone className="w-5 h-5" />, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-300 dark:border-violet-700' },
    { id: 'card', label: t('checkout.cardLabel'),      sub: t('checkout.cardSub'),  icon: <CreditCard  className="w-5 h-5" />, color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30',     border: 'border-blue-300 dark:border-blue-700' },
    { id: 'cod',  label: t('checkout.cashLabel'),      sub: t('checkout.cashSub'),      icon: <Banknote    className="w-5 h-5" />, color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-950/30',border: 'border-emerald-300 dark:border-emerald-700' },
  ], [t]);

  const UPI_APPS = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM'];

  const COUPONS = useMemo(() => [
    { code: 'FRESH10', label: t('checkout.coupon10Desc'), discount: 0.10, min: 200 },
    { code: 'FIRST50', label: t('checkout.couponFirstDesc'),  discount: 50,   min: 0, flat: true },
    { code: 'ORGANIC15', label: t('checkout.couponOrganicDesc'),   discount: 0.15, min: 300 },
  ], [t]);

  const TIPS = [0, 10, 20, 30, 50];

  const DELIVERY_INSTRUCTIONS = useMemo(() => [
    t('checkout.leaveAtDoor'), t('checkout.ringBell'), t('checkout.callOnArrival'), t('checkout.handleCare'), t('checkout.noContact')
  ], [t]);

  // Steps: 1=Identity, 2=Address, 3=Offers, 4=Payment → 5=Processing → success
  const [step, setStep] = useState(1);
  const [authChecked, setAuthChecked] = useState(false);

  // Step 1 – Identity
  const [guestName, setGuestName]   = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Auto-fill and skip Step 1 if logged in — wait for auth to finish loading
  useEffect(() => {
    if (authLoading) return; // Wait until auth state is resolved
    if (user && !authChecked) {
      setGuestName(user.name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
      
      let hasAddress = false;

      // 1. Try to load default address from AddressContext
      const defaultAddr = getDefaultAddress();
      if (defaultAddr) {
        setFlatNo(defaultAddr.line1 || '');
        setAddress(defaultAddr.line2 || defaultAddr.city || '');
        setPincode(defaultAddr.pincode || '');
        setLandmark(defaultAddr.landmark || '');
        setAddressType(defaultAddr.label || 'Home');
        hasAddress = true;
      }

      // 2. Fallback to localStorage last address if no default saved address exists
      if (!hasAddress) {
        const lastAddressStr = typeof window !== 'undefined' ? localStorage.getItem('nearmart_last_address') : null;
        if (lastAddressStr) {
          try {
            const parsed = JSON.parse(lastAddressStr);
            if (parsed.address && parsed.flatNo && parsed.pincode) {
              setAddress(parsed.address);
              setPincode(parsed.pincode);
              setFlatNo(parsed.flatNo);
              setLandmark(parsed.landmark || '');
              hasAddress = true;
            }
          } catch (e) {}
        }
      }

      setStep(hasAddress ? 3 : 2); // Automatically skip Address step if we have a saved address
      setAuthChecked(true);
    } else if (!user) {
      setAuthChecked(true);
    }
  }, [user, authLoading, authChecked, getDefaultAddress]);

  // Step 2 – Address
  const [address, setAddress]       = useState('');
  const [pincode, setPincode]       = useState('');
  const [flatNo, setFlatNo]         = useState('');
  const [landmark, setLandmark]     = useState('');
  const [addressType, setAddressType] = useState('Home');
  const [instruction, setInstruction] = useState('');
  const [tip, setTip]               = useState(20);
  const [detecting, setDetecting]   = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' or 'pickup'

  const handleDetectLocation = () => {
    setDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const getLangCode = (lang) => {
              const mapping = { 'EN': 'en', 'தமிழ்': 'ta', 'తెలుగు': 'te', 'ಕನ್ನಡ': 'kn', 'മലയാളം': 'ml', 'हिंदी': 'hi' };
              return mapping[lang] || 'en';
            };
            const langCode = getLangCode(language);
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=${langCode},en;q=0.5`);
            const data = await res.json();
            const addr = data.address;
            
            setPincode(addr.postcode || "");
            setAddress(`${addr.suburb || addr.neighbourhood || addr.residential || ""} ${addr.road || ""} ${addr.city || addr.state || ""}`.trim());
          } catch (err) {
            console.error("Geocoding error:", err);
          } finally {
            setDetecting(false);
          }
        },
        () => setDetecting(false),
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setDetecting(false);
    }
  };

  // Step 3 – Offers
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError]     = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Step 4 – Payment
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [upiId, setUpiId]         = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName]   = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv]     = useState('');

  // Result
  const [loading, setLoading]         = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  // ── Payment processing ──
  const { addLocalOrder, orders } = useOrders();

  const applyCoupon = (code) => {
    const couponCode = code || couponInput;
    const coupon = COUPONS.find(c => c.code === couponCode);
    if (coupon) {
      if (subTotal < 200 && coupon.code === 'FRESH10') {
        setCouponError('Minimum order ₹200 for this coupon');
        return;
      }
      if (coupon.code === 'FIRST50' && orders && orders.length > 0) {
        setCouponError('This coupon is exclusively for your very first order!');
        return;
      }
      setAppliedCoupon(coupon);
      setCouponSuccess(`✓ "${coupon.code}" applied! You saved ₹${coupon.flat ? coupon.discount : Math.round(subTotal * coupon.discount)}`);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
      setCouponSuccess('');
    }
  };

  const subTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = subTotal >= 500 ? 0 : 40;
  const couponDiscount = appliedCoupon
    ? (appliedCoupon.flat ? appliedCoupon.discount : Math.round(subTotal * appliedCoupon.discount))
    : 0;
  const totalAmount = Math.max(0, subTotal + deliveryFee + tip - couponDiscount);

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentError('');
    setLoading(true);
    
    try {
      let resultOrder;
      const orderPayload = {
        deliveryAddress: { 
          fullName: guestName, 
          phone: guestPhone, 
          line1: `${flatNo}, ${address}`, 
          city: 'N/A', 
          state: 'N/A', 
          pincode 
        },
        paymentMethod: paymentMethod,
        notes: instruction,
        items: cartItems,
        total: totalAmount,
        subtotal: subTotal,
        deliveryFee,
        discount: couponDiscount,
        tax: 0
      };

      let backendOrder = null;
      if (user && !user.isGuest) {
        // Authenticated users attempt backend creation
        try {
          backendOrder = await api.createOrder(orderPayload);
        } catch (e) {
          console.warn("Backend order creation failed or backend unavailable, proceeding with local web order.");
        }
      }

      // ALWAYS save web orders locally to ensure profile reflects full details,
      // as the mobile backend may drop items or not store web fields perfectly.
      const finalPayload = backendOrder ? { ...orderPayload, id: backendOrder.id || backendOrder._id } : orderPayload;
      resultOrder = await addLocalOrder(finalPayload);

      // Save for personalized home screen (Returning User logic)
      const lastOrder = {
        store: 'NearMart Local',
        items: cartItems.slice(0, 3), // Save top 3 items for suggestion
        date: new Date().toISOString()
      };
      sessionStorage.setItem('nearmart_last_order', JSON.stringify(lastOrder));
      
      await clearCart();

      // Enrich with mock delivery details for the DeliveryTracker component
      const enrichedOrder = {
        ...resultOrder,
        orderId: resultOrder.orderId || resultOrder.id || `ORD${Date.now()}`,
        transactionId: resultOrder.transactionId || `TXN${Math.floor(Math.random() * 99999999)}`,
        estimatedDelivery: '12–18 mins',
        customer: { name: guestName },
        tip,
        deliveryBoy: {
          name: 'Arjun Sharma',
          phone: '+91 98765 43210',
          rating: 4.8,
          vehicle: 'Electric Scooter (EV-09)',
        }
      };
      
      setOrderResult(enrichedOrder);
      
    } catch (err) {
      console.error(err);
      setPaymentError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCard   = v => v.replace(/\D/g,'').slice(0,16).replace(/(\d{4})(?=\d)/g,'$1 ');
  const formatExpiry = v => { const d = v.replace(/\D/g,'').slice(0,4); return d.length >= 2 ? d.slice(0,2)+'/'+d.slice(2) : d; };

  // ─── ORDER SUCCESS ───
  if (orderResult) return <DeliveryTracker order={orderResult} />;

  // ─── EMPTY CART ───
  if (cartItems.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-emerald-500 flex justify-center mb-4"><CheckCircle2 className="w-20 h-20" /></div>
      <h2 className="text-2xl font-bold mb-4">{t('cart.yourCartIsEmpty')}</h2>
      <Link href="/" className="inline-block bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white px-10 py-4 rounded-2xl font-black text-lg hover:brightness-110 shadow-lg shadow-emerald-500/25 transition-all active:scale-95">
        {t('cart.startShopping')} →
      </Link>
    </div>
  );

  // ─── MAIN CHECKOUT ───
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t('checkout.checkout')}</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1"><Lock className="w-3 h-3" /> {t('checkout.sslSecure')}</p>
          </div>
        </div>
        <Link href="/cart" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 transition-all w-fit">
          <ArrowLeft className="w-4 h-4" />
          {t('checkout.backToCart')}
        </Link>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8 px-1">
        {[t('checkout.stepYou'), t('checkout.stepAddress'), t('checkout.stepOffers'), t('checkout.stepPayment')].map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step > i+1 ? 'bg-emerald-500 text-white' : step === i+1 ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 ring-2 ring-offset-2 ring-gray-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
                {step > i+1 ? '✓' : i+1}
              </div>
              <span className={`text-[10px] font-black whitespace-nowrap ${step === i+1 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < 3 && <div className={`h-0.5 flex-1 rounded-full transition-all mb-4 ${step > i+1 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'}`}></div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

        {/* LEFT: Steps */}
        <form onSubmit={handlePayment} className="space-y-4">

          {/* ────── STEP 1: Identity ────── */}
          <div className={`bg-white dark:bg-gray-900 rounded-3xl border transition-all ${step === 1 ? 'border-emerald-300 dark:border-emerald-700 shadow-lg shadow-emerald-500/10' : 'border-gray-100 dark:border-gray-800 shadow-sm'}`}>
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <StepBadge step={1} current={step} />
                <div className="flex items-center gap-2">
                  <User2 className="w-4 h-4 text-gray-400" />
                  <h3 className={`font-black text-base ${step === 1 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{t('checkout.whoAreYou')} 👋</h3>
                </div>
              </div>
              {step > 1 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{guestName}</span>
                  <button type="button" onClick={() => setStep(1)} className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline">Edit</button>
                </div>
              )}
            </div>
            {step === 1 && (
              <div className="px-5 pb-6 border-t border-gray-100 dark:border-gray-800 space-y-4 pt-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-400 font-medium flex gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  {t('checkout.guestCheckoutInfo', { login: <a href="/login" className="font-black underline">{t('checkout.signIn')}</a> })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="co-label">{t('checkout.fullName')} *</label>
                    <input value={guestName} onChange={e => setGuestName(e.target.value)} required className="checkout-input" placeholder={t('checkout.namePlaceholder')} />
                  </div>
                  <div>
                    <label className="co-label">{t('checkout.phone')} *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">+91</span>
                      <input value={guestPhone} onChange={e => setGuestPhone(e.target.value.replace(/\D/g,'').slice(0,10))} className="checkout-input pl-10" placeholder="9876543210" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="co-label">{t('checkout.email')}</label>
                  <input value={guestEmail} onChange={e => setGuestEmail(e.target.value)} type="email" className="checkout-input" placeholder="example@email.com" />
                </div>
                <button type="button" disabled={!guestName.trim()}
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white rounded-2xl py-5 font-black text-lg hover:brightness-110 transition-all shadow-[0_12px_25px_rgba(22,163,74,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4">
                  Continue to Address <ChevronRight className="w-6 h-6" strokeWidth={3} />
                </button>
              </div>
            )}
          </div>

          {/* ────── STEP 2: Address ────── */}
          <div className={`bg-white dark:bg-gray-900 rounded-3xl border transition-all ${step === 2 ? 'border-emerald-300 dark:border-emerald-700 shadow-lg shadow-emerald-500/10' : 'border-gray-100 dark:border-gray-800 shadow-sm opacity-60'} ${step < 2 ? 'pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <StepBadge step={2} current={step} />
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <h3 className={`font-black text-base ${step === 2 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{t('checkout.deliveryAddress')}</h3>
                </div>
              </div>
              {step > 2 && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 truncate max-w-[120px]">{flatNo}, {address}</span>
                  <button type="button" onClick={() => setStep(2)} className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline">Edit</button>
                </div>
              )}
            </div>
            {step === 2 && (
              <div className="px-5 pb-6 border-t border-gray-100 dark:border-gray-800 space-y-4 pt-4">
                {/* Delivery Method Selector */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                  <button 
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${deliveryMethod === 'delivery' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600' : 'text-gray-500'}`}
                  >
                    {t('checkout.homeDelivery')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${deliveryMethod === 'pickup' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600' : 'text-gray-500'}`}
                  >
                    {t('checkout.storePickup')}
                  </button>
                </div>

                {deliveryMethod === 'delivery' ? (
                  <>
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex gap-3 mb-4">
                      <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-300">{t('checkout.deliveryLimit')}</p>
                        <p className="text-xs text-blue-700 dark:text-blue-400">{t('checkout.deliveryLimitDesc')}</p>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={handleDetectLocation}
                      disabled={detecting}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-black text-sm border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 transition-all disabled:opacity-50 mb-4"
                    >
                      <MapPin className={`w-4 h-4 ${detecting ? 'animate-bounce' : ''}`} />
                      {detecting ? t('checkout.detecting') : t('navbar.detectLocation')}
                    </button>

                    {/* Address type pills */}
                    <div>
                      <label className="co-label">{t('checkout.saveAs')}</label>
                      <div className="flex gap-2 mt-1">
                        {['Home', 'Work', 'Other'].map(t => (
                          <button key={t} type="button" onClick={() => setAddressType(t)}
                            className={`px-4 py-1.5 rounded-full text-xs font-black border transition-all ${addressType === t ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                            {t === 'Home' ? '🏠' : t === 'Work' ? '💼' : '📍'} {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="co-label">{t('checkout.flatNo')} *</label>
                        <input value={flatNo} onChange={e => setFlatNo(e.target.value)} required className="checkout-input" placeholder="Flat 4B" />
                      </div>
                      <div>
                        <label className="co-label">{t('checkout.pincode')} *</label>
                        <input value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g,'').slice(0,6))} required className="checkout-input" placeholder="600001" />
                      </div>
                    </div>
                    <div>
                      <label className="co-label">{t('checkout.streetArea')} *</label>
                      <input value={address} onChange={e => setAddress(e.target.value)} required className="checkout-input" placeholder={t('checkout.addressPlaceholder')} />
                    </div>
                    <div>
                      <label className="co-label">{t('checkout.landmark')}</label>
                      <input value={landmark} onChange={e => setLandmark(e.target.value)} className="checkout-input" placeholder="e.g. Near ATM" />
                    </div>

                    {/* Delivery instructions */}
                    <div>
                      <label className="co-label">{t('checkout.deliveryInstructions')}</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {DELIVERY_INSTRUCTIONS.map(ins => (
                          <button key={ins} type="button" onClick={() => setInstruction(instruction === ins ? '' : ins)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${instruction === ins ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}>
                            {ins}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tip for delivery partner */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-900">
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-orange-500 fill-orange-400" />
                        <p className="font-black text-sm text-gray-800 dark:text-white">{t('checkout.tipYourDeliveryPartner')}</p>
                        <span className="text-xs text-gray-500 font-medium">{t('checkout.goesToPartner')}</span>
                      </div>
                      <div className="flex gap-2">
                        {TIPS.map(t_val => (
                          <button key={t_val} type="button" onClick={() => setTip(t_val)}
                            className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${tip === t_val ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300'}`}>
                            {t_val === 0 ? t('checkout.none') : `₹${t_val}`}
                          </button>
                        ))}
                      </div>
                      {tip > 0 && <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-semibold">{t('checkout.thankYouTip', { amount: tip })}</p>}
                    </div>

                    <button type="button" disabled={!flatNo || !address || pincode.length < 6}
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('nearmart_last_address', JSON.stringify({ address, pincode, flatNo, landmark }));
                        }
                        setStep(3);
                      }}
                      className="w-full bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white rounded-2xl py-5 font-black text-lg hover:brightness-110 transition-all shadow-[0_12px_25px_rgba(22,163,74,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4">
                      {t('auth.continue', 'Continue')} <ChevronRight className="w-6 h-6" strokeWidth={3} />
                    </button>
                  </>
                ) : (
                  <div className="space-y-4 py-2">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6 text-center">
                      <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-300">{t('checkout.storePickup')}</h3>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">{t('checkout.readyIn', { time: '45 mins', store: 'Anna Nagar Store' })}</p>
                    </div>
                    <button type="button" onClick={() => setStep(3)}
                      className="w-full bg-emerald-500 text-white rounded-2xl py-3.5 font-black hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 mt-2">
                      {t('auth.continue', 'Continue')} <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

            {/* ────── STEP 3: Offers & Coupons ────── */}
          <div 
            onClick={() => step > 3 && setStep(3)}
            className={`bg-white dark:bg-gray-900 rounded-3xl border transition-all cursor-pointer ${step === 3 ? 'border-emerald-300 dark:border-emerald-700 shadow-lg shadow-emerald-500/10' : 'border-gray-100 dark:border-gray-800 shadow-sm opacity-60'} ${step < 3 ? 'pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <StepBadge step={3} current={step} />
                <div className="flex items-center gap-2">
                  <BadgePercent className="w-4 h-4 text-gray-400" />
                  <h3 className={`font-black text-base ${step === 3 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{t('checkout.stepOffers')}</h3>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {appliedCoupon ? (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full uppercase tracking-wider">{appliedCoupon.code} {t('checkout.applied')}</span>
                ) : step > 3 ? (
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('checkout.none')}</span>
                ) : null}
                {step > 3 && <button type="button" className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline">{t('common.edit')}</button>}
              </div>
            </div>
            {step === 3 && (
              <div className="px-5 pb-6 border-t border-gray-100 dark:border-gray-800 space-y-4 pt-4" onClick={e => e.stopPropagation()}>
                {/* Coupon input */}
                <div>
                  <label className="co-label">{t('checkout.enterCoupon')}</label>
                  <div className="relative mt-1">
                    <input 
                      value={couponInput} 
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); setCouponSuccess(''); }}
                      className="checkout-input pr-24" 
                      placeholder="e.g. FRESH10" 
                    />
                    <button 
                      type="button" 
                      onClick={() => applyCoupon()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 !bg-[#10B981] !text-white rounded-[14px] font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-md z-10 hover:brightness-110"
                    >
                      {t('checkout.apply')}
                    </button>
                  </div>
                  {couponError   && <p className="text-xs text-red-500 mt-1 font-semibold flex gap-1"><AlertCircle className="w-3 h-3 mt-0.5" />{couponError}</p>}
                  {couponSuccess && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold">{couponSuccess}</p>}
                </div>

                {/* Available coupons */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('checkout.availableOffers')}</p>
                  {COUPONS.map(c => (
                    <div key={c.code} 
                      onClick={() => applyCoupon(c.code)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${appliedCoupon?.code === c.code ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : 'border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-300'}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <Gift className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-gray-800 dark:text-gray-100">{c.code}</p>
                          <p className="text-xs text-gray-500">{c.label}</p>
                        </div>
                      </div>
                      {appliedCoupon?.code === c.code
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        : <button type="button" onClick={(e) => { e.stopPropagation(); applyCoupon(c.code); }} className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors uppercase">{t('checkout.tapToApply')}</button>}
                    </div>
                  ))}
                </div>

                <button type="button" onClick={() => setStep(4)}
                  className="w-full bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white rounded-2xl py-5 font-black text-lg hover:brightness-110 transition-all shadow-[0_12px_25px_rgba(22,163,74,0.35)] flex items-center justify-center gap-3 mt-4">
                  {appliedCoupon ? t('checkout.savedContinue', { amount: couponDiscount }) : t('checkout.skipContinue')} <ChevronRight className="w-6 h-6" strokeWidth={3} />
                </button>
              </div>
            )}
          </div>

          {/* ────── STEP 4: Payment ────── */}
          <div className={`bg-white dark:bg-gray-900 rounded-3xl border transition-all ${step === 4 ? 'border-emerald-300 dark:border-emerald-700 shadow-lg shadow-emerald-500/10' : 'border-gray-100 dark:border-gray-800 shadow-sm opacity-60'} ${step < 4 ? 'pointer-events-none' : ''}`}>
            <div className="flex items-center p-5">
              <div className="flex items-center gap-3">
                <StepBadge step={4} current={step} />
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <h3 className={`font-black text-base ${step === 4 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{t('checkout.stepPayment')}</h3>
                </div>
              </div>
            </div>
            {step === 4 && (
              <div className="px-5 pb-6 border-t border-gray-100 dark:border-gray-800 space-y-5 pt-4">

                {/* Method Selector */}
                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                      className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 font-bold text-xs transition-all ${paymentMethod === m.id ? `${m.bg} border-emerald-500 text-emerald-600 shadow-md scale-[1.03]` : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300'}`}>
                      <span className={paymentMethod === m.id ? 'text-emerald-500' : 'text-gray-400'}>{m.icon}</span>
                      <span className="font-black">{m.label}</span>
                      <span className="opacity-70 text-[9px] text-center leading-tight">{m.sub}</span>
                    </button>
                  ))}
                </div>

                {/* UPI */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-4 gap-2">
                      {UPI_APPS.map(app => (
                        <button key={app} type="button" onClick={() => setSelectedUpiApp(app)}
                          className={`py-2.5 rounded-xl border-2 text-xs font-black transition-all ${selectedUpiApp === app ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-emerald-200'}`}>
                          {app.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                    <input value={upiId} onChange={e => setUpiId(e.target.value)} className="checkout-input" placeholder="yourname@paytm  (optional)" />
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-3 border border-emerald-100 dark:border-emerald-900 flex gap-2 items-start">
                      <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">{t('checkout.instantPaymentUpi')}</p>
                    </div>
                  </div>
                )}

                {/* Card */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="relative">
                      <label className="co-label">{t('checkout.cardNumber')}</label>
                      <input value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} required={paymentMethod==='card'} className="checkout-input font-mono tracking-widest pr-12" placeholder="1234 5678 9012 3456" />
                      <CreditCard className="absolute right-3 bottom-2.5 w-5 h-5 text-gray-300" />
                    </div>
                    <input value={cardName} onChange={e => setCardName(e.target.value)} required={paymentMethod==='card'} className="checkout-input" placeholder={t('checkout.cardName')} />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="co-label">{t('checkout.expiry')}</label>
                        <input value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} required={paymentMethod==='card'} className="checkout-input font-mono" placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="co-label">{t('checkout.cvv')}</label>
                        <input type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,4))} required={paymentMethod==='card'} className="checkout-input font-mono" placeholder="•••" />
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-3 border border-blue-100 dark:border-blue-900 flex gap-2 items-start">
                      <Lock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">{t('checkout.cardSecureDesc')}</p>
                    </div>
                  </div>
                )}

                {/* COD */}
                {paymentMethod === 'cod' && (
                  <div className="animate-fadeIn bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900 flex gap-4 items-start">
                    <Banknote className="w-8 h-8 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-black text-emerald-800 dark:text-emerald-200">Cash on Delivery</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">Pay ₹{totalAmount.toFixed(0)} in cash when your delivery arrives. Keep change handy.</p>
                    </div>
                  </div>
                )}

                {paymentError && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-700 dark:text-red-400 font-semibold text-sm flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {paymentError}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white rounded-[22px] py-6 font-black text-xl hover:brightness-110 transition-all shadow-[0_15px_35px_rgba(22,163,74,0.35)] hover:-translate-y-1 flex items-center justify-center gap-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                  {loading ? (
                    <><Loader2 className="w-7 h-7 animate-spin" /> {t('common.processing')}</>
                  ) : (
                    <><ShieldCheck className="w-7 h-7" strokeWidth={3} /> {t('checkout.pay')} ₹{totalAmount.toFixed(0)} <ChevronRight className="w-6 h-6" strokeWidth={3} /></>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3" /> {t('checkout.securedBy')}
                </p>
              </div>
            )}
          </div>
        </form>

        {/* RIGHT: Bill Summary */}
        <div className="space-y-4 sticky top-24">

          {/* Cart items */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-black text-gray-800 dark:text-white">{t('checkout.yourOrder')}</h2>
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-black px-2.5 py-1 rounded-full">{t('cart.itemCount', { count: cartItems.length })}</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-60 overflow-y-auto no-scrollbar">
              {cartItems.map(item => {
                const fallbackImage = 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_200,h_200,q_auto,f_auto/samples/food/fish-vegetables.jpg';
                const getValidImage = () => {
                  const img = item.image_url || item.image;
                  if (!img || img === 'undefined' || img === 'null') return fallbackImage;
                  if (img.startsWith('http') || img.startsWith('/')) return img;
                  return fallbackImage;
                };

                return (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-50">
                    <Image 
                      src={getValidImage()} 
                      alt={item.name || 'Item'} 
                      fill
                      sizes="40px"
                      className="object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate" suppressHydrationWarning>
                      {item[`name_${language}`] || item.name}
                    </p>
                    <p className="text-xs text-gray-400">{t('cart.qty', { qty: item.quantity })}</p>
                  </div>
                  <p className="font-black text-sm text-gray-800 dark:text-white">₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>
                );
              })}
            </div>
          </div>

          {/* Bill Breakdown */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
            <h2 className="font-black text-gray-800 dark:text-white mb-1">{t('cart.billDetails')}</h2>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{t('cart.itemTotal')}</span>
              <span className="font-semibold">₹{subTotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">Delivery Fee
                {deliveryFee === 0 && <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-black px-1.5 py-0.5 rounded-full ml-1">FREE</span>}
              </span>
              <span className={`font-semibold ${deliveryFee === 0 ? 'line-through text-gray-300' : ''}`}>₹{deliveryFee}</span>
            </div>
            {tip > 0 && (
              <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3 fill-orange-400" /> Delivery Tip</span>
                <span className="font-semibold">₹{tip}</span>
              </div>
            )}
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Coupon ({appliedCoupon.code})</span>
                <span className="font-semibold">−₹{couponDiscount}</span>
              </div>
            )}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between">
              <span className="font-black text-gray-900 dark:text-white text-base">{t('cart.total')}</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-xl">₹{totalAmount.toFixed(0)}</span>
            </div>
            {deliveryFee === 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-2 text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                {t('checkout.savedDelivery', { amount: 40 })}
              </div>
            )}
          </div>

          {/* Delivery Promise */}
          <div className="bg-[#064E3B] rounded-[32px] p-6 text-white shadow-2xl shadow-emerald-900/20 border border-emerald-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <p className="font-black text-xl leading-none tracking-tight">{t('checkout.expressDeliveryPromise')}</p>
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-1">{t('checkout.expressDeliveryPromise')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/20 rounded-2xl px-4 py-3 border border-white/5">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <p className="text-[11px] text-emerald-100 font-bold leading-tight">{t('checkout.farmFreshDesc')}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
