import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const full_name = formData.get("full_name") as string;
    const age = formData.get("age") ? parseInt(formData.get("age") as string) : null;
    const country = formData.get("country") as string || null;
    const nationality = formData.get("nationality") as string || null;
    const phone = formData.get("phone") as string;
    const has_saudi_residency = formData.get("has_saudi_residency") === "true";
    const residency_expiry = formData.get("residency_expiry") as string || null;
    const notes = formData.get("notes") as string || null;
    const file = formData.get("file") as File | null;

    // ✅ تحقق من الحقول المطلوبة
    if (!full_name || !phone) {
      return NextResponse.json(
        { error: "الاسم ورقم الهاتف مطلوبان" },
        { status: 400 }
      );
    }

    let file_url: string | null = null;

    if (file && file.size > 0) {
      // ✅ إصلاح أمني: تحقق من نوع الملف في السيرفر (وليس فقط العميل)
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/heic",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "نوع الملف غير مسموح. يُرجى رفع صورة (JPG, PNG, WEBP) أو PDF فقط" },
          { status: 400 }
        );
      }

      // ✅ تحقق من حجم الملف في السيرفر أيضاً
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "حجم الملف كبير جداً. الأقصى 10 ميجابايت" },
          { status: 400 }
        );
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { error: uploadError } = await supabaseAdmin.storage
          .from("applications")
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (!uploadError) {
          const { data: urlData } = supabaseAdmin.storage
            .from("applications")
            .getPublicUrl(fileName);
          file_url = urlData.publicUrl;
        } else {
          // ✅ لا نكشف تفاصيل الخطأ الداخلية للمستخدم
          console.error("Upload error:", uploadError);
          return NextResponse.json({ error: "فشل رفع الملف، يرجى المحاولة مرة أخرى" }, { status: 500 });
        }
      } catch (e: any) {
        console.error("File processing error:", e);
        return NextResponse.json({ error: "خطأ في معالجة الملف، يرجى المحاولة مرة أخرى" }, { status: 500 });
      }
    }

    const { error: insertError } = await supabaseAdmin
      .from("users_applications")
      .insert({
        full_name,
        age,
        country,
        nationality,
        phone,
        has_saudi_residency,
        residency_expiry: residency_expiry || null,
        file_url,
        notes,
        status: "جديد",
      });

    if (insertError) {
      // ✅ لا نكشف تفاصيل قاعدة البيانات للمستخدم
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: "فشل حفظ البيانات، يرجى المحاولة مرة أخرى" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "تم التسجيل بنجاح",
    });
  } catch (error: any) {
    console.error("Apply API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى" },
      { status: 500 }
    );
  }
}