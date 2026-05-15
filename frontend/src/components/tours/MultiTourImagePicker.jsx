import { useEffect, useMemo } from "react";
import { ImagePlus, X } from "lucide-react";

export default function MultiTourImagePicker({
  files = [],
  existingImageUrls = [],
  onChange,
  label = "Tour images",
  hint = "Choose multiple images",
}) {
  const previews = useMemo(
    () => [
      // Existing image URLs
      ...existingImageUrls.map((url) => ({
        url,
        isExisting: true,
      })),
      // New file uploads
      ...files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        isExisting: false,
      })),
    ],
    [files, existingImageUrls]
  );

  useEffect(
    () => () => {
      previews.forEach((preview) => {
        if (!preview.isExisting) {
          URL.revokeObjectURL(preview.url);
        }
      });
    },
    [previews]
  );

  const removeFile = (indexToRemove) => {
    const newFilesCount = files.length;
    const existingFilesCount = existingImageUrls.length;
    
    if (indexToRemove < existingFilesCount) {
      // Remove from existing images
      onChange(files, existingImageUrls.filter((_, i) => i !== indexToRemove - 0));
    } else {
      // Remove from new files
      const fileIndex = indexToRemove - existingFilesCount;
      onChange(files.filter((_, i) => i !== fileIndex), existingImageUrls);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-egypt-teal">
          <ImagePlus size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="text-xs text-gray-500">
            {previews.length > 0
              ? `${previews.length} image${previews.length === 1 ? "" : "s"}`
              : "Select 2 or more images for the tour slider"}
          </p>
        </div>

        <label className="cursor-pointer rounded-lg bg-egypt-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">
          {hint}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => onChange([...files, ...Array.from(event.target.files || [])], existingImageUrls)}
          />
        </label>
      </div>

      {previews.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {previews.map((preview, index) => (
            <div
              key={`${preview.isExisting ? "existing" : "file"}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-white bg-white shadow-sm"
            >
              <img
                src={preview.url}
                alt={preview.isExisting ? "Existing tour image" : preview.file?.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute right-1 top-1 hidden h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white transition group-hover:flex"
                aria-label="Remove image"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
