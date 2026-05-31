import axios from "axios";
import { ENDPOINTS } from "../../config/api";
import { authHeader, getToken } from "../utils/tokenUtils";

export const getAllPlaces = async (params = {}) => {
  const headers = getToken() ? authHeader() : {};

  const response = await axios.get(ENDPOINTS.PLACES, {
    params,
    headers,
  });

  return response.data;
};

export const getPlaceById = async (id) => {
  const headers = getToken() ? authHeader() : {};

  const response = await axios.get(
    `${ENDPOINTS.PLACES}/${id}`,
    { headers }
  );

  return response.data;
};

export const getTopRatedPlaces = async (limit = 5) => {
  const headers = getToken() ? authHeader() : {};

  const response = await axios.get(
    ENDPOINTS.PLACES,
    {
      params: {
        pageSize: limit,
        sortBy: "averageRating",
        sortOrder: "desc",
      },
      headers,
    }
  );

  return response.data;
};

/* NEW */

export const ratePlace = async (placeId, rating, review = "") => {
  const headers = authHeader();

  const response = await axios.post(
    `${ENDPOINTS.PLACES}/${placeId}/rate`,
    {
      rating,
      review,
    },
    { headers }
  );

  return response.data;
};