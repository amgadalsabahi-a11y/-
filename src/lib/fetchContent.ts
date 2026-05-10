import { supabaseAdmin } from "./supabase";

export const getSiteData = async () => {
  try {
    const [settingsRes, faqsRes, servicesRes] = await Promise.all([
      supabaseAdmin.from("site_settings").select("*").eq("id", 1).single(),
      supabaseAdmin.from("faqs").select("*").order("sort_order"),
      supabaseAdmin.from("services").select("*").order("sort_order")
    ]);

    return {
      settings: settingsRes.data || null,
      faqs: faqsRes.data || [],
      services: servicesRes.data || []
    };
  } catch (error) {
    console.error("Error fetching site data:", error);
    return { settings: null, faqs: [], services: [] };
  }
};
