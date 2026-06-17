import { NextResponse } from 'next/server';
import { orders } from '@/lib/admin/mockData';

export async function GET() {
  return NextResponse.json({ success: true, orders });
}
