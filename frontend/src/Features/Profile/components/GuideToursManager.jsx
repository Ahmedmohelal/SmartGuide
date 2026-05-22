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
  getTourById,
  updateTour,
} from "../../../Services/api/tours";
import {
  extractTourImageUrl,
} from "../../../Services/utils/tourUtils";
import {
  defaultTourExtras,
  mapTourToEditForm,
  serializeTourExtras,
} from "../../../Services/utils/tourJsonUtils";
import TourExtrasFormSection from "../../../components/tours/TourExtrasFormSection";

const createInitialState = () => ({
  title: "",
  description: "",
  price: "",
  durationHours: "",
  maxGroupSize: "",
  ...defaultTourExtras(),
  imageFiles: [],
});

export default function CreateTour() {
  const [form, setForm] = useState(() => createInitialState());
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState([]);
  const [toursLoading, setToursLoading] = useState(true);
  const [editingTourId, setEditingTourId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [pendingDeleteTour, setPendingDeleteTour] = useState(null);
  const [editForm, setEditForm] = useState(() => createInitialState());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);

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

  const validateStep1 = () => {
    if (
      !form.title ||
      !form.description ||
      !form.price ||
      !form.durationHours ||
      !form.maxGroupSize
    ) {
      toast.error("Please fill all required fields in this step");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    // Step 2 doesn't require mandatory validation, user can skip
    return true;
  };

  const validateStep3 = () => {
    // Step 3 is optional (images)
    return true;
  };

  const handleNextStep = () => {
    if (createStep === 1 && !validateStep1()) return;
    if (createStep === 2 && !validateStep2()) return;
    if (createStep < 3) {
      setCreateStep(createStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (createStep > 1) {
      setCreateStep(createStep - 1);
    }
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateStep(1);
    setForm(createInitialState());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return;
    }

    setLoading(true);

    try {
      const { programStops, inclusionLines, addOnRows, ...rest } = form;
      const extras = serializeTourExtras({
        programStops,
        inclusionLines,
        addOnRows,
      });
      await createTour({ ...rest, ...extras });
      toast.success("Tour created successfully!");
      closeCreateModal();
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

  const openEditForm = async (tour) => {
    const id = getTourId(tour);
    if (!id) {
      toast.error("Invalid tour id");
      return;
    }

    setEditingTourId(id);
    setEditFormLoading(true);

    try {
      const full = await getTourById(id);
      setEditForm(mapTourToEditForm(full, []));
    } catch (err) {
      console.error("Failed to load tour for edit:", err);
      setEditForm(mapTourToEditForm(tour, []));
      toast.error("Could not load full tour details");
    } finally {
      setEditFormLoading(false);
    }
  };

  const closeEditForm = () => {
    setEditingTourId(null);
    setEditForm(createInitialState());
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
      const { programStops, inclusionLines, addOnRows, ...rest } = editForm;
      const extras = serializeTourExtras({
        programStops,
        inclusionLines,
        addOnRows,
      });
      await updateTour(editingTourId, { ...rest, ...extras });
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
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">Create New Tour</h3>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-egypt-teal hover:bg-teal-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300 active:scale-95"
        >
          <PlusCircle size={20} />
          Create Tour
        </button>
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

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {createStep === 1 && "Basic Information"}
                {createStep === 2 && "Tour Program"}
                {createStep === 3 && "Tour Images"}
              </h3>
              <div className="text-sm text-gray-500 font-medium">
                Step {createStep} of 3
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex-1 flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step < createStep
                        ? "bg-egypt-teal text-white"
                        : step === createStep
                          ? "bg-egypt-teal text-white ring-2 ring-egypt-teal/50"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step < createStep ? "✓" : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all ${
                        step < createStep ? "bg-egypt-teal" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Information */}
            {createStep === 1 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNextStep();
                }}
                className="space-y-4"
              >
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
                    onChange={(e) =>
                      handleChange("durationHours", e.target.value)
                    }
                  />
                  <input
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-egypt-teal/30 focus:border-egypt-teal"
                    type="number"
                    placeholder="Max Group Size *"
                    value={form.maxGroupSize}
                    onChange={(e) =>
                      handleChange("maxGroupSize", e.target.value)
                    }
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-egypt-teal text-white font-semibold hover:bg-teal-700 transition"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Tour Program */}
            {createStep === 2 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNextStep();
                }}
                className="space-y-4"
              >
                <TourExtrasFormSection
                  programStops={form.programStops}
                  onChangeProgramStops={(programStops) =>
                    setForm((prev) => ({ ...prev, programStops }))
                  }
                  inclusionLines={form.inclusionLines}
                  onChangeInclusionLines={(inclusionLines) =>
                    setForm((prev) => ({ ...prev, inclusionLines }))
                  }
                  addOnRows={form.addOnRows}
                  onChangeAddOnRows={(addOnRows) =>
                    setForm((prev) => ({ ...prev, addOnRows }))
                  }
                />

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-egypt-teal text-white font-semibold hover:bg-teal-700 transition"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Tour Images */}
            {createStep === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
                  <ImageIcon size={24} className="text-egypt-teal" />
                  <div>
                    <span className="font-medium block">
                      Upload tour images
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      handleChange(
                        "imageFiles",
                        Array.from(e.target.files || []),
                      )
                    }
                  />
                </label>

                {form.imageFiles.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Selected images: {form.imageFiles.length}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {form.imageFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-600"
                        >
                          {file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-egypt-teal text-white font-semibold hover:bg-teal-700 disabled:bg-gray-400 transition"
                  >
                    {loading ? "Creating..." : "Create Tour"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {editingTourId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Tour</h3>
            {editFormLoading ? (
              <p className="py-12 text-center text-sm text-slate-500">
                Loading tour details…
              </p>
            ) : (
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

                <TourExtrasFormSection
                  programStops={editForm.programStops}
                  onChangeProgramStops={(programStops) =>
                    setEditForm((prev) => ({ ...prev, programStops }))
                  }
                  inclusionLines={editForm.inclusionLines}
                  onChangeInclusionLines={(inclusionLines) =>
                    setEditForm((prev) => ({ ...prev, inclusionLines }))
                  }
                  addOnRows={editForm.addOnRows}
                  onChangeAddOnRows={(addOnRows) =>
                    setEditForm((prev) => ({ ...prev, addOnRows }))
                  }
                />

                <label className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 bg-gray-50">
                  <ImageIcon size={16} />
                  <span className="font-medium">Change image (optional)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="ml-auto text-xs"
                    onChange={(e) =>
                      handleEditChange(
                        "imageFiles",
                        Array.from(e.target.files || []),
                      )
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
            )}
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
