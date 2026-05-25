import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Bell,
  CheckCheck,
  Circle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../Services/api/notificationService";
import { getToken } from "../Services/utils/tokenUtils";
import { useNavigate } from "react-router-dom";

const pick = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const asList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

const getNotificationId = (notification) =>
  pick(
    notification?.notificationId,
    notification?.NotificationId,
    notification?.id,
    notification?.Id,
  );

const getNotificationTitle = (notification) =>
  pick(
    notification?.title,
    notification?.Title,
    notification?.subject,
    notification?.Subject,
    notification?.type,
    notification?.Type,
    "Notification",
  );

const getNotificationBody = (notification) =>
  pick(
    notification?.message,
    notification?.Message,
    notification?.body,
    notification?.Body,
    notification?.content,
    notification?.Content,
    notification?.description,
    notification?.Description,
    "",
  );

const getNotificationDate = (notification) =>
  pick(
    notification?.createdAtUtc,
    notification?.CreatedAtUtc,
    notification?.createdAt,
    notification?.CreatedAt,
    notification?.sentAtUtc,
    notification?.SentAtUtc,
    notification?.date,
    notification?.Date,
  );

const isNotificationRead = (notification) =>
  Boolean(
    pick(
      notification?.isRead,
      notification?.IsRead,
      notification?.read,
      notification?.Read,
      notification?.readAtUtc,
      notification?.ReadAtUtc,
      notification?.readAt,
      notification?.ReadAt,
      false,
    ),
  );

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const extractUnreadCount = (data) => {
  const count = pick(
    data?.unreadCount,
    data?.UnreadCount,
    data?.count,
    data?.Count,
    data?.total,
    data?.Total,
    typeof data === "number" ? data : undefined,
  );
  return Number(count) || 0;
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [markAllLoading, setMarkAllLoading] = useState(false);

  const unreadLocalCount = useMemo(
    () => notifications.filter((item) => !isNotificationRead(item)).length,
    [notifications],
  );

  const loadNotifications = useCallback(async () => {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const [listData, countData] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);
      setNotifications(asList(listData));
      setUnreadCount(extractUnreadCount(countData));
    } catch (err) {
      console.error("Failed to load notifications:", err);
      toast.error("Couldn't load notifications");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (notification) => {
    const id = getNotificationId(notification);
    if (!id || isNotificationRead(notification)) return;

    try {
      setActionLoadingId(id);
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          String(getNotificationId(item)) === String(id)
            ? { ...item, isRead: true, IsRead: true }
            : item,
        ),
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
      toast.error("Couldn't mark notification as read");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkAllLoading(true);
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true, IsRead: true })),
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
      toast.error("Couldn't mark all as read");
    } finally {
      setMarkAllLoading(false);
    }
  };

  const handleDelete = async (notification) => {
    const id = getNotificationId(notification);
    if (!id) return;

    try {
      setActionLoadingId(id);
      await deleteNotification(id);
      setNotifications((prev) =>
        prev.filter((item) => String(getNotificationId(item)) !== String(id)),
      );
      if (!isNotificationRead(notification)) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
      toast.success("Notification deleted");
    } catch (err) {
      console.error("Failed to delete notification:", err);
      toast.error("Couldn't delete notification");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-28 lg:px-8" dir="ltr">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="mt-1 text-sm text-slate-600">
              {unreadCount || unreadLocalCount} unread notifications
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadNotifications}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-egypt-teal hover:text-egypt-teal"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markAllLoading || notifications.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-egypt-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500">
              Loading notifications...
            </p>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-egypt-teal">
                <Bell size={26} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                No notifications yet
              </h2>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => {
                const id = getNotificationId(notification);
                const read = isNotificationRead(notification);

                return (
                  <article
                    key={id || `${getNotificationTitle(notification)}-${getNotificationDate(notification)}`}
                    className={`flex gap-4 p-5 transition ${
                      read ? "bg-white" : "bg-teal-50/70"
                    }`}
                  >
                    <div
                      className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        read ? "bg-slate-100 text-slate-500" : "bg-egypt-teal text-white"
                      }`}
                    >
                      {read ? <Bell size={20} /> : <Circle size={18} fill="currentColor" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-bold text-slate-900">
                            {getNotificationTitle(notification)}
                          </h2>
                          {getNotificationBody(notification) && (
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {getNotificationBody(notification)}
                            </p>
                          )}
                          {getNotificationDate(notification) && (
                            <p className="mt-2 text-xs text-slate-400">
                              {formatTime(getNotificationDate(notification))}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 gap-2">
                          {!read && (
                            <button
                              type="button"
                              onClick={() => handleMarkRead(notification)}
                              disabled={actionLoadingId === id}
                              className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2 text-xs font-semibold text-egypt-teal transition hover:bg-teal-100"
                            >
                              <CheckCheck size={15} />
                              Read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(notification)}
                            disabled={actionLoadingId === id}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
