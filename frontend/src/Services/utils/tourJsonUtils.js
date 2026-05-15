import {
  extractTourDescription,
  extractTourImageUrls,
  extractTourMaxGroupSize,
} from "./tourUtils";

const pick = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && v !== "");

export const parseTourJsonField = (value) => {
  if (value == null) return null;
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t || t === "null") return null;
  try {
    const parsed = JSON.parse(t);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const firstNonEmptyArray = (tour, jsonKeys, arrayKeys) => {
  for (const k of jsonKeys) {
    const parsed = parseTourJsonField(tour?.[k]);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  }
  for (const k of arrayKeys) {
    const v = tour?.[k];
    if (Array.isArray(v) && v.length) return v;
  }
  return [];
};

const normalizeStop = (item) => {
  if (typeof item === "string") {
    return { title: item, description: "" };
  }
  if (!item || typeof item !== "object") {
    return { title: "", description: "" };
  }
  return {
    title: pick(
      item.title,
      item.Title,
      item.name,
      item.Name,
      item.stopTitle,
      item.StopTitle
    ),
    description: pick(
      item.description,
      item.Description,
      item.details,
      item.Details,
      item.subtitle,
      item.Subtitle
    ),
  };
};

const normalizeInclusionLabel = (item) => {
  if (typeof item === "string") return item.trim();
  if (!item || typeof item !== "object") return "";
  return pick(
    item.description,
    item.Description,
    item.text,
    item.Text,
    item.title,
    item.Title,
    item.name,
    item.Name
  );
};

const normalizeAddOn = (item) => {
  if (!item || typeof item !== "object") {
    return { title: "", price: 0 };
  }
  const title = pick(item.title, item.Title, item.name, item.Name) || "";
  const price = Number(
    pick(item.price, item.Price, item.amount, item.Amount) ?? 0
  );
  return { title, price: Number.isFinite(price) ? price : 0 };
};

/** Data for Tour Details (three columns). */
export const extractTourProgramSections = (tour) => {
  if (!tour) {
    return { stops: [], inclusions: [], addOns: [] };
  }

  const stopsRaw = firstNonEmptyArray(
    tour,
    ["stopsJson", "StopsJson"],
    ["stops", "Stops"]
  );
  const stops = stopsRaw.map(normalizeStop).filter((s) => s.title || s.description);

  const incRaw = firstNonEmptyArray(
    tour,
    ["inclusionsJson", "InclusionsJson"],
    ["inclusions", "Inclusions"]
  );
  const inclusions = incRaw
    .map(normalizeInclusionLabel)
    .filter(Boolean);

  const addRaw = firstNonEmptyArray(
    tour,
    ["addOnsJson", "AddOnsJson"],
    ["addOns", "AddOns"]
  );
  const addOns = addRaw.map(normalizeAddOn).filter((a) => a.title);

  return { stops, inclusions, addOns };
};

export const defaultTourExtras = () => ({
  programStops: [{ title: "", description: "" }],
  inclusionLines: [""],
  addOnRows: [{ title: "", price: "" }],
});

/** Shape for create/edit forms from an API tour object (keeps all API rows). */
export const tourExtrasFromTour = (tour) => {
  const stopsRaw = firstNonEmptyArray(
    tour,
    ["stopsJson", "StopsJson"],
    ["stops", "Stops"]
  );
  const incRaw = firstNonEmptyArray(
    tour,
    ["inclusionsJson", "InclusionsJson"],
    ["inclusions", "Inclusions"]
  );
  const addRaw = firstNonEmptyArray(
    tour,
    ["addOnsJson", "AddOnsJson"],
    ["addOns", "AddOns"]
  );

  const programStops =
    stopsRaw.length > 0
      ? stopsRaw.map((item) => {
          const s = normalizeStop(item);
          return {
            title: s.title || "",
            description: s.description || "",
          };
        })
      : [{ title: "", description: "" }];

  const inclusionLines =
    incRaw.length > 0
      ? incRaw.map((item) => normalizeInclusionLabel(item)).filter(Boolean)
      : [""];

  const addOnRows =
    addRaw.length > 0
      ? addRaw.map((item) => {
          const a = normalizeAddOn(item);
          return {
            title: a.title || "",
            price: a.price != null && a.price !== "" ? String(a.price) : "",
          };
        })
      : [{ title: "", price: "" }];

  return { programStops, inclusionLines, addOnRows };
};

export const unwrapTourPayload = (raw) => {
  if (!raw || typeof raw !== "object") return raw;
  return raw.data ?? raw.tour ?? raw.result ?? raw;
};

/** Build edit/create form state from list item or full GET /tour/{id} response. */
export const mapTourToEditForm = (rawTour, imageFiles = []) => {
  const tour = unwrapTourPayload(rawTour);

  // Extract existing image URLs from tour
  const existingImageUrls = extractTourImageUrls(tour);

  return {
    title: pick(tour?.title, tour?.Title) || "",
    description: extractTourDescription(tour),
    price: tour?.price ?? tour?.Price ?? "",
    durationHours: tour?.durationHours ?? tour?.DurationHours ?? "",
    maxGroupSize: extractTourMaxGroupSize(tour),
    ...tourExtrasFromTour(tour),
    imageFiles,
    existingImageUrls,
    imageFile: imageFiles[0] ?? null,
  };
};

/** API expects PascalCase inside JSON strings (matches Postman / Swagger). */
export const serializeTourExtras = ({
  programStops = [],
  inclusionLines = [],
  addOnRows = [],
}) => {
  const stops = programStops
    .filter(
      (s) => (s.title || "").trim() || (s.description || "").trim()
    )
    .map((s) => ({
      Title: (s.title || "").trim(),
      Description: (s.description || "").trim(),
    }));

  const inclusions = inclusionLines
    .map((line) => (typeof line === "string" ? line.trim() : ""))
    .filter(Boolean)
    .map((description) => ({
      Description: description,
      Type: "Included",
    }));

  const addOns = addOnRows
    .filter((a) => (a.title || "").trim())
    .map((a) => ({
      Title: (a.title || "").trim(),
      Price: Number(a.price) || 0,
    }));

  return {
    stopsJson: JSON.stringify(stops),
    inclusionsJson: JSON.stringify(inclusions),
    addOnsJson: JSON.stringify(addOns),
  };
};
