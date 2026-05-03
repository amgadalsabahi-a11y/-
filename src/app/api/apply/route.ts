// ============================================================
// src/app/api/apply/route.ts
// إضافة: Magic Bytes + Zod Validation + Fix Filter Injection + Rate Limiting
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { detectMimeType, checkRateLimit } from "@/lib/security";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// --- Zod Schema للـ validation ---
const applySchema = z.object({
  full_name: z
    .string()
    .min(2, "الاسم قصير جداً")
    .max(100, "الاسم طويل جداً")
    .trim(),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-]{7,20}$/, "رقم الهاتف غير صحيح")
    .transform((v) => v.replace(/\s/g, "")),
  age: z.number().int().min(15).max(100).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  nationality: z.string().max(100).nullable().optional(),
  has_saudi_residency: z.boolean().optional(),
  residency_expiry: z.string().max(20).nullable().optional(),
  whatsapp_number: z
    .string()
    .regex(/^\+?[0-9\s\-]{7,20}$/, "رقم الواتساب غير صحيح")
    .transform((v) => v.replace(/\s/g, ""))
    .nullable()
    .optional(),
  is_residency_valid: z.string().max(50).nullable().optional(),
  notes: z.string().max(1000, "الملاحظات طويلة جداً (الحد 1000 حرف)").nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // --- Rate Limiting: 3 طلبات كل 10 دقائق لكل IP ---
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const rateCheck = checkRateLimit(`apply:${ip}`, 3, 10 * 60 * 1000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `عدد الطلبات كثير. حاول مرة أخرى بعد ${Math.ceil(rateCheck.retryAfterSeconds / 60)} دقيقة`,
        },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds) } }
      );
    }

    const formData = await req.formData();

    // --- استخراج البيانات من formData ---
    const rawData = {
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      age: formData.get("age") ? parseInt(formData.get("age") as string) : null,
      country: (formData.get("country") as string) || null,
      nationality: (formData.get("nationality") as string) || null,
      has_saudi_residency: formData.get("has_saudi_residency") === "true",
      residency_expiry: (formData.get("residency_expiry") as string) || null,
      whatsapp_number: (formData.get("whatsapp_number") as string) || null,
      is_residency_valid: (formData.get("is_residency_valid") as string) || null,
      notes: (formData.get("notes") as string) || null,
    };

    // --- Zod Validation ---
    const validation = applySchema.safeParse(rawData);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        { error: firstError.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const {
      full_name,
      phone,
      age,
      country,
      nationality,
      has_saudi_residency,
      residency_expiry,
      whatsapp_number,
      is_residency_valid,
      notes,
    } = validation.data;

    // --- التحقق من التكرار (بدون Filter Injection) ---
    // استعلامان منفصلان بدلاً من .or() لمنع الحقن
    const { data: existsByPhone } = await supabaseAdmin
      .from("users_applications")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existsByPhone) {
      return NextResponse.json(
        {
          error:
            "لديك طلب سابق مسجل برقم الهاتف هذا. يرجى انتظار الرد وعدم تكرار التقديم.",
        },
        { status: 400 }
      );
    }

    if (whatsapp_number) {
      const { data: existsByWhatsapp } = await supabaseAdmin
        .from("users_applications")
        .select("id")
        .eq("whatsapp_number", whatsapp_number)
        .maybeSingle();

      if (existsByWhatsapp) {
        return NextResponse.json(
          {
            error:
              "لديك طلب سابق مسجل برقم الواتساب هذا. يرجى انتظار الرد وعدم تكرار التقديم.",
          },
          { status: 400 }
        );
      }
    }

    // --- معالجة الملف ---
    let file_url: string | null = null;
    const file = formData.get("file") as File | null;

    if (file && file.size > 0) {
      // فحص الحجم أولاً
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "حجم الملف كبير جداً. الأقصى 10 ميجابايت" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ✅ فحص Magic Bytes الحقيقية (لا يمكن تزويرها)
      const detectedType = detectMimeType(buffer);

      if (!detectedType) {
        return NextResponse.json(
          {
            error:
              "نوع الملف غير مسموح. يُرجى رفع صورة (JPG, PNG, WebP) أو PDF فقط",
          },
          { status: 400 }
        );
      }

      // استخدم الامتداد من الـ magic bytes لا من اسم الملف
      const fileName = `${uuidv4()}.${detectedType.ext}`;

      try {
        const { error: uploadError } = await supabaseAdmin.storage
          .from("applications")
          .upload(fileName, buffer, {
            contentType: detectedType.mime,
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          return NextResponse.json(
            { error: "فشل رفع الملف، يرجى المحاولة مرة أخرى" },
            { status: 500 }
          );
        }

        // ملاحظة: بعد تفعيل private bucket، غير هذا إلى createSignedUrl
        const { data: urlData } = supabaseAdmin.storage
          .from("applications")
          .getPublicUrl(fileName);
        file_url = urlData.publicUrl;
      } catch (e) {
        console.error("File processing error:", e);
        return NextResponse.json(
          { error: "خطأ في معالجة الملف، يرجى المحاولة مرة أخرى" },
          { status: 500 }
        );
      }
    }

    // --- حفظ في قاعدة البيانات ---
    const { error: insertError } = await supabaseAdmin
      .from("users_applications")
      .insert({
        full_name,
        age: age ?? null,
        country: country ?? null,
        nationality: nationality ?? null,
        phone,
        whatsapp_number: whatsapp_number ?? null,
        has_saudi_residency: has_saudi_residency ?? false,
        residency_expiry: residency_expiry || null,
        is_residency_valid: is_residency_valid ?? null,
        file_url,
        notes: notes ?? null,
        status: "جديد",
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "فشل حفظ البيانات، يرجى المحاولة مرة أخرى" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم التسجيل بنجاح",
    });
  } catch (error) {
    console.error("Apply API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى" },
      { status: 500 }
    );
  }
}