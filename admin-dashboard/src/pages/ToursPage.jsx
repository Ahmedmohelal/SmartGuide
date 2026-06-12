import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import {
  fetchTours,
  activateTour,
  deactivateTour,
  deleteTour,
} from "../services/adminService";

const PAGE_SIZE = 10;

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  // Filter states
  const [search, setSearch] = useState("");
  const [guideId, setGuideId] = useState("");
  const [isActive, setIsActive] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageIndex,
        pageSize: PAGE_SIZE,
      };
      
      if (search.trim()) params.search = search.trim();
      if (guideId.trim()) params.guideId = guideId.trim();
      if (isActive !== "") params.isActive = isActive === "true";
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);
      
      const response = await fetchTours(params);
      
      // Handle both array and pagination response
      if (Array.isArray(response)) {
        setTours(response);
        setTotalCount(response.length);
      } else if (response?.data) {
        setTours(response.data);
        setTotalCount(response.count || response.data.length);
      }
    } catch {
      toast.error("Failed to load tours");
      setTours([]);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, search, guideId, isActive, minPrice, maxPrice]);

  useEffect(() => {
    load();
  }, [load]);

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
      setTours((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tour deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleFilterChange = () => {
    setPageIndex(1); // Reset to first page when filters change
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Tours" subtitle="Activate, deactivate, or remove tours." />

      {/* Filters */}
      <div className="admin-card space-y-4">
        <h3 className="font-semibold">Filters</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <div>
            <label className="admin-label">Search</label>
            <input
              type="text"
              placeholder="Tour title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange();
              }}
              className="admin-input"
            />
          </div>

          {/* Guide ID */}
          <div>
            <label className="admin-label">Guide ID</label>
            <input
              type="text"
              placeholder="Filter by guide..."
              value={guideId}
              onChange={(e) => {
                setGuideId(e.target.value);
                handleFilterChange();
              }}
              className="admin-input"
            />
          </div>

          {/* Status */}
          <div>
            <label className="admin-label">Status</label>
            <select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value);
                handleFilterChange();
              }}
              className="admin-input"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="admin-label">Min Price</label>
            <input
              type="number"
              placeholder="Min price..."
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                handleFilterChange();
              }}
              className="admin-input"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="admin-label">Max Price</label>
            <input
              type="number"
              placeholder="Max price..."
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                handleFilterChange();
              }}
              className="admin-input"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card admin-table-wrap">
        <table className="admin-table min-w-[1100px]">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Guide</th>
              <th>Price</th>
              <th>Duration (hrs)</th>
              <th>Max Group</th>
              <th>Bookings</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="!text-center">
                  Loading…
                </td>
              </tr>
            ) : tours.length === 0 ? (
              <tr>
                <td colSpan={9} className="!text-center text-[var(--admin-text-muted)]">
                  No tours found.
                </td>
              </tr>
            ) : (
              tours.map((t) => (
                console.log("Tour:", t) || true &&
                <tr key={t.id}>
                  <td>
                    {t.primaryImage ? (
                      <img
                        src={t.primaryImage}
                        alt={t.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-300 text-sm text-gray-600">
                        —
                      </div>
                    )}
                  </td>
                  <td className="font-semibold">{t.title}</td>
                  <td>{t.guideName || t.guideId}</td>
                  <td>{t.price} EGP</td>
                  <td>{t.durationHours || "-"}</td>
                  <td>{t.maxGroupSize || "-"}</td>
                  <td className="text-center">{t.totalBookings || 0}</td>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-card flex items-center justify-between">
          <p className="text-sm text-[var(--admin-text-muted)]">
            Page {pageIndex} of {totalPages} ({totalCount} tours)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPageIndex(Math.max(1, pageIndex - 1))}
              disabled={pageIndex === 1}
              className="admin-btn admin-btn-ghost disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPageIndex(Math.min(totalPages, pageIndex + 1))}
              disabled={pageIndex === totalPages}
              className="admin-btn admin-btn-ghost disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
