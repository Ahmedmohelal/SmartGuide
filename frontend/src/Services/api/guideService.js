import axios from "axios";
import { ENDPOINTS, API_BASE } from "../../config/api";
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
    const response = await axios.get(`${ENDPOINTS.GUIDES}/${id}/profile`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to load guide:", error);
    throw error;
  }
};

export const updateGuideProfile = async (id, data) => {
  try {
    const response = await axios.put(`${ENDPOINTS.GUIDES}/${id}/profile`, data, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update guide profile:", error);
    throw error;
  }
};

export const getGuideDashboard = async (months = 6, topTours = 5) => {
  try {

    console.log("TOKEN:", getToken());
    console.log("HEADERS:", authHeader());

    const response = await axios.get(`${API_BASE}/guide/dashboard`, {
      headers: authHeader(),
      params: { months, topTours },
    });

    console.log("DASHBOARD RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.log("FULL ERROR:", error.response);
    console.log("ERROR DATA:", error.response?.data);
    throw error;
  }
};

export const getGuideDashboardDocuments = async () => {
  try {
    const response = await axios.get(ENDPOINTS.DASHBOARD_DOCUMENTS, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to load dashboard documents:", error);
    throw error;
  }
};