import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as adminService from "../services/adminService";

const AdminDataContext = createContext();

export function AdminDataProvider({ children }) {
  const [data, setData] = useState({
    users: [],
    guides: [],
    tours: [],
    bookings: [],
    statistics: null,
    revenue: null,
    wallets: {}, // { guideId: { balance, isFrozen, transactions: [] } }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update user in local state
  const updateUser = useCallback((userId, updates) => {
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
    }));
  }, []);

  // Update guide in local state
  const updateGuide = useCallback((guideId, updates) => {
    setData((prev) => ({
      ...prev,
      guides: prev.guides.map((g) =>
        g.userId === guideId ? { ...g, ...updates } : g
      ),
    }));
  }, []);

  // Update wallet data
  const updateWallet = useCallback((guideId, updates) => {
    setData((prev) => ({
      ...prev,
      wallets: {
        ...prev.wallets,
        [guideId]: { ...prev.wallets[guideId], ...updates },
      },
    }));
  }, []);

  // Fetch guide wallet
  const fetchWallet = useCallback(async (guideId) => {
    try {
      const wallet = await adminService.fetchGuideWallet(guideId);
      const transactions = await adminService.fetchGuideWalletTransactions(guideId);
      updateWallet(guideId, { ...wallet, transactions });
      return { ...wallet, transactions };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [updateWallet]);

  // Add balance
  const addBalance = useCallback(
    async (guideId, amount, reason) => {
      const result = await adminService.addGuideBalance(guideId, amount, reason);
      await fetchWallet(guideId); // Refetch to get updated transactions
      return result;
    },
    [fetchWallet]
  );

  // Deduct balance
  const deductBalance = useCallback(
    async (guideId, amount, reason) => {
      const result = await adminService.deductGuideBalance(guideId, amount, reason);
      await fetchWallet(guideId);
      return result;
    },
    [fetchWallet]
  );

  // Freeze wallet
  const freezeWallet = useCallback(
    async (guideId, reason) => {
      const result = await adminService.freezeGuideWallet(guideId, reason);
      updateWallet(guideId, { isFrozen: true });
      return result;
    },
    [updateWallet]
  );

  // Unfreeze wallet
  const unfreezeWallet = useCallback(
    async (guideId, reason) => {
      const result = await adminService.unfreezeGuideWallet(guideId, reason);
      updateWallet(guideId, { isFrozen: false });
      return result;
    },
    [updateWallet]
  );

  // Fetch all initial data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [users, guides, tours, bookings, statistics, revenue] = await Promise.all([
        adminService.fetchUsers().catch(() => []),
        adminService.fetchAllGuides().catch(() => []),
        adminService.fetchTours().catch(() => []),
        adminService.fetchBookings().catch(() => []),
        adminService.fetchStatistics().catch(() => null),
        adminService.fetchRevenue().catch(() => null),
      ]);

      setData((prev) => ({
        ...prev,
        users: Array.isArray(users) ? users : [],
        guides: Array.isArray(guides) ? guides : [],
        tours: Array.isArray(tours) ? tours : [],
        bookings: Array.isArray(bookings) ? bookings : [],
        statistics: statistics || null,
        revenue: revenue || null,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AdminDataContext.Provider
      value={{
        data,
        loading,
        error,
        updateUser,
        updateGuide,
        updateWallet,
        fetchWallet,
        addBalance,
        deductBalance,
        freezeWallet,
        unfreezeWallet,
        fetchAllData,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }
  return context;
}
