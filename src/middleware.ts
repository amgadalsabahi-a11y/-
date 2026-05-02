import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ✅ إصلاح أمني: لا fallback في الكود
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET غير موجود في متغيرات البيئة");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. حماية صفحات الأدمن
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. حماية API الأدمن (ما عدا تسجيل الدخول)
  if (path.startsWith('/api/admin') && !path.startsWith('/api/admin/login')) {
    // السماح لـ GET /api/admin/content للواجهة العامة
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
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
  }

  // 3. إعادة توجيه المستخدم المسجل بعيداً عن صفحة الدخول
  if (path.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch { }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};