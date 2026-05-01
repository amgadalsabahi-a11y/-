import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'russia-gateway-super-secret-key-2024'
);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Protect Admin Pages
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. Protect Admin API Routes (Except Login)
  if (path.startsWith('/api/admin') && !path.startsWith('/api/admin/login')) {
    // Allow GET /api/admin/content for the frontend (Public)
    if (request.method === "GET" && path.startsWith('/api/admin/content')) {
      return NextResponse.next();
    }

    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
  }

  // 3. Redirect authenticated users away from login page
  if (path.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch {}
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
