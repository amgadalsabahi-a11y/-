// ============================================================
// next.config.ts
// إضافة: Security Headers كاملة
// ============================================================
import type { NextConfig } from "next";

const securityHeaders = [
  // يمنع المتصفح من تخمين نوع المحتوى
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // يمنع تضمين الموقع في iframe من خارجه (حماية من Clickjacking)
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // يتحكم في المعلومات المرسلة في Referrer header
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // يمنع DNS prefetch غير الضروري
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  // يقيد الـ permissions للمتصفح
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // HTTPS إجباري لمدة سنتين (فعّله فقط في production)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Content Security Policy — يمنع XSS
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // السماح بـ scripts من نفس الموقع + مكتبات AI
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
      // السماح بـ styles من نفس الموقع
      "style-src 'self' 'unsafe-inline'",
      // السماح بالصور من نفس الموقع + Supabase + data URIs + blob
      "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
      // السماح بالاتصال بـ Supabase + خوادم بيانات اللغة للـ AI
      "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://cdn.jsdelivr.net https://unpkg.com",
      // السماح بتشغيل الـ AI Workers
      "worker-src 'self' blob:",
      // منع تضمين الموقع في frame
      "frame-ancestors 'self'",
      // منع object/embed
      "object-src 'none'",
      // base URI من نفس الموقع فقط
      "base-uri 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // تطبيق الـ headers على كل الصفحات
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // منع تسريب معلومات الـ server في الـ headers
  poweredByHeader: false,

  // إعداد الصور المسموح بها من مصادر خارجية
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
    ],
  },
};

export default nextConfig;