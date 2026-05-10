import { LifeBuoy, MessageCircle, Mail, Phone, CircleHelp } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useProfile } from "../Context/ProfileContext";

export default function Support() {
  const { user } = useProfile();
  const [issueText, setIssueText] = useState("");
  const role = (localStorage.getItem("userRole") || "").toLowerCase();
  const roleLabel = role === "tourguide" ? "Tour Guide" : "Tourist";

  const supportEmail = "support@smartguide.com";
  const supportPhone = "+20 100 000 0000";
  const supportWhatsApp = user?.whatsAppNumber || "+20 100 000 0000";

  const faqs = [
    {
      question: "How can I edit my profile information?",
      answer:
        "From the profile page, click Edit Profile, update your information, then click Save Changes.",
    },
    {
      question: "What should I do if I forget my password?",
      answer:
        "From the login page, click Forgot Password and follow the reset instructions.",
    },
    {
      question: "How can I contact support quickly?",
      answer:
        "You can contact us through the email, phone number, or WhatsApp listed below.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10" dir="ltr">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 rounded-3xl bg-white border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-egypt-teal font-semibold mb-2">
                Help Center
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Support & Assistance
              </h1>
              <p className="mt-2 text-gray-600 text-sm md:text-base">
                Welcome {user?.firstName || user?.userName || "there"}, we are here to help you as a {roleLabel}.
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
              Frequently Asked Questions
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
                Describe Your Issue
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Write your issue clearly and we will contact you as soon as possible.
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
                  placeholder="Example: I can't update my profile information after saving..."
                  className="w-full min-h-32 resize-y rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 outline-none focus:border-egypt-teal focus:ring-2 focus:ring-teal-100"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-egypt-teal py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Submit Issue
                </button>
              </form>
            </div>

            <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Contact Support Team
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
                    WhatsApp: {supportWhatsApp}
                  </span>
                </a>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-teal-600 to-cyan-700 p-6 text-white shadow-lg">
              <p className="text-sm opacity-90">Still have a question?</p>
              <h3 className="mt-1 text-xl font-bold">We are with you step by step</h3>
              <p className="mt-2 text-sm leading-7 text-teal-50">
                Our team is available to answer your questions and help solve any issue you face.
              </p>
              <Link
                to="/profile"
                className="mt-5 inline-flex rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30 transition"
              >
                Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
