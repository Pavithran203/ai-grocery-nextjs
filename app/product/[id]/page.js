import { api } from '@/services/api';
import Link from 'next/link';
import { X } from 'lucide-react';
import ProductDetailFallback from '@/components/ProductDetailFallback';

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await api.getProductById(id);

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gray-50/50 dark:bg-black/20 py-6 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-950 rounded-[32px] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-900 overflow-hidden relative">
          <Link 
            href="/"
            className="absolute top-5 right-5 z-20 w-9 h-9 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-rose-500 transition-all active:scale-95 group"
          >
            <X className="w-4.5 h-4.5 transition-transform group-hover:rotate-90" />
          </Link>
          <ProductDetailFallback productId={id} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50/50 dark:bg-black/20 py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-950 rounded-[32px] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-900 overflow-hidden relative">
        
        {/* Close Button */}
        <Link 
          href="/"
          className="absolute top-5 right-5 z-20 w-9 h-9 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-rose-500 transition-all active:scale-95 group"
        >
          <X className="w-4.5 h-4.5 transition-transform group-hover:rotate-90" />
        </Link>

        <ProductDetailContent product={product} />
      </div>
    </div>
  );
}
