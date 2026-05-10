import axios from "axios";
import { ENDPOINTS } from "../../config/api";
import { authHeader, getToken } from "../utils/tokenUtils";

const requireAuth = () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }
};

export const getSavedPlaces = async () => {
  requireAuth();

  try {
    const response = await axios.get(
      ENDPOINTS.SAVED_PLACES,
      {
        headers: authHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to get saved places:", error);
    throw error;
  }
};

export const savePlace = async (placeId) => {
  requireAuth();

  try {
    const response = await axios.post(
      ENDPOINTS.SAVED_PLACES,
      {
        placeId: Number(placeId),
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
    console.error("Failed to save place:", error);
    throw error;
  }
};

export const deleteSavedPlace = async (placeId) => {
  requireAuth();

  try {
    const response = await axios.delete(
      `${ENDPOINTS.SAVED_PLACES}/${placeId}`,
      {
        headers: authHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to delete saved place:", error);
    throw error;
  }
};