"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLocale } from "@/components/LocaleProvider";
import { getTranslations } from "@/lib/i18n";
import { ArrowRight, ArrowLeft, Upload, AlertCircle } from "lucide-react";

const countriesAr = [
  "أفغانستان", "ألبانيا", "الجزائر", "أندورا", "أنغولا", "أنتيغوا وبربودا", "الأرجنتين", "أرمينيا", "أستراليا", "النمسا", "أذربيجان", "الباهاما", "البحرين", "بنغلاديش", "باربادوس", "بيلاروسيا", "بلجيكا", "بليز", "بنين", "بوتان", "بوليفيا", "البوسنة والهرسك", "بوتسوانا", "البرازيل", "بروناي", "بلغاريا", "بوركينا فاسو", "بوروندي", "كابو فيردي", "كمبوديا", "الكاميرون", "كندا", "جمهورية أفريقيا الوسطى", "تشاد", "تشيلي", "الصين", "كولومبيا", "جزر القمر", "الكونغو", "كوستاريكا", "كرواتيا", "كوبا", "قبرص", "التشيك", "الدنمارك", "جيبوتي", "دومينيكا", "جمهورية الدومينيكان", "تيمور الشرقية", "الإكوادور", "مصر", "السلفادور", "غينيا الاستوائية", "إريتريا", "إستونيا", "إسواتيني", "إثيوبيا", "فيجي", "فنلندا", "فرنسا", "الغابون", "غامبيا", "جورجيا", "ألمانيا", "غانا", "اليونان", "غرينادا", "غواتيمالا", "غينيا", "غينيا بيساو", "غويانا", "هايتي", "هندوراس", "المجر", "آيسلندا", "الهند", "إندونيسيا", "إيران", "العراق", "أيرلندا", "إيطاليا", "ساحل العاج", "جامايكا", "اليابان", "الأردن", "كازاخستان", "كينيا", "كيريباتي", "الكويت", "قرغيزستان", "لاوس", "لاتفيا", "لبنان", "ليسوتو", "ليبيريا", "ليبيا", "ليختنشتاين", "ليتوانيا", "لوكسمبورغ", "مدغشقر", "مالاوي", "ماليزيا", "المالديف", "مالي", "مالطا", "جزر مارشال", "موريتانيا", "موريشيوس", "المكسيك", "ميكرونيزيا", "مولدوفا", "موناكو", "منغوليا", "الجبل الأسود", "المغرب", "موزمبيق", "ميانمار", "ناميبيا", "ناورو", "نيبال", "هولندا", "نيوزيلندا", "نيكاراغوا", "النيجر", "نيجيريا", "كوريا الشمالية", "مقدونيا الشمالية", "النرويج", "عمان", "باكستان", "بالاو", "فلسطين", "بنما", "بابوا غينيا الجديدة", "باراغواي", "بيرو", "الفلبين", "بولندا", "البرتغال", "قطر", "رومانيا", "روسيا", "رواندا", "سانت كيتس ونيفيس", "سانت لوسيا", "سانت فينسنت والغرينادين", "ساموا", "سان مارينو", "ساو تومي وبرينسيب", "السعودية", "السنغال", "صربيا", "سيشل", "سيراليون", "سنغافورة", "سلوفاكيا", "سلوفينيا", "جزر سليمان", "الصومال", "جنوب أفريقيا", "كوريا الجنوبية", "جنوب السودان", "إسبانيا", "سريلانكا", "السودان", "سورينام", "السويد", "سويسرا", "سوريا", "تايوان", "طاجيكستان", "تنزانيا", "تايلاند", "توغو", "تونغا", "ترينيداد وتوباغو", "تونس", "تركيا", "تركمانستان", "توفالو", "أوغندا", "أوكرانيا", "الإمارات", "المملكة المتحدة", "الولايات المتحدة", "أوروغواي", "أوزبكستان", "فانواتو", "الفاتيكان", "فنزويلا", "فيتنام", "اليمن", "زامبيا", "زيمبابوي", "أخرى"
];

const countriesEn = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Other"
];

