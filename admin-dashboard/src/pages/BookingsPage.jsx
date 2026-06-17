import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import { fetchBookings, cancelBooking } from "../services/adminService";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchBookings();
      const filtered = Array.isArray(data)
        ? data.filter((b) => b.status?.toLowerCase() !== "cancelled")
        : [];
      setBookings(filtered);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCancel = async (id) => {
    try {
      await cancelBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success("Booking cancelled");
    } catch {
      toast.error("Cancel failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        subtitle={`${bookings.length} total reservations`}
      />

      <div className="admin-card admin-table-wrap">
        <table className="admin-table min-w-[900px]">
          <thead>
            <tr>
              <th>Tour</th>
              <th>Tourist</th>
              <th>Guide</th>
              <th>Date</th>
              <th>Status</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="!text-center">
                  Loading…
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="!text-center text-[var(--admin-text-muted)]">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id}>
                  <td className="font-semibold">{b.tourTitle}</td>
                  <td>{b.touristName}</td>
                  <td>{b.guideName}</td>
                  <td>{b.createdAtUtc ? new Date(b.createdAtUtc).toLocaleString() : "—"}</td>
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
