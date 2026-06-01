import axios from "axios";
import { ENDPOINTS } from "../config/api";
import { persistAuthFromResponse } from "../utils/tokenUtils";

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  const { data } = await axios.post(`${ENDPOINTS.AUTH}/refreshtoken`, {
    refreshToken,
  });
  persistAuthFromResponse(data);
  return data.token;
}
