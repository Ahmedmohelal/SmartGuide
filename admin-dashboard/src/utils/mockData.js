/**
 * Mock Data for Development
 * بيانات وهمية للتطوير والاختبار
 */

export const mockUsers = [
  {
    id: 1,
    name: "أحمد محمد",
    email: "ahmed@example.com",
    role: "user",
    status: "active",
    joinDate: "2024-01-15",
  },
  {
    id: 2,
    name: "فاطمة علي",
    email: "fatima@example.com",
    role: "guide",
    status: "active",
    joinDate: "2024-02-20",
  },
];

export const mockGuides = [
  {
    id: 1,
    name: "محمود الدليل",
    email: "guide@example.com",
    status: "pending",
    experience: 5,
    rating: 4.5,
    submittedDate: "2024-06-10",
  },
  {
    id: 2,
    name: "دينا السياحة",
    email: "dina@example.com",
    status: "approved",
    experience: 3,
    rating: 4.8,
    submittedDate: "2024-06-01",
  },
];

export const mockBookings = [
  {
    id: 1,
    tourName: "جولة بالقاهرة",
    guestName: "علي محمد",
    bookingDate: "2024-06-20",
    status: "confirmed",
    amount: 500,
  },
  {
    id: 2,
    tourName: "جولة الجيزة",
    guestName: "سارة أحمد",
    bookingDate: "2024-06-21",
    status: "pending",
    amount: 750,
  },
];

export const mockDashboardStats = {
  totalUsers: 1250,
  totalGuides: 85,
  totalBookings: 340,
  totalRevenue: 125000,
  pendingApprovals: 12,
};
