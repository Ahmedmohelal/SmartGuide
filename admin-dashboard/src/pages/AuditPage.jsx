import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import { fetchAuditLogs } from "../services/adminService";

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAuditLogs(150);
        setLogs(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit logs" subtitle="Recent admin actions on the platform." />

      <div className="admin-card admin-table-wrap">
        <table className="admin-table min-w-[800px]">
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>Admin</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="!text-center">
                  Loading…
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="!text-center text-[var(--admin-text-muted)]">
                  No logs yet.
                </td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr key={log.id || i}>
                  <td className="font-semibold">
                    {log.actionType || log.action}
                  </td>
                  <td>
                    {log.entityType}
                    {log.entityId ? ` · ${String(log.entityId).slice(0, 8)}…` : ""}
                  </td>
                  <td className="text-[var(--admin-text-muted)]">
                    {String(log.adminId || "").slice(0, 12)}…
                  </td>
                  <td className="text-[var(--admin-text-muted)]">
                    {log.createdAtUtc
                      ? new Date(log.createdAtUtc).toLocaleString()
                      : "—"}
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
