import axios from "axios";
import { ENDPOINTS } from "../config/api";
import { authHeader } from "../utils/tokenUtils";

const admin = (config = {}) =>
  axios({
    ...config,
    headers: { ...authHeader(), ...config.headers },
  });

export const fetchStatistics = () =>
  admin({ url: `${ENDPOINTS.ADMIN}/statistics` }).then((r) => r.data);

export const fetchRevenue = () =>
  admin({ url: `${ENDPOINTS.ADMIN}/revenue` }).then((r) => r.data);

export const fetchBookings = (params = {}) =>
  admin({ url: `${ENDPOINTS.ADMIN}/bookings`, params }).then(
    (r) => r.data?.data || [],
  );

export const fetchPendingGuides = () =>
  admin({ url: `${ENDPOINTS.ADMIN}/guides/pending` }).then((r) => {
    const all = r.data?.data || [];
    return all.filter((g) => g.verificationStatus === "Pending");
  });

export const fetchAllGuides = (page = 1, pageSize = 10) =>
  admin({
    url: `${ENDPOINTS.ADMIN}/guides?pageIndex=${page}&pageSize=${pageSize}`,
  }).then((r) => r.data);

export const fetchGuideDocuments = (guideId) => {
  const url = `${ENDPOINTS.ADMIN}/guides/${guideId}/documents`;
  console.log("Fetching documents from:", url);
  return admin({ url })
    .then((r) => {
      console.log("Documents response:", r.data);
      return r.data?.data || r.data || {};
    })
    .catch((err) => {
      console.error("Error fetching documents:", err);
      throw err;
    });
};

export const approveGuide = (id) =>
  admin({ method: "put", url: `${ENDPOINTS.ADMIN}/guides/${id}/approve` }).then(
    (r) => r.data,
  );

export const rejectGuide = (id, reason) =>
  admin({
    method: "put",
    url: `${ENDPOINTS.ADMIN}/guides/${id}/reject`,
    data: { reason },
  }).then((r) => r.data);

export const activateGuide = (id, reason) =>
  admin({
    method: "patch",
    url: `${ENDPOINTS.ADMIN}/guides/${id}/activate`,
    data: { reason },
  }).then((r) => r.data);

export const suspendGuide = (id, reason) =>
  admin({
    method: "patch",
    url: `${ENDPOINTS.ADMIN}/guides/${id}/suspend`,
    data: { reason },
  }).then((r) => r.data);

export const banGuide = (id, reason) =>
  admin({
    method: "patch",
    url: `${ENDPOINTS.ADMIN}/guides/${id}/ban`,
    data: { reason },
  }).then((r) => r.data);

export const putGuideUnderReview = (id, reason) =>
  admin({
    method: "patch",
    url: `${ENDPOINTS.ADMIN}/guides/${id}/under-review`,
    data: { reason },
  }).then((r) => r.data);

export const forceLogoutGuide = (id, reason) =>
  admin({
    method: "post",
    url: `${ENDPOINTS.ADMIN}/guides/${id}/force-logout`,
    data: { reason },
  }).then((r) => r.data);

export const fetchUsers = () =>
  admin({
    url: `${ENDPOINTS.ADMIN}/users`,
    params: {
      PageIndex: 1,
      PageSize: 100,
    },
  }).then((r) => r.data);

export const activateUser = (id) =>
  admin({ method: "put", url: `${ENDPOINTS.ADMIN}/users/${id}/activate` }).then(
    (r) => r.data,
  );

export const deactivateUser = (id) =>
  admin({
    method: "put",
    url: `${ENDPOINTS.ADMIN}/users/${id}/deactivate`,
  }).then((r) => r.data);

export const deleteUser = (id) =>
  admin({ method: "delete", url: `${ENDPOINTS.ADMIN}/users/${id}` }).then(
    (r) => r.data,
  );

export const fetchTours = (params = {}) =>
  admin({ url: `${ENDPOINTS.ADMIN}/tours`, params }).then(
    (r) => r.data?.data || [],
  );

export const activateTour = (id) =>
  admin({ method: "put", url: `${ENDPOINTS.ADMIN}/tours/${id}/activate` }).then(
    (r) => r.data,
  );

