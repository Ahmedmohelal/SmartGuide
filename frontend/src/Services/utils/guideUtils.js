import { API_BASE } from "../../config/api";

const API_ORIGIN = API_BASE.replace(/\/api\/?$/i, "");

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

export const getGuideName = (guide) => {
  if (guide?.firstName && guide?.lastName) {
    return `${guide.firstName} ${guide.lastName}`;
  }
  if (guide?.FirstName && guide?.LastName) {
    return `${guide.FirstName} ${guide.LastName}`;
  }
  return (
    guide?.name ||
    guide?.Name ||
    guide?.fullName ||
    guide?.FullName ||
    guide?.userName ||
    guide?.UserName ||
    "Unknown Guide"
  );
};

export const getGuideImage = (guide) => {
  const candidates = [
    guide?.profilePicture,
    guide?.ProfilePicture,
    guide?.profilePictureUrl,
    guide?.ProfilePictureUrl,
    guide?.profileImage,
    guide?.ProfileImage,
    guide?.profileImageUrl,
    guide?.ProfileImageUrl,
    guide?.guideImage,
    guide?.GuideImage,
    guide?.guideImageUrl,
    guide?.GuideImageUrl,
    guide?.imageUrl,
    guide?.ImageUrl,
    guide?.photoUrl,
    guide?.PhotoUrl,
    guide?.avatarUrl,
    guide?.AvatarUrl,
    guide?.image,
    guide?.Image,
    guide?.picture,
    guide?.Picture,
    guide?.user?.profilePicture,
    guide?.user?.ProfilePicture,
    guide?.User?.profilePicture,
    guide?.User?.ProfilePicture,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeImageValue(candidate);
    if (normalized) return normalized;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    getGuideName(guide)
  )}&background=0D9488&color=fff`;
};

export const hasGuideImage = (guide) =>
  !getGuideImage(guide).includes("ui-avatars.com");

export const getGuideRating = (guide) =>
  guide?.rating || guide?.averageRating || guide?.AverageRating || "N/A";

export const getGuideCity = (guide) =>
  guide?.city || guide?.City || guide?.location || guide?.Location || "Egypt";
