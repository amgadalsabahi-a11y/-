"use client";

import { useEffect, useState } from "react";
import { useLocale } from "./LocaleProvider";
import { getTranslations } from "@/lib/i18n";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/content?type=faqs&t=" + Date.now(), { cache: "no-store" })
      .then(res => res.json())
      .then(({ data }) => {
        if (data) setFaqs(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/5 rounded-full blur-[150px] -z-10" />

      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            {t.faq.title}
          </h2>
          <p className="text-gray-400 text-lg md:text-xl">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, i) => {
            const question = locale === "ar" ? faq.question_ar : faq.question_en;
            const answer = locale === "ar" ? faq.answer_ar : faq.answer_en;

            return (
              <div 
                key={i} 
                className="glass-card-static cursor-pointer hover:bg-white/5 transition-all group overflow-hidden border border-white/5"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-brand-blue transition-colors">
                      {question}
                    </h3>
                    <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-brand-blue/20 transition-all ${openIndex === i ? 'rotate-180 bg-brand-blue/20' : ''}`}>
                      <ChevronDown size={22} className="text-brand-blue" />
                    </div>
                  </div>
                  
                  <div className={`grid transition-all duration-300 ${openIndex === i ? 'grid-rows-[1fr] opacity-100 mt-6 pt-6 border-t border-white/10' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                        {answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
