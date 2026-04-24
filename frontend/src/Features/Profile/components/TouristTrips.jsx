import { Calendar, MapPin, ChevronLeft } from "lucide-react";

export default function TouristTrips() {
  // داتا تجريبية (Mock Data) لحد ما نربط الـ API بتاع الحجوزات
  const myTrips = [
    {
      id: 1,
      place: "أهرامات الجيزة",
      date: "2026-05-10",
      guide: "محمد علي",
      img: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 2,
      place: "معبد فيلة - أسوان",
      date: "2026-06-15",
      guide: "سارة أحمد",
      img: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&q=80&w=400",
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">رحلاتي القادمة 🧭</h3>
        <button className="text-egypt-teal text-sm font-semibold hover:gap-2 transition-all flex items-center">
          استكشاف المزيد <ChevronLeft size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myTrips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
            <div className="h-40 overflow-hidden relative">
              <img src={trip.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-egypt-teal shadow-sm">
                مؤكد ✅
              </div>
            </div>
            
            <div className="p-4 space-y-3" dir="rtl">
              <h4 className="font-bold text-gray-800">{trip.place}</h4>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Calendar size={14} className="text-egypt-teal" />
                <span>{trip.date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <MapPin size={14} className="text-egypt-teal" />
                <span>المرشد: {trip.guide}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}