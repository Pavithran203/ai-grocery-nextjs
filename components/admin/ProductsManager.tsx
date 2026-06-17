"use client";

import { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Filter, Plus, Search, Sparkles, Upload } from 'lucide-react';
import { adminFetch } from '@/lib/admin/adminFetch';

const fetchProducts = async () => {
  const res = await adminFetch('/api/admin/products');
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
};

const parseResponse = async (res) => {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || 'Server returned an error');
  }
  return data;
};

const createProduct = async (product) => {
  const res = await adminFetch('/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return parseResponse(res);
};

const updateProduct = async (product) => {
  const encodedId = encodeURIComponent(String(product.id));
  const res = await adminFetch(`/api/admin/products/${encodedId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return parseResponse(res);
};

function formatCurrency(value: number) {
  return `₹${value.toFixed(0)}`;
}

const emptyProduct = {
  id: '',
  name: '',
  category: 'Staples',
  variants: 'Single',
  unit: 'Single',
  price: 0,
  stock: 0,
  available: true,
  image_url: '',
};

export default function ProductsManager() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['adminProducts'], queryFn: fetchProducts, staleTime: 1000 * 60 * 2 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formState, setFormState] = useState({ ...emptyProduct });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);



  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      closeModal();
    },
    onError: (error: any) => setFormError(error.message || 'Failed to save product'),
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      closeModal();
    },
    onError: (error: any) => setFormError(error.message || 'Failed to save product'),
  });

  useEffect(() => {
    if (data?.products) {
      setProducts(data.products);
    }
  }, [data]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (item.deleted) return false;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' ? true : statusFilter === 'Live' ? item.available : !item.available;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  const handleToggle = async (id: string) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    const updated = { ...product, available: !product.available };
    
    // Optimistic UI update
    setProducts((current) => current.map((p) => p.id === id ? updated : p));

    try {
      await updateProduct(updated);
    } catch (e) {
      console.error(e);
    }
    queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    const product = products.find((item) => item.id === id);
    if (!product) return;
    const updated = { ...product, deleted: true, available: false };
    
    // Optimistic UI update
    setProducts((current) => current.filter((p) => p.id !== id));

    try {
      await updateProduct(updated);
    } catch (e) {
      console.error(e);
    }
    queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
  };

  const openNewProductModal = () => {
    setFormState({ ...emptyProduct });
    setEditingProduct(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setFormState({
      ...product,
      variants: Array.isArray(product.variants) ? product.variants.join(', ') : String(product.unit || product.variants || 'Single'),
      available: typeof product.available === 'boolean' ? product.available : true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormState({ ...emptyProduct });
    setFormError('');
    setSaving(false);
  };

  const handleFormChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);

    if (!formState.name.trim()) {
      setFormError('Product name is required');
      setSaving(false);
      return;
    }
    if (formState.price <= 0) {
      setFormError('Price must be greater than zero');
      setSaving(false);
      return;
    }

const variantList = typeof formState.variants === 'string'
        ? formState.variants.split(',').map((value) => value.trim()).filter(Boolean)
        : formState.variants;

      const payload = {
        ...formState,
        variants: variantList,
        unit: variantList?.[0] || formState.unit || 'Single',
    };

    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ ...payload, id: editingProduct.id });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error) {
      // handled in mutation onError
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-emerald-600">Product management</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Catalog control center</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Add, edit, publish, or archive products with category and inventory status controls for rapid retail operations.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openNewProductModal}
              className="inline-flex items-center gap-2 rounded-3xl bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" /> New product
            </button>
            <button onClick={() => {
              const rows = products.map((item) => [item.id, item.name, item.category, item.price, item.stock, item.available].join(','));
              const csv = ['id,name,category,price,stock,available', ...rows].join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'nearmart-products.csv';
              link.click();
              URL.revokeObjectURL(url);
            }}
              className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-900 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-emerald-900 transition hover:bg-emerald-100"><Upload className="h-4 w-4" /> Import</button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
            <Search className="h-4 w-4 text-slate-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or categories"
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
            />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-3 text-sm text-slate-600">
            <div className="inline-flex items-center gap-2 shrink-0"><Filter className="h-4 w-4" /> Filters</div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-slate-700 outline-none cursor-pointer border-none max-w-[140px] truncate"
            >
              <option value="All">All</option>
              <option value="Live">Live</option>
              <option value="Draft">Drafts</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-[0.2em] text-[11px]">
                <th className="px-4 py-4">Product</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Unit</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Stock</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading product catalog...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-red-500">Unable to load catalog.</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No products match your search.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4 font-black text-slate-900">{product.name}</td>
                    <td className="px-4 py-4 text-slate-600">{product.category}</td>
                    <td className="px-4 py-4 text-slate-600">{Array.isArray(product.variants) ? product.variants.join(', ') : product.unit || 'Single'}</td>
                    <td className="px-4 py-4 font-black text-slate-900">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-4 text-slate-600">{product.stock}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] ${product.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {product.available ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditProductModal(product)}
                        className="rounded-full bg-slate-900 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-white transition hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(product.id)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-slate-900 transition hover:bg-slate-50"
                      >
                        Toggle
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-rose-600 transition hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-[28px] border border-slate-100 bg-slate-50 p-6 text-slate-700">
          <div className="flex items-center gap-3 text-slate-900">
            <Sparkles className="h-4 w-4" />
            <p className="font-black uppercase tracking-[0.2em] text-slate-900">AI recommendations</p>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-7">Suggested cross-sell products and category boosts automatically surface based on last week’s purchase history and inventory health.</p>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-600">Catalog editor</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">{editingProduct ? 'Edit product' : 'Add new product'}</h3>
              </div>
              <button type="button" onClick={closeModal} className="text-slate-500 hover:text-slate-900">Close</button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-black text-slate-700">Product name</span>
                  <input
                    value={formState.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-black text-slate-700">Category</span>
                  <select
                    value={formState.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500"
                  >
                    <option>Staples</option>
                    <option>Fruits</option>
                    <option>Vegetables</option>
                    <option>Dairy</option>
                    <option>Bakery</option>
                    <option>Beverages</option>
                    <option>Snacks</option>
                    <option>Oils</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-black text-slate-700">Price</span>
                  <input
                    type="number"
                    value={formState.price}
                    onChange={(e) => handleFormChange('price', Number(e.target.value))}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-black text-slate-700">Stock</span>
                  <input
                    type="number"
                    value={formState.stock}
                    onChange={(e) => handleFormChange('stock', Number(e.target.value))}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-black text-slate-700">Unit / Variants</span>
                  <input
                    value={formState.variants}
                    onChange={(e) => handleFormChange('variants', e.target.value)}
                    placeholder="Comma-separated"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </label>
              </div>

              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-black text-slate-700">Image URL</span>
                  <input
                    value={formState.image_url || ''}
                    onChange={(e) => handleFormChange('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </label>
              </div>

              <label className="inline-flex items-center gap-3 mt-2 text-sm font-black text-slate-700">
                <input
                  type="checkbox"
                  checked={formState.available}
                  onChange={(e) => handleFormChange('available', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Live product status
              </label>

              {formError && <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-red-700">{formError}</div>}

              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-emerald-600 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-emerald-500 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update product' : 'Add product'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-900 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
