import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, sub, accent = "brand" }) {
  const accents = {
    brand: "from-brand to-brand-light",
    gold: "from-gold to-amber-500",
    blue: "from-sky-500 to-blue-600",
    rose: "from-rose-500 to-pink-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-card overflow-hidden p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--admin-text-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
          {sub ? (
            <p className="mt-1 text-xs text-[var(--admin-text-muted)]">{sub}</p>
          ) : null}
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accents[accent] || accents.brand} text-white shadow-lg`}
        >
          {Icon ? <Icon size={22} /> : null}
        </div>
      </div>
    </motion.div>
  );
}
