"use client";

import { useLocale } from "./LocaleProvider";
import { getTranslations } from "@/lib/i18n";
import { Award, HeartHandshake, BadgeDollarSign } from "lucide-react";

const icons = [Award, HeartHandshake, BadgeDollarSign];

export default function Trust() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    // ✅ إصلاح: py-16 للجوال بدل py-32
    <section className="relative py-16 md:py-32 overflow-hidden">
      <div className="section-container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            {t.trust.title}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {t.trust.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {t.trust.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <div key={i} className="glass-card p-8 md:p-10 text-center group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-blue/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={36} className="text-brand-blue" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed break-words">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}