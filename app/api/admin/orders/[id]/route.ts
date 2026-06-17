import { NextResponse } from 'next/server';
import { orders } from '@/lib/admin/mockData';

const VALID_STATUSES = ['Pending', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'Pending': ['Packed', 'Cancelled'],
  'Packed': ['Out for Delivery', 'Cancelled'],
  'Out for Delivery': ['Delivered'],
  'Delivered': [],
  'Cancelled': ['Pending'],
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json().catch(() => ({}));
  const { id } = await params;
  const routeId = String(id || '').trim();

  if (!routeId) {
    return NextResponse.json({ message: 'Missing order ID.' }, { status: 400 });
  }

  const orderIndex = orders.findIndex((item) => String(item.id).trim() === routeId);

  if (orderIndex === -1) {
    // If it's a client-side local/guest order, return simulated success 
    // so the client-side mutation succeeds and updates local storage.
    return NextResponse.json({
      success: true,
      order: {
        id: routeId,
        status: body.status || 'Pending',
        assignedTo: body.assignedTo || 'Unassigned',
        statusHistory: [{ status: body.status || 'Pending', timestamp: new Date().toISOString() }]
      }
    });
  }

  const existing = orders[orderIndex];
  const newStatus = body.status || existing.status;
  const newAssignedTo = body.assignedTo !== undefined ? body.assignedTo : existing.assignedTo;

  if (!VALID_STATUSES.includes(newStatus)) {
    return NextResponse.json({ message: `Invalid status: ${newStatus}` }, { status: 400 });
  }

  if (newStatus !== existing.status) {
    const allowed = ALLOWED_TRANSITIONS[existing.status];
    if (!allowed || !allowed.includes(newStatus)) {
      return NextResponse.json(
        { message: `Cannot transition from ${existing.status} to ${newStatus}.` },
        { status: 400 },
      );
    }
  }

  const statusHistory = [
    ...(existing.statusHistory || []),
    ...(newStatus !== existing.status
      ? [{ status: newStatus, timestamp: new Date().toISOString() }]
      : []),
  ];

  const updatedOrder = {
    ...existing,
    status: newStatus,
    assignedTo: newAssignedTo,
    statusHistory,
  };

  orders[orderIndex] = updatedOrder;

  return NextResponse.json({ success: true, order: updatedOrder });
}