export const deactivateTour = (id) =>
  admin({
    method: "put",
    url: `${ENDPOINTS.ADMIN}/tours/${id}/deactivate`,
  }).then((r) => r.data);

export const deleteTour = (id) =>
  admin({ method: "delete", url: `${ENDPOINTS.ADMIN}/tours/${id}` }).then(
    (r) => r.data,
  );

export const fetchAuditLogs = (take = 100) =>
  admin({ url: `${ENDPOINTS.ADMIN}/audit-logs`, params: { take } }).then(
    (r) => r.data?.data || [],
  );

export const cancelBooking = (bookingId) =>
  admin({
    method: "delete",
    url: `${ENDPOINTS.ADMIN}/bookings/${bookingId}`,
  }).then((r) => r.data);

export const fetchGuideWallet = (guideId) =>
  admin({ url: `${ENDPOINTS.ADMIN}/guides/${guideId}/wallet` }).then(
    (r) => r.data,
  );

export const fetchGuideWalletTransactions = (guideId) =>
  admin({
    url: `${ENDPOINTS.ADMIN}/guides/${guideId}/wallet/transactions`,
  }).then((r) => r.data);

export const addGuideBalance = (guideId, amount, reason) =>
  admin({
    method: "post",
    url: `${ENDPOINTS.ADMIN}/guides/${guideId}/wallet/add-balance`,
    data: { amount, reason },
  }).then((r) => r.data);

export const deductGuideBalance = (guideId, amount, reason) =>
  admin({
    method: "post",
    url: `${ENDPOINTS.ADMIN}/guides/${guideId}/wallet/deduct-balance`,
    data: { amount, reason },
  }).then((r) => r.data);

export const freezeGuideWallet = (guideId, reason) =>
  admin({
    method: "patch",
    url: `${ENDPOINTS.ADMIN}/guides/${guideId}/wallet/freeze`,
    data: { reason },
  }).then((r) => r.data);

export const unfreezeGuideWallet = (guideId, reason) =>
  admin({
    method: "patch",
    url: `${ENDPOINTS.ADMIN}/guides/${guideId}/wallet/unfreeze`,
    data: { reason },
  }).then((r) => r.data);

export const createAdmin = async (adminData) => {
  console.log("=== CREATE ADMIN REQUEST ===");
  console.log("Creating admin with data:", adminData);
  console.log("Request URL:", `${ENDPOINTS.ADMIN}/create-admin`);
  console.log("Headers:", authHeader());

  try {
    const formData = new FormData();

    formData.append("FirstName", adminData.FirstName || "");
    formData.append("LastName", adminData.LastName || "");
    formData.append("UserName", adminData.UserName || "");
    formData.append("Email", adminData.Email || "");
    formData.append("Password", adminData.Password || "");
    formData.append("Country", adminData.Country || "");
    formData.append("WhatsAppNumber", adminData.WhatsAppNumber || "");

    // لو فيه صورة بروفايل
    if (adminData.ProfilePicture instanceof File) {
      formData.append("ProfilePicture", adminData.ProfilePicture);
    }

    console.log("=== FORMDATA CONTENT ===");
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const response = await admin({
      method: "post",
      url: `${ENDPOINTS.ADMIN}/create-admin`,
      data: formData,

      // متحطيش Content-Type بنفسك
      // Axios هيضيف multipart/form-data تلقائياً
      headers: {
        ...authHeader(),
      },
    });

    console.log("=== CREATE ADMIN SUCCESS ===");
    console.log(response.data);

    return response.data;
  } catch (err) {
    console.log("=== REQUEST DETAILS ===");
    console.log("Request data sent:", err.config?.data);
    console.log("Request headers:", err.config?.headers);

    const errorData = err.response?.data;

    console.error("=== API ERROR RESPONSE ===");
    console.error("Status:", err.response?.status);
    console.error("Error data:", errorData);

    if (errorData?.errors) {
      console.error("Validation errors detailed:");

      Object.entries(errorData.errors).forEach(([field, messages]) => {
        console.error(`${field}:`, messages);
      });
    }

    throw err;
  }
};
