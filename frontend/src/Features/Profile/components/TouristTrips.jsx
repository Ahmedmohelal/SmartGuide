import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Banknote,
  Loader,
  AlertCircle,
  Clock3,
} from "lucide-react";
import { getMyBookings, getTourSlots } from "../../../Services/api/bookingService";
import { getTourById, getHomeTours } from "../../../Services/api/tours";
import {
  extractTourDescription,
  extractTourImageUrl,
} from "../../../Services/utils/tourUtils";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1539768942893-daf53e449371?auto=format&fit=crop&w=900&q=80";

const pick = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && v !== "");

const formatDate = (date) => {
  if (!date) return null;
  const value =
    typeof date === "string" ? `${date.split("T")[0]}T00:00:00` : date;
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return null;
  const raw = String(time);
  const [hours, minutes] = raw.split(":");
  const value = new Date();
  value.setHours(Number(hours), Number(minutes), 0);
  return value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (status) => {
  const normalized = String(status || "").toLowerCase();
  const statusMap = {
    confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800" },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  };
  return (
    statusMap[normalized] || {
      label: status || "Unknown",
      color: "bg-gray-100 text-gray-800",
    }
  );
};

const getBookingTourId = (booking) =>
  pick(booking.tourId, booking.TourId);

const getBookingSlot = (booking) => booking.slot || booking.Slot || {};

const getBookingKey = (booking) => {
  const slot = getBookingSlot(booking);
  const slotId = pick(slot.id, slot.Id);
  if (slotId) return `slot:${slotId}`;

  const tourId = getBookingTourId(booking);
  const slotDate = pick(slot.date, slot.Date);
  const startTime = pick(slot.startTime, slot.StartTime);
  if (tourId && slotDate && startTime) {
    return `tour:${tourId}:${slotDate}:${startTime}`;
  }

  const id = pick(booking.id, booking.Id);
  return id ? `booking:${id}` : null;
};

const STATUS_PRIORITY = {
  confirmed: 4,
  pending: 3,
  rejected: 2,
  cancelled: 1,
};

const pickPreferredBooking = (current, next) => {
  const currentStatus =
    STATUS_PRIORITY[String(pick(current.status, current.Status)).toLowerCase()] ??
    0;
  const nextStatus =
    STATUS_PRIORITY[String(pick(next.status, next.Status)).toLowerCase()] ?? 0;

  if (nextStatus !== currentStatus) {
    return nextStatus > currentStatus ? next : current;
  }

  const currentCreated = new Date(
    pick(current.createdAtUtc, current.CreatedAtUtc) || 0,
  ).getTime();
  const nextCreated = new Date(
    pick(next.createdAtUtc, next.CreatedAtUtc) || 0,
  ).getTime();

  return nextCreated >= currentCreated ? next : current;
};

const dedupeBookings = (bookings) => {
  const seenIds = new Set();
  const uniqueById = bookings.filter((booking) => {
    const id = pick(booking.id, booking.Id);
    if (!id) return true;
    const key = String(id);
    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });

  const bySlot = new Map();

  uniqueById.forEach((booking) => {
    const key = getBookingKey(booking);
    if (!key) return;

    const existing = bySlot.get(key);
    bySlot.set(key, existing ? pickPreferredBooking(existing, booking) : booking);
  });

  return [...bySlot.values()];
};

const slotIdMatches = (slot, targetId) =>
  String(pick(slot.id, slot.Id)) === String(targetId);

async function resolveTourIdBySlot(slotId, slotDate, tours) {
  if (!slotId || !slotDate) return null;

  const dateKey =
    typeof slotDate === "string"
      ? slotDate.split("T")[0]
      : slotDate;

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

export default function TouristTrips() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyBookings();
      const bookings = dedupeBookings(Array.isArray(data) ? data : []);
      const enriched = await loadToursForBookings(bookings);
      setItems(enriched);
    } catch (err) {
      console.error(err);
      setError("Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

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
        <h3 className="text-xl font-bold text-gray-900 mb-2">My Booked Tours</h3>
        <p className="text-gray-600 text-sm">
          {items.length} {items.length === 1 ? "booking" : "bookings"}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">You have not booked any tours yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {items.map(({ booking, tour, tourId: resolvedTourId }) => {
            const id = pick(booking.id, booking.Id);
            const tourId = resolvedTourId || getBookingTourId(booking);
            const slot = booking.slot || booking.Slot || {};
            const slotDate = pick(slot.date, slot.Date);
            const startTime = pick(slot.startTime, slot.StartTime);
            const endTime = pick(slot.endTime, slot.EndTime);
            const totalPrice = pick(booking.totalPrice, booking.TotalPrice);
            const status = getStatusBadge(pick(booking.status, booking.Status));

            const title =
              pick(tour?.title, tour?.Title, booking.tourTitle, booking.TourTitle) ||
              "Tour";
            const description =
              extractTourDescription(tour) ||
              "Your booked tour experience in Egypt.";
            const image = extractTourImageUrl(tour) || FALLBACK_IMG;
            const duration =
              pick(tour?.durationHours, tour?.DurationHours) ?? null;
            const tourPrice = pick(tour?.price, tour?.Price);
            const displayPrice = totalPrice ?? tourPrice;

            const cardContent = (
              <>
                <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden sm:w-64 shrink-0">
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className="flex-1 p-5 sm:p-6 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="font-bold text-lg text-gray-900">{title}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700">
                    {slotDate && (
                      <span className="inline-flex items-center gap-2">
                        <Calendar size={16} className="text-egypt-teal shrink-0" />
                        {formatDate(slotDate)}
                      </span>
                    )}

                    {(startTime || endTime) && (
                      <span className="inline-flex items-center gap-2">
                        <Clock size={16} className="text-egypt-teal shrink-0" />
                        {startTime && formatTime(startTime)}
                        {startTime && endTime && " – "}
                        {endTime && formatTime(endTime)}
                      </span>
                    )}

                    {duration != null && (
                      <span className="inline-flex items-center gap-2">
                        <Clock3 size={16} className="text-egypt-teal shrink-0" />
                        {duration} hrs
                      </span>
                    )}

                    {displayPrice !== undefined && (
                      <span className="inline-flex items-center gap-2 font-semibold text-egypt-teal">
                        <Banknote size={16} className="shrink-0" />
                        {Number(displayPrice).toLocaleString("en-US")} EGP
                      </span>
                    )}
                  </div>

                  {tourId && (
                    <span className="text-sm font-semibold text-egypt-teal mt-auto">
                      View tour details →
                    </span>
                  )}
                </div>
              </>
            );

            return tourId ? (
              <Link
                key={id}
                to={`/tours/${tourId}`}
                className="flex flex-col sm:flex-row overflow-hidden bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow group"
              >
                {cardContent}
              </Link>
            ) : (
              <div
                key={id}
                className="flex flex-col sm:flex-row overflow-hidden bg-white border border-gray-200 rounded-xl"
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
