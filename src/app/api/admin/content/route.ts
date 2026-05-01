import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");

  try {
    if (type === "settings") {
      const { data } = await supabaseAdmin.from("site_settings").select("*").eq("id", 1).single();
      return NextResponse.json({ data });
    }
    if (type === "faqs") {
      const { data } = await supabaseAdmin.from("faqs").select("*").order("sort_order");
      return NextResponse.json({ data });
    }
    if (type === "services") {
      const { data } = await supabaseAdmin.from("services").select("*").order("sort_order");
      return NextResponse.json({ data });
    }
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ data: null, error: "Database not connected" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, payload } = await req.json();

    if (type === "settings") {
      const { error } = await supabaseAdmin.from("site_settings").upsert({ id: 1, ...payload });
      if (error) throw error;
    } 
    else if (type === "faqs") {
      if (payload.action === "add") {
        const { error } = await supabaseAdmin.from("faqs").insert(payload.data);
        if (error) throw error;
      } else if (payload.action === "edit") {
        const { error } = await supabaseAdmin.from("faqs").update(payload.data).eq("id", payload.id);
        if (error) throw error;
      } else if (payload.action === "delete") {
        const { error } = await supabaseAdmin.from("faqs").delete().eq("id", payload.id);
        if (error) throw error;
      }
    }
    else if (type === "services") {
      if (payload.action === "add") {
        const { error } = await supabaseAdmin.from("services").insert(payload.data);
        if (error) throw error;
      } else if (payload.action === "edit") {
        const { error } = await supabaseAdmin.from("services").update(payload.data).eq("id", payload.id);
        if (error) throw error;
      } else if (payload.action === "delete") {
        const { error } = await supabaseAdmin.from("services").delete().eq("id", payload.id);
        if (error) throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}
