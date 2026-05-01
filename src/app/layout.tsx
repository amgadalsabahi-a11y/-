import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "بوابة روسيا | Russia Gateway - خدمات الدراسة والعمل والسياحة",
  description: "بوابة روسيا - شريكك الموثوق للدراسة والعمل والسياحة وتأسيس الأعمال في روسيا. خدمات متكاملة من التقديم حتى الوصول.",
  keywords: "روسيا, دراسة, عمل, سياحة, تأشيرة, جامعات روسية, Russia, study, work, tourism",
  openGraph: {
    title: "بوابة روسيا | Russia Gateway",
    description: "خدمات متكاملة للدراسة والعمل والسياحة في روسيا",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo antialiased">
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
