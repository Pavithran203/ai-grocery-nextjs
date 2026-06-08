import { api } from '@/services/api';
import ProductsContent from '@/components/ProductsContent';

export default async function ProductsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const category = resolvedParams?.category || resolvedParams?.cat || null;
  const q = resolvedParams?.q || resolvedParams?.search || '';
  const products = await api.getProducts(category);

  return (
    <ProductsContent products={products} category={category} initialQuery={q} />
  );
}
