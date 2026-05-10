import axios from "axios";
import { ENDPOINTS } from "../../config/api";
import { authHeader, getToken } from "../utils/tokenUtils";

export const getAllGuides = async () => {
  try {
    const headers = getToken() ? authHeader() : {};
    const response = await axios.get(ENDPOINTS.GUIDES, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to load guides:", error);
    throw error;
  }
};

export const getGuideById = async (id) => {
  try {
    const headers = getToken() ? authHeader() : {};
    const response = await axios.get(`${ENDPOINTS.GUIDES}/${id}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to load guide:", error);
    throw error;
  }
};
