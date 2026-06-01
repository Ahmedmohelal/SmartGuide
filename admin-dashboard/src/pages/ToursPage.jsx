import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import {
  fetchTours,
  activateTour,
  deactivateTour,
  deleteTour,
} from "../services/adminService";

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchTours();
      setTours(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load tours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (id, active) => {
    try {
      if (active) await deactivateTour(id);
      else await activateTour(id);
      toast.success(active ? "Tour deactivated" : "Tour activated");
      load();
    } catch {
      toast.error("Action failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this tour permanently?")) return;
    try {
      setDeletingId(id);
      await deleteTour(id);
      // remove from local state immediately (no backend changes required)
      setTours((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tour deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Tours" subtitle="Activate, deactivate, or remove tours." />

      <div className="admin-card admin-table-wrap">
        <table className="admin-table min-w-[800px]">
          <thead>
            <tr>
              <th>Title</th>
              <th>Guide</th>
              <th>Price</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="!text-center">
                  Loading…
                </td>
              </tr>
            ) : tours.length === 0 ? (
              <tr>
                <td colSpan={5} className="!text-center text-[var(--admin-text-muted)]">
                  No tours found.
                </td>
              </tr>
            ) : (
              tours.map((t) => (
                <tr key={t.id}>
                  <td className="font-semibold">{t.title}</td>
                  <td>{t.guideName || t.guideId}</td>
                  <td>{t.price} EGP</td>
                  <td>
                    <span
                      className={`admin-badge ${t.isActive ? "admin-badge-brand" : "admin-badge-gold"}`}
                    >
                      {t.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggle(t.id, t.isActive)}
                        disabled={deletingId === t.id}
                        className="admin-btn admin-btn-ghost"
                      >
                        {t.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(t.id)}
                        disabled={deletingId === t.id}
                        className="admin-btn admin-btn-danger"
                      >
                        {deletingId === t.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
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
