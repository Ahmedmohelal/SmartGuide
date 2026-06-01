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
  admin({ url: `${ENDPOINTS.ADMIN}/bookings`, params }).then((r) => r.data);

export const fetchPendingGuides = () =>
  admin({ url: `${ENDPOINTS.ADMIN}/guides/pending` }).then((r) => r.data);

export const fetchAllGuides = () =>
  admin({ url: `${ENDPOINTS.ADMIN}/guides` }).then((r) => r.data);

export const fetchGuideDocuments = (guideId) =>
  admin({ url: `${ENDPOINTS.ADMIN}/guides/${guideId}/documents` }).then(
    (r) => r.data
  );

export const approveGuide = (id) =>
  admin({ method: "put", url: `${ENDPOINTS.ADMIN}/guides/${id}/approve` }).then(
    (r) => r.data
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
  admin({ url: `${ENDPOINTS.ADMIN}/users` }).then((r) => r.data);

export const activateUser = (id) =>
  admin({ method: "put", url: `${ENDPOINTS.ADMIN}/users/${id}/activate` }).then(
    (r) => r.data
  );

export const deactivateUser = (id) =>
  admin({ method: "put", url: `${ENDPOINTS.ADMIN}/users/${id}/deactivate` }).then(
    (r) => r.data
  );

export const deleteUser = (id) =>
  admin({ method: "delete", url: `${ENDPOINTS.ADMIN}/users/${id}` }).then(
    (r) => r.data
  );

export const fetchTours = () =>
  admin({ url: `${ENDPOINTS.ADMIN}/tours` }).then((r) => r.data);

export const activateTour = (id) =>
  admin({ method: "put", url: `${ENDPOINTS.ADMIN}/tours/${id}/activate` }).then(
    (r) => r.data
  );

export const deactivateTour = (id) =>
  admin({
    method: "put",
    url: `${ENDPOINTS.ADMIN}/tours/${id}/deactivate`,
  }).then((r) => r.data);

export const deleteTour = (id) =>
  admin({ method: "delete", url: `${ENDPOINTS.ADMIN}/tours/${id}` }).then(
    (r) => r.data
  );

export const fetchAuditLogs = (take = 100) =>
  admin({ url: `${ENDPOINTS.ADMIN}/audit-logs`, params: { take } }).then(
    (r) => r.data
  );

export const cancelBooking = (bookingId) =>
  admin({
    method: "delete",
    url: `${ENDPOINTS.ADMIN}/${bookingId}`,
  }).then((r) => r.data);

export const fetchGuideWallet = (guideId) =>
  admin({ url: `${ENDPOINTS.ADMIN}/guides/${guideId}/wallet` }).then(
    (r) => r.data
  );

export const fetchGuideWalletTransactions = (guideId) =>
  admin({ url: `${ENDPOINTS.ADMIN}/guides/${guideId}/wallet/transactions` }).then(
    (r) => r.data
  );

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

export const createAdmin = (adminData) =>
  admin({
    method: "post",
    url: `${ENDPOINTS.ADMIN}/create-admin`,
    data: adminData,
  }).then((r) => r.data);
