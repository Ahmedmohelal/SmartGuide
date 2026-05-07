/** قسم مرتبط برابط الناف «الأسئلة الشائعة» — يمكن تعبئة المحتوى لاحقاً */
export default function FaqSection() {
  return (
    <section
      id="faq"
      className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-slate-600">
          We are preparing answers for the most common questions about services and bookings. Stay tuned.
        </p>
      </div>
    </section>
  );
}
