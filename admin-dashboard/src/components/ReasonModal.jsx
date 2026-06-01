import { X } from "lucide-react";

export default function ReasonModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  confirmClassName = "admin-btn admin-btn-primary",
  onClose,
  onConfirm,
  reason,
  setReason,
  loading,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="admin-card w-full max-w-md p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="admin-btn admin-btn-ghost !p-2"
          >
            <X size={20} />
          </button>
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Reason (required)"
          className="admin-input resize-none"
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="admin-btn admin-btn-ghost flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`admin-btn flex-1 ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
