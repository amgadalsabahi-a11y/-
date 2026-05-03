import { useState, useEffect } from "react";

/**
 * Hook لجلب رابط آمن (Signed URL) لملف من Supabase
 * إذا كان الرابط عاماً أصلاً، سيعيده كما هو.
 * إذا كان خاصاً، سيطلب رابطاً مؤقتاً من الـ API.
 */
export function useSafeUrl(url: string | null) {
  const [safeUrl, setSafeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) {
      setSafeUrl(null);
      return;
    }

    // إذا كان الرابط ليس من Supabase (مثلاً Unsplash)، نستخدمه مباشرة
    if (!url.includes("supabase.co")) {
      setSafeUrl(url);
      return;
    }

    // طلب رابط آمن من الـ API
    const fetchSafeUrl = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/file-url?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data.signedUrl) {
          setSafeUrl(data.signedUrl);
        } else {
          setSafeUrl(url); // Fallback
        }
      } catch (e) {
        setSafeUrl(url);
      } finally {
        setLoading(false);
      }
    };

    fetchSafeUrl();
  }, [url]);

  return { safeUrl, loading };
}
