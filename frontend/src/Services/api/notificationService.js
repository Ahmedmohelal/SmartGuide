import axios from "axios";
import { API_BASE } from "../../config/api";
import { authHeader } from "../utils/tokenUtils";

const NOTIFICATIONS_BASE = `${API_BASE}/Notifications`;
const encoded = (value) => encodeURIComponent(String(value));

export const getNotifications = async (page = 1, pageSize = 20) => {
  const response = await axios.get(NOTIFICATIONS_BASE, {
    headers: authHeader(),
    params: { page, pageSize },
  });
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await axios.get(`${NOTIFICATIONS_BASE}/unread-count`, {
    headers: authHeader(),
  });
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await axios.patch(
    `${NOTIFICATIONS_BASE}/${encoded(notificationId)}/read`,
    undefined,
    { headers: authHeader() },
  );
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await axios.patch(`${NOTIFICATIONS_BASE}/read-all`, undefined, {
    headers: authHeader(),
  });
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await axios.delete(`${NOTIFICATIONS_BASE}/${encoded(notificationId)}`, {
    headers: authHeader(),
  });
  return response.data;
};
