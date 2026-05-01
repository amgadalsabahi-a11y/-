"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLocale } from "@/components/LocaleProvider";
import { getTranslations } from "@/lib/i18n";
import { ArrowRight, ArrowLeft, Upload, AlertCircle, CheckCircle } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Controlled State for ALL fields
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    country: "",
    nationality: "",
    phone: "",
    residency_expiry: "",
    notes: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setErrorMsg(locale === "ar" ? "حجم الملف كبير جداً (الأقصى 10 ميجابايت)" : "File too large (Max 10MB)");
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setErrorMsg("");
    }
  };

  const handleSubmit = async () => {
    // Manual Validation
    if (!form.full_name || !form.phone || !form.country || !file) {
      setErrorMsg(locale === "ar" ? "يرجى ملء جميع الخانات المطلوبة وإرفاق الجواز" : "Please fill all required fields and upload passport");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("age", form.age);
      formData.append("country", form.country);
      formData.append("nationality", form.nationality);
      formData.append("phone", form.phone);
      formData.append("notes", form.notes || "");
      formData.append("file", file);

      const isSaudi = form.country === "السعودية" || form.country === "Saudi Arabia";
      formData.append("has_saudi_residency", isSaudi ? "true" : "false");
      if (isSaudi) {
        formData.append("residency_expiry", form.residency_expiry);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 seconds for slow uploads

      const res = await fetch("/api/apply", {
        method: "POST",
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Scroll to top to see success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(data.error || t.register.error);
      }
    } catch (err: any) {
      setErrorMsg(locale === "ar" ? "فشل الاتصال بالسيرفر، يرجى المحاولة مرة أخرى" : "Connection failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    "اليمن", "السعودية", "مصر", "الأردن", "العراق", "سوريا", "لبنان", "فلسطين", "الكويت", "الإمارات", "قطر", "البحرين", "عمان", "المغرب", "تونس", "الجزائر", "ليبيا", "السودان", "أخرى"
  ];

  if (success) {
    return (
      <main className="min-h-screen bg-[#050B18]">
        <Navbar />
        <div className="section-container pt-32 text-center">
          <div className="glass-card p-12 max-w-2xl mx-auto border-green-500/30">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">{t.register.success}</h1>
            <p className="text-gray-400 text-lg mb-8">
              {locale === "ar" ? "تم استلام طلبك بنجاح، سيقوم فريقنا بمراجعته والتواصل معك قريباً." : "Your request has been received, our team will review it and contact you soon."}
            </p>
            <Link href="/" className="btn-primary inline-flex items-center gap-2">
              <Arrow size={20} />
              {locale === "ar" ? "العودة للرئيسية" : "Back to Home"}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#050B18]">
      <Navbar />

      <section className="pt-24 pb-16">
        <div className="section-container">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
            <Arrow className="group-hover:-translate-x-1 transition-transform rtl:group-hover:translate-x-1" size={20} />
            {locale === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </Link>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{t.register.title}</h1>
              <p className="text-gray-400 text-lg">{t.register.subtitle}</p>
            </div>

            {errorMsg && (
              <div className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 animate-fade-in">
                <AlertCircle size={24} className="text-red-400 shrink-0" />
                <p className="text-red-200 font-medium">{errorMsg}</p>
              </div>
            )}

            <div className="glass-card-static p-6 md:p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-gray-300 font-semibold mb-2">{t.register.fullName} *</label>
                  <input type="text" name="full_name" value={form.full_name} onChange={handleInputChange} className="glass-input w-full px-5 py-4 text-lg" placeholder={t.register.fullName} />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">{t.register.age} *</label>
                  <input type="number" name="age" value={form.age} onChange={handleInputChange} className="glass-input w-full px-5 py-4 text-lg" placeholder="18+" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">{t.register.country} *</label>
                  <select name="country" value={form.country} onChange={handleInputChange} className="glass-input w-full px-5 py-4 text-lg text-white bg-navy-900/50">
                    <option value="" className="bg-navy-900">{locale === "ar" ? "اختر بلد الإقامة" : "Select Country"}</option>
                    {countries.map(c => <option key={c} value={c} className="bg-navy-900">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">{t.register.nationality} *</label>
                  <select name="nationality" value={form.nationality} onChange={handleInputChange} className="glass-input w-full px-5 py-4 text-lg text-white bg-navy-900/50">
                    <option value="" className="bg-navy-900">{locale === "ar" ? "اختر الجنسية" : "Select Nationality"}</option>
                    {countries.map(c => <option key={c} value={c} className="bg-navy-900">{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">{t.register.phone} *</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleInputChange} dir="ltr" className="glass-input w-full px-5 py-4 text-lg text-start" placeholder="+79337062267" />
              </div>

              {(form.country === "السعودية" || form.country === "Saudi Arabia") && (
                <div className="animate-fade-in bg-white/5 p-4 rounded-xl border border-white/10">
                  <label className="block text-gray-300 font-semibold mb-2">{t.register.residencyExpiry} *</label>
                  <input type="date" name="residency_expiry" value={form.residency_expiry} onChange={handleInputChange} className="glass-input w-full px-5 py-4 text-lg" />
                </div>
              )}

              <div>
                <label className="block text-gray-300 font-semibold mb-2">{locale === "ar" ? "جواز السفر *" : "Passport *"}</label>
                <label className="glass-input flex flex-col items-center justify-center gap-3 px-5 py-10 cursor-pointer hover:bg-white/10 transition-colors text-center border-2 border-dashed">
                  <Upload size={32} className="text-brand-blue" />
                  <span className="text-gray-400 font-medium text-lg px-2 text-balance">
                    {fileName || (locale === "ar" ? "اضغط لرفع صورة جواز السفر" : "Click to upload passport")}
                  </span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">{t.register.notes}</label>
                <textarea name="notes" value={form.notes} onChange={handleInputChange} className="glass-input w-full px-5 py-4 text-lg h-32" placeholder={t.register.notesPlaceholder} />
              </div>

              <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary w-full !py-5 !text-xl disabled:opacity-50 mt-8">
                {loading ? (
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{t.register.submitting}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span>{t.register.submit}</span>
                    <Arrow size={22} />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
