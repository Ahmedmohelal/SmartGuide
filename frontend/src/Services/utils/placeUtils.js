const convertWikiFileUrl = (url) => {
  if (!url) return url;
  try {
    const parsedUrl = new URL(url);
    const wikiFileMatch = parsedUrl.pathname.match(/\/wiki\/File:(.+)$/i);
    if (wikiFileMatch) {
      return `${parsedUrl.origin}/wiki/Special:FilePath/${wikiFileMatch[1]}`;
    }
  } catch (e) {
    return url;
  }
  return url;
};

export const getPlaceImage = (place) => {
  const url = place?.imageUrl || place?.ImageUrl || place?.image || place?.coverImage || "";
  const convertedUrl = convertWikiFileUrl(url);
  return convertedUrl || "https://images.unsplash.com/photo-1539768942893-daf53e449371?auto=format&fit=crop&w=800&q=80";
};

export const getPlaceRating = (place) =>
  Number(place?.rating ?? place?.averageRating ?? 0);

export const getPlaceTitle = (place) => place?.name || place?.title || "Untitled Place";
export const getPlaceDescription = (place) => place?.description || place?.desc || "";
export const getPlaceCity = (place) => place?.city || place?.location || "Egypt";
