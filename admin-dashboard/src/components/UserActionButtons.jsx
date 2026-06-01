import { useState } from "react";
import { CheckCircle2, Slash, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { activateUser, deactivateUser, deleteUser } from "../services/adminService";

export default function UserActionButtons({ user, onDone }) {
  const [busy, setBusy] = useState(false);

  const perform = async (fn, fallbackMessage) => {
    setBusy(true);
    try {
      const result = await fn();
      if (result && (result.isSuccess === false || result.IsSuccess === false)) {
        throw new Error(result?.message || result?.Message || fallbackMessage || "Action failed");
      }
      toast.success(result?.message || result?.Message || fallbackMessage);
      onDone?.();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {user.isActive ? (
        <button
          type="button"
          disabled={busy}
          className="admin-btn admin-btn-warning"
          onClick={() => perform(() => deactivateUser(user.id), "User deactivated")}
        >
          <Slash size={14} /> Deactivate
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          className="admin-btn admin-btn-primary"
          onClick={() => perform(() => activateUser(user.id), "User activated")}
        >
          <CheckCircle2 size={14} /> Activate
        </button>
      )}

      <button
        type="button"
        disabled={busy}
        className="admin-btn admin-btn-danger"
        onClick={() => {
          if (!window.confirm("Delete this user permanently?")) return;
          perform(() => deleteUser(user.id), "User deleted");
        }}
      >
        <Trash2 size={14} /> Delete
      </button>
    </div>
  );
}
