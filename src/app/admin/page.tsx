"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { getTranslations } from "@/lib/i18n";
import { 
  Users, 
  Settings, 
  LogOut, 
  Layout, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Trash2, 
  Plus, 
  Save, 
  HelpCircle,
  Briefcase,
  ChevronRight,
  Upload,
  Edit,
  X
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [tab, setTab] = useState("apps");
  const [loadingApps, setLoadingApps] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  
  // Settings State
  const [heroAr, setHeroAr] = useState({ title: "", subtitle: "", description: "", cta: "", image: "" });
  const [heroEn, setHeroEn] = useState({ title: "", subtitle: "", description: "", cta: "", image: "" });
  const [aboutAr, setAboutAr] = useState({ title: "", subtitle: "", description: "", about_image: "", features: "" });
  const [aboutEn, setAboutEn] = useState({ title: "", subtitle: "", description: "", about_image: "", features: "" });
  
  const [faqs, setFaqs] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  const [newFaq, setNewFaq] = useState({ question_ar: "", answer_ar: "", question_en: "", answer_en: "" });
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  
  const [newService, setNewService] = useState({ title_ar: "", desc_ar: "", title_en: "", desc_en: "" });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAboutImage, setUploadingAboutImage] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchContent("settings");
    fetchContent("faqs");
    fetchContent("services");
  }, []);

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch("/api/admin/applications");
      const { data } = await res.json();
      setApplications(data || []);
    } catch (e) {}
    setLoadingApps(false);
  };

  const fetchContent = async (type: string) => {
    try {
      const res = await fetch(`/api/admin/content?type=${type}&t=${Date.now()}`);
      const { data } = await res.json();
      if (type === "settings" && data) {
        const ar = JSON.parse(data.about_ar || "{}");
        const en = JSON.parse(data.about_en || "{}");
        setHeroAr({ title: ar.hero_title || "", subtitle: ar.hero_subtitle || "", description: ar.hero_description || "", cta: ar.hero_cta || "", image: ar.hero_image || "" });
        setHeroEn({ title: en.hero_title || "", subtitle: en.hero_subtitle || "", description: en.hero_description || "", cta: en.hero_cta || "", image: en.hero_image || "" });
        setAboutAr({ title: ar.about_title || "", subtitle: ar.about_subtitle || "", description: ar.about_description || "", about_image: ar.about_image || "", features: ar.features || "" });
        setAboutEn({ title: en.about_title || "", subtitle: en.about_subtitle || "", description: en.about_description || "", about_image: en.about_image || "", features: en.features || "" });
      } else if (type === "faqs") {
        setFaqs(data || []);
      } else if (type === "services") {
        setServices(data || []);
      }
    } catch (e) {}
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) fetchApplications();
    } catch (e) {}
  };

  const deleteApplication = async (id: string) => {
    if (!confirm(locale === "ar" ? "هل أنت متأكد من حذف هذا الطلب؟" : "Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch(`/api/admin/applications?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchApplications();
    } catch (e) {}
  };

  const saveSettings = async () => {
    const payload = {
      about_ar: JSON.stringify({
        hero_title: heroAr.title, hero_subtitle: heroAr.subtitle, hero_description: heroAr.description, hero_cta: heroAr.cta, hero_image: heroAr.image,
        about_title: aboutAr.title, about_subtitle: aboutAr.subtitle, about_description: aboutAr.description, about_image: aboutAr.about_image, features: aboutAr.features
      }),
      about_en: JSON.stringify({
        hero_title: heroEn.title, hero_subtitle: heroEn.subtitle, hero_description: heroEn.description, hero_cta: heroEn.cta, hero_image: heroEn.image,
        about_title: aboutEn.title, about_subtitle: aboutEn.subtitle, about_description: aboutEn.description, about_image: aboutEn.about_image, features: aboutEn.features
      })
    };
    await fetch("/api/admin/content", { method: "POST", body: JSON.stringify({ type: "settings", payload }) });
    alert("تم الحفظ بنجاح");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'about') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'hero') setUploadingImage(true); else setUploadingAboutImage(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        if (target === 'hero') {
          setHeroAr(prev => ({ ...prev, image: data.url }));
          setHeroEn(prev => ({ ...prev, image: data.url }));
        } else {
          setAboutAr(prev => ({ ...prev, about_image: data.url }));
          setAboutEn(prev => ({ ...prev, about_image: data.url }));
        }
        alert("تم رفع الصورة بنجاح");
      } else {
        alert("فشل الرفع: " + (data.error || ""));
      }
    } catch (err) { alert("خطأ في الرفع"); }
    finally { if (target === 'hero') setUploadingImage(false); else setUploadingAboutImage(false); }
  };

  const saveFaq = async () => {
    const action = editingFaqId ? "edit" : "add";
    await fetch("/api/admin/content", {
      method: "POST",
      body: JSON.stringify({ type: "faqs", payload: { action, id: editingFaqId, data: newFaq } })
    });
    setNewFaq({ question_ar: "", answer_ar: "", question_en: "", answer_en: "" });
    setEditingFaqId(null);
    fetchContent("faqs");
  };

  const deleteFaq = async (id: string) => {
    if (!confirm("حذف؟")) return;
    await fetch("/api/admin/content", { method: "POST", body: JSON.stringify({ type: "faqs", payload: { action: "delete", id } }) });
    fetchContent("faqs");
  };

  const saveService = async () => {
    const action = editingServiceId ? "edit" : "add";
    await fetch("/api/admin/content", {
      method: "POST",
      body: JSON.stringify({ type: "services", payload: { action, id: editingServiceId, data: newService } })
    });
    setNewService({ title_ar: "", desc_ar: "", title_en: "", desc_en: "" });
    setEditingServiceId(null);
    fetchContent("services");
  };

  const deleteService = async (id: string) => {
    if (!confirm("حذف؟")) return;
    await fetch("/api/admin/content", { method: "POST", body: JSON.stringify({ type: "services", payload: { action: "delete", id } }) });
    fetchContent("services");
  };

  const stats = {
    total: applications.length,
    new: applications.filter(a => a.status === "جديد").length,
    contacted: applications.filter(a => a.status === "تم التواصل").length,
    rejected: applications.filter(a => a.status === "مرفوض").length,
  };

  return (
    <div className="min-h-screen bg-[#050B18]">
      <nav className="glass-navbar sticky top-0 z-40 px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-red flex items-center justify-center text-white font-bold text-2xl">🇷🇺</div>
            <div className="hidden md:flex gap-4">
              <button onClick={() => setTab("apps")} className={`px-4 py-2 rounded-lg font-medium transition-all ${tab === "apps" ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-gray-400 hover:text-white"}`}>الطلبات</button>
              <button onClick={() => setTab("hero")} className={`px-4 py-2 rounded-lg font-medium transition-all ${tab === "hero" ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-gray-400 hover:text-white"}`}>الهيرو</button>
              <button onClick={() => setTab("about")} className={`px-4 py-2 rounded-lg font-medium transition-all ${tab === "about" ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-gray-400 hover:text-white"}`}>من نحن</button>
              <button onClick={() => setTab("services")} className={`px-4 py-2 rounded-lg font-medium transition-all ${tab === "services" ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-gray-400 hover:text-white"}`}>الخدمات</button>
              <button onClick={() => setTab("faqs")} className={`px-4 py-2 rounded-lg font-medium transition-all ${tab === "faqs" ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-gray-400 hover:text-white"}`}>الأسئلة الشائعة</button>
            </div>
          </div>
          <button onClick={() => { fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); }} className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all font-medium">
            <LogOut size={18} />
            خروج
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {tab === "apps" && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="glass-card-static p-6 rounded-2xl border-l-4 border-brand-blue">
                <p className="text-gray-400 text-sm mb-1">إجمالي الطلبات</p>
                <p className="text-3xl font-black text-white">{stats.total}</p>
              </div>
              <div className="glass-card-static p-6 rounded-2xl border-l-4 border-yellow-500">
                <p className="text-gray-400 text-sm mb-1">طلبات جديدة</p>
                <p className="text-3xl font-black text-white">{stats.new}</p>
              </div>
              <div className="glass-card-static p-6 rounded-2xl border-l-4 border-green-500">
                <p className="text-gray-400 text-sm mb-1">تم التواصل</p>
                <p className="text-3xl font-black text-white">{stats.contacted}</p>
              </div>
              <div className="glass-card-static p-6 rounded-2xl border-l-4 border-red-500">
                <p className="text-gray-400 text-sm mb-1">مرفوضة</p>
                <p className="text-3xl font-black text-white">{stats.rejected}</p>
              </div>
            </div>

            <div className="glass-card-static rounded-2xl overflow-hidden border border-white/5">
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Users className="text-brand-blue" />
                  قائمة الطلبات
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-start">
                  <thead className="bg-white/5 text-gray-400 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-start font-semibold">الاسم</th>
                      <th className="px-6 py-4 text-start font-semibold">الهاتف</th>
                      <th className="px-6 py-4 text-start font-semibold">البلد</th>
                      <th className="px-6 py-4 text-start font-semibold">جواز السفر</th>
                      <th className="px-6 py-4 text-start font-semibold">الحالة</th>
                      <th className="px-6 py-4 text-center font-semibold">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {applications.map(app => (
                      <tr key={app.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{app.full_name}</td>
                        <td className="px-6 py-4 text-gray-300" dir="ltr">{app.phone}</td>
                        <td className="px-6 py-4 text-gray-300">{app.country}</td>
                        <td className="px-6 py-4 text-gray-400">{app.residency_expiry || "-"}</td>
                        <td className="px-6 py-4">
                          {app.file_url ? (
                            <a href={app.file_url} target="_blank" className="text-brand-blue hover:underline font-bold flex items-center gap-1">
                              <Layout size={14} /> عرض
                            </a>
                          ) : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={app.status} 
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                            className="bg-navy-900 border border-white/10 text-xs rounded-lg px-3 py-1.5 focus:border-brand-blue transition-all"
                          >
                            <option value="جديد">جديد</option>
                            <option value="تم التواصل">تم التواصل</option>
                            <option value="مرفوض">مرفوض</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => deleteApplication(app.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {(tab === "hero" || tab === "about") && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="glass-card-static p-8 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Settings className="text-brand-blue" />
                  إعدادات {tab === "hero" ? "قسم الهيرو" : "قسم من نحن"}
                </h2>
                <button onClick={saveSettings} className="btn-primary !py-3 !px-8 flex items-center gap-2">
                  <Save size={20} />
                  حفظ التعديلات
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Arabic */}
                <div className="space-y-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-brand-blue border-b border-white/10 pb-2">المحتوى العربي</h3>
                  {tab === "hero" ? (
                    <>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">العنوان الرئيسي</label>
                        <input value={heroAr.title} onChange={e => setHeroAr({...heroAr, title: e.target.value})} className="glass-input w-full p-4" />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">العنوان الفرعي</label>
                        <input value={heroAr.subtitle} onChange={e => setHeroAr({...heroAr, subtitle: e.target.value})} className="glass-input w-full p-4" />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">الوصف</label>
                        <textarea value={heroAr.description} onChange={e => setHeroAr({...heroAr, description: e.target.value})} className="glass-input w-full p-4 h-32" />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">نص الزر (CTA)</label>
                        <input value={heroAr.cta} onChange={e => setHeroAr({...heroAr, cta: e.target.value})} className="glass-input w-full p-4" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">العنوان</label>
                        <input value={aboutAr.title} onChange={e => setAboutAr({...aboutAr, title: e.target.value})} className="glass-input w-full p-4" />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">العنوان الفرعي</label>
                        <input value={aboutAr.subtitle} onChange={e => setAboutAr({...aboutAr, subtitle: e.target.value})} className="glass-input w-full p-4" />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">الوصف</label>
                        <textarea value={aboutAr.description} onChange={e => setAboutAr({...aboutAr, description: e.target.value})} className="glass-input w-full p-4 h-32" />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">المميزات (كل ميزة في سطر)</label>
                        <textarea value={aboutAr.features} onChange={e => setAboutAr({...aboutAr, features: e.target.value})} className="glass-input w-full p-4 h-32" />
                      </div>
                    </>
                  )}
                </div>

                {/* English */}
                <div className="space-y-6 p-6 bg-white/5 rounded-2xl border border-white/5" dir="ltr">
                  <h3 className="text-lg font-bold text-brand-red border-b border-white/10 pb-2">English Content</h3>
                  {tab === "hero" ? (
                    <>
                      <div>
                        <label className="block text-gray-500 text-sm mb-2">Main Title</label>
                        <input value={heroEn.title} onChange={e => setHeroEn({...heroEn, title: e.target.value})} className="glass-input w-full p-4" />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-sm mb-2">Subtitle</label>
                        <input value={heroEn.subtitle} onChange={e => setHeroEn({...heroEn, subtitle: e.target.value})} className="glass-input w-full p-4" />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-sm mb-2">Description</label>
                        <textarea value={heroEn.description} onChange={e => setHeroEn({...heroEn, description: e.target.value})} className="glass-input w-full p-4 h-32" />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-sm mb-2">Button Text (CTA)</label>
                        <input value={heroEn.cta} onChange={e => setHeroEn({...heroEn, cta: e.target.value})} className="glass-input w-full p-4" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-gray-500 text-sm mb-2">Title</label>
                        <input value={aboutEn.title} onChange={e => setAboutEn({...aboutEn, title: e.target.value})} className="glass-input w-full p-4" />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-sm mb-2">Subtitle</label>
                        <input value={aboutEn.subtitle} onChange={e => setAboutEn({...aboutEn, subtitle: e.target.value})} className="glass-input w-full p-4" />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-sm mb-2">Description</label>
                        <textarea value={aboutEn.description} onChange={e => setAboutEn({...aboutEn, description: e.target.value})} className="glass-input w-full p-4 h-32" />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-sm mb-2">Features (one per line)</label>
                        <textarea value={aboutEn.features} onChange={e => setAboutEn({...aboutEn, features: e.target.value})} className="glass-input w-full p-4 h-32" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">الصورة الحالية</h3>
                <div className="flex items-center gap-8">
                  <div className="w-48 h-32 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                    {(tab === 'hero' ? heroAr.image : aboutAr.about_image) ? (
                      <img src={tab === 'hero' ? heroAr.image : aboutAr.about_image} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 text-xs">لا توجد صورة</span>
                    )}
                  </div>
                  <label className="btn-secondary !py-3 !px-6 cursor-pointer flex items-center gap-2">
                    {uploadingImage || uploadingAboutImage ? "جاري الرفع..." : (
                      <>
                        <Upload size={18} />
                        تغيير الصورة
                      </>
                    )}
                    <input type="file" className="hidden" onChange={e => handleImageUpload(e, tab === 'hero' ? 'hero' : 'about')} disabled={uploadingImage || uploadingAboutImage} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "faqs" && (
          <div className="space-y-8 animate-fade-in">
            <div className="glass-card-static p-8 rounded-2xl border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <HelpCircle className="text-brand-blue" />
                {editingFaqId ? "تعديل السؤال" : "إضافة سؤال جديد"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <input value={newFaq.question_ar} onChange={e => setNewFaq({...newFaq, question_ar: e.target.value})} placeholder="السؤال (بالعربي)" className="glass-input w-full p-4" />
                  <textarea value={newFaq.answer_ar} onChange={e => setNewFaq({...newFaq, answer_ar: e.target.value})} placeholder="الجواب (بالعربي)" className="glass-input w-full p-4 h-32" />
                </div>
                <div className="space-y-4" dir="ltr">
                  <input value={newFaq.question_en} onChange={e => setNewFaq({...newFaq, question_en: e.target.value})} placeholder="Question (English)" className="glass-input w-full p-4" />
                  <textarea value={newFaq.answer_en} onChange={e => setNewFaq({...newFaq, answer_en: e.target.value})} placeholder="Answer (English)" className="glass-input w-full p-4 h-32" />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={saveFaq} className="btn-primary !py-4 !px-10 flex items-center gap-2">
                  {editingFaqId ? <Save size={20} /> : <Plus size={20} />}
                  {editingFaqId ? "حفظ التعديلات" : "إضافة السؤال"}
                </button>
                {editingFaqId && (
                  <button onClick={() => { setEditingFaqId(null); setNewFaq({ question_ar: "", answer_ar: "", question_en: "", answer_en: "" }); }} className="btn-secondary !py-4 !px-8 flex items-center gap-2">
                    <X size={20} />
                    إلغاء التعديل
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map(faq => (
                <div key={faq.id} className="glass-card-static p-6 rounded-2xl flex items-start justify-between group">
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-lg">{faq.question_ar}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{faq.answer_ar}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingFaqId(faq.id);
                        setNewFaq({ question_ar: faq.question_ar, answer_ar: faq.answer_ar, question_en: faq.question_en, answer_en: faq.answer_en });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteFaq(faq.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "services" && (
          <div className="space-y-8 animate-fade-in">
            <div className="glass-card-static p-8 rounded-2xl border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <Briefcase className="text-brand-blue" />
                {editingServiceId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <input value={newService.title_ar} onChange={e => setNewService({...newService, title_ar: e.target.value})} placeholder="عنوان الخدمة (بالعربي)" className="glass-input w-full p-4" />
                  <textarea value={newService.desc_ar} onChange={e => setNewService({...newService, desc_ar: e.target.value})} placeholder="وصف الخدمة (بالعربي)" className="glass-input w-full p-4 h-32" />
                </div>
                <div className="space-y-4" dir="ltr">
                  <input value={newService.title_en} onChange={e => setNewService({...newService, title_en: e.target.value})} placeholder="Service Title (English)" className="glass-input w-full p-4" />
                  <textarea value={newService.desc_en} onChange={e => setNewService({...newService, desc_en: e.target.value})} placeholder="Service Description (English)" className="glass-input w-full p-4 h-32" />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={saveService} className="btn-primary !py-4 !px-10 flex items-center gap-2">
                  {editingServiceId ? <Save size={20} /> : <Plus size={20} />}
                  {editingServiceId ? "حفظ التعديلات" : "إضافة الخدمة"}
                </button>
                {editingServiceId && (
                  <button onClick={() => { setEditingServiceId(null); setNewService({ title_ar: "", desc_ar: "", title_en: "", desc_en: "" }); }} className="btn-secondary !py-4 !px-8 flex items-center gap-2">
                    <X size={20} />
                    إلغاء التعديل
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map(ser => (
                <div key={ser.id} className="glass-card-static p-6 rounded-2xl flex flex-col justify-between group">
                  <div className="mb-6">
                    <h3 className="font-bold text-white text-lg mb-2">{ser.title_ar}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3">{ser.desc_ar}</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => {
                        setEditingServiceId(ser.id);
                        setNewService({ title_ar: ser.title_ar, desc_ar: ser.desc_ar, title_en: ser.title_en, desc_en: ser.desc_en });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteService(ser.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
