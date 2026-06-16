import { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import { createBookingSlot } from "../../Services/api/bookingService";

export default function CreateBookingSlot({ tourId, onSlotCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    capacity: 50,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatApiError = (err) => {
    const data = err.response?.data;
    if (!data) return "Failed to create slot";

    if (data.errors) {
      const messages = Object.values(data.errors).flat();
      if (messages.length) return messages.join(" — ");
    }

    return data.message || data.title || "Failed to create slot";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tourId || !formData.date || !formData.startTime || !formData.endTime) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.endTime <= formData.startTime) {
      setError("End time must be after start time");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const slotData = {
        tourId,
        date: formData.date,
        startTime:
          formData.startTime.length === 5
            ? `${formData.startTime}:00`
            : formData.startTime,
        endTime:
          formData.endTime.length === 5
            ? `${formData.endTime}:00`
            : formData.endTime,
        capacity: Number(formData.capacity) || 50,
      };

      await createBookingSlot(slotData);

      setSuccess(true);
      onSlotCreated?.(slotData);

      setFormData({
        date: "",
        startTime: "",
        endTime: "",
        capacity: 50,
      });

      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Create slot error:", err.response?.data || err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-egypt-teal text-white rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add new slot
        </button>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Create a new slot
          </h3>

          {error && (
            <div className="flex gap-3 bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
              <AlertCircle className="text-red-600 shrink-0" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex gap-3 bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
              <CheckCircle className="text-green-600 shrink-0" size={20} />
              <p className="text-green-800">Slot created successfully</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Date</label>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-egypt-teal" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Start time
              </label>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-egypt-teal" />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                End time
              </label>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-egypt-teal" />
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Capacity (1–50)
              </label>
              <input
                type="number"
                name="capacity"
                min={1}
                max={50}
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-egypt-teal text-white rounded-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create slot"
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
