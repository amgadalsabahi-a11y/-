// ============================================================
// src/app/api/admin/upload/route.ts
// إضافة: فحص نوع الملف بالـ Magic Bytes
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { detectMimeType } from "@/lib/security";
import { v4 as uuidv4 } from "uuid";

// أنواع الملفات المسموحة في رفع الأدمن
const ALLOWED_ADMIN_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "لم يتم اختيار ملف" },
        { status: 400 }
      );
    }

    // فحص الحجم
    const maxSize = 20 * 1024 * 1024; // 20MB للأدمن
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "حجم الملف كبير جداً. الأقصى 20 ميجابايت" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ فحص Magic Bytes
    const detectedType = detectMimeType(buffer);

    if (!detectedType || !ALLOWED_ADMIN_MIMES.includes(detectedType.mime)) {
      return NextResponse.json(
        {
          error:
            "نوع الملف غير مسموح. الأنواع المقبولة: JPG, PNG, WebP, GIF, PDF",
        },
        { status: 400 }
      );
    }

    // استخدم امتداداً آمناً من الـ magic bytes
    const fileName = `admin-uploads/${uuidv4()}.${detectedType.ext}`;

    const { error } = await supabaseAdmin.storage
      .from("applications")
      .upload(fileName, buffer, {
        contentType: detectedType.mime,
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json(
        { error: "فشل الرفع لقاعدة البيانات" },
        { status: 500 }
      );
    }

    // ملاحظة: بعد تفعيل private bucket، غير إلى createSignedUrl
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("applications")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم أثناء الرفع" },
      { status: 500 }
    );
  }
}