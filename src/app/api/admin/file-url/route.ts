// ============================================================
// src/app/api/admin/file-url/route.ts
// يولّد Signed URL مؤقت للملفات الخاصة
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    try {
        const fileUrl = req.nextUrl.searchParams.get("url");

        if (!fileUrl) {
            return NextResponse.json({ error: "url مطلوب" }, { status: 400 });
        }

        // استخراج مسار الملف داخل الـ bucket من الـ URL الكامل
        // مثال: https://xxx.supabase.co/storage/v1/object/public/applications/uuid.jpg
        // → uuid.jpg
        const marker = "/object/public/applications/";
        const markerPrivate = "/object/sign/applications/";

        let filePath = "";

        if (fileUrl.includes(marker)) {
            filePath = fileUrl.split(marker)[1];
        } else if (fileUrl.includes(markerPrivate)) {
            filePath = fileUrl.split(markerPrivate)[1].split("?")[0];
        } else {
            return NextResponse.json({ error: "رابط غير صحيح" }, { status: 400 });
        }

        // توليد رابط مؤقت صالح لمدة ساعة واحدة
        const { data, error } = await supabaseAdmin.storage
            .from("applications")
            .createSignedUrl(filePath, 3600);

        if (error || !data?.signedUrl) {
            console.error("Signed URL error:", error);
            return NextResponse.json(
                { error: "فشل توليد الرابط" },
                { status: 500 }
            );
        }

        return NextResponse.json({ signedUrl: data.signedUrl });
    } catch (error) {
        console.error("file-url error:", error);
        return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
    }
}