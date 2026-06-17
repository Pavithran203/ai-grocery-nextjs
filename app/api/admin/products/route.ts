 import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const DEMO_TOKEN = 'demo-token-admin';

// Map MongoDB model to Frontend format
const mapToFrontend = (p: any) => ({
  ...p,
  id: p._id || p.id,
  available: p.isAvailable !== undefined ? p.isAvailable : p.available,
  image_url: p.image || p.image_url || '',
  variants: p.tags && p.tags.length > 0 ? p.tags : (p.unit ? [p.unit] : ['Single']),
  deleted: false,
});

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/products?admin=true&limit=1000`);
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      return NextResponse.json({ success: true, products: [], categories: [] });
    }

    const products = (data.products || data.data || []).map(mapToFrontend);
    const categories = ['Staples', 'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Oils'];
    
    return NextResponse.json({ success: true, products, categories });
  } catch (error) {
    return NextResponse.json({ success: true, products: [], categories: [] });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, category, price, stock, variants, available, image_url, unit } = body || {};

  if (!name || !category || typeof price !== 'number' || typeof stock !== 'number') {
    return NextResponse.json({ message: 'Name, category, price, and stock are required.' }, { status: 400 });
  }

  const variantList = Array.isArray(variants) ? variants : String(variants || 'Single').split(',').map((v) => String(v).trim()).filter(Boolean);

  const backendPayload = {
    name,
    category,
    price,
    stock,
    isAvailable: available !== false,
    image: image_url || '',
    unit: variantList[0] || unit || 'Single',
    tags: variantList,
  };

  try {
    const res = await fetch(`${BACKEND_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEMO_TOKEN}`
      },
      body: JSON.stringify(backendPayload),
    });
    
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ message: data.message || 'Backend failed to create product' }, { status: res.status });
    }

    const newProduct = mapToFrontend(data.product || data.data);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to reach backend' }, { status: 500 });
  }
}
