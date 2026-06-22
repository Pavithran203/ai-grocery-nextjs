import Link from 'next/link';
import { api } from '@/services/api';
import CategoryGrid from '@/components/CategoryGrid';
import ProductCard from '@/components/ProductCard';
import { TrendingUp, Zap, Tag, Gift } from 'lucide-react';

export default async function Home() {
  const categories = await api.getCategories();
  const trending = await api.getTrending();
  const megaDeals = await api.getRecommended();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

      {/* Hero Banner */}
      <section className="relative rounded-lg overflow-hidden bg-[#1F4A8E] text-white p-6 md:p-12 shadow-lg flex items-center justify-between">
        <div className="max-w-2xl z-10 relative">
          <span className="flex px-4 py-1.5 bg-white/20 rounded-full text-sm font-bold mb-4 items-center gap-2 w-max border border-white/30">
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" /> Instant 10-Min Delivery
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Fresh Groceries <br /> Delivered Fast
          </h1>
          <p className="text-blue-100 mb-8 text-lg font-light">
            Your daily essentials, fresh produce, and top brands right to your door.
          </p>
          <div className="flex gap-4">
            <Link href="/products" className="bg-white text-[#1F4A8E] px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
              Shop Now
            </Link>
            <button className="bg-white/20 backdrop-blur border border-white/30 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/30 transition-colors">
              View Deals
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Brand Partners Template (New) */}
      <section className="border-y border-gray-100 dark:border-gray-800 py-8">
        <p className="text-center text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Trusted by Top Brands</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
          {['Amul', 'Nestle', 'Britannia', 'Aashirvaad', 'Tropicana', 'Fortune'].map((brand) => (
            <h3 key={brand} className="text-2xl font-black text-gray-800 dark:text-white tracking-tighter">{brand}</h3>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Shop by Category
          </h2>
          <Link href="/products" className="text-[#1F4A8E] dark:text-blue-400 font-bold text-sm hover:underline">
            See All →
          </Link>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      {/* Mega Deals Template (New) */}
      <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F1A800] rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Best Deals</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Limited time offers</p>
            </div>
          </div>
          <Link href="/products" className="text-[#1F4A8E] dark:text-blue-400 font-bold text-sm hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {megaDeals.slice(0, 5).map((product, i) => (
            <ProductCard key={`mega-${product._id || product.id || i}`} product={product} />
          ))}
        </div>
      </section>

      {/* Trending / Most Bought Template */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Popular in your area</p>
            </div>
          </div>
          <Link href="/products" className="text-[#1F4A8E] dark:text-blue-400 font-bold text-sm hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {trending.slice(0, 5).map((product, i) => (
            <ProductCard key={`trend-${product._id || product.id || i}`} product={product} />
          ))}
        </div>
      </section>

      {/* Mobile App Banner */}
      <section className="bg-linear-to-r from-blue-700 to-blue-800 text-white rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Get the FreshKart App</h2>
          <p className="text-blue-100">Download now for exclusive deals and faster checkout</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-[#1F4A8E] px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
            Download
          </button>
        </div>
      </section>

    </div>
  );
}
