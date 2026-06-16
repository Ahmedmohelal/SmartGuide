import { getTourSlots } from "../api/bookingService";
import { getTourById } from "../api/tours";

export const pick = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && v !== "");

export const getBookingTourId = (booking) =>
  pick(booking.tourId, booking.TourId);

export const getBookingSlot = (booking) => booking.slot || booking.Slot || {};

const slotIdMatches = (slot, targetId) =>
  String(pick(slot.id, slot.Id)) === String(targetId);

async function resolveTourIdBySlot(slotId, slotDate, tours) {
  if (!slotId || !slotDate) return null;

  const dateKey =
    typeof slotDate === "string" ? slotDate.split("T")[0] : slotDate;

  for (const tour of tours) {
    const tourId = pick(tour.id, tour.Id, tour.tourId, tour.TourId);
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

async function resolveTourIdsForBookings(bookings, tours) {
  const resolved = new Map();
  const slotCache = new Map();

  const needsLookup = bookings.filter((booking) => {
    if (getBookingTourId(booking)) return false;
    const slot = getBookingSlot(booking);
    return Boolean(pick(slot.id, slot.Id) && pick(slot.date, slot.Date));
  });

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

export async function enrichBookingsWithTours(bookings, tourCatalog = []) {
  const tourIdByBooking = await resolveTourIdsForBookings(
    bookings,
    tourCatalog,
  );

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

export const formatBookingDate = (date) => {
  if (!date) return "N/A";
  const value =
    typeof date === "string" ? `${date.split("T")[0]}T00:00:00` : date;
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatBookingTime = (time) => {
  if (!time) return "";
  const raw = String(time);
  const [hours, minutes] = raw.split(":");
  const value = new Date();
  value.setHours(Number(hours), Number(minutes), 0);
  return value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getTourTitleFromBookingItem = (item) =>
  pick(
    item.tour?.title,
    item.tour?.Title,
    item.booking?.tourTitle,
    item.booking?.TourTitle,
    "Tour",
  );
