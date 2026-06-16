import { useState, useEffect } from "react";
import { Calendar, Loader } from "lucide-react";
import TourBookingSlots from "./TourBookingSlots";
import CreateBookingSlot from "./CreateBookingSlot";
import { getAllTourSlots } from "../../Services/api/bookingService";

const formatSlotDate = (date) => {
  if (!date) return "Date not set";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatSlotTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const value = new Date();
  value.setHours(Number(hours), Number(minutes), 0);
  return value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TourSlotsManager({ tourId, userRole }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("view");

  const isGuide = userRole?.toLowerCase().includes("guide");

  const fetchSlots = async (extraDates = []) => {
    if (!tourId) return;

    try {
      setLoading(true);
      const data = await getAllTourSlots(tourId, extraDates);
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGuide && tourId) {
      fetchSlots();
    }
  }, [isGuide, tourId]);

  const handleSlotCreated = (createdSlot) => {
    setActiveTab("view");
    fetchSlots(createdSlot?.date ? [createdSlot.date] : []);
  };

  return (
    <div className="rounded-3xl border border-white/60 bg-white/55 p-7 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="text-egypt-teal" size={22} />
        <h2 className="text-xl font-bold text-slate-900">Available slots</h2>
      </div>

      {isGuide ? (
        <div className="space-y-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("view")}
              className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === "view"
                  ? "border-egypt-teal text-egypt-teal"
                  : "border-transparent text-gray-600"
              }`}
            >
              View slots
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === "create"
                  ? "border-egypt-teal text-egypt-teal"
                  : "border-transparent text-gray-600"
              }`}
            >
              Add new slot
            </button>
          </div>

          {activeTab === "view" && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader className="animate-spin text-egypt-teal" size={32} />
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No slots for this tour yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slots.map((slot) => {
                    const slotId = slot.id || slot.Id;
                    const remaining =
                      slot.remainingSpots ??
                      slot.RemainingSpots ??
                      (slot.capacity ?? slot.Capacity ?? 0) -
                        (slot.bookedCount ?? slot.BookedCount ?? 0);
                    const isFull = slot.isFull ?? slot.IsFull ?? remaining <= 0;

                    return (
                      <div
                        key={slotId}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Date</p>
                            <p className="font-semibold text-gray-900">
                              {formatSlotDate(slot.date || slot.Date)}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {formatSlotTime(slot.startTime || slot.StartTime)} —{" "}
                              {formatSlotTime(slot.endTime || slot.EndTime)}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded font-semibold ${
                              isFull
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isFull ? "Full" : "Available"}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-700">
                            Capacity: {slot.capacity ?? slot.Capacity ?? 0}
                          </p>
                          <p className="text-sm text-gray-700">
                            Booked: {slot.bookedCount ?? slot.BookedCount ?? 0}
                          </p>
                          <p className="text-sm font-semibold text-egypt-teal">
                            Remaining: {remaining}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "create" && (
            <div>
              <CreateBookingSlot
                tourId={tourId}
                onSlotCreated={handleSlotCreated}
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <TourBookingSlots tourId={tourId} />
        </div>
      )}
    </div>
  );
}
