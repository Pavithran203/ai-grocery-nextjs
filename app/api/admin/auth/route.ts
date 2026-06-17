import { NextRequest, NextResponse } from 'next/server';
import { adminUsers, createJwtToken } from '@/lib/admin/mockData';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body || {};

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = adminUsers.find(
    (account) => account.email.toLowerCase() === normalizedEmail && account.password === password
  );

  if (!user) {
    return NextResponse.json({ message: 'Invalid admin credentials.' }, { status: 401 });
  }

  const token = createJwtToken(user.email, user.role);
  return NextResponse.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
