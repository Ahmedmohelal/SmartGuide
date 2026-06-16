import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useProfile } from "../../Context/ProfileContext";
import ProfileHeader from "./components/ProfileHeader";
import PersonalInfoCard from "./components/PersonalInfoCard";
import EditProfileModal from "./components/EditProfileModal";
import {
  CalendarDays,
  Globe2,
  Star,
  Users,
  DollarSign,
  MapPin,
  TrendingUp,
  PlusCircle,
  Pencil,
  Trash2,
  Ticket,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import {
  getGuideDashboard,
  getGuideDashboardDocuments,
} from "../../Services/api/guideService";
import { getGuideBookings } from "../../Services/api/bookingService";
import {
  enrichBookingsWithTours,
  formatBookingDate,
  formatBookingTime,
  getBookingSlot,
  getTourTitleFromBookingItem,
  pick,
} from "../../Services/utils/bookingTourEnrichment";
import {
  createTour,
  deleteTour,
  getMyTours,
  getTourById,
  updateTour,
} from "../../Services/api/tours";
import {
  extractTourImageUrls,
  extractTourMaxGroupSize,
} from "../../Services/utils/tourUtils";
import {
  defaultTourExtras,
  mapTourToEditForm,
  serializeTourExtras,
} from "../../Services/utils/tourJsonUtils";
import TourExtrasFormSection from "../../components/tours/TourExtrasFormSection";
import TourImageCarousel from "../../components/tours/TourImageCarousel";
import MultiTourImagePicker from "../../components/tours/MultiTourImagePicker";

const createInitialState = () => ({
  title: "",
  description: "",
  price: "",
  durationHours: "",
  maxGroupSize: "",
  ...defaultTourExtras(),
  imageFiles: [],
  existingImageUrls: [],
});

export default function GuideProfile() {
  const { user, loading, error, updateProfileData } = useProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [guideBookings, setGuideBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [documents, setDocuments] = useState(null);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState(null);
  const [activeDocument, setActiveDocument] = useState(null);
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);

  const fetchGuideBookings = async () => {
    try {
      setBookingsLoading(true);
      const [bookings, myTours] = await Promise.all([
        getGuideBookings(),
        getMyTours(),
      ]);
      const enriched = await enrichBookingsWithTours(
        Array.isArray(bookings) ? bookings : [],
        Array.isArray(myTours) ? myTours : [],
      );
      setGuideBookings(enriched);
    } catch (err) {
      console.error("Failed to load guide bookings:", err);
      setGuideBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const data = await getGuideDashboard(6, 5);
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
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

  useEffect(() => {
    fetchDashboard();
    fetchGuideBookings();
    fetchMyTours();
    fetchDashboardDocuments();
  }, []);

  const handleSaveProfile = async (newData) => {
    const result = await updateProfileData(newData);
    if (result.success) {
      setIsEditModalOpen(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (imageFiles, existingImageUrls) => {
    setForm((prev) => ({
      ...prev,
      imageFiles,
      existingImageUrls: existingImageUrls || prev.existingImageUrls || [],
    }));
  };

  const validateStep1 = () => {
    if (!form.title || !form.description || !form.price || !form.durationHours || !form.maxGroupSize) {
      toast.error("Please fill all required fields in this step");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    return true;
  };

  const validateStep3 = () => {
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
      closeCreateModal();
      await fetchMyTours();
      await fetchDashboard();
      await fetchGuideBookings();
    } catch (err) {
      const body = err.response?.data;
      const errors = body?.errors;

      if (import.meta.env.DEV && errors) {
        Object.entries(errors).forEach(([key, msgs]) => {
          console.log(`${key}:`, Array.isArray(msgs) ? msgs.join(", ") : msgs);
        });
      }

      toast.error(
        body?.message ||
          (errors && Object.values(errors).flat().join(" ")) ||
          "Failed to create tour"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const tourFallbackImage =
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

  const handleEditImageChange = (imageFiles, existingImageUrls) => {
    setEditForm((prev) => ({
      ...prev,
      imageFiles,
      existingImageUrls: existingImageUrls || prev.existingImageUrls || [],
    }));
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
      await fetchGuideBookings();
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
      await fetchGuideBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete tour");
      console.error("Delete error:", error);
    } finally {
      setPendingDeleteTour(null);
      setDeleteLoadingId(null);
    }
  };

  const dashboardStatistics =
    dashboardData?.statistics || dashboardData?.Statistics || {};

  const monthlyEarnings =
    dashboardData?.monthlyEarnings || dashboardData?.MonthlyEarnings || [];

  const topTours =
    dashboardData?.mostPopularTours || dashboardData?.MostPopularTours || [];

  const formatMonthLabel = (item) => {
    const month = item.month ?? item.Month;
    const year = item.year ?? item.Year;
    if (month && year) {
      return new Date(year, month - 1).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
    return "N/A";
  };

  const recentGuideBookings = useMemo(
    () =>
      [...guideBookings]
        .sort((a, b) => {
          const dateA = new Date(
            pick(
              a.booking?.createdAtUtc,
              a.booking?.CreatedAtUtc,
            ) || 0,
          ).getTime();
          const dateB = new Date(
            pick(
              b.booking?.createdAtUtc,
              b.booking?.CreatedAtUtc,
            ) || 0,
          ).getTime();
          return dateB - dateA;
        })
        .slice(0, 5),
    [guideBookings],
  );

  const activeTopTours = useMemo(() => {
    const activeTourIds = new Set(
      tours.map((tour) => String(getTourId(tour))).filter(Boolean),
    );

    return topTours.filter((tour) =>
      activeTourIds.has(String(tour.tourId ?? tour.TourId)),
    );
  }, [topTours, tours]);

  const stats = [
    {
      label: "Total Tours",
      value: toursLoading ? "..." : tours.length,
      icon: MapPin,
      color: "bg-teal-50 text-teal-900",
      iconColor: "text-egypt-teal",
    },
    {
      label: "Total Bookings",
      value: bookingsLoading ? "..." : guideBookings.length,
      icon: CalendarDays,
      color: "bg-blue-50 text-blue-900",
      iconColor: "text-blue-600",
    },
    {
      label: "Total Revenue",
      value: `${
        dashboardStatistics.totalEarnings ??
        dashboardStatistics.TotalEarnings ??
        0
      } EGP`,
      icon: DollarSign,
      color: "bg-green-50 text-green-900",
      iconColor: "text-green-600",
    },
    {
      label: "Total Tourists",
      value:
        dashboardStatistics.totalUniqueTourists ??
        dashboardStatistics.TotalUniqueTourists ??
        user?.touristsCount ??
        0,
      icon: Users,
      color: "bg-purple-50 text-purple-900",
      iconColor: "text-purple-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-egypt-teal border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100 m-4">
        <p className="text-red-600 font-bold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm underline text-red-500"
        >
          Try again
        </button>
      </div>
    );
  }

  const scrollToVerificationDocs = () => {
    document.getElementById("verification-docs")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      <ProfileHeader onEditClick={() => setIsEditModalOpen(true)} />

      {/* View Verification Documents Button */}
      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={scrollToVerificationDocs}
          className="inline-flex items-center justify-center rounded-xl bg-egypt-teal px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          View verification documents
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <PersonalInfoCard />
        </div>

        <div className="lg:col-span-8 space-y-6">
          {/* Dashboard Stats */}
          <div className="bg-gradient-to-br from-indigo-600 to-teal-700 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100/50">
            <h4 className="font-bold text-lg mb-4">Tour Guide Dashboard</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-white/80">
                          {stat.label}
                        </p>
                        <p className="mt-1 text-xl font-bold text-white">
                          {stat.value}
                        </p>
                      </div>
                      <div className="rounded-lg p-2 bg-white/20">
                        <Icon size={20} className="text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dashboard Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Dashboard Overview
              </span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Monthly Revenue
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <TrendingUp size={16} className="text-egypt-teal" />
                  Last 6 months
                </div>
              </div>

              {monthlyEarnings.length > 0 ? (
                <div className="space-y-4">
                  {monthlyEarnings.map((item) => {
                    const revenue =
                      item.earnings ?? item.Earnings ?? 0;
                    const label = formatMonthLabel(item);

                    return (
                    <div key={label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          {label}
                        </span>
                        <span className="font-bold text-slate-900">
                          {revenue} EGP
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-egypt-teal transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              (revenue /
                                Math.max(
                                  ...monthlyEarnings.map(
                                    (m) => m.earnings ?? m.Earnings ?? 0,
                                  ),
                                )) *
                                100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-slate-500">
                  No revenue data available
                </p>
              )}
            </div>

            {/* Top Tours */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-slate-900">
                Top Tours
              </h2>

              {activeTopTours.length > 0 ? (
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
                          Occupancy
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTopTours.map((tour, index) => (
                        <tr
                          key={tour.tourId || tour.TourId || index}
                          className="border-b border-slate-50 last:border-0"
                        >
                          <td className="py-4 text-sm font-medium text-slate-900">
                            {tour.title || tour.Title || "Untitled Tour"}
                          </td>
                          <td className="py-4 text-sm text-slate-600">
                            {tour.totalBookings ?? tour.TotalBookings ?? 0}
                          </td>
                          <td className="py-4 text-sm font-semibold text-slate-900">
                            {tour.revenue ?? tour.Revenue ?? 0} EGP
                          </td>
                          <td className="py-4 text-sm text-slate-600">
                            {Math.round(
                              (tour.occupancyRate ?? tour.OccupancyRate ?? 0) *
                                100,
                            )}
                            %
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
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-slate-900">
                Recent Bookings
              </h2>

              {bookingsLoading ? (
                <p className="text-center text-slate-500">
                  Loading recent bookings...
                </p>
              ) : recentGuideBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentGuideBookings.map((item) => {
                    const booking = item.booking;
                    const bookingId = pick(booking.id, booking.Id);
                    const slot = getBookingSlot(booking);
                    const slotDate = pick(slot.date, slot.Date);
                    const startTime = pick(slot.startTime, slot.StartTime);
                    const endTime = pick(slot.endTime, slot.EndTime);
                    const status = String(
                      pick(booking.status, booking.Status) || "Unknown",
                    ).toLowerCase();
                    const amount =
                      pick(booking.totalPrice, booking.TotalPrice) ?? 0;
                    const dateLabel = slotDate
                      ? `${formatBookingDate(slotDate)}${
                          startTime
                            ? ` • ${formatBookingTime(startTime)}${
                                endTime ? ` – ${formatBookingTime(endTime)}` : ""
                              }`
                            : ""
                        }`
                      : "N/A";

                    return (
                    <div
                      key={bookingId}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {getTourTitleFromBookingItem(item)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {dateLabel}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-semibold text-slate-900">
                          {Number(amount).toLocaleString("en-US")} EGP
                        </p>
                        <p
                          className={`mt-1 text-xs font-medium capitalize ${
                            status === "confirmed"
                              ? "text-green-600"
                              : status === "pending"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {status}
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-slate-500">No recent bookings</p>
              )}
            </div>
          </div>

          {/* Tours Management Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Tours Management
              </span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
              <style>{`
                @keyframes fadeInUp {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }

                .guide-bio-container {
                  animation: fadeInUp 0.6s ease-out;
                }

                .bio-text {
                  animation: fadeInUp 0.6s ease-out 0.2s backwards;
                }
              `}</style>

              <div className="guide-bio-container space-y-4">
                <h3 className="font-bold text-gray-900 text-lg mb-4 text-right">
                  About You as a Guide
                </h3>

                <p className="bio-text text-sm leading-7 text-gray-700 bg-linear-to-br from-egypt-teal/5 to-blue-50 p-5 rounded-2xl border border-egypt-teal/10 shadow-sm">
                  {user?.bio ||
                    "Add a short summary about your experience, languages you speak, and tour types to make your profile more appealing to tourists."}
                </p>
              </div>
            </div>

            {/* Verification Documents */}
            <div
              id="verification-docs"
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Verification Documents
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    View the ID and license images you uploaded for
                    verification.
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
                <p className="text-sm text-slate-500">
                  Loading verification images...
                </p>
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

            {/* Create New Tour */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Create New Tour
                </h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-egypt-teal hover:bg-teal-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300 active:scale-95"
              >
                <PlusCircle size={20} />
                Create Tour
              </button>
            </div>

            {/* My Tours */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
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
                      <TourImageCarousel
                        images={extractTourImageUrls(tour)}
                        fallback={tourFallbackImage}
                        alt={getTourTitle(tour) || "Tour"}
                        className="h-40 w-full"
                      />
                      <div className="p-4">
                        <h4 className="font-bold text-slate-900 line-clamp-1">
                          {getTourTitle(tour) || "Untitled tour"}
                        </h4>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <Ticket size={14} className="text-egypt-teal" />
                            <span>{tour.price ?? 0} EGP</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarClock
                              size={14}
                              className="text-egypt-teal"
                            />
                            <span>{getTourDurationHours(tour)}h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} className="text-egypt-teal" />
                            <span>
                              {extractTourMaxGroupSize(tour)}
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

              <MultiTourImagePicker
                files={editForm.imageFiles}
                existingImageUrls={editForm.existingImageUrls || []}
                onChange={handleEditImageChange}
                label="Change tour images"
                hint="Choose multiple images"
              />

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
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
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
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
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
                <MultiTourImagePicker
                  files={form.imageFiles}
                  existingImageUrls={form.existingImageUrls || []}
                  onChange={handleImageChange}
                  label="Upload tour images"
                  hint="Choose multiple images"
                />

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
                    disabled={formLoading}
                    className="px-4 py-2 rounded-lg bg-egypt-teal text-white font-semibold hover:bg-teal-700 disabled:bg-gray-400 transition"
                  >
                    {formLoading ? "Creating..." : "Create Tour"}
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

      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
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
