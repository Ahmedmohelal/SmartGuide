import { useState, useEffect } from "react";
import { X, Plus, Minus, Snowflake, Flame, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminData } from "../context/AdminDataContext";

export default function WalletModal({ open, guide, onClose }) {
  const [tab, setTab] = useState("balance");
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const { fetchWallet, addBalance, deductBalance, freezeWallet, unfreezeWallet } =
    useAdminData();

  const guideId = guide?.userId;

  // Load wallet on open
  useEffect(() => {
    if (open && guideId && !wallet) {
      (async () => {
        setLoading(true);
        try {
          const data = await fetchWallet(guideId);
          setWallet(data);
        } catch (err) {
          toast.error("Failed to load wallet");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [open, guideId, wallet, fetchWallet]);

  if (!open) return null;

  const validateAmount = (val) => {
    if (!val || isNaN(val)) return "Amount is required";
    const num = parseFloat(val);
    if (num < 0) return "Amount cannot be negative";
    if (!/^\d+(\.\d{1,2})?$/.test(val)) return "Max 2 decimal places allowed";
    return null;
  };

  const handleAddBalance = async () => {
    const amountErr = validateAmount(amount);
    if (amountErr) {
      toast.error(amountErr);
      return;
    }
    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }

    setBusy(true);
    try {
      await addBalance(guideId, parseFloat(amount), reason.trim());
      const updated = await fetchWallet(guideId);
      setWallet(updated);
      toast.success("Balance added successfully");
      setModal(null);
      setAmount("");
      setReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add balance");
    } finally {
      setBusy(false);
    }
  };

  const handleDeductBalance = async () => {
    const amountErr = validateAmount(amount);
    if (amountErr) {
      toast.error(amountErr);
      return;
    }
    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }

    setBusy(true);
    try {
      await deductBalance(guideId, parseFloat(amount), reason.trim());
      const updated = await fetchWallet(guideId);
      setWallet(updated);
      toast.success("Balance deducted successfully");
      setModal(null);
      setAmount("");
      setReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to deduct balance");
    } finally {
      setBusy(false);
    }
  };

  const handleFreeze = async () => {
    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }

    setBusy(true);
    try {
      await freezeWallet(guideId, reason.trim());
      const updated = await fetchWallet(guideId);
      setWallet(updated);
      toast.success("Wallet frozen successfully");
      setModal(null);
      setReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to freeze wallet");
    } finally {
      setBusy(false);
    }
  };

  const handleUnfreeze = async () => {
    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }

    setBusy(true);
    try {
      await unfreezeWallet(guideId, reason.trim());
      const updated = await fetchWallet(guideId);
      setWallet(updated);
      toast.success("Wallet unfrozen successfully");
      setModal(null);
      setReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unfreeze wallet");
    } finally {
      setBusy(false);
    }
  };

  const amountError = amount ? validateAmount(amount) : null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
        <div className="admin-card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                {guide?.firstName} {guide?.lastName}
              </h2>
              <p className="mt-1 text-sm text-[var(--admin-text-muted)]">Wallet Management</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="admin-btn admin-btn-ghost !p-2"
            >
              <X size={24} />
            </button>
          </div>

          {loading ? (
            <p className="py-12 text-center text-[var(--admin-text-muted)]">Loading wallet…</p>
          ) : wallet ? (
            <>
              {/* Tabs */}
              <div className="mb-6 flex gap-2 border-b border-[var(--admin-border)]">
                <button
                  type="button"
                  onClick={() => setTab("balance")}
                  className={`pb-3 px-4 font-semibold border-b-2 transition ${
                    tab === "balance"
                      ? "border-brand text-brand"
                      : "border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                  }`}
                >
                  Balance Overview
                </button>
                <button
                  type="button"
                  onClick={() => setTab("transactions")}
                  className={`pb-3 px-4 font-semibold border-b-2 transition ${
                    tab === "transactions"
                      ? "border-brand text-brand"
                      : "border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                  }`}
                >
                  Transaction History
                </button>
              </div>

              {/* Balance Tab */}
              {tab === "balance" && (
                <div className="space-y-6">
                  {/* Balance Card */}
                  <div className="admin-card-muted rounded-lg border-2 border-dashed border-[var(--admin-border)] p-6">
                    <p className="text-sm font-semibold text-[var(--admin-text-muted)]">
                      Current Balance
                    </p>
                    <p className="mt-3 text-4xl font-bold text-brand">
                      {wallet?.balance?.toLocaleString("en-EG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      EGP
                    </p>
                    <div className="mt-4 flex gap-2">
                      {wallet?.isFrozen && (
                        <span className="admin-badge" style={{ background: "#e11d48" }}>
                          <Snowflake size={14} className="inline mr-1" />
                          Wallet Frozen
                        </span>
                      )}
                      <span className="admin-badge admin-badge-brand">
                        {guide?.guideAccountStatus || "Active"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={wallet?.isFrozen || busy}
                      onClick={() => {
                        setModal("add");
                        setAmount("");
                        setReason("");
                      }}
                      className="admin-btn admin-btn-primary flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Add Balance
                    </button>
                    <button
                      type="button"
                      disabled={wallet?.isFrozen || busy}
                      onClick={() => {
                        setModal("deduct");
                        setAmount("");
                        setReason("");
                      }}
                      className="admin-btn admin-btn-warning flex items-center justify-center gap-2"
                    >
                      <Minus size={18} />
                      Deduct Balance
                    </button>
                    {!wallet?.isFrozen ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setModal("freeze");
                          setReason("");
                        }}
                        className="admin-btn admin-btn-danger flex items-center justify-center gap-2"
                      >
                        <Snowflake size={18} />
                        Freeze Wallet
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setModal("unfreeze");
                          setReason("");
                        }}
                        className="admin-btn admin-btn-primary flex items-center justify-center gap-2"
                      >
                        <Flame size={18} />
                        Unfreeze Wallet
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Transactions Tab */}
              {tab === "transactions" && (
                <div>
                  {wallet?.transactions && wallet.transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--admin-border)]">
                            <th className="py-3 px-4 text-left font-semibold">Date</th>
                            <th className="py-3 px-4 text-left font-semibold">Type</th>
                            <th className="py-3 px-4 text-right font-semibold">Amount</th>
                            <th className="py-3 px-4 text-left font-semibold">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wallet.transactions.map((tx, idx) => (
                            <tr key={idx} className="border-b border-[var(--admin-border)]">
                              <td className="py-3 px-4">
                                {new Date(tx.date || tx.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className="inline-block px-2 py-1 rounded text-xs font-semibold"
                                  style={{
                                    background:
                                      tx.type === "credit" || tx.amount >= 0
                                        ? "#10b98120"
                                        : "#ef444420",
                                    color:
                                      tx.type === "credit" || tx.amount >= 0
                                        ? "#059669"
                                        : "#dc2626",
                                  }}
                                >
                                  {tx.type || (tx.amount >= 0 ? "Credit" : "Debit")}
                                </span>
                              </td>
                              <td
                                className="py-3 px-4 text-right font-semibold"
                                style={{
                                  color:
                                    tx.type === "credit" || tx.amount >= 0
                                      ? "#059669"
                                      : "#dc2626",
                                }}
                              >
                                {tx.type === "credit" || tx.amount >= 0 ? "+" : ""}
                                {tx.amount?.toLocaleString("en-EG", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="py-3 px-4 text-xs text-[var(--admin-text-muted)]">
                                {tx.reason || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="py-8 text-center text-[var(--admin-text-muted)]">
                      No transactions yet
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="py-12 text-center text-[var(--admin-text-muted)]">
              Failed to load wallet data
            </p>
          )}
        </div>
      </div>

      {/* Add/Deduct/Freeze Modal */}
      {modal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
          <div className="admin-card w-full max-w-md p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold">
              {modal === "add"
                ? "Add Balance"
                : modal === "deduct"
                  ? "Deduct Balance"
                  : modal === "freeze"
                    ? "Freeze Wallet"
                    : "Unfreeze Wallet"}
            </h3>

            {(modal === "add" || modal === "deduct") && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">
                    Amount (EGP)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="admin-input"
                  />
                  {amountError && <p className="mt-1 text-xs text-red-500">{amountError}</p>}
                </div>
              </>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (required)"
                rows={3}
                className="admin-input resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="admin-btn admin-btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={
                  modal === "add"
                    ? handleAddBalance
                    : modal === "deduct"
                      ? handleDeductBalance
                      : modal === "freeze"
                        ? handleFreeze
                        : handleUnfreeze
                }
                className={`admin-btn flex-1 ${
                  modal === "add"
                    ? "admin-btn-primary"
                    : modal === "deduct" || modal === "freeze"
                      ? "admin-btn-danger"
                      : "admin-btn-primary"
                }`}
              >
                {busy ? (
                  <>
                    <Loader2 className="inline animate-spin mr-2" size={16} />
                    Processing…
                  </>
                ) : modal === "add" ? (
                  "Add"
                ) : modal === "deduct" ? (
                  "Deduct"
                ) : modal === "freeze" ? (
                  "Freeze"
                ) : (
                  "Unfreeze"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
