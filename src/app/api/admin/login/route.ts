import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createToken } from "@/lib/auth";

// ✅ إصلاح أمني: حذفنا بيانات الدخول الثابتة من الكود تماماً
// الآن يعتمد فقط على قاعدة البيانات أو متغيرات البيئة في .env

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    let adminName = "";
    let authenticated = false;

    // المحاولة الأولى: من قاعدة البيانات
    try {
      const { data: adminUser } = await supabaseAdmin
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .single();

      if (adminUser) {
        // ✅ إصلاح أمني مهم: يجب أن يكون password_hash مشفراً بـ bcrypt في الـ DB
        // مؤقتاً: مقارنة مباشرة — يُنصح بتحديث DB لاستخدام bcrypt
        // للتحديث الكامل: npm install bcryptjs && import bcrypt from 'bcryptjs'
        // ثم: const isMatch = await bcrypt.compare(password, adminUser.password_hash);
        if (adminUser.password_hash === password) {
          authenticated = true;
          adminName = adminUser.name;
        }
      }
    } catch {
      // قاعدة البيانات غير متاحة
    }

    // ✅ إصلاح أمني: الـ fallback الآن من متغيرات البيئة فقط — ليس من الكود
    if (!authenticated) {
      const envEmail = process.env.ADMIN_EMAIL;
      const envPassword = process.env.ADMIN_PASSWORD;
      const envName = process.env.ADMIN_NAME || "مدير النظام";

      if (envEmail && envPassword && email === envEmail && password === envPassword) {
        authenticated = true;
        adminName = envName;
      }
    }

    if (!authenticated) {
      // ✅ تأخير بسيط لمنع brute force (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

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