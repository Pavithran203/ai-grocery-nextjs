"use client";
import { X, ShoppingCart, Star, ShieldCheck, Zap, Heart, Share2, Info, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";

export default function ProductModal({ product, onClose }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const inCart = cartItems.find(item => item.id === product.id);

  const [isClosing, setIsClosing] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Push a dummy state to history to intercept back navigation
    window.history.pushState({ isModalOpen: true }, '');

    const handlePopState = () => {
      setIsClosing(true);
      setTimeout(onClose, 300);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        window.history.back(); // This triggers popstate
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => { 
      document.body.style.overflow = 'unset'; 
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleClose = () => {
    // Instead of manually closing, we tell the browser to go back,
    // which triggers the popstate listener to close the modal cleanly.
    if (window.history.state && window.history.state.isModalOpen) {
      window.history.back();
    } else {
      setIsClosing(true);
      setTimeout(onClose, 300);
    }
  };

  if (!product) return null;

  const originalPrice = product.discount > 0
    ? Math.round(product.price / (1 - product.discount / 100))
    : null;

  const productName = language === 'ta' && product.name_ta ? product.name_ta :
                   language === 'te' && product.name_te ? product.name_te :
                   language === 'kn' && product.name_kn ? product.name_kn :
                   language === 'ml' && product.name_ml ? product.name_ml :
                   language === 'hi' && product.name_hi ? product.name_hi :
                   product.name;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className={`relative w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl transition-transform duration-300 ease-out ${isClosing ? 'translate-y-full' : 'translate-y-0 sm:scale-100'} max-h-[90vh] flex flex-col bg-white dark:bg-gray-950`}>
        
        {/* Header (Sticky on Mobile) */}
        <div className="flex items-center justify-between p-6 sticky top-0 backdrop-blur-md z-10 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80">
          <h2 className="font-black text-xl truncate pr-4 text-gray-900 dark:text-white">{productName}</h2>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
            
            {/* Image Section */}
            <div className="w-full md:w-1/2">
              <div className="relative rounded-[32px] overflow-hidden p-8 aspect-square flex items-center justify-center bg-emerald-50/50 dark:bg-emerald-500/5 shadow-inner">
                <Image 
                  src={(imgSrc || product.image_url || '').startsWith('http') || (imgSrc || product.image_url || '').startsWith('/') ? (imgSrc || product.image_url) : 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_600,h_600,q_auto,f_auto/samples/food/fish-vegetables.jpg'} 
                  alt={productName || 'Product Image'} 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                  onError={() => setImgSrc(`https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_600,h_600,q_auto,f_auto/samples/food/fish-vegetables.jpg`)}
                />
                {parseFloat(product.rating) >= 4.8 && (
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-3 py-1 rounded-xl font-black text-[10px] tracking-widest shadow-xl shadow-amber-500/20 uppercase border border-white/20 animate-fadeIn">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('product.premium', 'Premium')}
                  </div>
                )}
                <button className="absolute top-4 right-4 p-3 rounded-2xl bg-white dark:bg-gray-900 shadow-xl text-gray-400 hover:text-rose-500 transition-all hover:scale-110">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Info Section */}
            <div className="w-full md:w-1/2 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge badge-teal">{t(`categories.${product.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`, product.category)}</span>
                  {product.tag && <span className="badge badge-orange">{product.tag}</span>}
                </div>
                <h1 className="text-4xl font-black leading-tight mb-2 tracking-tight text-gray-900 dark:text-white">
                  {productName}
                </h1>
                <p className="font-black uppercase tracking-widest text-[10px] text-gray-500">
                  {product.unit || '1 kg'} · {t('product.premiumQuality', 'Premium Quality')}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    {originalPrice && (
                      <span className="text-sm text-gray-400 line-through font-bold">₹{originalPrice}</span>
                    )}
                    <span className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white">₹{product.price}</span>
                  </div>
                  {product.discount > 0 && (
                    <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-xl shadow-emerald-500/30">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>

                {/* Social Proof Stats */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                      {Math.floor((product.reviews % 18) + 4)} {t('product.viewingNow', 'Viewing Now')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-500/20">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tighter">
                      {product.reviews * 12}+ {t('product.soldRecently', 'Sold Recently')}
                    </span>
                  </div>
                </div>

              </div>

              <div className="flex items-center gap-8 py-6 border-y border-gray-100 dark:border-gray-900">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Star className="w-6 h-6 fill-amber-500" />
                  </div>
                  <div>
                    <p className="text-base font-black text-gray-900 dark:text-white leading-none mb-1">{product.rating || '4.5'}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('product.rating', 'Rating')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Zap className="w-6 h-6 fill-emerald-500" />
                  </div>
                  <div>
                    <p className="text-base font-black text-gray-900 dark:text-white leading-none mb-1">{t('product.tenMins', '10 Mins')}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('product.delivery', 'Delivery')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-gray-800 dark:text-gray-200">{t('product.qualityAssured', 'Quality Assured')}</p>
                    <p className="text-xs text-gray-500">{t('product.sourcedDirectly', 'Sourced directly from certified farms')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-gray-800 dark:text-gray-200">{t('product.productInfo', 'Product Information')}</p>
                    <p className="text-xs text-gray-500">{t('product.storageInfo', 'Keep in cool & dry place. Avoid direct sunlight.')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Sticky CTA) */}
        <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="max-w-md mx-auto flex items-center gap-4">
            {inCart ? (
              <div className="flex-1 flex items-center justify-between bg-rose-50 dark:bg-rose-500/10 p-2 rounded-3xl border-2 border-rose-500/20 shadow-inner">
                <button 
                  onClick={() => updateQuantity(product.id, inCart.quantity - 1)}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-900 text-rose-600 shadow-sm hover:scale-105 active:scale-95 transition-all"
                >
                  <span className="text-3xl font-black">-</span>
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{inCart.quantity}</span>
                  <span className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest">{t('cart.inCart', 'In Cart')}</span>
                </div>
                <button 
                  onClick={() => updateQuantity(product.id, inCart.quantity + 1)}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl bg-rose-500 text-white shadow-xl shadow-rose-500/30 hover:scale-110 active:scale-95 transition-all"
                >
                  <span className="text-3xl font-black">+</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => addToCart(product)}
                className="flex-1 py-5 rounded-3xl flex items-center justify-center gap-4 text-white text-xl font-black shadow-2xl shadow-emerald-500/40 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <ShoppingCart className="w-7 h-7" strokeWidth={3} />
                <span>{t('product.add', 'Add')} · ₹{product.price}</span>
              </button>
            )}
            <button className="p-4 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}         </div>
        </div>

      </div>
    </div>
  );
}
