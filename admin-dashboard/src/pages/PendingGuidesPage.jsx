import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { fetchPendingGuides } from "../services/adminService";
import GuideActionButtons from "../components/GuideActionButtons";
import PageHeader from "../components/PageHeader";

export default function PendingGuidesPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPendingGuides();
      setGuides(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load pending guides");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchPendingGuides();
      setGuides(Array.isArray(data) ? data : []);
      toast.success("Updated pending guides");
    } catch {
      toast.error("Failed to refresh pending guides");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approve / Reject"
        subtitle="Review new guide applications and their documents."
      >
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="admin-btn admin-btn-ghost flex items-center gap-2"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Updating…" : "Refresh"}
          </button>
          <Link to="/guides" className="admin-btn admin-btn-ghost">
            All guides →
          </Link>
        </div>
      </PageHeader>

      {loading ? (
        <p className="py-12 text-center text-[var(--admin-text-muted)]">Loading…</p>
      ) : guides.length === 0 ? (
        <div className="admin-card-muted space-y-2 p-12 text-center">
          <p className="text-[var(--admin-text-muted)]">
            No pending verifications right now.
          </p>
          <Link to="/guides" className="admin-btn admin-btn-primary mx-auto">
            Manage all guides
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {guides.map((g) => (
            <article
              key={g.userId}
              className="admin-card border-2 border-gold/35 p-6 shadow-md"
            >
              <div className="flex gap-4">
                {g.profileImage ? (
                  <img
                    src={g.profileImage}
                    alt=""
                    className="h-16 w-16 rounded-xl object-cover ring-2 ring-gold/40"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand/15 text-lg font-bold text-brand">
                    {g.firstName?.[0]}
                    {g.lastName?.[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">
                    {g.firstName} {g.lastName}
                  </h2>
                  <p className="truncate text-sm text-[var(--admin-text-muted)]">
                    {g.email}
                  </p>
                  <span className="admin-badge admin-badge-gold mt-2">
                    {g.verificationStatus}
                  </span>
                </div>
              </div>
              <GuideActionButtons guide={g} onDone={load} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
