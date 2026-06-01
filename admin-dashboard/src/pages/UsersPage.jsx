import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { fetchUsers } from "../services/adminService";
import PageHeader from "../components/PageHeader";
import UserActionButtons from "../components/UserActionButtons";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="All registered accounts on the platform.">
        <Link to="/create-admin" className="admin-btn admin-btn-primary flex items-center gap-2">
          <UserPlus size={18} />
          Create Admin
        </Link>
      </PageHeader>

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
                <td colSpan={5} className="text-center! text-(--admin-text-muted)">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center! text-(--admin-text-muted)">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="font-semibold">
                    {u.firstName} {u.lastName}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="admin-badge admin-badge-brand">{u.role}</span>
                  </td>
                  <td>{u.isActive ? "Yes" : "No"}</td>
                  <td>
                    <UserActionButtons user={u} onDone={() => {
                      (async () => {
                        try {
                          const data = await fetchUsers();
                          setUsers(Array.isArray(data) ? data : []);
                        } catch {
                          toast.error("Failed to refresh users");
                        }
                      })();
                    }} />
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
