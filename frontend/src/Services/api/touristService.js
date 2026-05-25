import axios from "axios";
import { API_BASE } from "../../config/api";
import { authHeader, getToken } from "../utils/tokenUtils";

export const getTouristById = async (id) => {

  console.log("Sending tourist id:", id);

  try {

    if (!id || id === ":id") {
      throw new Error("A valid tourist id is required");
    }

    const headers = getToken() ? authHeader() : {};

    const response = await axios.get(
      `${API_BASE}/tourists/${encodeURIComponent(id)}/profile`,
      { headers }
    );

    return response.data;

  } catch (error) {
    console.error("Failed to load tourist:", error);
    throw error;
  }
};
