"use client";

import { useEffect, useState } from 'react';
import ProductDetailContent from './ProductDetailContent';
import Link from 'next/link';

export default function ProductDetailFallback({ productId }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cleanId = productId.includes('__') ? productId.split('__')[1] : productId;
      
      // Look in local storage for custom products
      const customProducts = JSON.parse(localStorage.getItem('nearmart_admin_products') || '[]');
      const found = customProducts.find(p => p.id === cleanId && p.available !== false && !p.deleted);
      
      if (found) {
        // Mock a store mapping if the ID contains store prefix
        let mapped = { ...found };
        if (productId.includes('__')) {
          const storeId = productId.split('__')[0];
          mapped = {
            ...mapped,
            id: productId,
            storeId: storeId,
            storeName: "Local Store"
          };
        }
        setProduct(mapped);
      }
    } catch (e) {
      console.error('Failed to parse local products', e);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center text-slate-500 font-bold">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link href="/" className="text-emerald-500 font-bold hover:underline">Return to Home</Link>
      </div>
    );
  }

  return <ProductDetailContent product={product} />;
}
