"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import ProductModalOverlay from "@/components/ProductModalOverlay";
import ProductDetailContent from "@/components/ProductDetailContent";
import { useParams } from "next/navigation";

export default function ProductModalIntercept() {
  const params = useParams();
  const id = params.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      const data = await api.getProductById(id);
      setProduct(data);
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  if (loading) return null;
  if (!product) return null;

  return (
    <ProductModalOverlay>
      <ProductDetailContent product={product} isModal={true} />
    </ProductModalOverlay>
  );
}
