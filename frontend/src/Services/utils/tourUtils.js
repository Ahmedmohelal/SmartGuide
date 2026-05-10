import { API_BASE } from "../../config/api";

const API_ORIGIN = "https://smartguide.runasp.net";

const normalizeImageValue = (value) => {
  if (!value || typeof value !== "string") return "";
  const cleaned = value.replace(/\\/g, "/").trim();
  if (!cleaned) return "";
  if (
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://") ||
    cleaned.startsWith("data:") ||
    cleaned.startsWith("blob:")
  ) {
    return cleaned;
  }
  return cleaned.startsWith("/") ? `${API_ORIGIN}${cleaned}` : `${API_ORIGIN}/${cleaned}`;
};

export const extractTourImageUrl = (tour) => {
  const candidates = [
    tour?.primaryImage,
    tour?.PrimaryImage,
    tour?.imageUrl,
    tour?.image,
    tour?.coverImage,
    tour?.imagePath,
    tour?.thumbnail,
    Array.isArray(tour?.images) ? tour.images[0] : null,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const normalized = normalizeImageValue(candidate);
      if (normalized) return normalized;
    }

    if (candidate && typeof candidate === "object") {
      const nested =
        candidate.url ||
        candidate.path ||
        candidate.imageUrl ||
        candidate.src ||
        "";
      const normalizedNested = normalizeImageValue(nested);
      if (normalizedNested) return normalizedNested;
    }
  }

  return "";
};

export const extractTourDescription = (tour) =>
  tour?.description ||
  tour?.Description ||
  tour?.tourDescription ||
  tour?.TourDescription ||
  "";

export const extractTourMaxGroupSize = (tour) =>
  tour?.maxGroupSize ??
  tour?.MaxGroupSize ??
  tour?.maxTourists ??
  tour?.MaxTourists ??
  0;