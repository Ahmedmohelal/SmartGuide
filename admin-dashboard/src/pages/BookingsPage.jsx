import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DateFilter from "../components/DateFilter";
import PageHeader from "../components/PageHeader";
import { fetchBookings, cancelBooking } from "../services/adminService";
import { toDateKey, filterBookingsByDay } from "../utils/analytics";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => filterBookingsByDay(bookings, selectedDate),
    [bookings, selectedDate]
  );

  const onCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled");
      load();
    } catch {
      toast.error("Cancel failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        subtitle="Filter by date and manage reservations."
      />

      <DateFilter value={selectedDate} onChange={setSelectedDate} />

      <div className="admin-card admin-table-wrap">
        <table className="admin-table min-w-[900px]">
          <thead>
            <tr>
              <th>Tour</th>
              <th>Tourist</th>
              <th>Guide</th>
              <th>Status</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="!text-center">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="!text-center text-[var(--admin-text-muted)]">
                  No bookings on {selectedDate}
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id}>
                  <td className="font-semibold">{b.tourTitle}</td>
                  <td>{b.touristName}</td>
                  <td>{b.guideName}</td>
                  <td>
                    <span className="admin-badge admin-badge-gold">{b.status}</span>
                  </td>
                  <td>{b.totalPrice} EGP</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onCancel(b.id)}
                      className="admin-btn admin-btn-danger"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
