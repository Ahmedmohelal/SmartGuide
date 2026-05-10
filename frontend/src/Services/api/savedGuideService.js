import axios from "axios";
import { ENDPOINTS } from "../../config/api";
import { authHeader, getToken } from "../utils/tokenUtils";

const requireAuth = () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }
};

export const getSavedGuides = async () => {
  requireAuth();

  try {
    const response = await axios.get(
      ENDPOINTS.TOURIST_SAVED_GUIDES,
      {
        headers: authHeader(),
      }
    );

    return response.data;
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
      {
        guideId: String(guideId),
      },
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
    const response = await axios.delete(
      `${ENDPOINTS.TOURIST_SAVED_GUIDES}/${guideId}`,
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
