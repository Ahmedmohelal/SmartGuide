import { useState } from "react";
import {
  Check,
  X,
  Eye,
  Shield,
  ShieldOff,
  Ban,
  Search,
  LogOut,
  Loader2,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import ReasonModal from "./ReasonModal";
import WalletModal from "./WalletModal";
import {
  approveGuide,
  rejectGuide,
  activateGuide,
  suspendGuide,
  banGuide,
  putGuideUnderReview,
  forceLogoutGuide,
  fetchGuideDocuments,
} from "../services/adminService";

const isPendingVerification = (g) => {
  const v = (g.verificationStatus || "").toLowerCase();
  return v === "pending" || v === "notverified";
};

export default function GuideActionButtons({ guide, onDone }) {
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState("");
  const [docs, setDocs] = useState(null);
  const [walletOpen, setWalletOpen] = useState(false);

  const id = guide.userId;
  const pending = isPendingVerification(guide);
  const isBanned = (guide.guideAccountStatus || "").toLowerCase() === "banned";
  const actionButton = isBanned
    ? {
        type: "unban",
        title: "Unban guide",
        label: "Unban",
        icon: <Shield size={14} />,
        className: "admin-btn admin-btn-primary",
      }
    : {
        type: "activate",
        title: "Activate guide",
        label: "Activate",
        icon: <Shield size={14} />,
        className: "admin-btn admin-btn-primary",
      };

  const run = async (fn, successMsg) => {
    setBusy(true);
    try {
      await fn();
      toast.success(successMsg);
      setModal(null);
      setReason("");
      onDone?.();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const openReasonModal = (type, title, confirmLabel, confirmClass) => {
    setReason("");
    setModal({ type, title, confirmLabel, confirmClass });
  };

  const confirmModal = async () => {
    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }

    const r = reason.trim();

    switch (modal.type) {
      case "reject":
        await run(() => rejectGuide(id, r), "Guide rejected");
        break;
      case "unban":
      case "activate":
        await run(() => activateGuide(id, r), "Guide activated");
        break;
      case "suspend":
        await run(() => suspendGuide(id, r), "Guide suspended");
        break;
      case "ban":
        await run(() => banGuide(id, r), "Guide banned");
        break;
      case "review":
        await run(() => putGuideUnderReview(id, r), "Marked under review");
        break;
      case "logout":
        await run(() => forceLogoutGuide(id, r), "Force logout sent");
        break;
      default:
        break;
    }
  };

  const viewDocs = async () => {
    setBusy(true);
    try {
      setDocs(await fetchGuideDocuments(id));
    } catch {
      toast.error("Could not load documents");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-actions-bar">
        <p className="admin-actions-label">Actions</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={viewDocs}
            className="admin-btn admin-btn-ghost"
          >
            {busy ? <Loader2 className="animate-spin" size={14} /> : <Eye size={14} />}
            Documents
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => setWalletOpen(true)}
            className="admin-btn admin-btn-gold"
          >
            <Wallet size={14} /> Wallet
          </button>

          {pending ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(() => approveGuide(id), "Guide approved")}
                className="admin-btn admin-btn-primary"
              >
                <Check size={14} /> Approve
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  openReasonModal("reject", "Reject guide", "Reject", "admin-btn-danger")
                }
                className="admin-btn admin-btn-danger"
              >
                <X size={14} /> Reject
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  openReasonModal(
                    actionButton.type,
                    actionButton.title,
                    actionButton.label,
                    actionButton.className
                  )
                }
                className={actionButton.className}
              >
                {actionButton.icon} {actionButton.label}
              </button>

              {!isBanned ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    openReasonModal("suspend", "Suspend guide", "Suspend", "admin-btn-warning")
                  }
                  className="admin-btn admin-btn-warning"
                >
                  <ShieldOff size={14} /> Suspend
                </button>
              ) : null}

              {!isBanned ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    openReasonModal("ban", "Ban guide", "Ban", "admin-btn-danger")
                  }
                  className="admin-btn admin-btn-danger"
                >
                  <Ban size={14} /> Ban
                </button>
              ) : null}

              {!isBanned ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    openReasonModal("review", "Under review", "Confirm", "admin-btn-dark")
                  }
                  className="admin-btn admin-btn-dark"
                >
                  <Search size={14} /> Review
                </button>
              ) : null}

              {!isBanned ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    openReasonModal("logout", "Force logout", "Logout", "admin-btn-dark")
                  }
                  className="admin-btn admin-btn-ghost"
                >
                  <LogOut size={14} /> Logout
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      <ReasonModal
        open={!!modal}
        title={modal?.title}
        confirmLabel={modal?.confirmLabel}
        confirmClassName={modal?.confirmClass || "admin-btn-primary"}
        reason={reason}
        setReason={setReason}
        loading={busy}
        onClose={() => {
          setModal(null);
          setReason("");
        }}
        onConfirm={confirmModal}
      />

      {docs ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/65 p-4">
          <div className="admin-card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Verification documents</h3>
              <button
                type="button"
                onClick={() => setDocs(null)}
                className="admin-btn admin-btn-ghost p-2!"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {docs.nationalIdImage ? (
                <div className="rounded-xl border border-(--admin-border) p-2">
                  <p className="mb-2 text-sm font-semibold">National ID</p>
                  <img
                    src={docs.nationalIdImage}
                    alt="ID"
                    className="max-h-72 w-full rounded-lg object-contain"
                  />
                </div>
              ) : null}
              {docs.guideLicenseImage ? (
                <div className="rounded-xl border border-(--admin-border) p-2">
                  <p className="mb-2 text-sm font-semibold">License</p>
                  <img
                    src={docs.guideLicenseImage}
                    alt="License"
                    className="max-h-72 w-full rounded-lg object-contain"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <WalletModal open={walletOpen} guide={guide} onClose={() => setWalletOpen(false)} />
    </>
  );
}
