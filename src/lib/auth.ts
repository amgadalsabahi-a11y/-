import { SignJWT, jwtVerify } from "jose";

// ✅ إصلاح أمني: لا fallback في الكود — يجب أن يكون JWT_SECRET في ملف .env
// إذا لم يكن موجوداً سيرمي خطأ ويوقف التطبيق (أفضل من مفتاح ضعيف مكشوف)
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET غير موجود في متغيرات البيئة. أضفه في ملف .env");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createToken(payload: { email: string; name: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { email: string; name: string };
  } catch {
    return null;
  }
}