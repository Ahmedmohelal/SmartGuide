import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  TrendingUp,
  TrendingDown,
  Percent,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import DateFilter from "../components/DateFilter";
import {
  TrendChart,
  StatusPieChart,
  RevenueBarChart,
} from "../components/charts/DashboardCharts";
import { fetchRevenue, fetchBookings, fetchStatistics } from "../services/adminService";
import {
  toDateKey,
  buildLastNDaysSeries,
  bookingStatusPie,
  daySummary,
  filterBookingsByDay,
} from "../utils/analytics";
import PageHeader from "../components/PageHeader";

export default function RevenuePage() {
  const [revenue, setRevenue] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [r, s, b] = await Promise.all([
          fetchRevenue().catch(() => null),
          fetchStatistics().catch(() => null),
          fetchBookings().catch(() => []),
        ]);
        setRevenue(r);
        setStatistics(s);
        setBookings(Array.isArray(b) ? b : []);
      } catch {
        toast.error("Failed to load revenue data");
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
    () => buildLastNDaysSeries(bookings, 30, new Date(selectedDate + "T12:00:00")),
    [bookings, selectedDate]
  );

  const statusPie = useMemo(() => bookingStatusPie(dayBookings), [dayBookings]);

  const totalRevenue = Number(statistics?.totalRevenue ?? 0);
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const avgRevenuePerBooking =
    confirmedBookings > 0 ? Math.round(totalRevenue / confirmedBookings) : 0;

  if (loading) {
    return (
      <p className="py-20 text-center text-[var(--admin-text-muted)]">
        Loading revenue analytics…
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Revenue & Analytics"
        subtitle="Comprehensive financial overview and booking analytics."
      />

      <DateFilter value={selectedDate} onChange={setSelectedDate} />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Banknote}
          label="Total Revenue (All Time)"
          value={`${totalRevenue.toLocaleString()} EGP`}
          sub={`${confirmedBookings} confirmed bookings`}
          accent="gold"
        />
        <StatCard
          icon={TrendingUp}
          label={`Day Revenue (${selectedDate})`}
          value={`${summary.revenue.toLocaleString()} EGP`}
          sub="Confirmed only"
          accent="gold"
        />
        <StatCard
          icon={Percent}
          label="Avg Revenue per Booking"
          value={`${avgRevenuePerBooking.toLocaleString()} EGP`}
          sub="All-time average"
          accent="blue"
        />
        <StatCard
          icon={Calendar}
          label={`Bookings on ${selectedDate}`}
          value={summary.total}
          sub={`${summary.confirmed} confirmed`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="admin-card p-6">
          <h3 className="mb-4 text-lg font-bold">Revenue Trend (Last 30 Days)</h3>
          <TrendChart
            data={trend}
            dataKeyLeft="revenue"
            dataKeyRight="bookings"
            tooltipLeft="Revenue (EGP)"
            tooltipRight="Bookings"
            strokeLeft="#c9a227"
            strokeRight="#0d7a68"
          />
        </div>

        {/* Booking Status Distribution */}
        <div className="admin-card p-6">
          <h3 className="mb-4 text-lg font-bold">Bookings by Status</h3>
          <StatusPieChart data={statusPie} />
        </div>
      </div>

      {/* Revenue by Status Table */}
      <div className="admin-card p-6">
        <h3 className="mb-4 text-lg font-bold">Today's Bookings Breakdown</h3>
        {dayBookings && dayBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border)]">
                  <th className="py-3 px-4 text-left font-semibold">Booking ID</th>
                  <th className="py-3 px-4 text-left font-semibold">Guide</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Amount (EGP)</th>
                  <th className="py-3 px-4 text-left font-semibold">Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {dayBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-[var(--admin-border)]">
                    <td className="py-3 px-4 font-mono text-xs">
                      {booking.id?.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4">{booking.guideName || "—"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-green-500/20 text-green-700"
                            : booking.status === "cancelled"
                              ? "bg-red-500/20 text-red-700"
                              : "bg-yellow-500/20 text-yellow-700"
                        }`}
                      >
                        {booking.status || "pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {booking.totalAmount?.toLocaleString() || "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--admin-text-muted)]">
                      {booking.paymentMethod || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-[var(--admin-text-muted)]">
            No bookings on this date
          </p>
        )}
      </div>

      {/* Financial Summary Card */}
      <div className="admin-card p-6">
        <h3 className="mb-4 text-lg font-bold">Financial Summary</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-[var(--admin-hover)] p-4">
            <p className="text-sm text-[var(--admin-text-muted)]">Total Revenue (All Time)</p>
            <p className="mt-2 text-2xl font-bold text-brand">
              {totalRevenue.toLocaleString()} EGP
            </p>
          </div>
          <div className="rounded-lg bg-[var(--admin-hover)] p-4">
            <p className="text-sm text-[var(--admin-text-muted)]">Confirmed Bookings</p>
            <p className="mt-2 text-2xl font-bold text-gold">{confirmedBookings}</p>
          </div>
          <div className="rounded-lg bg-[var(--admin-hover)] p-4">
            <p className="text-sm text-[var(--admin-text-muted)]">Pending Bookings</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {bookings.filter((b) => b.status === "pending").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
