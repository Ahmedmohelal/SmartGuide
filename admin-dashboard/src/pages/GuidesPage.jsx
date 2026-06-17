import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllGuides } from "../services/adminService";
import GuideActionButtons from "../components/GuideActionButtons";
import PageHeader from "../components/PageHeader";
import toast from "react-hot-toast";

export default function GuidesPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllGuides();
      setGuides(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load guides");
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
        title="Manage guides"
        subtitle="Approve, reject, suspend, ban, and review documents."
      >
        <Link to="/guides/pending" className="admin-btn admin-btn-gold">
          Pending verifications →
        </Link>
      </PageHeader>

      {loading ? (
        <p className="py-12 text-center text-[var(--admin-text-muted)]">Loading…</p>
      ) : guides.length === 0 ? (
        <div className="admin-card-muted p-12 text-center text-[var(--admin-text-muted)]">
          No guides found.
        </div>
      ) : (
        <div className="space-y-4">
          
          {guides.map((g) => (
            <article key={g.userId} className="admin-card p-5">
              
              <div className="flex flex-wrap items-start gap-4">
                {g.profileImage ? (
                  <img
                    src={g.profileImage}
                    alt=""
                    className="h-14 w-14 rounded-xl object-cover ring-2 ring-[var(--admin-border)]"
                    
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand/15 text-lg font-bold text-brand">
                    {g.firstName?.[0]}
                    {g.lastName?.[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold">
                    {g.firstName} {g.lastName}
                  </h2>
                  <p className="text-sm text-[var(--admin-text-muted)]">{g.email}</p>
                  <p className="mt-2 flex flex-wrap gap-2">
                    <span className="admin-badge admin-badge-brand">
                      {g.verificationStatus}
                    </span>
                    <span className="admin-badge admin-badge-gold">
                      {g.guideAccountStatus}
                    </span>
                    {g.country ? (
                      <span className="text-xs text-[var(--admin-text-muted)]">
                        {g.country}
                      </span>
                    ) : null}
                  </p>
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
