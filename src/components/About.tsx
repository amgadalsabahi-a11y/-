"use client";

import { useLocale } from "./LocaleProvider";
import { getTranslations } from "@/lib/i18n";
import { CheckCircle2 } from "lucide-react";
import { useSafeUrl } from "@/lib/useSafeUrl";

export default function About({ initialData }: { initialData: any }) {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  
  let content: any = null;

  if (initialData) {
    try {
      const parsedAr = JSON.parse(initialData.about_ar);
      const parsedEn = JSON.parse(initialData.about_en);
      const current = locale === "ar" ? parsedAr : parsedEn;
      content = {
        title: current.about_title || current.title,
        subtitle: current.about_subtitle || current.subtitle,
        description: current.about_description || current.description,
        features: current.features || "",
        about_image: current.about_image || "",
        extra_image_1: current.extra_image_1 || "",
        extra_image_2: current.extra_image_2 || ""
      };
    } catch (e) {
      content = {
        title: t.about.title,
        subtitle: t.about.subtitle,
        description: locale === "ar" ? initialData.about_ar : initialData.about_en,
        features: t.about.features.join("\n"),
        about_image: ""
      };
    }
  }

  const displayTitle = content?.title || t.about.title;
  const displaySubtitle = content?.subtitle || t.about.subtitle;
  const displayDesc = content?.description || t.about.description;
  const featuresList = content?.features
    ? content.features.split("\n").filter((f: string) => f.trim() !== "")
    : t.about.features;

  return (
    <section id="about" className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute top-0 start-0 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[120px]" />

      <div className="section-container">
        {/* ✅ الإصلاح الرئيسي: النص دائماً أول على الجوال، الصورة ثانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* النص — order-1 على كل الشاشات */}
          <div className="order-1">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              {displayTitle}
            </h2>
            <p className="text-brand-blue text-lg font-semibold mb-6">
              {displaySubtitle}
            </p>
            <p className="text-gray-400 text-lg leading-relaxed mb-10 break-words whitespace-pre-wrap">
              {displayDesc}
            </p>

            <div className="space-y-4 mb-10">
              {featuresList.map((feature: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={22} className="text-green-400 mt-0.5 shrink-0" />
                  <span className="text-gray-300 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* الصورة — order-2 على كل الشاشات */}
          <div className="order-2">
            {content?.about_image ? (
              <div className="w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 group">
                <img 
                  src={content.about_image} 
                  alt="About Us" 
                  className="w-full h-auto md:min-h-[400px] object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
            ) : (
              <div className="glass-card-static p-8 md:p-10 relative overflow-hidden group min-h-[300px] md:min-h-[400px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-brand-red/10 group-hover:scale-105 transition-transform duration-500" />
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-blue to-brand-red flex items-center justify-center mb-6 shadow-xl shadow-brand-blue/20">
                    <div className="w-12 h-10 rounded-sm overflow-hidden flex flex-col shadow-lg border border-white/10">
                      <div className="h-1/3 w-full bg-white"></div>
                      <div className="h-1/3 w-full bg-[#1C3578]"></div>
                      <div className="h-1/3 w-full bg-[#E4181C]"></div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {locale === "ar" ? "وجهتك الموثوقة" : "Your Trusted Destination"}
                  </h3>
                  <p className="text-gray-400">
                    {locale === "ar"
                      ? "نحن نضمن لك أفضل تجربة للوصول إلى روسيا بسهولة وأمان تام."
                      : "We guarantee you the best experience to reach Russia easily and safely."}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ✅ الصور الإضافية - مكتملة مش جوا كرت */}
        {(content?.extra_image_1 || content?.extra_image_2) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-12 md:mt-20">
            {content?.extra_image_1 && (
              <div className="w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 group">
                <img 
                  src={content.extra_image_1} 
                  alt="Extra About 1" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
            )}
            {content?.extra_image_2 && (
              <div className="w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 group">
                <img 
                  src={content.extra_image_2} 
                  alt="Extra About 2" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}