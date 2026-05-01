import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createToken } from "@/lib/auth";

// Hardcoded fallback credentials for immediate testing
const FALLBACK_EMAIL = "admin@russia-gateway.com";
const FALLBACK_PASSWORD = "Admin@Russia2024";
const FALLBACK_NAME = "مدير النظام";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    // First try: Check database for admin user
    let adminName = "";
    let authenticated = false;

    try {
      const { data: adminUser } = await supabaseAdmin
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .single();

      if (adminUser && adminUser.password_hash === password) {
        authenticated = true;
        adminName = adminUser.name;
      }
    } catch {
      // DB not configured, fall through to fallback
    }

    // Fallback: Check hardcoded credentials
    if (!authenticated) {
      if (email === FALLBACK_EMAIL && password === FALLBACK_PASSWORD) {
        authenticated = true;
        adminName = FALLBACK_NAME;
      }
    }

    if (!authenticated) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createToken({ email, name: adminName });

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      name: adminName,
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
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
