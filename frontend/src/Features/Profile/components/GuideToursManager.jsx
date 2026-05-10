import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  AlertTriangle,
  CalendarClock,
  Pencil,
  Image as ImageIcon,
  PlusCircle,
  Ticket,
  Trash2,
  Users,
} from "lucide-react";
import {
  createTour,
  deleteTour,
  getMyTours,
  updateTour,
} from "../../../Services/api/tours";
import {
  extractTourDescription,
  extractTourImageUrl,
  extractTourMaxGroupSize,
} from "../../../Services/utils/tourUtils";

const initialState = {
  title: "",
  description: "",
  price: "",
  durationHours: "",
  maxGroupSize: "",

  // optional
  stopsJson: "[]",
  inclusionsJson: "[]",
  addOnsJson: "[]",

  imageFile: null,
};

export default function CreateTour() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState([]);
  const [toursLoading, setToursLoading] = useState(true);
  const [editingTourId, setEditingTourId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [pendingDeleteTour, setPendingDeleteTour] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    durationHours: "",
    maxGroupSize: "",
    stopsJson: "[]",
    inclusionsJson: "[]",
    addOnsJson: "[]",
    imageFile: null,
  });

  const fetchMyTours = async () => {
    try {
      const data = await getMyTours();
      setTours(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch guide tours:", error);
      toast.error("Couldn't load your tours.");
    } finally {
      setToursLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTours();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation (required fields only)
    if (
      !form.title ||
      !form.description ||
      !form.price ||
      !form.durationHours ||
      !form.maxGroupSize
    ) {
      toast.error("Please fill required fields");
      return;
    }

    setLoading(true);

    try {
      await createTour(form);
      toast.success("Tour created successfully!");
      setForm(initialState);
      await fetchMyTours();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      if (import.meta.env.DEV) {
        console.log("ERROR FULL:", err.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const getTourImage = (tour) =>
    extractTourImageUrl(tour) ||
    "https://images.unsplash.com/photo-1493244040629-496f6d136cc3?auto=format&fit=crop&w=900&q=80";

  const getTourId = (tour) => tour?.id || tour?.tourId;
  const getTourTitle = (tour) => tour?.title || tour?.Title || "";
  const getTourDurationHours = (tour) =>
    tour?.durationHours ?? tour?.DurationHours ?? 0;

  const openEditForm = (tour) => {
    setEditingTourId(getTourId(tour));
    setEditForm({
      title: getTourTitle(tour),
      description: extractTourDescription(tour),
      price: tour?.price ?? "",
      durationHours: getTourDurationHours(tour),
      maxGroupSize: extractTourMaxGroupSize(tour),
      stopsJson: tour?.stopsJson || "[]",
      inclusionsJson: tour?.inclusionsJson || "[]",
      addOnsJson: tour?.addOnsJson || "[]",
      imageFile: null,
    });
  };

  const closeEditForm = () => {
    setEditingTourId(null);
    setEditForm({
      title: "",
      description: "",
      price: "",
      durationHours: "",
      maxGroupSize: "",
      stopsJson: "[]",
      inclusionsJson: "[]",
      addOnsJson: "[]",
      imageFile: null,
    });
  };

  const handleEditChange = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdateTour = async (e) => {
    e.preventDefault();
    if (!editingTourId) return;

    if (
      !editForm.title ||
      !editForm.description ||
      !editForm.price ||
      !editForm.durationHours ||
      !editForm.maxGroupSize
    ) {
      toast.error("Please fill required fields");
      return;
    }

    setEditLoading(true);
    try {
      await updateTour(editingTourId, editForm);
      toast.success("Tour updated successfully!");
      closeEditForm();
      await fetchMyTours();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update tour");
      console.error("Update error:", error);
    } finally {
      setEditLoading(false);
    }
  };

  const requestDeleteTour = (tour) => {
    setPendingDeleteTour(tour);
  };

  const cancelDeleteTour = () => {
    setPendingDeleteTour(null);
  };

  const handleDeleteTour = async () => {
    const tour = pendingDeleteTour;
    const id = getTourId(tour);
    if (!id) {
      toast.error("Invalid tour id");
      setPendingDeleteTour(null);
      return;
    }

    setDeleteLoadingId(id);
    try {
      await deleteTour(id);
      toast.success("Tour deleted successfully");
      if (editingTourId === id) closeEditForm();
      await fetchMyTours();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete tour");
      console.error("Delete error:", error);
    } finally {
      setPendingDeleteTour(null);
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-2 mb-5">
          <PlusCircle size={20} className="text-egypt-teal" />
          <h3 className="text-lg font-bold text-gray-900">Create New Tour</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
            placeholder="Title *"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <textarea
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none min-h-[96px] resize-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
            placeholder="Description *"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
              type="number"
              placeholder="Price *"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
              type="number"
              placeholder="Duration Hours *"
              value={form.durationHours}
              onChange={(e) => handleChange("durationHours", e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
              type="number"
              placeholder="Max Group Size *"
              value={form.maxGroupSize}
              onChange={(e) => handleChange("maxGroupSize", e.target.value)}
            />
          </div>

          <details className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700">
              Advanced options (JSON)
            </summary>
            <div className="mt-3 space-y-3">
              <textarea
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none min-h-[80px] resize-y bg-white focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                placeholder="Stops JSON (optional)"
                value={form.stopsJson}
                onChange={(e) => handleChange("stopsJson", e.target.value)}
              />
              <textarea
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none min-h-[80px] resize-y bg-white focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                placeholder="Inclusions JSON (optional)"
                value={form.inclusionsJson}
                onChange={(e) => handleChange("inclusionsJson", e.target.value)}
              />
              <textarea
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none min-h-[80px] resize-y bg-white focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                placeholder="AddOns JSON (optional)"
                value={form.addOnsJson}
                onChange={(e) => handleChange("addOnsJson", e.target.value)}
              />
            </div>
          </details>

          <label className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 bg-gray-50">
            <ImageIcon size={16} />
            <span className="font-medium">Upload tour image</span>
            <input
              type="file"
              accept="image/*"
              className="ml-auto text-xs"
              onChange={(e) => handleChange("imageFile", e.target.files?.[0])}
            />
          </label>

          <button
            disabled={loading}
            className="w-full md:w-auto px-6 py-2.5 rounded-xl font-semibold text-white bg-egypt-teal hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating..." : "Create Tour"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Your Created Tours
        </h3>

        {toursLoading ? (
          <p className="text-sm text-gray-500">Loading tours...</p>
        ) : tours.length === 0 ? (
          <p className="text-sm text-gray-500">
            You don&apos;t have tours yet. Create your first one above.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tours.map((tour) => (
              <div
                key={getTourId(tour) || tour.title}
                className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white"
              >
                <img
                  src={getTourImage(tour)}
                  alt={getTourTitle(tour) || "Tour"}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <h4 className="font-bold text-gray-900 line-clamp-1">
                    {getTourTitle(tour) || "Untitled tour"}
                  </h4>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2 min-h-[40px]">
                    {tour.description ||
                      tour.Description ||
                      "No description provided."}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Ticket size={14} className="text-egypt-teal" />
                      <span>{tour.price ?? 0} EGP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarClock size={14} className="text-egypt-teal" />
                      <span>{getTourDurationHours(tour)}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} className="text-egypt-teal" />
                      <span>{tour.maxGroupSize ?? tour.MaxGroupSize ?? 0}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(tour)}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteTour(tour)}
                      disabled={deleteLoadingId === getTourId(tour)}
                      className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 transition"
                    >
                      <Trash2 size={14} />
                      {deleteLoadingId === getTourId(tour)
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingTourId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Tour</h3>
            <form onSubmit={handleUpdateTour} className="space-y-3">
              <input
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                placeholder="Title *"
                value={editForm.title}
                onChange={(e) => handleEditChange("title", e.target.value)}
              />
              <textarea
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none min-h-[96px] resize-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                placeholder="Description *"
                value={editForm.description}
                onChange={(e) =>
                  handleEditChange("description", e.target.value)
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                  type="number"
                  placeholder="Price *"
                  value={editForm.price}
                  onChange={(e) => handleEditChange("price", e.target.value)}
                />
                <input
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                  type="number"
                  placeholder="Duration Hours *"
                  value={editForm.durationHours}
                  onChange={(e) =>
                    handleEditChange("durationHours", e.target.value)
                  }
                />
                <input
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                  type="number"
                  placeholder="Max Group Size *"
                  value={editForm.maxGroupSize}
                  onChange={(e) =>
                    handleEditChange("maxGroupSize", e.target.value)
                  }
                />
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 bg-gray-50">
                <ImageIcon size={16} />
                <span className="font-medium">Change image (optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="ml-auto text-xs"
                  onChange={(e) =>
                    handleEditChange("imageFile", e.target.files?.[0] || null)
                  }
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditForm}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-lg bg-egypt-teal text-white font-semibold hover:bg-teal-700 disabled:bg-gray-400 transition"
                >
                  {editLoading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDeleteTour && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-2 rounded-xl bg-red-100 text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Delete Tour</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-800">
                    {getTourTitle(pendingDeleteTour) || "this tour"}
                  </span>
                  ? This action can&apos;t be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={cancelDeleteTour}
                disabled={deleteLoadingId === getTourId(pendingDeleteTour)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTour}
                disabled={deleteLoadingId === getTourId(pendingDeleteTour)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:bg-red-400 transition"
              >
                {deleteLoadingId === getTourId(pendingDeleteTour)
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
