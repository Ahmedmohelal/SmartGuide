import axios from "axios";
import { API_BASE } from "../../config/api";
import { authHeader, getUserIdFromToken } from "../utils/tokenUtils";

/* =========================
   BOOKINGS (USER SIDE)
========================= */

/**
 * Get current user bookings
 */
export const getMyBookings = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}/Bookings/my-bookings`,
      { headers: authHeader() }
    );

    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    throw error;
  }
};

/**
 * Get bookings received by the current guide
 */
export const getGuideBookings = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}/Bookings/guide-bookings`,
      { headers: authHeader() }
    );

    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch guide bookings:", error);
    throw error;
  }
};

/**
 * Create new booking
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(
      `${API_BASE}/Users/bookings`,
      bookingData,
      { headers: authHeader() }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to create booking:", error);
    throw error;
  }
};

/**
 * Get single booking
 */
export const getBookingById = async (bookingId) => {
  try {
    const response = await axios.get(
      `${API_BASE}/bookings/${bookingId}`,
      { headers: authHeader() }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch booking:", error);
    throw error;
  }
};

/**
 * Update booking
 */
export const updateBooking = async (bookingId, updateData) => {
  try {
    const response = await axios.put(
      `${API_BASE}/bookings/${bookingId}`,
      updateData,
      { headers: authHeader() }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to update booking:", error);
    throw error;
  }
};

/**
 * Cancel booking
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/Bookings/${bookingId}`,
      { headers: authHeader() }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to cancel booking:", error);
    throw error;
  }
};

/* =========================
   SLOTS (GUIDE / TOUR)
========================= */

/**
 * Create booking slot (GUIDE)
 * POST /tours/slots
 */
export const createBookingSlot = async (data) => {
  const response = await axios.post(
    `${API_BASE}/tours/slots`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
    }
  );

  return response.data;
};

/**
 * Get slots for a specific tour
 * GET /tours/{tourId}/slots?date=YYYY-MM-DD
 * Without date: tries all future slots (backend) or falls back to multi-day fetch
 */
const sortSlots = (slots) =>
  [...slots].sort((a, b) => {
    const dateA = a.date || a.Date || "";
    const dateB = b.date || b.Date || "";
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    const startA = a.startTime || a.StartTime || "";
    const startB = b.startTime || b.StartTime || "";
    return startA.localeCompare(startB);
  });

const buildDateRange = (daysAhead = 365) => {
  const dates = [];
  const start = new Date();

  for (let i = 0; i < daysAhead; i += 1) {
    const day = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i
    );
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const dayOfMonth = String(day.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${dayOfMonth}`);
  }

  return dates;
};

const mergeSlots = (results) => {
  const merged = new Map();

  results.flat().forEach((slot) => {
    const id = slot.id || slot.Id;
    if (id) merged.set(id, slot);
  });

  return sortSlots([...merged.values()]);
};

export const getAllTourSlots = async (tourId, extraDates = []) => {
  const dates = [...new Set([...buildDateRange(365), ...extraDates])];
  const batchSize = 20;
  const allResults = [];

  for (let i = 0; i < dates.length; i += batchSize) {
    const chunk = dates.slice(i, i + batchSize);
    const chunkResults = await Promise.all(
      chunk.map((date) => getTourSlots(tourId, date).catch(() => []))
    );
    allResults.push(...chunkResults);
  }

  return mergeSlots(allResults);
};

export const getTourSlots = async (tourId, date) => {
  try {
    const response = await axios.get(
      `${API_BASE}/tours/${tourId}/slots`,
      {
        headers: authHeader(),
        params: { date },
      }
    );

    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch tour slots:", error);
    throw error;
  }
};

/**
 * Book a slot (USER)
 */
export const bookSlot = async (slotId) => {
  try {
    const response = await axios.post(
      `${API_BASE}/Users/bookings/slot/${slotId}`,
      {},
      { headers: authHeader() }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to book slot:", error);
    throw error;
  }
};

/**
 * Update slot (optional - ONLY if backend supports it)
 */
export const updateBookingSlot = async (slotId, slotData) => {
  try {
    const response = await axios.put(
      `${API_BASE}/tours/slots/${slotId}`,
      slotData,
      { headers: authHeader() }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to update booking slot:", error);
    throw error;
  }
};

/**
 * Delete slot (optional - ONLY if backend supports it)
 */
export const deleteBookingSlot = async (slotId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/tours/slots/${slotId}`,
      { headers: authHeader() }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to delete booking slot:", error);
    throw error;
  }
};