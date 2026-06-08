import { api } from '@/services/api';
import Link from 'next/link';
import { X } from 'lucide-react';
import ProductDetailContent from '@/components/ProductDetailContent';

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await api.getProductById(id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link href="/" className="text-emerald-500 font-bold hover:underline">Return to Home</Link>
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
