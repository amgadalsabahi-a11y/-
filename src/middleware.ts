// ============================================================
// src/middleware.ts
// إضافة: حماية /api/apply من الـ abuse
// ============================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET غير موجود في متغيرات البيئة");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // -------------------------------------------------------
  // 1. حماية صفحات الأدمن
  // -------------------------------------------------------
  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      // توكن منتهي أو مزور — امسحه وأعد التوجيه
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_token");
      return response;
    }
  }

  // -------------------------------------------------------
  // 2. حماية API الأدمن
  // -------------------------------------------------------
  if (
    path.startsWith("/api/admin") &&
    !path.startsWith("/api/admin/login")
  ) {
    // اسمح بـ GET على /api/admin/content للواجهة العامة
    if (
      request.method === "GET" &&
      path.startsWith("/api/admin/content")
    ) {
      return NextResponse.next();
    }

    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }
  }

  // -------------------------------------------------------
  // 3. إعادة توجيه الأدمن المسجل بعيداً عن صفحة الدخول
  // -------------------------------------------------------
  if (path.startsWith("/admin/login")) {
    const token = request.cookies.get("admin_token")?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL("/admin", request.url));
      } catch {
        // توكن منتهي — دع المستخدم يدخل
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};