import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "لم يتم اختيار ملف" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename - Simplified path
    const fileExt = file.name.split(".").pop();
    const fileName = `admin-uploads/${uuidv4()}.${fileExt}`;

    // Upload to Supabase
    const { data, error } = await supabaseAdmin.storage
      .from("applications")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      // Try to provide a more descriptive error message
      return NextResponse.json({ 
        error: "فشل الرفع لقاعدة البيانات", 
        details: error.message 
      }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("applications")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم أثناء الرفع" }, { status: 500 });
  }
}
