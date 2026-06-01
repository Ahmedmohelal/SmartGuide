import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchPendingGuides } from "../services/adminService";
import GuideActionButtons from "../components/GuideActionButtons";
import PageHeader from "../components/PageHeader";

export default function PendingGuidesPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPendingGuides();
      setGuides(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load pending guides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approve / Reject"
        subtitle="Review new guide applications and their documents."
      >
        <Link to="/guides" className="admin-btn admin-btn-ghost">
          All guides →
        </Link>
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
