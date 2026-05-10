import axios from "axios";
import { ENDPOINTS } from "../../config/api";
import { getToken, authHeader, getUserIdFromToken } from "../utils/tokenUtils";

export const getMyProfile = async () => {
  const token = getToken();
  const id = getUserIdFromToken();

  const res = await axios.get(
    `${ENDPOINTS.GUIDES}/${id}/profile`,
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
  const res = await axios.get(ENDPOINTS.TOURS);
  return res.data;
};

// =====================
// GET TOUR BY ID
// =====================
export const getTourById = async (id) => {
  const token = getToken();
  const res = await axios.get(`${ENDPOINTS.TOURS}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

// =====================
// CATALOG (ACTIVE TOURS — TOURIST / GUIDE HOME)
// =====================
export const getToursCatalog = async () => {
  const res = await axios.get(`${ENDPOINTS.TOURS}/catalog`, {
    headers: authHeader(),
  });
  return Array.isArray(res.data) ? res.data : [];
};

// =====================
// GET MY TOURS
// =====================
export const getMyTours = async () => {
  const res = await axios.get(`${ENDPOINTS.TOURS}/my-tours`, {
    headers: authHeader(),
  });

  return Array.isArray(res.data) ? res.data : [];
};

// =====================
// CREATE TOUR
// =====================
export const createTour = async (data) => {
  const token = getToken();

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
    `${ENDPOINTS.TOURS}/create`,
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

  const res = await axios.put(`${ENDPOINTS.TOURS}/${id}`, formData, {
    headers: authHeader(),
  });

  return res.data;
};

// =====================
// DELETE TOUR
// =====================
export const deleteTour = async (id) => {
  const res = await axios.delete(`${ENDPOINTS.TOURS}/${id}`, {
    headers: authHeader(),
  });

  return res.data;
};