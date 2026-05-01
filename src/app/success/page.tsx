"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { CheckCircle2, Home } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function SuccessPage() {
  const { locale } = useLocale();

  return (
    <main className="relative min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center relative p-4">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-green-500/20 rounded-full blur-[120px]" />
        
        <div className="glass-card max-w-lg w-full p-8 md:p-12 text-center relative z-10 animate-fade-in-up">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8 animate-pulse-slow shadow-lg shadow-green-500/20">
            <CheckCircle2 size={48} className="text-green-400" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            {locale === "ar" ? "شكراً لك!" : "Thank You!"}
          </h1>
          
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10">
            {locale === "ar" 
              ? "تم استلام طلبك بنجاح. سيتم التواصل بك في أقرب وقت خلال 30 يوم إن شاء الله."
              : "Your application has been received successfully. We will contact you as soon as possible within 30 days, God willing."}
          </p>
          
          <Link href="/" className="btn-primary inline-flex">
            <Home size={20} className={locale === "ar" ? "ml-2" : "mr-2"} />
            {locale === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>
    </main>
  );
}
