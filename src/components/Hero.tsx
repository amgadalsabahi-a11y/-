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
    fetch("/api/admin/content?type=settings", { next: { revalidate: 300 } } as any)
      .then(res => res.json())
      .then(({ data }) => {
        if (data) {
          try {
            const parsed = JSON.parse(locale === "ar" ? data.about_ar : data.about_en);
            setContent({
              title: parsed.hero_title,
              subtitle: parsed.hero_subtitle,
              description: parsed.hero_description,
              cta: parsed.hero_cta,
              title_color: parsed.hero_title_color,
              subtitle_color: parsed.hero_subtitle_color,
              description_color: parsed.hero_description_color
            });
            if (parsed.hero_image) {
              setBgImage(parsed.hero_image);
            }
          } catch (e) { }
        }
      })
      .catch(() => { });
  }, [locale]);

  const displayTitle = content?.title || t.hero.title;
  const displaySubtitle = content?.subtitle || t.hero.subtitle;
  const displayDesc = content?.description || t.hero.description;
  const displayCta = content?.cta || t.hero.cta;

  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    // ✅ إصلاح: pt-24 للجوال بدل pt-20، وأزلنا pt-10 من الـ div الداخلي
    <section id="hero" className="relative min-h-[95vh] md:min-h-screen flex items-center overflow-hidden pt-24 md:pt-0">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-navy-950/80 z-10" />
        <img
          src={bgImage || "https://images.unsplash.com/photo-1513326738677-b964603b136d?q=80&w=2000"}
          alt="Russia"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="section-container relative z-20 w-full flex justify-center md:justify-start">
        <div className="max-w-4xl mx-auto md:mx-0 py-8 md:py-0 text-center md:text-start flex flex-col items-center md:items-start">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 backdrop-blur-sm mb-6 md:mb-8 animate-fade-in">
            <span className="text-brand-blue text-sm font-bold tracking-wider uppercase">
              🇷🇺 {t.hero.badge}
            </span>
          </div>

          <h1 
            className="text-4xl md:text-7xl font-black mb-6 md:mb-8 leading-[1.1] animate-fade-in-up"
            style={{ color: content?.title_color || "#ffffff" }}
          >
            {displayTitle}
            <span 
              className="block mt-2"
              style={{ color: content?.subtitle_color || "#1e50a2" }}
            >
              {displaySubtitle}
            </span>
          </h1>

          <p
            className="text-base md:text-xl leading-relaxed max-w-2xl mb-8 md:mb-12 animate-fade-in-up font-medium"
            style={{ 
              animationDelay: "0.2s",
              color: content?.description_color || "#d1d5db"
            }}
          >
            {displayDesc}
          </p>

          {/* ✅ إصلاح: قللنا padding الزر الثاني على الجوال وقصّرنا النص */}
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Link href="/register" className="btn-primary w-full sm:w-auto !py-4 !px-8 !text-lg md:!text-xl group justify-center">
              {displayCta}
              <Arrow size={22} className="group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1 shrink-0" />
            </Link>
            <a
              href="#faq"
              className="btn-secondary w-full sm:w-auto !py-4 !px-6 text-base md:text-lg text-center"
            >
              {locale === "ar" ? "الشروط والمستحقات" : "Terms & Entitlements"}
            </a>
          </div>
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute -bottom-24 -start-24 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px] z-0" />
    </section>
  );
}