import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { toDateKey } from "../utils/analytics";

const addDays = (key, delta) => {
  const d = new Date(key + "T12:00:00");
  d.setDate(d.getDate() + delta);
  return toDateKey(d);
};

export default function DateFilter({ value, onChange }) {
  const today = toDateKey(new Date());
  const isToday = value === today;

  return (
    <div className="admin-card flex flex-wrap items-center gap-4 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--admin-text-muted)]">
        <Calendar size={18} className="text-brand" />
        <span>Filter by date</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(addDays(value, -1))}
          className="admin-btn admin-btn-ghost !p-2.5"
          aria-label="Previous day"
        >
          <ChevronLeft size={18} />
        </button>

        <input
          type="date"
          value={value}
          max={today}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="admin-input !w-auto"
        />

        <button
          type="button"
          onClick={() => onChange(addDays(value, 1))}
          disabled={isToday}
          className="admin-btn admin-btn-ghost !p-2.5"
          aria-label="Next day"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(today)}
          className="admin-btn admin-btn-primary !py-1.5 !text-xs"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onChange(addDays(today, -1))}
          className="admin-btn admin-btn-ghost !py-1.5 !text-xs"
        >
          Yesterday
        </button>
        <button
          type="button"
          onClick={() => onChange(addDays(today, -7))}
          className="admin-btn admin-btn-ghost !py-1.5 !text-xs"
        >
          7 days ago
        </button>
      </div>
    </div>
  );
}
