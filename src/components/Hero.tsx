"use client";

import { useEffect, useState } from "react";
import { useLocale } from "./LocaleProvider";
import { getTranslations } from "@/lib/i18n";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function Hero() {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/content?type=settings&t=" + Date.now(), { cache: "no-store" })
      .then(res => res.json())
      .then(({ data }) => {
        if (data) {
          try {
            const parsed = JSON.parse(locale === "ar" ? data.about_ar : data.about_en);
            setContent({
              title: parsed.hero_title,
              subtitle: parsed.hero_subtitle,
              description: parsed.hero_description,
              cta: parsed.hero_cta
            });
            if (parsed.hero_image) {
              setBgImage(parsed.hero_image);
            }
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, [locale]);

  const displayTitle = content?.title || t.hero.title;
  const displaySubtitle = content?.subtitle || t.hero.subtitle;
  const displayDesc = content?.description || t.hero.description;
  const displayCta = content?.cta || t.hero.cta;

  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section id="hero" className="relative min-h-[85vh] md:min-h-screen flex items-center overflow-hidden pt-20 md:pt-0">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-navy-950/80 z-10" />
        <img 
          src={bgImage || "https://images.unsplash.com/photo-1513326738677-b964603b136d?q=80&w=2000"} 
          alt="Russia" 
          className="w-full h-full object-cover" 
        />
      </div>

      <div className="section-container relative z-20">
        <div className="max-w-4xl pt-10 md:pt-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 backdrop-blur-sm mb-6 md:mb-8 animate-fade-in">
             <span className="text-brand-blue text-sm font-bold tracking-wider uppercase">
               🇷🇺 {t.hero.badge}
             </span>
          </div>

          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 md:mb-8 leading-[1.1] animate-fade-in-up">
            {displayTitle}
            <span className="block text-brand-blue mt-2">{displaySubtitle}</span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl mb-8 md:mb-12 animate-fade-in-up font-medium" style={{ animationDelay: "0.2s" }}>
            {displayDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Link href="/register" className="btn-primary w-full sm:w-auto !py-4 !px-10 !text-xl group">
              {displayCta}
              <Arrow size={24} className="group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1" />
            </Link>
            <a href="#faq" className="btn-secondary w-full sm:w-auto !py-4 !px-8 text-lg text-center">
              {locale === "ar" ? "قراءة الشروط والمستحقات" : "Read Terms and Entitlements"}
            </a>
          </div>
        </div>
      </div>
      
      {/* Decorative Blur */}
      <div className="absolute -bottom-24 -start-24 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px] z-0" />
    </section>
  );
}
