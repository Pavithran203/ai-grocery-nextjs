"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import ProductsContent from '@/components/ProductsContent';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CAMPAIGNS } from '@/data/campaigns';

export default function CampaignPage() {
  const params = useParams();
  const id = params.id;
  const campaign = CAMPAIGNS.find(item => item.id === id) || null;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);

      if (!campaign) {
        const allProducts = await api.getProducts();
        if (mounted) {
          setProducts(allProducts.slice(0, 10));
          setLoading(false);
        }
        return;
      }

      const productLists = await Promise.all(
        campaign.categories.map(category => api.getProducts(category))
      );
      const seen = new Set();
      const merged = productLists.flat().filter(product => {
        if (seen.has(product.id)) return false;
        seen.add(product.id);
        return true;
      });

      if (mounted) {
        setProducts(merged);
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [campaign]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            {campaign?.title || 'Special Offers'}
          </h1>
          {campaign?.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-2">
              {campaign.description}
            </p>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-20 font-black">Loading Campaign...</div>
      ) : (
        <ProductsContent products={products} />
      )}
    </div>
  );
}
