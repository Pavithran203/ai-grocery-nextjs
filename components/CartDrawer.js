"use client";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { X, Plus, Minus, ChevronLeft, ChevronRight, Clock, Tag, CreditCard, BadgePercent, Gift, ArrowRight, ShoppingCart, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { couponService } from "@/services/couponService";
import { useRouter } from "next/navigation";
import SafeImage from "./SafeImage";
const COUPONS = [
  { code: 'FRESH50', discount: 50, minOrder: 500, desc: 'Save ₹50 on orders above ₹500' },
  { code: 'FIRST100', discount: 100, minOrder: 800, desc: 'Save ₹100 on your first order' },
  { code: 'DEAL30', discount: 30, minOrder: 300, desc: 'Flat ₹30 off on ₹300+' },
];

export default function CartDrawer() {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    getCartCount,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCart();
  const { isAuthenticated, setLoginModalOpen } = useAuth();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      window.history.pushState({ isCartOpen: true }, '');

      const handlePopState = () => {
        setIsCartOpen(false);
      };

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          window.history.back();
        }
      };

      window.addEventListener('popstate', handlePopState);
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isCartOpen, setIsCartOpen]);

  const closeCart = () => {
    if (window.history.state && window.history.state.isCartOpen) {
      window.history.back();
    } else {
      setIsCartOpen(false);
    }
  };

  const savings = cartItems.reduce((total, item) => {
    const discount = item.discount || 0;
    if (discount > 0) {
      const orig = Math.round(item.price / (1 - discount / 100));
      return total + (orig - item.price) * item.quantity;
    }
    return total;
  }, 0);

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = getCartCount();
  const deliveryFee = cartTotal >= 500 ? 0 : 29;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, cartTotal + deliveryFee - couponDiscount);

  const applicableCoupons = COUPONS.filter(c => cartTotal >= c.minOrder && c.code !== appliedCoupon?.code);
  const lockedCoupon = COUPONS.find(c => cartTotal < c.minOrder);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCart} />

      <div className="relative w-full max-w-[420px] h-full shadow-2xl flex flex-col cart-slide-in bg-white dark:bg-gray-950">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <button onClick={closeCart} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-black tracking-tight flex-1 text-gray-900 dark:text-white">{t('cart.shoppingCart')}</h2>
          {itemCount > 0 && (
            <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">{itemCount} {itemCount === 1 ? t('cart.item') : t('cart.items')}</span>
          )}
        </div>

        {/* Savings Banner */}
        {savings > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 px-4 py-2.5 flex items-center justify-center gap-2 border-b border-emerald-100/50 dark:border-emerald-900/30">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              {t('cart.savingsLabel', { amount: savings })}
            </span>
            <span className="text-emerald-500 text-sm">✓</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-300" />
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 dark:text-white">{t('cart.yourCartIsEmpty')}</p>
                <p className="text-sm text-gray-400 font-medium mt-1">{t('cart.looksLikeEmpty')}</p>
              </div>
              <button 
                onClick={closeCart} 
                style={{ backgroundColor: '#059669', color: '#ffffff', fontWeight: '900' }}
                className="px-10 py-4 rounded-full shadow-xl active:scale-95 transition-all text-[14px] tracking-widest uppercase"
              >
                {t('cart.startShopping')}
              </button>
            </div>
          ) : (
            <div>
              {/* Coupons & Offers */}
              <div className="mx-3 mt-3 rounded-2xl border overflow-hidden border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
                  <h3 className="text-[13px] font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-500" />
                    {t('cart.couponsOffers')}
                  </h3>
                </div>

                {appliedCoupon && (
                  <div className="px-4 py-3 bg-emerald-50/80 dark:bg-emerald-950/30 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Gift className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">₹{appliedCoupon.discount} saved with {appliedCoupon.code}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Coupon applied!</p>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Remove</button>
                  </div>
                )}

                {!appliedCoupon && lockedCoupon && (
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <BadgePercent className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Save ₹{lockedCoupon.discount} with {lockedCoupon.code}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          Shop for ₹{Math.max(0, lockedCoupon.minOrder - cartTotal)} more to apply
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">View all coupons</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Locked</span>
                  </div>
                )}

                {!appliedCoupon && applicableCoupons.length > 0 && (
                  <div className="border-t border-gray-50 dark:border-gray-800">
                    {applicableCoupons.slice(0, 1).map(coupon => (
                      <div key={coupon.code} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Gift className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">₹{coupon.discount} OFF with {coupon.code}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const result = couponService.validateCoupon(coupon.code, cartTotal);
                            if (result.success) applyCoupon(result.coupon);
                          }}
                          className="text-[11px] font-black text-white uppercase tracking-wider px-4 py-2 rounded-xl hover:shadow-lg active:scale-95 transition-all bg-gradient-to-br from-emerald-500 to-emerald-600"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Offers */}
              <div className="mx-3 mt-2 rounded-2xl border px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">{t('cart.viewPaymentOffers')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              {/* Delivery & Items */}
              <div className="mx-3 mt-2 rounded-2xl border overflow-hidden border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-50 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{t('cart.deliveringIn')}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">{itemCount} {itemCount === 1 ? t('cart.item') : t('cart.items')}</p>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {cartItems.map((item) => {
                    const discount = item.discount || 0;
                    const originalPrice = discount > 0 ? Math.round(item.price / (1 - discount / 100)) : null;

                    return (
                      <div key={item.id} className="px-4 py-3 flex items-center gap-3 group">
                        <div className="relative w-14 h-14 rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700 p-1">
                          <SafeImage 
                            src={item.image || item.image_url} 
                            alt={item.name || 'Item'} 
                            type="product"
                            entityId={item.id}
                            productName={item.name}
                            componentName="CartDrawer"
                            fill
                            sizes="56px"
                            objectFit="contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1" suppressHydrationWarning>
                            {item[`name_${i18n.language}`] || item.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">{item.unit || item.weight || '1 pack'}</p>
                        </div>

                        {/* Quantity Controls - Zepto style */}
                        <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl overflow-hidden shrink-0 shadow-lg border border-emerald-100 dark:border-emerald-900">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border-r border-emerald-100 dark:border-emerald-800"
                          >
                            <Minus className="w-3.5 h-3.5" strokeWidth={3.5} />
                          </button>
                          <span className="w-7 text-center text-xs font-black text-emerald-900 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white hover:brightness-110 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0 min-w-[52px]">
                          {originalPrice && (
                            <p className="text-[10px] text-gray-400 line-through leading-none mb-0.5">₹{originalPrice * item.quantity}</p>
                          )}
                          <p className="text-xs font-black text-gray-900 dark:text-white">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Free Delivery Progress */}
              {cartTotal < 500 && (
                <div className="mx-3 mt-2 rounded-2xl border px-4 py-3 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-emerald-500" />
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      {t('cart.freeDeliveryProgress', { amount: 500 - cartTotal })}
                    </p>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (cartTotal / 500) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Bill Details */}
              <div className="mx-3 mt-2 rounded-2xl border overflow-hidden border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
                  <h3 className="text-[13px] font-black text-gray-900 dark:text-white">{t('cart.billDetails')}</h3>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">{t('cart.itemTotal')}</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">{t('cart.deliveryFee')}</span>
                    <span className={`font-bold ${deliveryFee === 0 ? 'text-emerald-500' : 'text-gray-800 dark:text-gray-200'}`}>
                      {deliveryFee === 0 ? t('common.free') : `₹${deliveryFee}`}
                    </span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-medium">{t('cart.itemDiscount')}</span>
                      <span className="font-bold text-emerald-500">-₹{savings}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-medium">{t('cart.couponDiscount')} ({appliedCoupon.code})</span>
                      <span className="font-bold text-emerald-500">-₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between text-sm">
                    <span className="font-black text-gray-900 dark:text-white">{t('cart.grandTotal')}</span>
                    <span className="font-black text-gray-900 dark:text-white">₹{finalTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setIsCartOpen(false);
                  router.push('/checkout');
                } else {
                  setLoginModalOpen(true);
                  setIsCartOpen(false);
                }
              }}
              className="w-full py-5 text-white font-black rounded-[24px] shadow-2xl flex items-center justify-between px-6 transition-all active:scale-[0.98] text-lg group border-b-4 border-emerald-800 bg-emerald-600"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                   <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <span className="tracking-tight">
                  {isAuthenticated ? t('cart.proceedToCheckout') : t('cart.loginToCheckout')}
                </span>
              </div>
              <div className="flex items-center gap-2.5 bg-black/20 px-4 py-2 rounded-xl">
                <span className="font-black text-white">₹{finalTotal}</span>
                <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1" strokeWidth={3} />
              </div>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cartSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .cart-slide-in {
          animation: cartSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
