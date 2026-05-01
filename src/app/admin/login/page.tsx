"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { getTranslations } from "@/lib/i18n";
import { Lock, Mail, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  const handleManualSubmit = async () => {
    if (!email || !password) {
      setError(locale === "ar" ? "يرجى إدخال البريد وكلمة المرور" : "Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin");
        // Force refresh after a small delay to ensure cookie is set
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        setError(data.error || t.admin.loginError);
      }
    } catch {
      setError(t.admin.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-[#050B18]">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="glass-card w-full max-w-md p-8 md:p-10 relative z-10 border border-white/10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-red flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-blue/20">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t.admin.login}</h1>
          <p className="text-gray-400 text-sm">
            {locale === "ar" ? "يرجى إدخال بيانات الاعتماد للوصول للوحة التحكم" : "Please enter your credentials to access the dashboard"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 animate-fade-in">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <p className="text-red-300 font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">{t.admin.email}</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full px-5 py-3 ps-12 text-white"
                placeholder="admin@russia-gateway.com"
                dir="ltr"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">{t.admin.password}</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full px-5 py-3 ps-12 text-white"
                placeholder="••••••••"
                dir="ltr"
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualSubmit}
            disabled={loading}
            className="btn-primary w-full !mt-8 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{t.admin.logging}</span>
              </>
            ) : (
              <>
                <span>{t.admin.loginBtn}</span>
                <Arrow size={18} />
              </>
            )}
          </button>
          
          <Link href="/" className="block text-center text-gray-500 hover:text-white text-sm transition-colors mt-4">
            {locale === "ar" ? "العودة للموقع" : "Back to Website"}
          </Link>
        </div>
      </div>
    </div>
  );
}
