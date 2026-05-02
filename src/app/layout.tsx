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
  title: "بوابة روسيا | Russia Gateway",
  description: "بوابة روسيا - بوابتك الأولى نحو روسيا.",
  keywords: "روسيا, دراسة, عمل, سياحة, تأشيرة, جامعات روسية, Russia, study, work, tourism",
  openGraph: {
    title: "بوابة روسيا | Russia Gateway",
    description: "بوابة روسيا - بوابتك الأولى نحو روسيا.",
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
