"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

const CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Snacks",
  "Beverages",
  "Meat & Seafood",
  "Frozen Foods",
  "Organic",
  "Cleaning & Household",
];

const defaultForm = {
  name: "",
  price: "",
  originalPrice: "",
  category: "Fruits",
  image: "",
  description: "",
  unit: "1 kg",
  stock: "100",
  isTrending: false,
  isRecommended: false,
  isMegaDeal: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const all = await api.getProducts();
      setProducts(all || []);
    } catch (err) {
      setError("Failed to load products: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice) || Number(form.price),
        stock: Number(form.stock),
      };
      const newProduct = await api.createProduct(payload);
      setProducts((prev) => [newProduct, ...prev]);
      setSuccess(`✅ Product "${newProduct.name}" created successfully!`);
      setForm(defaultForm);
      setShowModal(false);
    } catch (err) {
      setError("Failed to create product: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Product Management
          </h1>
          <p className="text-sm text-gray-500">
            Add, edit, and manage your inventory here.
          </p>
        </div>
        <button
          id="add-product-btn"
          onClick={() => { setShowModal(true); setError(""); setSuccess(""); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all"
        >
          + Add New Product
        </button>
      </div>

      {/* Alert banners */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Product Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row justify-between gap-2">
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm w-full md:w-64 bg-white dark:bg-gray-800 focus:outline-emerald-500"
          />
          <span className="text-sm text-gray-500 self-center">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading products…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No products found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {filtered.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">
                      {p.name}
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-bold">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">₹{p.price}</td>
                    <td className="p-4">
                      {p.stock > 5 ? (
                        <span className="font-bold text-emerald-600">
                          In Stock ({p.stock})
                        </span>
                      ) : p.stock > 0 ? (
                        <span className="font-bold text-amber-500">
                          Low ({p.stock})
                        </span>
                      ) : (
                        <span className="font-bold text-red-500">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {p.isAvailable ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                          Active
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Product Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                Add New Product
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {/* Modal body */}
            <form
              id="add-product-form"
              onSubmit={handleSubmit}
              className="overflow-y-auto flex-1 p-6 space-y-4"
            >
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Product Name *
                  </label>
                  <input
                    id="product-name"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Fresh Kashmiri Apples 1kg"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    id="product-price"
                    name="price"
                    type="number"
                    required
                    min="0"
                    value={form.price}
                    onChange={handleFormChange}
                    placeholder="240"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    id="product-original-price"
                    name="originalPrice"
                    type="number"
                    min="0"
                    value={form.originalPrice}
                    onChange={handleFormChange}
                    placeholder="280"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Category *
                  </label>
                  <select
                    id="product-category"
                    name="category"
                    required
                    value={form.category}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Unit
                  </label>
                  <input
                    id="product-unit"
                    name="unit"
                    value={form.unit}
                    onChange={handleFormChange}
                    placeholder="1 kg"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    id="product-stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Image URL */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Image URL *
                  </label>
                  <input
                    id="product-image"
                    name="image"
                    required
                    value={form.image}
                    onChange={handleFormChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    id="product-description"
                    name="description"
                    rows={2}
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Short product description…"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* Flags */}
                <div className="col-span-2 flex gap-6 mt-1">
                  {[
                    { name: "isTrending", label: "Trending" },
                    { name: "isRecommended", label: "Recommended" },
                    { name: "isMegaDeal", label: "Mega Deal" },
                  ].map(({ name, label }) => (
                    <label key={name} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name={name}
                        checked={form[name]}
                        onChange={handleFormChange}
                        className="accent-emerald-600 w-4 h-4"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </form>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                id="submit-product-btn"
                type="submit"
                form="add-product-form"
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold transition-colors"
              >
                {submitting ? "Creating…" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
