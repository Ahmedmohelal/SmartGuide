import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  Map,
  CalendarDays,
  Banknote,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import DateFilter from "../components/DateFilter";
import {
  TrendChart,
  StatusPieChart,
  RevenueBarChart,
} from "../components/charts/DashboardCharts";
import {
  fetchStatistics,
  fetchBookings,
} from "../services/adminService";
import {
  toDateKey,
  buildLastNDaysSeries,
  bookingStatusPie,
  paymentMethodPie,
  daySummary,
  filterBookingsByDay,
} from "../utils/analytics";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [s, b] = await Promise.all([
          fetchStatistics(),
          fetchBookings(),
        ]);
        setStats(s);
        setBookings(Array.isArray(b) ? b : []);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dayBookings = useMemo(
    () => filterBookingsByDay(bookings, selectedDate),
    [bookings, selectedDate]
  );

  const summary = useMemo(
    () => daySummary(bookings, selectedDate),
    [bookings, selectedDate]
  );

  const trend = useMemo(
    () => buildLastNDaysSeries(bookings, 14, new Date(selectedDate + "T12:00:00")),
    [bookings, selectedDate]
  );

  const statusPie = useMemo(() => bookingStatusPie(dayBookings), [dayBookings]);
  const payPie = useMemo(() => paymentMethodPie(dayBookings), [dayBookings]);

  if (loading) {
    return (
      <p className="py-20 text-center text-[var(--admin-text-muted)]">
        Loading dashboard…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-[var(--admin-text-muted)]">
          Platform overview — pick a date to drill into daily numbers
        </p>
      </div>

      <DateFilter value={selectedDate} onChange={setSelectedDate} />

      {(stats?.pendingVerifications ?? 0) > 0 ? (
        <Link
          to="/guides/pending"
          className="admin-card block border-2 border-gold/40 bg-gradient-to-r from-gold/15 to-brand/10 p-5 transition hover:shadow-lg"
        >
          <p className="font-bold text-brand">
            {stats.pendingVerifications} guide(s) waiting for approval
          </p>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Click here → Approve / Reject with documents
          </p>
        </Link>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total users"
          value={stats?.totalUsers ?? "—"}
          sub={`${stats?.totalTourists ?? 0} tourists · ${stats?.totalTourGuides ?? 0} guides`}
        />
        <StatCard
          icon={UserCheck}
          label="Pending verifications"
          value={stats?.pendingVerifications ?? "—"}
          accent="gold"
        />
        <StatCard
          icon={Map}
          label="Tours"
          value={stats?.totalTours ?? "—"}
          sub={`${stats?.activeTours ?? 0} active`}
          accent="blue"
        />
        <StatCard
          icon={Banknote}
          label="Total revenue (all time)"
          value={`${Number(stats?.totalRevenue ?? 0).toLocaleString()} EGP`}
          sub="Confirmed bookings"
          accent="gold"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label={`Bookings on ${selectedDate}`}
          value={summary.total}
          sub={`${summary.confirmed} confirmed · ${summary.pending} pending`}
        />
        <StatCard
          icon={TrendingUp}
          label="Day revenue"
          value={`${summary.revenue.toLocaleString()} EGP`}
          sub="Confirmed only"
          accent="gold"
        />
        <StatCard
          icon={CalendarDays}
          label="All bookings"
          value={stats?.totalBookings ?? "—"}
          sub={`${stats?.pendingBookings ?? 0} pending platform-wide`}
        />
        <StatCard
          icon={Banknote}
          label="Online vs cash"
          value={`${Number(stats?.onlineRevenue ?? 0).toLocaleString()}`}
          sub={`Cash: ${Number(stats?.cashRevenue ?? 0).toLocaleString()} EGP`}
          accent="blue"
        />
      </div>

      <TrendChart data={trend} />

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusPieChart
          data={statusPie}
          title={`Booking status — ${selectedDate}`}
        />
        <RevenueBarChart data={payPie} />
      </div>
    </div>
  );
}
