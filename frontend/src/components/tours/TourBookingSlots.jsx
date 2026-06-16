import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Loader, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAllTourSlots } from "../../Services/api/bookingService";

const APP_BOOKING_MESSAGE =
  "Please download the mobile app to book this tour";

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

export default function TourBookingSlots({ tourId, onBookingSuccess }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (tourId) {
      fetchAvailableSlots();
    }
  }, [tourId]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTourSlots(tourId);
      const available = (Array.isArray(data) ? data : []).filter((slot) => {
        const remaining =
          slot.remainingSpots ??
          slot.RemainingSpots ??
          (slot.capacity ?? slot.Capacity ?? 0) -
            (slot.bookedCount ?? slot.BookedCount ?? 0);
        const isFull = slot.isFull ?? slot.IsFull ?? remaining <= 0;
        return !isFull;
      });
      setSlots(available);
      setSelectedSlot(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load available slots");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = () => {
    toast.error(APP_BOOKING_MESSAGE);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="animate-spin text-egypt-teal" size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex gap-3 bg-red-50 border border-red-200 p-4 rounded-lg">
        <AlertCircle className="text-red-600 shrink-0" size={20} />
        <div>
          <p className="text-red-800 font-semibold">{error}</p>
          <button
            onClick={fetchAvailableSlots}
            className="text-red-600 underline text-sm mt-2 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-600">
          {slots.length} slot{slots.length === 1 ? "" : "s"} available
        </p>
      </div>

      {slots.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No available slots at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map((slot) => {
            const slotId = slot.id || slot.Id;
            const isSelected = (selectedSlot?.id || selectedSlot?.Id) === slotId;
            const remaining =
              slot.remainingSpots ??
              slot.RemainingSpots ??
              (slot.capacity ?? slot.Capacity ?? 0) -
                (slot.bookedCount ?? slot.BookedCount ?? 0);

            return (
              <div
                key={slotId}
                onClick={() => setSelectedSlot(slot)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-egypt-teal bg-egypt-teal/5"
                    : "border-gray-200 bg-white hover:border-egypt-teal/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-egypt-teal" />
                  <span className="font-semibold text-gray-900">
                    {formatSlotDate(slot.date || slot.Date)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {formatSlotTime(slot.startTime || slot.StartTime)} —{" "}
                    {formatSlotTime(slot.endTime || slot.EndTime)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Users size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {remaining} spot{remaining === 1 ? "" : "s"} available
                  </span>
                </div>

                {isSelected && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookSlot();
                    }}
                    className="w-full mt-3 px-4 py-2 bg-egypt-teal text-white rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Book this slot
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
