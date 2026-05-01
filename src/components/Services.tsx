"use client";

import { useEffect, useState } from "react";
import { useLocale } from "./LocaleProvider";
import { getTranslations } from "@/lib/i18n";
import { GraduationCap, Briefcase, Plane, Building2 } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Briefcase,
  Plane,
  Building2,
};

const gradients = [
  "from-blue-500/20 to-blue-600/5",
  "from-emerald-500/20 to-emerald-600/5",
  "from-amber-500/20 to-amber-600/5",
  "from-rose-500/20 to-rose-600/5",
];

const iconColors = ["text-blue-400", "text-emerald-400", "text-amber-400", "text-rose-400"];

export default function Services() {
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/content?type=services&t=" + Date.now())
      .then(res => res.json())
      .then(({ data }) => {
        if (data && data.length > 0) {
          setServices(data);
        }
      })
      .catch(() => {});
  }, []);

  const displayItems = services.length > 0 ? services : t.services.items;

  return (
    <section id="services" className="relative py-16 md:py-24">
      <div className="absolute top-1/2 end-0 w-[300px] h-[300px] bg-brand-red/5 rounded-full blur-[100px]" />

      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            {t.services.title}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {t.services.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {displayItems.map((item: any, i: number) => {
            const Icon = iconMap[item.icon] || Briefcase;
            const title = locale === "ar" ? (item.title_ar || item.title) : (item.title_en || item.title);
            const desc = locale === "ar" ? (item.desc_ar || item.description) : (item.desc_en || item.description);
            const colorIndex = i % gradients.length;

            return (
              <div key={i} className="glass-card p-8 md:p-10 group">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradients[colorIndex]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={30} className={iconColors[colorIndex]} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                  {title}
                </h3>
                <p className="text-gray-400 leading-relaxed break-words whitespace-pre-wrap">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
