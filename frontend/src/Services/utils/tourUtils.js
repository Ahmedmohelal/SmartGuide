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
  return extractTourImageUrls(tour)[0] || "";
};

export const extractTourImageUrls = (tour) => {
  const source = tour?.data ?? tour?.tour ?? tour?.result ?? tour;
  const candidates = [
    source?.images,
    source?.Images,
    source?.tourImages,
    source?.TourImages,
    source?.imageUrls,
    source?.ImageUrls,
    source?.photos,
    source?.Photos,
    source?.gallery,
    source?.Gallery,
    source?.primaryImage,
    source?.PrimaryImage,
    source?.imageUrl,
    source?.ImageUrl,
    source?.image,
    source?.Image,
    source?.coverImage,
    source?.CoverImage,
    source?.imagePath,
    source?.ImagePath,
    source?.thumbnail,
    source?.Thumbnail,
  ];
  const urls = [];

  const addCandidate = (candidate) => {
    if (Array.isArray(candidate)) {
      candidate.forEach(addCandidate);
      return;
    }

    if (typeof candidate === "string") {
      const normalized = normalizeImageValue(candidate);
      if (normalized) urls.push(normalized);
      return;
    }

    if (candidate && typeof candidate === "object") {
      const nested =
        candidate.url ||
        candidate.Url ||
        candidate.path ||
        candidate.Path ||
        candidate.imageUrl ||
        candidate.ImageUrl ||
        candidate.imagePath ||
        candidate.ImagePath ||
        candidate.filePath ||
        candidate.FilePath ||
        candidate.src ||
        candidate.Src ||
        "";
      const normalizedNested = normalizeImageValue(nested);
      if (normalizedNested) urls.push(normalizedNested);
    }
  };

  candidates.forEach(addCandidate);
  return [...new Set(urls)];
};

export const extractTourDescription = (tour) =>
  tour?.description ||
  tour?.Description ||
  tour?.tourDescription ||
  tour?.TourDescription ||
  "";

const positiveNumberLike = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? value : null;
};

export const extractTourMaxGroupSize = (tour) => {
  const source = tour?.data ?? tour?.tour ?? tour?.result ?? tour;
  const candidates = [
    source?.maxGroupSize,
    source?.MaxGroupSize,
    source?.maximumGroupSize,
    source?.MaximumGroupSize,
    source?.groupSize,
    source?.GroupSize,
    source?.maxGuests,
    source?.MaxGuests,
    source?.guestLimit,
    source?.GuestLimit,
    source?.capacity,
    source?.Capacity,
    source?.maxTourists,
    source?.MaxTourists,
    source?.numberOfTourists,
    source?.NumberOfTourists,
  ];

  return candidates.map(positiveNumberLike).find(Boolean) ?? 0;
};
