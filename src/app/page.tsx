"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { useLocale } from "@/components/LocaleProvider";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    // جلب البيانات الأولية للتأكد من جاهزية الموقع
    const checkData = async () => {
      try {
        const res = await fetch("/api/admin/content?type=settings");
        if (res.ok) {
          // ننتظر قليلاً لضمان سلاسة الحركة
          setTimeout(() => setIsLoading(false), 500);
        } else {
          setIsLoading(false);
        }
      } catch (e) {
        setIsLoading(false);
      }
    };

    checkData();
  }, []);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-[#050B18] flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full border-4 border-brand-blue/20 border-t-brand-blue animate-spin mb-4" />
          <p className="text-white font-bold animate-pulse">
            {locale === "ar" ? "جاري تحميل بوابة روسيا..." : "Loading Russia Gateway..."}
          </p>
        </div>
      )}
      
      <main className={`relative bg-[#050B18] min-h-screen overflow-x-hidden transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <Navbar />
        <Hero />
        <About />
        <HowItWorks />
        <FAQ />
        <Footer />
      </main>
    </>
  );
}
