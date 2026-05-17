import axios from "axios";
import { ENDPOINTS } from "../../config/api";
import {
  getToken,
  authHeader,
  getUserIdFromToken,
  isGuide,
} from "../utils/tokenUtils";

export const getMyProfile = async () => {
  const token = getToken();
  const id = getUserIdFromToken();

  const res = await axios.get(`${ENDPOINTS.GUIDES}/${id}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getAllTours = async () => {
  const res = await axios.get(ENDPOINTS.TOURS, {
    headers: authHeader(),
  });
  return Array.isArray(res.data) ? res.data : [];
};

export const getTourById = async (id) => {
  const token = getToken();

  if (token && isGuide()) {
    try {
      const res = await axios.get(`${ENDPOINTS.DASHBOARD_TOUR}/${id}`, {
        headers: authHeader(),
      });
      return res.data;
    } catch (err) {
      const status = err.response?.status;
      if (status === 403 || status === 404) {
        const res = await axios.get(`${ENDPOINTS.TOURS}/${id}`, {
          headers: {},
        });
        return res.data;
      }
      throw err;
    }
  }

  const res = await axios.get(`${ENDPOINTS.TOURS}/${id}`, {
    headers: token ? authHeader() : {},
  });
  return res.data;
};

export const getToursByGuide = async (guideId) => {
  const token = getToken();
  const res = await axios.get(`${ENDPOINTS.TOURS}/guide/${guideId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return Array.isArray(res.data) ? res.data : [];
};

export const getToursByPlace = async (placeId) => {
  const res = await axios.get(`${ENDPOINTS.DASHBOARD_TOUR}/by-place/${placeId}`, {
    headers: authHeader(),
  });
  return Array.isArray(res.data) ? res.data : [];
};

export const getHomeTours = async () => {
  const token = getToken();
  const res = await axios.get(`${ENDPOINTS.TOURS}/home`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return Array.isArray(res.data) ? res.data : [];
};

export const getAllToursFromAllGuides = getHomeTours;

export const getMyTours = async () => {
  const res = await axios.get(`${ENDPOINTS.DASHBOARD}/my-tours`, {
    headers: authHeader(),
  });
  return Array.isArray(res.data) ? res.data : [];
};

const formText = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

/** Must be a JSON array string for StopsJson / InclusionsJson / AddOnsJson. */
const formJsonField = (value, fallback = "[]") => {
  if (value == null) return fallback;
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return fallback;
    try {
      const parsed = JSON.parse(t);
      return Array.isArray(parsed) ? t : fallback;
    } catch {
      return fallback;
    }
  }
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
  return fallback;
};

const collectImageFiles = (data) => {
  const files = [];
  if (data.imageFile instanceof File) {
    files.push(data.imageFile);
  }
  if (Array.isArray(data.imageFiles)) {
    data.imageFiles.forEach((f) => {
      if (f instanceof File) files.push(f);
    });
  }
  return files;
};

const appendTourFormFields = (formData, data) => {
  formData.append("Title", formText(data.title));
  formData.append("Description", formText(data.description));
  formData.append("Price", formText(data.price));
  formData.append("DurationHours", formText(data.durationHours));
  formData.append("MaxGroupSize", formText(data.maxGroupSize));

  formData.append("StopsJson", formJsonField(data.stopsJson));
  formData.append("InclusionsJson", formJsonField(data.inclusionsJson));
  formData.append("AddOnsJson", formJsonField(data.addOnsJson));

  collectImageFiles(data).forEach((file) => {
    formData.append("Images", file);
  });
};

export const createTour = async (data) => {
  const token = getToken();
  const formData = new FormData();

  appendTourFormFields(formData, data);

  const res = await axios.post(`${ENDPOINTS.DASHBOARD_TOUR}/create`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const updateTour = async (id, data) => {
  const formData = new FormData();

  appendTourFormFields(formData, data);

  const res = await axios.put(`${ENDPOINTS.DASHBOARD_TOUR}/edit/${id}`, formData, {
    headers: authHeader(),
  });

  return res.data;
};

export const deleteTour = async (id) => {
  const res = await axios.delete(`${ENDPOINTS.DASHBOARD_TOUR}/${id}`, {
    headers: authHeader(),
  });
  return res.data;
};
