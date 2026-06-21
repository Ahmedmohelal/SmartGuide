import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { fetchUsers } from "../services/adminService";
import PageHeader from "../components/PageHeader";
import UserActionButtons from "../components/UserActionButtons";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchUsers();

        

        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? [...users] : [];
    let result = list;
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      result = result.filter(
        (u) =>
          (`${u.firstName || ""} ${u.lastName || ""}`.toLowerCase().includes(s) ||
            (u.email || "").toLowerCase().includes(s)),
      );
    }
    if (roleFilter) result = result.filter((u) => (u.role || "").toString().toLowerCase() === roleFilter);
    if (activeFilter)
      result = result.filter((u) => (activeFilter === "active" ? u.isActive : !u.isActive));

    return result;
  }, [users, search, roleFilter, activeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="All registered accounts on the platform."
      >
        <Link
          to="/create-admin"
          className="admin-btn admin-btn-primary flex items-center gap-2"
        >
          <UserPlus size={18} />
          Create Admin
        </Link>
      </PageHeader>

      <div className="admin-card space-y-4 p-3">
        <h3 className="font-semibold">Filters</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
          <div>
            <label className="admin-label">Search</label>
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="admin-input"
            >
              <option value="">All</option>
              {Array.from(new Set(users.map((u) => (u.role || "").toString().toLowerCase()).filter(Boolean))).map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="admin-label">Active</label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="admin-input"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table min-w-220">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center! text-(--admin-text-muted)"
                >
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center! text-(--admin-text-muted)"
                >
                  No users found.
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center! text-(--admin-text-muted)"
                >
                  No users match the filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td className="font-semibold">
                    {u.firstName} {u.lastName}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="admin-badge admin-badge-brand">
                      {(u.role || "").toString().charAt(0).toUpperCase() + (u.role || "").toString().slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td>{u.isActive ? "Yes" : "No"}</td>
                  <td>
                    <UserActionButtons
                      user={u}
                      onDone={async () => {
                        try {
                          const response = await fetchUsers();
                          setUsers(
                            Array.isArray(response.data) ? response.data : [],
                          );
                        } catch {
                          toast.error("Failed to refresh users");
                        }
                      }}
                    />
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
