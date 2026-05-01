"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { getTranslations } from "@/lib/i18n";
import { Menu, X, Globe } from "lucide-react";

export default function Navbar() {
  const { locale, setLocale } = useLocale();
  const t = getTranslations(locale);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#hero", label: t.nav.home },
    { href: "#about", label: t.nav.about },
    { href: "#services", label: t.nav.services },
    { href: "#how-it-works", label: t.nav.howItWorks },
    { href: "#faq", label: t.nav.faq },
  ];

  const toggleLocale = () => {
    setLocale(locale === "ar" ? "en" : "ar");
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-navbar shadow-2xl shadow-black/30"
            : "bg-transparent"
        }`}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-8 rounded-sm overflow-hidden flex flex-col shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                <div className="h-1/3 w-full bg-white"></div>
                <div className="h-1/3 w-full bg-[#1C3578]"></div>
                <div className="h-1/3 w-full bg-[#E4181C]"></div>
              </div>
              <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                {locale === "ar" ? "بوابة روسيا" : "Russia Gateway"}
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium relative after:absolute after:bottom-[-4px] after:start-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-brand-blue after:transition-all after:duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={toggleLocale}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm"
                title={locale === "ar" ? "Switch to English" : "التبديل للعربية"}
              >
                <Globe size={18} />
                <span className="font-medium">{locale === "ar" ? "EN" : "عربي"}</span>
              </button>
              <Link href="/register" className="btn-primary !py-2.5 !px-6 !text-sm">
                {t.nav.register}
              </Link>
            </div>

            {/* Mobile Toggle */}
            <div className="flex lg:hidden items-center gap-3">
              <button
                onClick={toggleLocale}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
              >
                <Globe size={20} />
                <span className="font-medium text-sm">{locale === "ar" ? "EN" : "عربي"}</span>
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="mobile-menu-overlay lg:hidden">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-6 end-6 p-2 text-gray-300 hover:text-white"
          >
            <X size={28} />
          </button>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-2xl font-bold text-gray-200 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/register"
            onClick={() => setMobileOpen(false)}
            className="btn-primary !text-lg !px-10 !py-4 mt-4"
          >
            {t.nav.register}
          </Link>
        </div>
      )}
    </>
  );
}
