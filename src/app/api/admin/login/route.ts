// ============================================================
// src/app/api/admin/login/route.ts
// إضافة: bcrypt + Rate Limiting
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/security";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // --- Rate Limiting: 5 محاولات كل 15 دقيقة لكل IP ---
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const rateCheck = checkRateLimit(
      `login:${ip}`,
      5,
      15 * 60 * 1000 // 15 دقيقة
    );

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `محاولات كثيرة جداً. حاول مرة أخرى بعد ${rateCheck.retryAfterSeconds} ثانية`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    // --- استلام البيانات ---
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password.trim() : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    // تحقق أولي من طول البيانات لمنع هجمات الـ DoS
    if (email.length > 200 || password.length > 200) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    let adminName = "";
    let authenticated = false;

    // --- المحاولة الأولى: من قاعدة البيانات مع bcrypt ---
    try {
      const { data: adminUser } = await supabaseAdmin
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .single();

      if (adminUser) {
        // ✅ مقارنة آمنة باستخدام bcrypt
        const isMatch = await bcrypt.compare(password, adminUser.password_hash);
        if (isMatch) {
          authenticated = true;
          adminName = adminUser.name;
        }
      }
    } catch (dbError) {
      // قاعدة البيانات غير متاحة — نكمل للـ fallback
      console.error("DB login error:", dbError);
    }

    // --- Fallback: من متغيرات البيئة ---
    if (!authenticated) {
      const envEmail = process.env.ADMIN_EMAIL;
      const envPassword = process.env.ADMIN_PASSWORD;
      const envName = process.env.ADMIN_NAME || "مدير النظام";

      if (
        envEmail &&
        envPassword &&
        email === envEmail.toLowerCase() &&
        password === envPassword
      ) {
        authenticated = true;
        adminName = envName;
      }
    }

    // --- رفض مع تأخير ثابت لمنع Timing Attack ---
    if (!authenticated) {
      // تأخير ثابت بغض النظر عن سبب الرفض
      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    // --- إنشاء التوكن وضبط الـ Cookie ---
    const token = await createToken({ email, name: adminName });

    const response = NextResponse.json({
      success: true,
      name: adminName,
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 ساعة
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}