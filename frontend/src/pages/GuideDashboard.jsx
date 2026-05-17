import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getGuideDashboard, getGuideDashboardDocuments } from "../Services/api/guideService";
import {
  createTour,
  deleteTour,
  getMyTours,
  getTourById,
  updateTour,
} from "../Services/api/tours";
import {
  extractTourDescription,
  extractTourImageUrl,
  extractTourMaxGroupSize,
} from "../Services/utils/tourUtils";
import {
  defaultTourExtras,
  mapTourToEditForm,
  serializeTourExtras,
} from "../Services/utils/tourJsonUtils";
import TourExtrasFormSection from "../components/tours/TourExtrasFormSection";
import {
  AlertTriangle,
  CalendarClock,
  DollarSign,
  MapPin,
  Pencil,
  Image as ImageIcon,
  PlusCircle,
  Ticket,
  Trash2,
  Users,
  TrendingUp,
} from "lucide-react";

const createInitialState = () => ({
  title: "",
  description: "",
  price: "",
  durationHours: "",
  maxGroupSize: "",
  ...defaultTourExtras(),
  imageFile: null,
});

export default function GuideDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState(null);
  const [activeDocument, setActiveDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(() => createInitialState());
  const [formLoading, setFormLoading] = useState(false);
  const [tours, setTours] = useState([]);
  const [toursLoading, setToursLoading] = useState(true);
  const [editingTourId, setEditingTourId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [pendingDeleteTour, setPendingDeleteTour] = useState(null);
  const [editForm, setEditForm] = useState(() => createInitialState());

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await getGuideDashboard(6, 5);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardDocuments = async () => {
    try {
      setDocsLoading(true);
      const data = await getGuideDashboardDocuments();
      setDocuments(data);
      setDocsError(null);
    } catch (err) {
      setDocsError("Failed to load verification documents");
      console.error(err);
    } finally {
      setDocsLoading(false);
    }
  };

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

  const scrollToVerificationDocs = () => {
    document.getElementById("verification-docs")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    fetchDashboard();
    fetchDashboardDocuments();
    fetchMyTours();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    setFormLoading(true);

    try {
      const { programStops, inclusionLines, addOnRows, ...rest } = form;
      const extras = serializeTourExtras({
        programStops,
        inclusionLines,
        addOnRows,
      });
      await createTour({ ...rest, ...extras });
      toast.success("Tour created successfully!");
      setForm(createInitialState());
      await fetchMyTours();
      await fetchDashboard();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      if (import.meta.env.DEV) {
        console.log("ERROR FULL:", err.response?.data);
      }
    } finally {
      setFormLoading(false);
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
      await fetchDashboard();
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
      await fetchDashboard();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete tour");
      console.error("Delete error:", error);
    } finally {
      setPendingDeleteTour(null);
      setDeleteLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-egypt-teal border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Tours",
      value: dashboardData?.statistics?.totalTours || 0,
      icon: MapPin,
      color: "bg-teal-50 text-teal-900",
      iconColor: "text-egypt-teal",
    },
    {
      label: "Active Tours",
      value: dashboardData?.statistics?.activeTours || 0,
      icon: CalendarClock,
      color: "bg-blue-50 text-blue-900",
      iconColor: "text-blue-600",
    },
    {
      label: "Total Earnings",
      value: `${dashboardData?.statistics?.totalEarnings || 0} EGP`,
      icon: DollarSign,
      color: "bg-green-50 text-green-900",
      iconColor: "text-green-600",
    },
    {
      label: "Wallet Balance",
      value:
        dashboardData?.statistics?.walletBalance ??
        dashboardData?.walletBalance ??
        0,
      icon: DollarSign,
      color: "bg-purple-50 text-purple-900",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Guide Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Overview of your tours and performance
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToVerificationDocs}
            className="inline-flex items-center justify-center rounded-xl bg-egypt-teal px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            View verification documents
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.color}`}>
                      <Icon size={24} className={stat.iconColor} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Verification Documents */}
        <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Verification Documents
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                View the ID and license images you uploaded for verification.
              </p>
            </div>
            {documents?.verificationStatus && (
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  documents.verificationStatus === "Verified"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {documents.verificationStatus}
              </span>
            )}
          </div>

          {docsLoading ? (
            <p className="text-sm text-slate-500">Loading verification images...</p>
          ) : docsError ? (
            <p className="text-sm text-red-600">{docsError}</p>
          ) : documents ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                <img
                  src={documents.nationalIdImageUrl}
                  alt="National ID"
                  className="h-72 w-full object-cover"
                />
                <div className="space-y-2 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    National ID
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDocument({
                          title: "National ID",
                          url: documents.nationalIdImageUrl,
                        })
                      }
                      className="rounded-lg bg-egypt-teal px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
                    >
                      View image
                    </button>
                    <a
                      href={documents.nationalIdImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-egypt-teal hover:underline"
                    >
                      Open full image
                    </a>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                <img
                  src={documents.licenseImageUrl}
                  alt="License"
                  className="h-72 w-full object-cover"
                />
                <div className="space-y-2 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    License
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDocument({
                          title: "License",
                          url: documents.licenseImageUrl,
                        })
                      }
                      className="rounded-lg bg-egypt-teal px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
                    >
                      View image
                    </button>
                    <a
                      href={documents.licenseImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-egypt-teal hover:underline"
                    >
                      Open full image
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No verification documents available.
            </p>
          )}
        </div>

        {/* Monthly Earnings Chart */}
        <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Monthly Earnings
            </h2>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <TrendingUp size={16} className="text-egypt-teal" />
              Last 6 months
            </div>
          </div>

          {dashboardData?.monthlyEarnings &&
          dashboardData.monthlyEarnings.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.monthlyEarnings.map((item, index) => (
                <div key={item.month || index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {item.month}
                    </span>

                    <span className="font-bold text-slate-900">
                      {item.earnings || 0} EGP
                    </span>
                  </div>

                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-egypt-teal transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          ((item.earnings || 0) /
                            Math.max(
                              ...dashboardData.monthlyEarnings.map(
                                (m) => m.earnings || 0,
                              ),
                              1,
                            )) *
                            100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">
              No earnings data available
            </p>
          )}
        </div>

        {/* Top Tours */}
        <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Top Tours</h2>

          {dashboardData?.mostPopularTours &&
          dashboardData.mostPopularTours.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-left text-sm font-semibold text-slate-700">
                      Tour Name
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-slate-700">
                      Bookings
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-slate-700">
                      Revenue
                    </th>
                    <th className="pb-3 text-left text-sm font-semibold text-slate-700">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.mostPopularTours.map((tour, index) => (
                    <tr
                      key={tour.id || index}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="py-4 text-sm font-medium text-slate-900">
                        {tour.title || tour.Title || "Untitled Tour"}
                      </td>
                      <td className="py-4 text-sm text-slate-600">
                        {tour.bookings || 0}
                      </td>
                      <td className="py-4 text-sm font-semibold text-slate-900">
                        {tour.revenue || 0} EGP
                      </td>
                      <td className="py-4 text-sm text-slate-600">
                        {tour.rating || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-500">
              No tours data available
            </p>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Recent Bookings
          </h2>

          {dashboardData?.recentActivities &&
          dashboardData.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentActivities.map((booking, index) => (
                <div
                  key={booking.id || index}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {booking.tourName || booking.tourTitle || "Tour"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {booking.touristName || "Tourist"} •{" "}
                      {booking.date || "N/A"}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-semibold text-slate-900">
                      {booking.amount || 0} EGP
                    </p>
                    <p
                      className={`mt-1 text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "text-green-600"
                          : booking.status === "pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {booking.status || "Unknown"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">No recent bookings</p>
          )}
        </div>

        {/* Create New Tour */}
        <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <PlusCircle size={20} className="text-egypt-teal" />
            <h2 className="text-xl font-bold text-slate-900">
              Create New Tour
            </h2>
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
              disabled={formLoading}
              className="w-full md:w-auto px-6 py-2.5 rounded-xl font-semibold text-white bg-egypt-teal hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {formLoading ? "Creating..." : "Create Tour"}
            </button>
          </form>
        </div>

        {/* My Tours */}
        <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Your Created Tours
          </h2>

          {toursLoading ? (
            <p className="text-sm text-slate-500">Loading tours...</p>
          ) : tours.length === 0 ? (
            <p className="text-sm text-slate-500">
              You don&apos;t have tours yet. Create your first one above.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tours.map((tour) => (
                <div
                  key={getTourId(tour) || tour.title}
                  className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white"
                >
                  <img
                    src={getTourImage(tour)}
                    alt={getTourTitle(tour) || "Tour"}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 line-clamp-1">
                      {getTourTitle(tour) || "Untitled tour"}
                    </h4>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2 min-h-[40px]">
                      {tour.description ||
                        tour.Description ||
                        "No description provided."}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
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
                        <span>
                          {tour.maxGroupSize ?? tour.MaxGroupSize ?? 0}
                        </span>
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
      </div>

      {/* Edit Tour Modal */}
      {editingTourId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Tour</h3>
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
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {pendingDeleteTour && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-2 rounded-xl bg-red-100 text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Delete Tour
                </h4>
                <p className="text-sm text-slate-600 mt-1">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-800">
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

      {/* Verification Document Modal */}
      {activeDocument && (
        <div
          className="fixed inset-0 z-70 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveDocument(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {activeDocument.title}
                </h3>
                <p className="text-sm text-slate-600">
                  Verification image preview.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDocument(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-slate-950 p-4">
              <img
                src={activeDocument.url}
                alt={activeDocument.title}
                className="mx-auto max-h-[76vh] w-full rounded-3xl object-contain"
              />
            </div>
            <div className="flex justify-end border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={() => setActiveDocument(null)}
                className="rounded-lg bg-egypt-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
