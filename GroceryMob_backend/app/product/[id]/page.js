"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, Star, Plus, Minus, ShoppingCart, Zap, ShieldCheck, RefreshCw } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { cartItems, addToCart, updateQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);

  const pId = product ? (product._id || product.id) : null;
  const inCart = product ? cartItems.find(item => (item._id || item.id) === pId) : null;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getProductById(id)
      .then(setProduct)
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center">
        <div className="w-10 h-10 border-4 border-[#5C61F2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg mb-6">{error || "Product not found."}</p>
        <button
          onClick={() => router.back()}
          className="bg-[#5C61F2] text-white px-8 py-3 rounded-full font-bold hover:bg-[#4b50d9] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, qty);
  };

  const handleBuyNow = () => {
    // Add to cart first
    addToCart(product, qty);
    // Then redirect to checkout
    setTimeout(() => router.push("/checkout"), 100);
  };

  const discountedPrice = (product.price * 0.8).toFixed(2);
  const originalPrice = product.price.toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-[#5C61F2] transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Product Image */}
        <div className="relative bg-[#F7F7F7] dark:bg-gray-800 rounded-3xl overflow-hidden flex items-center justify-center p-8 aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full mix-blend-multiply dark:mix-blend-normal rounded-2xl"
          />
          <div className="absolute top-5 left-5 bg-[#FFAB76] text-white text-sm font-black px-3 py-1.5 rounded-full shadow">
            -20% OFF
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          {/* Category badge */}
          <span className="inline-block bg-[#5C61F2]/10 text-[#5C61F2] text-xs font-bold px-3 py-1 rounded-full mb-4 w-max">
            {product.category}
          </span>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i <= Math.round(product.rating || 4) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{product.rating || "4.5"}</span>
            <span className="text-sm text-gray-400">(128 reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-4xl font-black text-gray-900 dark:text-white">₹{discountedPrice}</span>
            <span className="text-xl text-gray-400 line-through font-medium">₹{originalPrice}</span>
            <span className="text-sm font-bold text-emerald-500">You save ₹{(product.price * 0.2).toFixed(2)}</span>
          </div>

          {/* Quantity selector + Add to cart */}
          {inCart ? (
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-3 bg-[#5C61F2]/10 rounded-full px-4 py-2 border border-[#5C61F2]/20">
                <button
                  onClick={() => updateQuantity(pId, inCart.quantity - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-[#5C61F2] shadow-sm"
                >
                  <Minus className="w-4 h-4" strokeWidth={3} />
                </button>
                <span className="text-lg font-black text-[#5C61F2] min-w-6 text-center">{inCart.quantity}</span>
                <button
                  onClick={() => updateQuantity(pId, inCart.quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[#5C61F2] text-white shadow-sm"
                >
                  <Plus className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>
              <span className="text-sm text-emerald-600 font-bold mb-2">✓ Added to cart</span>
              <button
                onClick={() => router.push("/checkout")}
                className="flex items-center justify-center gap-2 bg-[#FF9F43] hover:bg-[#FF8C1A] text-white py-3.5 rounded-full font-bold text-base shadow-lg shadow-[#FF9F43]/30 transition-all active:scale-95"
              >
                <Zap className="w-5 h-5" />
                Proceed to Checkout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-8">
              {/* Qty picker */}
              <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-2">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  <Minus className="w-3 h-3" strokeWidth={3} />
                </button>
                <span className="text-base font-bold w-6 text-center">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  <Plus className="w-3 h-3" strokeWidth={3} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 bg-[#5C61F2]/10 border-2 border-[#5C61F2] hover:bg-[#5C61F2]/20 text-[#5C61F2] py-3.5 rounded-full font-bold text-base transition-all active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2 bg-[#FF9F43] hover:bg-[#FF8C1A] text-white py-3.5 rounded-full font-bold text-base shadow-lg shadow-[#FF9F43]/30 transition-all active:scale-95"
                >
                  <Zap className="w-5 h-5" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Zap className="w-4 h-4" />, label: "10-min delivery" },
              { icon: <ShieldCheck className="w-4 h-4" />, label: "100% fresh" },
              { icon: <RefreshCw className="w-4 h-4" />, label: "Easy returns" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl py-3 px-2 text-center"
              >
                <span className="text-[#5C61F2]">{icon}</span>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
