import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Trash2, Loader, AlertCircle, Edit } from "lucide-react";
import { getMyBookingSlots, deleteBookingSlot } from "../../Services/api/bookingService";
import { toast } from "react-hot-toast";

export default function MyBookingSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null); // لتتبع الموعد الذي يتم حذفه

  useEffect(() => {
    fetchMySlots();
  }, []);

  const fetchMySlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyBookingSlots();
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("فشل تحميل المواعيد");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الموعد؟")) {
      return;
    }

    try {
      setDeleting(slotId);
      await deleteBookingSlot(slotId);
      setSlots(slots.filter(slot => (slot.id || slot.Id) !== slotId));
      toast.success("تم حذف الموعد بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("فشل حذف الموعد");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (slot) => {
    toast.success("سيتم تطوير خاصية التعديل قريباً");
    // سيتم تطوير هذه الخاصية لاحقاً
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin text-egypt-teal" size={32} />
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
            onClick={fetchMySlots}
            className="text-red-600 underline text-sm mt-2 hover:text-red-800"
          >
            إعادة محاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">مواعيد الرحلات 📅</h3>
        <p className="text-gray-600 text-sm">{slots.length} موعد</p>
      </div>

      {slots.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">لم تنشئ أي مواعيد بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map((slot) => (
            <div key={slot.id || slot.Id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              {/* عنوان الرحلة */}
              <h4 className="font-bold text-gray-900 mb-3">
                {slot.tourTitle || slot.TourTitle || "رحلة"}
              </h4>

              {/* التاريخ والوقت */}
              <div className="space-y-2 mb-4">
                {slot.startTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar size={14} className="text-egypt-teal shrink-0" />
                    <span>{formatDateTime(slot.startTime)}</span>
                  </div>
                )}

                {slot.endTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock size={14} className="text-egypt-teal shrink-0" />
                    <span>إلى {formatDateTime(slot.endTime)}</span>
                  </div>
                )}
              </div>

              {/* عدد الأماكن والسعر */}
              <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-t border-gray-200 pt-4">
                {(slot.availableSpots || slot.AvailableSpots) && (
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-egypt-teal" />
                    <div>
                      <p className="text-xs text-gray-600">الأماكن</p>
                      <p className="font-bold text-gray-900">
                        {slot.availableSpots || slot.AvailableSpots}
                      </p>
                    </div>
                  </div>
                )}

                {(slot.price || slot.Price) && (
                  <div>
                    <p className="text-xs text-gray-600">السعر</p>
                    <p className="font-bold text-egypt-teal">
                      ${slot.price || slot.Price}
                    </p>
                  </div>
                )}
              </div>

              {/* حالة الموعد */}
              {(slot.status || slot.Status) && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                    {(slot.status || slot.Status)?.toLowerCase() === "available" ? "متاح" : slot.status || slot.Status}
                  </span>
                  {slot.bookedCount && (
                    <span className="text-xs text-gray-600">
                      ({slot.bookedCount} محجوز)
                    </span>
                  )}
                </div>
              )}

              {/* أزرار الإجراءات */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(slot)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-1"
                >
                  <Edit size={14} />
                  تعديل
                </button>
                <button 
                  onClick={() => handleDelete(slot.id || slot.Id)}
                  disabled={deleting === (slot.id || slot.Id)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting === (slot.id || slot.Id) ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
