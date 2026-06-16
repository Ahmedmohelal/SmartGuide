import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  Loader,
  AlertCircle,
  Ticket,
  History,
  XCircle,
  Hourglass,
  CheckCircle2,
  Ban,
} from "lucide-react";
import {
  cancelBooking,
  getMyBookings,
  getTourSlots,
} from "../../../Services/api/bookingService";
import { getTourById, getHomeTours } from "../../../Services/api/tours";
import { getTourTitleFromBookingItem } from "../../../Services/utils/bookingTourEnrichment";
import Swal from "sweetalert2";


const pick = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && v !== "");

const getBookingTourId = (booking) =>
  pick(booking.tourId, booking.TourId);

const getBookingSlot = (booking) => booking.slot || booking.Slot || {};

const getBookingStatus = (booking) =>
  String(pick(booking.status, booking.Status) || "unknown").toLowerCase();

const dedupeBookingsById = (bookings) => {
  const seen = new Set();
  return bookings.filter((booking) => {
    const id = pick(booking.id, booking.Id);
    if (!id) return true;
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const slotIdMatches = (slot, targetId) =>
  String(pick(slot.id, slot.Id)) === String(targetId);

async function resolveTourIdBySlot(slotId, slotDate, tours) {
  if (!slotId || !slotDate) return null;

  const dateKey =
    typeof slotDate === "string" ? slotDate.split("T")[0] : slotDate;

  for (const tour of tours) {
    const tourId = pick(tour.id, tour.Id);
    if (!tourId) continue;

    try {
      const slots = await getTourSlots(tourId, dateKey);
      const list = Array.isArray(slots) ? slots : [];
      if (list.some((slot) => slotIdMatches(slot, slotId))) {
        return tourId;
      }
    } catch {
      // Try the next tour.
    }
  }

  return null;
}

async function resolveTourIdsForBookings(bookings) {
  const resolved = new Map();
  const slotCache = new Map();

  const needsLookup = bookings.filter((booking) => {
    if (getBookingTourId(booking)) return false;
    const slot = getBookingSlot(booking);
    return Boolean(pick(slot.id, slot.Id) && pick(slot.date, slot.Date));
  });

  if (needsLookup.length === 0) {
    return resolved;
  }

  let tours = [];
  try {
    tours = await getHomeTours();
  } catch (err) {
    console.error("Failed to load tours for booking lookup:", err);
    return resolved;
  }

  await Promise.all(
    needsLookup.map(async (booking) => {
      const bookingId = pick(booking.id, booking.Id);
      const slot = getBookingSlot(booking);
      const slotId = pick(slot.id, slot.Id);
      const slotDate = pick(slot.date, slot.Date);
      const cacheKey = `${slotId}:${slotDate}`;

      if (slotCache.has(cacheKey)) {
        resolved.set(bookingId, slotCache.get(cacheKey));
        return;
      }

      const tourId = await resolveTourIdBySlot(slotId, slotDate, tours);
      slotCache.set(cacheKey, tourId);
      if (tourId) {
        resolved.set(bookingId, tourId);
      }
    }),
  );

  return resolved;
}

async function loadToursForBookings(bookings) {
  const tourIdByBooking = await resolveTourIdsForBookings(bookings);

  const tourIds = [
    ...new Set(
      bookings
        .map((booking) => {
          const bookingId = pick(booking.id, booking.Id);
          return getBookingTourId(booking) || tourIdByBooking.get(bookingId);
        })
        .filter(Boolean),
    ),
  ];

  const tourEntries = await Promise.all(
    tourIds.map(async (tourId) => {
      try {
        const tour = await getTourById(tourId);
        return [String(tourId), tour];
      } catch (err) {
        console.error(`Failed to load tour ${tourId}:`, err);
        return [String(tourId), null];
      }
    }),
  );

  const toursById = Object.fromEntries(tourEntries);

  return bookings.map((booking) => {
    const bookingId = pick(booking.id, booking.Id);
    const tourId =
      getBookingTourId(booking) || tourIdByBooking.get(bookingId) || null;

    return {
      booking,
      tourId,
      tour: tourId ? toursById[String(tourId)] ?? null : null,
    };
  });
}

const getSlotDateKey = (slotDate) => {
  if (!slotDate) return null;
  return typeof slotDate === "string"
    ? slotDate.split("T")[0]
    : String(slotDate);
};

const formatSlotDate = (slotDate) => getSlotDateKey(slotDate) || "N/A";

const formatSlotTimeRange = (startTime, endTime) => {
  const start = startTime ? String(startTime) : "";
  const end = endTime ? String(endTime) : "";
  if (start && end) return `${start} - ${end}`;
  return start || end || "N/A";
};

const getBookingSlotStart = (booking) => {
  const slot = getBookingSlot(booking);
  const dateKey = getSlotDateKey(pick(slot.date, slot.Date));
  const startTime = pick(slot.startTime, slot.StartTime);

  if (!dateKey) return null;

  if (startTime) {
    const [hours, minutes, seconds = "0"] = String(startTime).split(":");
    const value = new Date(`${dateKey}T00:00:00`);
    value.setHours(Number(hours), Number(minutes), Number(seconds), 0);
    return value;
  }

  return new Date(`${dateKey}T00:00:00`);
};

const isUpcomingBooking = (item) => {
  const status = getBookingStatus(item.booking);
  if (status === "cancelled" || status === "rejected") return false;

  const slotStart = getBookingSlotStart(item.booking);
  if (!slotStart) return true;

  return slotStart >= new Date();
};

const canCancelBooking = (item) => {
  const status = getBookingStatus(item.booking);
  return (
    isUpcomingBooking(item) &&
    (status === "pending" || status === "confirmed")
  );
};

const getStatusTheme = (status) => {
  switch (status) {
    case "confirmed":
      return {
        label: "Confirmed",
        barClass: "bg-emerald-500",
        icon: CheckCircle2,
      };
    case "pending":
      return {
        label: "Pending",
        barClass: "bg-amber-500",
        icon: Hourglass,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        barClass: "bg-red-500",
        icon: XCircle,
      };
    case "rejected":
      return {
        label: "Rejected",
        barClass: "bg-red-500",
        icon: Ban,
      };
    default:
      return {
        label: status || "Unknown",
        barClass: "bg-slate-500",
        icon: AlertCircle,
      };
  }
};

function BookingCard({ item, onCancel, cancellingId }) {
  const booking = item.booking;
  const bookingId = pick(booking.id, booking.Id);
  const slot = getBookingSlot(booking);
  const slotDate = pick(slot.date, slot.Date);
  const startTime = pick(slot.startTime, slot.StartTime);
  const endTime = pick(slot.endTime, slot.EndTime);
  const totalPrice = pick(booking.totalPrice, booking.TotalPrice) ?? 0;
  const paymentMethod =
    pick(booking.paymentMethod, booking.PaymentMethod) || "Online";
  const status = getBookingStatus(booking);
  const statusTheme = getStatusTheme(status);
  const StatusIcon = statusTheme.icon;
  const title = getTourTitleFromBookingItem(item);
  const tourId = item.tourId || getBookingTourId(booking);
  const showCancel = canCancelBooking(item);
  const isCancelling = cancellingId === bookingId;

  const cardBody = (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className={`flex items-center justify-between px-4 py-3 text-white ${statusTheme.barClass}`}
      >
        <div className="flex items-center gap-2 font-semibold">
          <StatusIcon size={18} />
          <span>{statusTheme.label}</span>
        </div>
        <span className="text-xs font-medium text-white/90">{paymentMethod}</span>
      </div>

      <div className="space-y-4 p-4">
        {tourId ? (
          <Link
            to={`/tours/${tourId}`}
            className="block text-base font-bold text-slate-900 hover:text-egypt-teal"
          >
            {title}
          </Link>
        ) : (
          <p className="text-base font-bold text-slate-900">{title}</p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
            <Calendar size={16} className="shrink-0 text-egypt-teal" />
            <span>{formatSlotDate(slotDate)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
            <Clock size={16} className="shrink-0 text-egypt-teal" />
            <span>{formatSlotTimeRange(startTime, endTime)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm font-medium text-slate-500">Total Price</span>
          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
            {Number(totalPrice).toLocaleString("en-US", {
              style: "currency",
              currency: "EGP",
            })}
          </span>
        </div>

        {showCancel && (
          <button
            type="button"
            onClick={() => onCancel(bookingId)}
            disabled={isCancelling}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-500 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircle size={18} />
            {isCancelling ? "Cancelling..." : "Cancel Booking"}
          </button>
        )}
      </div>
    </div>
  );

  return <div key={bookingId}>{cardBody}</div>;
}

export default function TouristTrips() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyBookings();
      const bookings = dedupeBookingsById(Array.isArray(data) ? data : []);
      const enriched = await loadToursForBookings(bookings);
      setItems(enriched);
    } catch (err) {
      console.error(err);
      setError("Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!bookingId) return;
  
    const result = await Swal.fire({
      title: "Cancel Booking?",
      text: "Are you sure you want to cancel this booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No",
      confirmButtonColor: "#d33",
    });
  
    if (!result.isConfirmed) return;
  
    try {
      setCancellingId(bookingId);
  
      const response = await cancelBooking(bookingId);
  
      toast.success(
        response?.message ||
          response?.Message ||
          "Booking cancelled successfully."
      );
  
      await fetchBookings();
      setActiveTab("past");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Failed to cancel booking."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const upcomingItems = useMemo(
    () =>
      items
        .filter(isUpcomingBooking)
        .sort(
          (a, b) =>
            (getBookingSlotStart(a.booking)?.getTime() || 0) -
            (getBookingSlotStart(b.booking)?.getTime() || 0),
        ),
    [items],
  );

  const pastItems = useMemo(
    () =>
      items
        .filter((item) => !isUpcomingBooking(item))
        .sort(
          (a, b) =>
            (getBookingSlotStart(b.booking)?.getTime() || 0) -
            (getBookingSlotStart(a.booking)?.getTime() || 0),
        ),
    [items],
  );

  const visibleItems = activeTab === "upcoming" ? upcomingItems : pastItems;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin text-egypt-teal" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex gap-3 bg-red-50 border border-red-200 p-4 rounded-lg">
        <AlertCircle className="text-red-600 shrink-0" size={20} />
        <div>
          <p className="text-red-800 font-semibold">{error}</p>
          <button
            onClick={fetchBookings}
            className="text-red-600 underline text-sm mt-2 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">My Trips</h3>
        <p className="text-gray-600 text-sm">
          {items.length} {items.length === 1 ? "booking" : "bookings"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === "upcoming"
              ? "bg-white text-egypt-teal shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Ticket size={18} />
          Upcoming
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("past")}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === "past"
              ? "bg-white text-egypt-teal shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <History size={18} />
          Past
        </button>
      </div>

      {visibleItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-gray-600">
            {activeTab === "upcoming"
              ? "You have no upcoming bookings."
              : "You have no past bookings."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {visibleItems.map((item) => (
            <BookingCard
              key={pick(item.booking.id, item.booking.Id)}
              item={item}
              onCancel={handleCancelBooking}
              cancellingId={cancellingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
