import axios from "axios";

const API = "https://smartguide.runasp.net/api/Tours";
const API_ORIGIN = "https://smartguide.runasp.net";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
});
const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.sub;
};
export const getMyProfile = async () => {
  const token = localStorage.getItem("token");
  const id = getUserIdFromToken();

  const res = await axios.get(
    `https://smartguide.runasp.net/api/tour-guides/${id}/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// =====================
// GET ALL TOURS
// =====================
export const getAllTours = async () => {
  const res = await axios.get(API);
  return res.data;
};

// =====================
// GET TOUR BY ID
// =====================
export const getTourById = async (id) => {
  const token = getToken();
  const res = await axios.get(`${API}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

// =====================
// CATALOG (ACTIVE TOURS — TOURIST / GUIDE HOME)
// =====================
export const getToursCatalog = async () => {
  const res = await axios.get(`${API}/catalog`, {
    headers: authHeader(),
  });
  return Array.isArray(res.data) ? res.data : [];
};

// =====================
// GET MY TOURS
// =====================
export const getMyTours = async () => {
  const res = await axios.get(`${API}/my-tours`, {
    headers: authHeader(),
  });

  return Array.isArray(res.data) ? res.data : [];
};

const normalizeImageValue = (value) => {
  if (!value || typeof value !== "string") return "";
  const cleaned = value.replace(/\\/g, "/").trim();
  if (!cleaned) return "";
  if (
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://") ||
    cleaned.startsWith("data:") ||
    cleaned.startsWith("blob:")
  ) {
    return cleaned;
  }
  return cleaned.startsWith("/") ? `${API_ORIGIN}${cleaned}` : `${API_ORIGIN}/${cleaned}`;
};

export const extractTourImageUrl = (tour) => {
  const candidates = [
    tour?.primaryImage,
    tour?.PrimaryImage,
    tour?.imageUrl,
    tour?.image,
    tour?.coverImage,
    tour?.imagePath,
    tour?.thumbnail,
    Array.isArray(tour?.images) ? tour.images[0] : null,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const normalized = normalizeImageValue(candidate);
      if (normalized) return normalized;
    }

    if (candidate && typeof candidate === "object") {
      const nested =
        candidate.url ||
        candidate.path ||
        candidate.imageUrl ||
        candidate.src ||
        "";
      const normalizedNested = normalizeImageValue(nested);
      if (normalizedNested) return normalizedNested;
    }
  }

  return "";
};

export const extractTourDescription = (tour) =>
  tour?.description ||
  tour?.Description ||
  tour?.tourDescription ||
  tour?.TourDescription ||
  "";

export const extractTourMaxGroupSize = (tour) =>
  tour?.maxGroupSize ??
  tour?.MaxGroupSize ??
  tour?.maxTourists ??
  tour?.MaxTourists ??
  0;

// =====================
// CREATE TOUR
// =====================
export const createTour = async (data) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("Title", data.title);
  formData.append("Description", data.description);
  formData.append("Price", data.price);
  formData.append("DurationHours", data.durationHours);
  formData.append("MaxGroupSize", data.maxGroupSize);
  formData.append("MaxTourists", data.maxGroupSize);

  formData.append("StopsJson", "[]");
  formData.append("InclusionsJson", "[]");
  formData.append("AddOnsJson", "[]");

  if (data.imageFile) {
    formData.append("Image", data.imageFile);
    formData.append("Images", data.imageFile);
  }

  const res = await axios.post(
    "https://smartguide.runasp.net/api/Tours/create",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // ❌ IMPORTANT: متكتبيش Content-Type خالص
      },
    }
  );

  return res.data;
};

// =====================
// UPDATE TOUR
// =====================
export const updateTour = async (id, data) => {
  const formData = new FormData();

  formData.append("Title", data.title);
  formData.append("Description", data.description);
  formData.append("Price", data.price);
  formData.append("DurationHours", data.durationHours);
  formData.append("MaxGroupSize", data.maxGroupSize);
  formData.append("MaxTourists", data.maxGroupSize);
  formData.append("StopsJson", data.stopsJson || "[]");
  formData.append("InclusionsJson", data.inclusionsJson || "[]");
  formData.append("AddOnsJson", data.addOnsJson || "[]");

  if (data.imageFile) {
    formData.append("Image", data.imageFile);
    formData.append("Images", data.imageFile);
  }

  const res = await axios.put(`${API}/${id}`, formData, {
    headers: authHeader(),
  });

  return res.data;
};
// =====================
// DELETE TOUR
// =====================
export const deleteTour = async (id) => {
  const res = await axios.delete(`${API}/${id}`, {
    headers: authHeader(),
  });

  return res.data;
};