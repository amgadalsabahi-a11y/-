"use client";

import { useState } from "react";
import { useLocale } from "./LocaleProvider";
import { getTranslations } from "@/lib/i18n";
import { ChevronDown } from "lucide-react";

export default function FAQ({ initialData = [] }: { initialData: any[] }) {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // ✅ إصلاح: fallback للبيانات الثابتة إذا كانت قاعدة البيانات فارغة
  const displayFaqs = initialData.length > 0
    ? initialData
    : (t as any).faq?.items || [];

  return (
    <section id="faq" className="py-16 md:py-24 relative overflow-hidden">
      {/* ✅ إصلاح: استبدلنا translate-x بـ mx-auto لدعم RTL */}
      <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 mx-auto w-[800px] h-[800px] bg-brand-blue/5 rounded-full blur-[150px] -z-10" />

      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            {t.faq.title}
          </h2>
          <p className="text-gray-400 text-lg md:text-xl">
            {t.faq.subtitle}
          </p>
        </div>

        {displayFaqs.length === 0 ? (
          <p className="text-center text-gray-500">{locale === "ar" ? "لا توجد أسئلة حتى الآن" : "No FAQs yet"}</p>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {displayFaqs.map((faq: any, i: number) => {
              const question = locale === "ar" ? faq.question_ar : faq.question_en;
              const answer = locale === "ar" ? faq.answer_ar : faq.answer_en;

              return (
                <div
                  key={i}
                  className="glass-card-static cursor-pointer hover:bg-white/5 transition-all group overflow-hidden border border-white/5"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <div className="p-5 md:p-8">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-base md:text-xl font-bold text-white group-hover:text-brand-blue transition-colors">
                        {question}
                      </h3>
                      <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-brand-blue/20 transition-all shrink-0 ${openIndex === i ? "rotate-180 bg-brand-blue/20" : ""}`}>
                        <ChevronDown size={22} className="text-brand-blue" />
                      </div>
                    </div>

                    <div className={`grid transition-all duration-300 ${openIndex === i ? "grid-rows-[1fr] opacity-100 mt-6 pt-6 border-t border-white/10" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        <p className="text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                          {answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}