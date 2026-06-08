import { api } from '@/services/api';
import HomeContent from '@/components/HomeContent';

export default async function Home() {
  const [categories, trending, recommended, megaDeals, newArrivals, allProducts, bundles] = await Promise.all([
    api.getCategories(),
    api.getTrending(),
    api.getRecommended(),
    api.getMegaDeals(),
    api.getNewArrivals(),
    api.getProducts(),
    api.getBundleSuggestions()
  ]);

  const traditionalStaples = allProducts.filter(p => 
    p.category === 'Staples' && (
      p.tag === 'Traditional' || p.tag === 'Pure' || p.tag === 'Premium' || 
      p.name?.toLowerCase().includes('jaggery') || p.name?.toLowerCase().includes('rice')
    )
  ).slice(0, 4);

  // Deduplicate: each section shows unique products
  const recommendedIds = new Set(recommended.map(p => p.id));
  const trendingFiltered = trending.filter(p => !recommendedIds.has(p.id));
  const trendingIds = new Set(trendingFiltered.map(p => p.id));
  const dealsFiltered = megaDeals.filter(p => !recommendedIds.has(p.id) && !trendingIds.has(p.id));
  const newArrivalsFiltered = (newArrivals || []).filter(p =>
    !recommendedIds.has(p.id) && !trendingIds.has(p.id) && !new Set(dealsFiltered.map(x => x.id)).has(p.id)
  );

  return (
    <HomeContent 
      trendingFiltered={trendingFiltered}
      recommended={recommended}
      dealsFiltered={dealsFiltered}
      newArrivalsFiltered={newArrivalsFiltered}
      bundles={bundles}
      traditionalStaples={traditionalStaples}
      allProducts={allProducts}
    />
  );
}
// Trigger Next.js dev server recompile: 2026-05-18T07:42:00Z
