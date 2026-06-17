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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json().catch(() => ({}));
  const { id } = await params;
  const currentId = String(id || body?.id || '').trim();

  if (!currentId) {
    return NextResponse.json({ message: 'Missing product ID.' }, { status: 400 });
  }

  // If frontend sent 'deleted: true', we DELETE it from the real DB!
  if (body.deleted) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/${currentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${DEMO_TOKEN}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ message: data.message || 'Failed to delete on backend' }, { status: res.status });
      }
      return NextResponse.json({ success: true, message: 'Product deleted permanently.' });
    } catch (error) {
      return NextResponse.json({ message: 'Backend unreachable.' }, { status: 500 });
    }
  }

  // Otherwise, it is an UPDATE
  const variantList = Array.isArray(body.variants)
    ? body.variants
    : String(body.variants || body.unit || 'Single').split(',').map((v: string) => String(v).trim()).filter(Boolean);

  const backendPayload: any = {};
  if (body.name !== undefined) backendPayload.name = body.name;
  if (body.category !== undefined) backendPayload.category = body.category;
  if (body.price !== undefined) backendPayload.price = body.price;
  if (body.stock !== undefined) backendPayload.stock = body.stock;
  if (body.available !== undefined) backendPayload.isAvailable = body.available;
  if (body.image_url !== undefined) backendPayload.image = body.image_url;
  if (body.unit !== undefined) backendPayload.unit = body.unit;
  if (variantList.length > 0) backendPayload.tags = variantList;

  try {
    const res = await fetch(`${BACKEND_URL}/api/products/${currentId}`, {
      method: 'PUT', // Express backend uses PUT for updates
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEMO_TOKEN}`
      },
      body: JSON.stringify(backendPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ message: data.message || 'Backend failed to update product' }, { status: res.status });
    }

    const updatedProduct = mapToFrontend(data.product || data.data);
    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to reach backend' }, { status: 500 });
  }
}
