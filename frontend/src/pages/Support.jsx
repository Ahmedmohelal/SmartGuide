import { LifeBuoy, MessageCircle, Mail, Phone, CircleHelp } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useProfile } from "../context/ProfileContext";

export default function Support() {
  const { user } = useProfile();
  const [issueText, setIssueText] = useState("");
  const role = (localStorage.getItem("userRole") || "").toLowerCase();
  const roleLabel = role === "tourguide" ? "مرشد سياحي" : "سائح";

  const supportEmail = "support@smartguide.com";
  const supportPhone = "+20 100 000 0000";
  const supportWhatsApp = user?.whatsAppNumber || "+20 100 000 0000";

  const faqs = [
    {
      question: "كيف أعدل بيانات الملف الشخصي؟",
      answer:
        "من صفحة البروفايل اضغط على Edit Profile ثم عدل البيانات واضغط حفظ التغييرات.",
    },
    {
      question: "ماذا أفعل إذا نسيت كلمة المرور؟",
      answer:
        "من صفحة تسجيل الدخول اضغط Forgot Password واتبع خطوات إعادة تعيين كلمة المرور.",
    },
    {
      question: "كيف أتواصل مع فريق الدعم بسرعة؟",
      answer:
        "تستطيع التواصل معنا عبر البريد الإلكتروني أو رقم الهاتف أو واتساب الموضحين بالأسفل.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10" dir="rtl">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 rounded-3xl bg-white border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-egypt-teal font-semibold mb-2">
                مركز المساعدة
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                الدعم والمساعدة
              </h1>
              <p className="mt-2 text-gray-600 text-sm md:text-base">
                اهلا {user?.firstName || user?.userName || "بك"}، نحن هنا لمساعدتك
                كـ {roleLabel}.
              </p>
            </div>
            <div className="rounded-2xl bg-teal-50 p-3 text-egypt-teal">
              <LifeBuoy size={28} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <CircleHelp size={18} className="text-egypt-teal" />
              الاسئلة الشائعة
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900">{faq.question}</p>
                  <p className="mt-2 text-sm text-gray-600 leading-7">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                اكتب مشكلتك
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                اكتب تفاصيل المشكلة بوضوح وسنتواصل معك في أقرب وقت.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="space-y-3"
              >
                <textarea
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="مثال: لا أستطيع تعديل بيانات الملف الشخصي بعد الحفظ..."
                  className="w-full min-h-32 resize-y rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 outline-none focus:border-egypt-teal focus:ring-2 focus:ring-teal-100"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-egypt-teal py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  إرسال المشكلة
                </button>
              </form>
            </div>

            <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                تواصل مع فريق الدعم
              </h2>
              <div className="space-y-3">
                <a
                  href={`mailto:${supportEmail}`}
                  className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition"
                >
                  <Mail size={18} className="text-egypt-teal" />
                  <span className="text-sm text-gray-700">{supportEmail}</span>
                </a>

                <a
                  href={`tel:${supportPhone}`}
                  className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition"
                >
                  <Phone size={18} className="text-egypt-teal" />
                  <span className="text-sm text-gray-700">{supportPhone}</span>
                </a>

                <a
                  href={`https://wa.me/${supportWhatsApp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition"
                >
                  <MessageCircle size={18} className="text-egypt-teal" />
                  <span className="text-sm text-gray-700">
                    واتساب: {supportWhatsApp}
                  </span>
                </a>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-teal-600 to-cyan-700 p-6 text-white shadow-lg">
              <p className="text-sm opacity-90">مازال لديك استفسار؟</p>
              <h3 className="mt-1 text-xl font-bold">نحن معك خطوة بخطوة</h3>
              <p className="mt-2 text-sm leading-7 text-teal-50">
                فريقنا متاح للرد على استفساراتك ومساعدتك في حل اي مشكلة تواجهك.
              </p>
              <Link
                to="/profile"
                className="mt-5 inline-flex rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30 transition"
              >
                العودة للملف الشخصي
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
