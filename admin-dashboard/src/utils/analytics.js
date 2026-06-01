/** @param {string} isoDate YYYY-MM-DD */
export const toDateKey = (d) => {
  const x = d instanceof Date ? d : new Date(d);
  return x.toISOString().slice(0, 10);
};

export const parseApiDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Bookings for a single calendar day (UTC date part of CreatedAtUtc) */
export const filterBookingsByDay = (bookings, dayKey) =>
  (bookings || []).filter((b) => {
    const created = parseApiDate(b.createdAtUtc);
    return created && toDateKey(created) === dayKey;
  });

export const buildLastNDaysSeries = (bookings, days = 14, endDate = new Date()) => {
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const points = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    const dayBookings = filterBookingsByDay(bookings, key);
    const confirmed = dayBookings.filter(
      (b) => (b.status || "").toLowerCase() === "confirmed"
    );
    points.push({
      date: key,
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      bookings: dayBookings.length,
      revenue: confirmed.reduce((s, b) => s + Number(b.totalPrice || 0), 0),
    });
  }
  return points;
};

export const bookingStatusPie = (bookings) => {
  const counts = {};
  (bookings || []).forEach((b) => {
    const s = (b.status || "Unknown").toString();
    counts[s] = (counts[s] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

export const paymentMethodPie = (bookings) => {
  const confirmed = (bookings || []).filter(
    (b) => (b.status || "").toLowerCase() === "confirmed"
  );
  let online = 0;
  let cash = 0;
  confirmed.forEach((b) => {
    const m = (b.paymentMethod || "").toLowerCase();
    if (m === "online") online += Number(b.totalPrice || 0);
    else if (m === "cash") cash += Number(b.totalPrice || 0);
  });
  return [
    { name: "Online", value: online },
    { name: "Cash", value: cash },
  ].filter((x) => x.value > 0);
};

export const daySummary = (bookings, dayKey) => {
  const day = filterBookingsByDay(bookings, dayKey);
  const confirmed = day.filter((b) => (b.status || "").toLowerCase() === "confirmed");
  return {
    total: day.length,
    confirmed: confirmed.length,
    pending: day.filter((b) => (b.status || "").toLowerCase() === "pending").length,
    cancelled: day.filter((b) => (b.status || "").toLowerCase() === "cancelled").length,
    revenue: confirmed.reduce((s, b) => s + Number(b.totalPrice || 0), 0),
  };
};