const dialCodes = [
  { name: "Russia", code: "+7", flag: "🇷🇺" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { name: "Egypt", code: "+20", flag: "🇪🇬" },
  { name: "UAE", code: "+971", flag: "🇦🇪" },
  { name: "Kuwait", code: "+965", flag: "🇰🇼" },
  { name: "Qatar", code: "+974", flag: "🇶🇦" },
  { name: "Oman", code: "+968", flag: "🇴🇲" },
  { name: "Bahrain", code: "+973", flag: "🇧🇭" },
  { name: "Jordan", code: "+962", flag: "🇯🇴" },
  { name: "Iraq", code: "+964", flag: "🇮🇶" },
  { name: "Yemen", code: "+967", flag: "🇾🇪" },
  { name: "Syria", code: "+963", flag: "🇸🇾" },
  { name: "Palestine", code: "+970", flag: "🇵🇸" },
  { name: "Lebanon", code: "+961", flag: "🇱🇧" },
  { name: "Sudan", code: "+249", flag: "🇸🇩" },
  { name: "Libya", code: "+218", flag: "🇱🇾" },
  { name: "Tunisia", code: "+216", flag: "🇹🇳" },
  { name: "Algeria", code: "+213", flag: "🇩🇿" },
  { name: "Morocco", code: "+212", flag: "🇲🇦" },
  { name: "Turkey", code: "+90", flag: "🇹🇷" },
  { name: "USA", code: "+1", flag: "🇺🇸" },
  { name: "UK", code: "+44", flag: "🇬🇧" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "Pakistan", code: "+92", flag: "🇵🇰" },
  { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
  { name: "China", code: "+86", flag: "🇨🇳" }
];

export default function Register() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = getTranslations(locale);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    age: "",
    country: "",
    nationality: "",
    phone: "",
    residency_expiry: "",
    notes: ""
  });
  const [dialCode, setDialCode] = useState("+966");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  // ✅ ArrowLeft للرجوع في العربية، ArrowRight في الإنجليزية
  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft;
  const ForwardArrow = locale === "ar" ? ArrowLeft : ArrowRight;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMsg(locale === "ar" ? "حجم الملف كبير جداً (الأقصى 10 ميجابايت)" : "File too large (Max 10MB)");
        return;
      }
      // ✅ التحقق من نوع الملف على جانب العميل أيضاً
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(jpg|jpeg|png|webp|heic|pdf)$/i)) {
        setErrorMsg(locale === "ar" ? "يُسمح فقط بصور (JPG, PNG, WEBP) أو PDF" : "Only images (JPG, PNG, WEBP) or PDF allowed");
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setErrorMsg("");
    }
  };

  const handleSubmit = async () => {
    // ✅ تحقق شامل من جميع الحقول المطلوبة
    if (!form.full_name.trim()) {
      setErrorMsg(locale === "ar" ? "يرجى إدخال الاسم الكامل" : "Please enter your full name");
      return;
    }
    const ageNum = parseInt(form.age, 10);
    if (!form.age || isNaN(ageNum) || ageNum < 18) {
      setErrorMsg(locale === "ar" ? "عذراً، يجب أن يكون العمر 18 عاماً أو أكثر للتسجيل" : "Sorry, you must be 18 years or older to register");
      return;
    }
    if (!form.phone.trim()) {
      setErrorMsg(locale === "ar" ? "يرجى إدخال رقم الهاتف" : "Please enter your phone number");
      return;
    }
    if (!form.country) {
      setErrorMsg(locale === "ar" ? "يرجى اختيار بلد الإقامة" : "Please select your country");
      return;
    }
    if (!form.nationality) {
      setErrorMsg(locale === "ar" ? "يرجى اختيار الجنسية" : "Please select your nationality");
      return;
    }
    if (!file) {
      setErrorMsg(locale === "ar" ? "يرجى إرفاق صورة جواز السفر" : "Please upload your passport");
      return;
    }
    // ✅ تحقق من تاريخ انتهاء الإقامة إذا كانت السعودية
    const isSaudi = form.country === "السعودية" || form.country === "Saudi Arabia";
    if (isSaudi && !form.residency_expiry) {
      setErrorMsg(locale === "ar" ? "يرجى إدخال تاريخ انتهاء الإقامة" : "Please enter residency expiry date");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("age", form.age);
      formData.append("country", form.country);
      formData.append("nationality", form.nationality);
      formData.append("phone", dialCode + " " + form.phone);
      formData.append("notes", form.notes || "");
      formData.append("file", file);
      formData.append("has_saudi_residency", isSaudi ? "true" : "false");
      if (isSaudi) {
        formData.append("residency_expiry", form.residency_expiry);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const res = await fetch("/api/apply", {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok) {
        // ✅ استخدام صفحة Success الموجودة بدل inline message
        router.push("/success");
      } else {
        setErrorMsg(data.error || t.register.error);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setErrorMsg(locale === "ar" ? "انتهت مهلة الاتصال، يرجى المحاولة مرة أخرى" : "Request timed out, please try again");
      } else {
        setErrorMsg(locale === "ar" ? "فشل الاتصال بالسيرفر، يرجى المحاولة مرة أخرى" : "Connection failed, please try again");
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <main className="relative min-h-screen bg-[#050B18]">
      <Navbar />

      <section className="pt-24 pb-16">
        <div className="section-container">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            {/* ✅ سهم الرجوع الصحيح حسب اللغة */}
            <BackArrow className="group-hover:translate-x-1 transition-transform" size={20} />
            {locale === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </Link>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{t.register.title}</h1>
              <p className="text-gray-400 text-lg">{t.register.subtitle}</p>
              <div className="mt-4 inline-block px-4 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue font-bold text-sm">
                {locale === "ar" ? "سيتم الرد خلال من 25 إلى 40 يوم" : "Response time: 25 to 40 days"}
              </div>
            </div>

            {errorMsg && (
              <div className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-4 animate-fade-in">
                <AlertCircle size={24} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-200 font-medium">{errorMsg}</p>
              </div>
            )}

            <div className="glass-card-static p-6 md:p-12 space-y-8">

              {/* الاسم + العمر */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-gray-300 font-semibold mb-2">{t.register.fullName} *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleInputChange}
                    className="glass-input w-full px-5 py-4 text-lg"
                    placeholder={t.register.fullName}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">{t.register.age} *</label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleInputChange}
                    className="glass-input w-full px-5 py-4 text-lg"
                    placeholder="18+"
                    min="1"
                    max="99"
                  />
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">{t.register.country} *</label>
                  <input
                    list="countries_list"
                    name="country"
                    value={form.country}
                    onChange={handleInputChange}
                    placeholder={locale === "ar" ? "ابحث عن بلد الإقامة..." : "Search Country..."}
                    className="glass-input w-full px-5 py-4 text-lg text-white bg-navy-900/50"
                    autoComplete="off"
                  />
                  <datalist id="countries_list">
                    {(locale === "ar" ? countriesAr : countriesEn).map(c => <option key={`c-${c}`} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">{t.register.nationality} *</label>
                  <input
                    list="nationalities_list"
                    name="nationality"
                    value={form.nationality}
                    onChange={handleInputChange}
                    placeholder={locale === "ar" ? "ابحث عن الجنسية..." : "Search Nationality..."}
                    className="glass-input w-full px-5 py-4 text-lg text-white bg-navy-900/50"
                    autoComplete="off"
                  />
                  <datalist id="nationalities_list">
                    {(locale === "ar" ? countriesAr : countriesEn).map(c => <option key={`n-${c}`} value={c} />)}
                  </datalist>
                </div>
              </div>



              {/* رقم الهاتف */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">{t.register.phone} *</label>
                <div className="flex flex-row gap-2">
                  <div className="relative w-28 sm:w-32 shrink-0">
                    <input
                      list="dial_codes_list"
                      value={dialCode}
                      onChange={(e) => setDialCode(e.target.value)}
                      placeholder="+966"
                      className="glass-input w-full px-3 py-4 text-lg text-center"
                    />
                    <datalist id="dial_codes_list">
                      {dialCodes.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </datalist>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    dir="ltr"
                    className="glass-input flex-1 px-5 py-4 text-lg min-w-0"
                    placeholder="5xxxxxxx"
                  />
                </div>
              </div>

              {/* تاريخ انتهاء الإقامة (يظهر فقط للسعودية) */}
              {(form.country === "السعودية" || form.country === "Saudi Arabia") && (
                <div className="animate-fade-in bg-white/5 p-6 rounded-2xl border border-white/10">
                  <label className="block text-gray-300 font-semibold mb-2">
                    {locale === "ar" ? "تاريخ انتهاء الإقامة *" : "Residency Expiry Date *"}
                  </label>
                  <input
                    type="date"
                    name="residency_expiry"
                    value={form.residency_expiry}
                    onChange={handleInputChange}
                    className="glass-input w-full px-5 py-4 text-lg"
                  />
                </div>
              )}

              {/* رفع الجواز */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  {locale === "ar" ? "جواز السفر *" : "Passport *"}
                </label>
                <label className="glass-input flex flex-col items-center justify-center gap-3 px-5 py-8 md:py-10 cursor-pointer hover:bg-white/10 transition-colors text-center border-2 border-dashed">
                  <Upload size={32} className="text-brand-blue" />
                  <span className="text-gray-400 font-medium text-base md:text-lg px-2 text-balance">
                    {fileName || (locale === "ar" ? "اضغط لرفع صورة جواز السفر" : "Click to upload passport")}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {locale === "ar" ? "JPG، PNG، PDF — بحد أقصى 10 ميجابايت" : "JPG, PNG, PDF — Max 10MB"}
                  </span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              {/* ملاحظات */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">{t.register.notes}</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  className="glass-input w-full px-5 py-4 text-lg h-32 resize-none"
                  placeholder={t.register.notesPlaceholder}
                />
              </div>

              {/* زر الإرسال */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full !py-5 !text-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="animate-spin w-6 h-6 text-white shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{t.register.submitting}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>{t.register.submit}</span>
                    <ForwardArrow size={22} className="shrink-0" />
                  </div>
                )}
              </button>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}