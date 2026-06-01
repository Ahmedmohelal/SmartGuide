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
      return hydrateTourDetailsWithListFields(res.data, id, true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403 || status === 404) {
        const res = await axios.get(`${ENDPOINTS.TOURS}/${id}`, {
          headers: {},
        });
        return hydrateTourDetailsWithListFields(res.data, id, false);
      }
      throw err;
    }
  }

  const res = await axios.get(`${ENDPOINTS.TOURS}/${id}`, {
    headers: token ? authHeader() : {},
  });
  return hydrateTourDetailsWithListFields(res.data, id, false);
};

export const getToursByGuide = async (guideId) => {
  const token = getToken();
  const res = await axios.get(`${ENDPOINTS.TOURS}/guide/${guideId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return Array.isArray(res.data) ? res.data : [];
};

export const getToursByPlace = async (placeId) => {
  const res = await axios.get(
    `${ENDPOINTS.DASHBOARD_TOUR}/by-place/${placeId}`,
    {
      headers: authHeader(),
    },
  );
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

const unwrapTourPayload = (raw) => {
  if (!raw || typeof raw !== "object") return raw;
  return raw.data ?? raw.Data ?? raw.tour ?? raw.Tour ?? raw.result ?? raw.Result ?? raw.value ?? raw.Value ?? raw;
};

const getTourId = (tour) => tour?.id ?? tour?.Id ?? tour?.tourId ?? tour?.TourId;

const getTourListMaxGroupSize = (tour) =>
  tour?.maxGroupSize ?? tour?.MaxGroupSize ?? null;

const hydrateTourDetailsWithListFields = async (rawTour, id, preferGuideList) => {
  const tour = unwrapTourPayload(rawTour);

  if (getTourListMaxGroupSize(tour) != null) {
    return rawTour;
  }

  const token = getToken();
  if (!token) return rawTour;

  try {
    const list = preferGuideList ? await getMyTours() : await getHomeTours();
    const matchingTour = list.find(
      (item) => String(getTourId(item)) === String(id)
    );
    const maxGroupSize = getTourListMaxGroupSize(matchingTour);

    if (maxGroupSize == null) {
      return rawTour;
    }

    return {
      ...rawTour,
      maxGroupSize,
      MaxGroupSize: maxGroupSize,
    };
  } catch {
    return rawTour;
  }
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

  const res = await axios.put(
    `${ENDPOINTS.DASHBOARD_TOUR}/edit/${id}`,
    formData,
    {
      headers: authHeader(),
    },
  );

  return res.data;
};

export const deleteTour = async (id) => {
  const res = await axios.delete(`${ENDPOINTS.DASHBOARD_TOUR}/${id}`, {
    headers: authHeader(),
  });
  return res.data;
};
