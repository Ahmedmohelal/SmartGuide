import axios from "axios";
import { ENDPOINTS } from "../../config/api";
import { authHeader, getToken } from "../utils/tokenUtils";
import { getGuideById } from "./guideService";

const requireAuth = () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }
};

const extractSavedGuidesList = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.Data)) return data.Data;
  if (Array.isArray(data.savedGuides)) return data.savedGuides;
  if (Array.isArray(data.SavedGuides)) return data.SavedGuides;
  return [];
};

const pickGuideId = (item) => {
  if (item == null || typeof item !== "object") return null;
  return (
    item.guideId ??
    item.GuideId ??
    item.guide?.id ??
    item.guide?.Id ??
    item.id ??
    item.Id ??
    null
  );
};

const lacksDisplayFields = (g) =>
  !(
    g.firstName ||
    g.FirstName ||
    g.name ||
    g.Name ||
    g.userName ||
    g.UserName
  );

/** Merge API row with optional nested guide payload; always set id / guideId as strings. */
const normalizeSavedGuideEntry = (item) => {
  const id = pickGuideId(item);
  if (id == null || id === "") return null;
  const sid = String(id);
  const nested = item.guide || item.Guide || item.profile || item.Profile || {};
  return {
    ...item,
    ...nested,
    guideId: sid,
    id: sid,
  };
};

const hydrateSavedGuides = async (entries) => {
  if (!entries.some(lacksDisplayFields)) return entries;

  return Promise.all(
    entries.map(async (g) => {
      if (!lacksDisplayFields(g)) return g;
      try {
        const raw = await getGuideById(g.guideId);
        const profile = raw?.data ?? raw;
        return { ...g, ...profile, guideId: g.guideId, id: g.id };
      } catch {
        return g;
      }
    })
  );
};

export const getSavedGuides = async () => {
  requireAuth();

  try {
    const response = await axios.get(ENDPOINTS.TOURIST_SAVED_GUIDES, {
      headers: authHeader(),
    });

    const list = extractSavedGuidesList(response.data);
    const normalized = list
      .map(normalizeSavedGuideEntry)
      .filter(Boolean);

    return hydrateSavedGuides(normalized);
  } catch (error) {
    console.error("Failed to get saved guides:", error);
    throw error;
  }
};

export const saveGuide = async (guideId) => {
  requireAuth();

  try {
    const response = await axios.post(
      ENDPOINTS.TOURIST_SAVED_GUIDES,
      { guideId: String(guideId) },
      {
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to save guide:", error);
    throw error;
  }
};

export const deleteSavedGuide = async (guideId) => {
  requireAuth();

  try {
    const encodedId = encodeURIComponent(String(guideId));
    const response = await axios.delete(
      `${ENDPOINTS.TOURIST_SAVED_GUIDES}/${encodedId}`,
      {
        headers: authHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to delete saved guide:", error);
    throw error;
  }
};
