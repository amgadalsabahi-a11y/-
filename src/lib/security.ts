// ============================================================
// src/lib/security.ts
// Rate Limiter + Magic Bytes File Detector
// ============================================================

// ---------------------------------------------------------------
// Rate Limiter (in-memory)
// يعمل داخل كل serverless function بشكل مستقل
// ---------------------------------------------------------------

type RateRecord = { count: number; resetAt: number };
const rateLimitStore = new Map<string, RateRecord>();

// التنظيف كل 10 دقائق لمنع تراكم الذاكرة
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetAt) rateLimitStore.delete(key);
    }
}, 10 * 60 * 1000);

/**
 * يرجع true إذا السماح بالطلب، false إذا تجاوز الحد
 * @param key - معرف فريد (IP + endpoint مثلاً)
 * @param maxAttempts - أقصى عدد محاولات
 * @param windowMs - النافذة الزمنية بالـ milliseconds
 */
export function checkRateLimit(
    key: string,
    maxAttempts: number,
    windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSeconds: 0 };
    }

    if (record.count >= maxAttempts) {
        const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
        return { allowed: false, retryAfterSeconds };
    }

    record.count++;
    return { allowed: true, retryAfterSeconds: 0 };
}

// ---------------------------------------------------------------
// Magic Bytes File Detector
// يفحص أول بايتات الملف الفعلية بدلاً من الاعتماد على client
// ---------------------------------------------------------------

export interface DetectedFileType {
    mime: string;
    ext: string;
}

/**
 * يكشف نوع الملف الحقيقي من الـ magic bytes
 * يرجع null إذا كان النوع غير مسموح أو غير معروف
 */
export function detectMimeType(buffer: Buffer): DetectedFileType | null {
    if (buffer.length < 12) return null;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return { mime: "image/jpeg", ext: "jpg" };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
    ) {
        return { mime: "image/png", ext: "png" };
    }

    // PDF: 25 50 44 46 (%PDF)
    if (
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46
    ) {
        return { mime: "application/pdf", ext: "pdf" };
    }

    // WebP: RIFF????WEBP
    if (
        buffer[0] === 0x52 && // R
        buffer[1] === 0x49 && // I
        buffer[2] === 0x46 && // F
        buffer[3] === 0x46 && // F
        buffer[8] === 0x57 && // W
        buffer[9] === 0x45 && // E
        buffer[10] === 0x42 && // B
        buffer[11] === 0x50   // P
    ) {
        return { mime: "image/webp", ext: "webp" };
    }

    // GIF: GIF87a أو GIF89a
    if (
        buffer[0] === 0x47 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x38
    ) {
        return { mime: "image/gif", ext: "gif" };
    }

    return null;
}