import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { fetchAllGuides } from "../services/adminService";
import GuideActionButtons from "../components/GuideActionButtons";
import PageHeader from "../components/PageHeader";

export default function GuidesPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);

  const load = async () => {
    setLoading(true);

    try {
      const result = await fetchAllGuides(page, pageSize);

      setGuides(result.data || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load guides");
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const totalPages = Math.ceil(totalCount / pageSize);

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

      {/* Loading */}
      {loading ? (
        <p className="py-12 text-center text-[var(--admin-text-muted)]">
          Loading…
        </p>
      ) : guides.length === 0 ? (
        <div className="admin-card-muted p-12 text-center text-[var(--admin-text-muted)]">
          No guides found.
        </div>
      ) : (
        <>
          {/* Guides List */}
          <div className="space-y-4">
            {guides.map((g) => (
              <article key={g.userId} className="admin-card p-5">
                <div className="flex flex-wrap items-start gap-4">
                  {g.profileImage ? (
                    <img
                      src={g.profileImage}
                      alt={`${g.firstName} ${g.lastName}`}
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

                    <p className="text-sm text-[var(--admin-text-muted)]">
                      {g.email}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="admin-badge admin-badge-brand">
                        {g.verificationStatus}
                      </span>

                      <span className="admin-badge admin-badge-gold">
                        {g.guideAccountStatus}
                      </span>

                      {g.country && (
                        <span className="text-xs text-[var(--admin-text-muted)]">
                          {g.country}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <GuideActionButtons
                  guide={g}
                  onDone={load}
                />
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="admin-btn admin-btn-ghost disabled:opacity-50"
              >
                Previous
              </button>

              <span className="text-sm text-[var(--admin-text-muted)]">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="admin-btn admin-btn-ghost disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}