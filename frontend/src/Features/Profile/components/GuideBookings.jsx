import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Users, DollarSign, Loader, AlertCircle, Mail, Phone, Calendar } from "lucide-react";
import { getGuideBookings, updateBooking } from "../../../Services/api/bookingService";

export default function GuideBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getGuideBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("فشل تحميل الحجوزات");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setUpdating(bookingId);
      await updateBooking(bookingId, { status: newStatus });
      
      setBookings((prev) =>
        prev.map((b) =>
          (b.id === bookingId || b.Id === bookingId)
            ? { ...b, status: newStatus, Status: newStatus }
            : b
        )
      );
    } catch (err) {
      console.error(err);
      alert("فشل تحديث الحالة");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <CheckCircle size={18} className="text-green-600" />;
      case "rejected":
        return <XCircle size={18} className="text-red-600" />;
      case "pending":
        return <Clock size={18} className="text-yellow-600" />;
      default:
        return <Clock size={18} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBookings = filterStatus === "all"
    ? bookings
    : bookings.filter((b) => (b.status || b.Status || "").toLowerCase() === filterStatus);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => (b.status || b.Status || "").toLowerCase() === "pending").length,
    confirmed: bookings.filter((b) => (b.status || b.Status || "").toLowerCase() === "confirmed").length,
    rejected: bookings.filter((b) => (b.status || b.Status || "").toLowerCase() === "rejected").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin text-egypt-teal" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "الإجمالي", value: stats.total, color: "bg-blue-50 border-blue-200" },
          { label: "قيد الانتظار", value: stats.pending, color: "bg-yellow-50 border-yellow-200" },
          { label: "مؤكدة", value: stats.confirmed, color: "bg-green-50 border-green-200" },
          { label: "مرفوضة", value: stats.rejected, color: "bg-red-50 border-red-200" },
        ].map((stat) => (
          <div key={stat.label} className={`border rounded-lg p-4 ${stat.color}`}>
            <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* فلاتر */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {["all", "pending", "confirmed", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              filterStatus === status
                ? "border-egypt-teal text-egypt-teal"
                : "border-transparent text-gray-600"
            }`}
          >
            {status === "all" ? "الكل" : status === "pending" ? "قيد الانتظار" : status === "confirmed" ? "مؤكدة" : "مرفوضة"}
          </button>
        ))}
      </div>

      {/* قائمة الحجوزات */}
      {error && (
        <div className="flex gap-3 bg-red-50 border border-red-200 p-4 rounded-lg">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">لا توجد حجوزات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id || booking.Id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                {/* اسم السائح والرحلة */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">السائح</p>
                  <p className="font-bold text-gray-900">{booking.touristName || "غير محدد"}</p>
                  <p className="text-xs text-gray-600 mt-2">{booking.tourTitle || "رحلة"}</p>
                </div>

                {/* التاريخ والضيوف */}
                <div className="space-y-2">
                  {booking.bookingDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar size={14} className="text-egypt-teal shrink-0" />
                      <span>{new Date(booking.bookingDate).toLocaleDateString("ar-EG")}</span>
                    </div>
                  )}
                  {booking.numberOfGuests && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users size={14} className="text-egypt-teal shrink-0" />
                      <span>{booking.numberOfGuests}</span>
                    </div>
                  )}
                </div>

                {/* السعر */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">السعر</p>
                  <p className="text-lg font-bold text-egypt-teal">${booking.price || "0"}</p>
                </div>

                {/* الحالة */}
                <div className="flex items-center gap-2">
                  {getStatusIcon(booking.status || booking.Status)}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status || booking.Status)}`}>
                    {(booking.status || booking.Status)?.toLowerCase() === "pending" ? "قيد الانتظار" 
                      : (booking.status || booking.Status)?.toLowerCase() === "confirmed" ? "مؤكد"
                      : "مرفوض"}
                  </span>
                </div>

                {/* الأزرار */}
                <div className="flex gap-2">
                  {(booking.status || booking.Status)?.toLowerCase() === "pending" && (
                    <>
                      <button
                        disabled={updating === (booking.id || booking.Id)}
                        onClick={() => handleStatusChange(booking.id || booking.Id, "confirmed")}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {updating === (booking.id || booking.Id) ? "..." : "موافق"}
                      </button>
                      <button
                        disabled={updating === (booking.id || booking.Id)}
                        onClick={() => handleStatusChange(booking.id || booking.Id, "rejected")}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {updating === (booking.id || booking.Id) ? "..." : "رفض"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* تفاصيل التواصل */}
              {(booking.touristEmail || booking.touristPhone) && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4">
                  {booking.touristEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail size={14} className="text-egypt-teal" />
                      <span>{booking.touristEmail}</span>
                    </div>
                  )}
                  {booking.touristPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone size={14} className="text-egypt-teal" />
                      <span>{booking.touristPhone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
