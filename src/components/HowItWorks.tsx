"use client";

import { useLocale } from "./LocaleProvider";
import { getTranslations } from "@/lib/i18n";
import { ClipboardList, SearchCheck, PhoneCall } from "lucide-react";

const icons = [ClipboardList, SearchCheck, PhoneCall];

export default function HowItWorks() {
  const { locale } = useLocale();
  const t = getTranslations(locale);

  return (
    <section id="how-it-works" className="relative py-32">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            {t.howItWorks.title}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line - desktop only */}
          <div className="hidden md:block absolute top-24 start-[16%] end-[16%] h-[2px] bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent" />

          {t.howItWorks.steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <div key={i} className="relative text-center group">
                {/* Step number circle */}
                <div className="relative inline-flex items-center justify-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-blue to-brand-blue/60 flex items-center justify-center shadow-lg shadow-brand-blue/25 group-hover:scale-110 transition-transform duration-300 relative z-10">
                    <Icon size={32} className="text-white" />
                  </div>
                  <div className="absolute -top-2 -end-2 w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {step.number}
                  </div>
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed break-words max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
