import { useCart } from "@/context/CartContext";
import { Sparkles, ShoppingBag, Plus, ArrowRight, X, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Image from "next/image";

export default function ComboSection({ bundles }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [showCartChoices, setShowCartChoices] = useState(false);
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const handleAddBundle = (bundle) => {
    bundle.items.forEach(item => addToCart(item));
    setShowCartChoices(true);
  };

  return (
    <section id="combos" className="space-y-10 py-10 border-y border-orange-100 dark:border-orange-900/30">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-wider">{t('product.marketSpecial', 'Market Special')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t('product.marketComboOffers', 'Market Combo Offers')}</h2>
          <p className="text-gray-500 mt-1 font-medium">{t('product.curatedBundles', 'Curated bundles to save your time and money.')}</p>
        </div>
        <button className="hidden sm:flex items-center gap-2 text-orange-600 font-black text-sm hover:underline">
          {t('product.viewAllOffers', 'View All Offers')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {!bundles || bundles.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 dark:bg-gray-900/50 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-800 w-full">
          <p className="text-gray-400 font-bold italic">{t('common.noResults', 'No Results')}</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-6 gap-6 no-scrollbar md:grid md:grid-cols-2 md:gap-8 snap-x">
          {bundles.map((bundle, idx) => (
          <div 
            key={idx}
            className="group relative overflow-hidden rounded-[32px] p-6 sm:p-10 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] active:scale-[0.98] min-w-[280px] sm:min-w-[340px] md:min-w-0 snap-center flex-shrink-0 border border-white/40 dark:border-white/5"
            style={{ background: bundle.gradient || 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' }}
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Background Decorations */}
            <div className="absolute -top-12 -right-12 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
              <Sparkles className="w-64 h-64" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <span className={`px-5 py-2 rounded-full backdrop-blur-xl text-[11px] font-black uppercase tracking-widest shadow-sm ${
                  bundle.badge === 'Festival Offer' ? 'bg-orange-500 text-white animate-pulse' : 
                  bundle.badge === 'Fast Moving' ? 'bg-emerald-500 text-white' : 
                  'bg-white/60 text-gray-900 border border-white'
                }`}>
                  {bundle.badge === 'Festival Offer' ? t('product.festivalOffer', 'Festival Offer') :
                   bundle.badge === 'Fast Moving' ? t('product.fastMoving', 'Fast Moving') :
                   bundle.badge === 'Best Seller' ? t('product.bestSeller', 'Best Seller') :
                   bundle.badge === 'Nearby Buying' ? t('product.nearbyBuying', 'Nearby Buying') :
                   t('product.valueBundle', 'Value Bundle')}
                </span>
                <div className="text-right">
                  <span className="block text-3xl sm:text-4xl font-black text-gray-900 leading-none">
                    ₹{bundle.discount}
                  </span>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">OFF {t('product.festivalOffer') ? 'Special' : ''}</span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6 leading-tight max-w-[80%]">
                {language === 'ta' && bundle.title_ta ? bundle.title_ta :
                 language === 'te' && bundle.title_te ? bundle.title_te :
                 language === 'kn' && bundle.title_kn ? bundle.title_kn :
                 language === 'ml' && bundle.title_ml ? bundle.title_ml :
                 language === 'hi' && bundle.title_hi ? bundle.title_hi :
                 bundle.title}
              </h3>

              <div className="flex -space-x-5 mb-10">
                {bundle.items.map((item, i) => {
                  const fallbackImage = 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_200,h_200,q_auto,f_auto/samples/food/spices.jpg';
                  const getValidImage = () => {
                    const img = item.image_url || item.image;
                    if (!img || img === 'undefined' || img === 'null') return fallbackImage;
                    if (img.startsWith('http') || img.startsWith('/')) return img;
                    return fallbackImage;
                  };
                  return (
                  <div key={item.id || i} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] border-4 border-white bg-white/40 backdrop-blur-md overflow-hidden shadow-xl transform transition-all duration-500 group-hover:translate-y-[-8px] group-hover:rotate-2 hover:!scale-125 hover:z-50" style={{ transitionDelay: `${i * 100}ms` }}>
                    <Image 
                      src={getValidImage()} 
                      alt={item.name || 'Item'} 
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  );
                })}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] border-4 border-white bg-white/40 backdrop-blur-xl flex items-center justify-center text-gray-900 text-xl font-black shadow-xl">
                  +{bundle.items.length}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{t('product.includes', 'Includes')}</p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {bundle.items.map(it => {
                      const itemName = language === 'ta' && it.name_ta ? it.name_ta :
                                     language === 'te' && it.name_te ? it.name_te :
                                     language === 'kn' && it.name_kn ? it.name_kn :
                                     language === 'ml' && it.name_ml ? it.name_ml :
                                     language === 'hi' && it.name_hi ? it.name_hi :
                                     it.name;
                      return itemName;
                    }).join(' + ')}
                  </p>
                </div>
                <button 
                  onClick={() => handleAddBundle(bundle)}
                  className="flex items-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm sm:text-base shadow-2xl hover:bg-black hover:scale-105 transition-all active:scale-95 shrink-0 group/btn"
                >
                  <ShoppingBag className="w-5 h-5 group-hover/btn:animate-bounce" />
                  {t('product.addCombo', 'Add Combo')}
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}
      {/* ── CART CHOICES MODAL ── */}
      {showCartChoices && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 animate-slideUp text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            <button 
              onClick={() => setShowCartChoices(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('common.added', 'Added!')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
              {t('cart.comboAddedDesc', 'Your combo pack has been successfully added. What would you like to do next?')}
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/cart')}
                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
              >
                {t('cart.goToCart', 'Go to Cart')} <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowCartChoices(false)}
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-black rounded-2xl hover:bg-gray-200 transition-all"
              >
                {t('cart.continueShopping', 'Continue Shopping')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
