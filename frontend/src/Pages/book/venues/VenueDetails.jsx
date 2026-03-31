import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { venues } from "./data";
import PaymentButton from "../../../components/PaymentButton";
import { Calendar, Clock, MapPin, Star, Navigation, Map, Shield } from "lucide-react";
import axiosInstance from "../../../api/axios";
export default function VenueDetails() {
  const { id } = useParams();
  
  // Try static first
  const staticVenue = venues.find((v) => v.id === Number(id));
  const [venue, setVenue] = useState(staticVenue || null);

  useEffect(() => {
    if (!staticVenue && id) {
      // It must be a dynamic venue from the backend
      axiosInstance.get(`/api/owners/centers/${id}`).then(res => {
         const center = res.data;
         setVenue({
            id: center.id,
            title: center.name,
            location: `${center.address}, ${center.city}`,
            rating: 4.5,
            reviews: 0,
            price: center.price || "₹500",
            image: center.imageUrl || "https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=1200",
         });
      }).catch(err => console.error("Failed fetching dynamic venue details", err));
    }
  }, [id, staticVenue]);

  // Determine available dates (next 3 days for demo)
  const today = new Date();
  const dates = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const slots = [
    "06:00-07:00", "07:00-08:00", "08:00-09:00", 
    "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00"
  ];

  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState(slots[3]); // default to 4PM

  const [bookedSlotsDict, setBookedSlotsDict] = useState({});
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  useEffect(() => {
    if (!venue) return;
    const fetchBookings = async () => {
      try {
        setIsLoadingBookings(true);
        const res = await axiosInstance.get(`/api/owners/bookings/venue/${venue.id}`);
        const dict = {};
        res.data.forEach(b => {
          if (b.status === "CONFIRMED" || b.status === "PENDING") {
            if (!dict[b.bookingDate]) dict[b.bookingDate] = [];
            dict[b.bookingDate].push(b.timeSlot);
          }
        });
        setBookedSlotsDict(dict);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setIsLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [venue]);

  useEffect(() => {
    if (bookedSlotsDict[selectedDate]?.includes(selectedSlot)) {
      setSelectedSlot("");
    }
  }, [selectedDate, bookedSlotsDict, selectedSlot]);

  if (!venue) return <div className="p-6 sm:p-10 text-center text-xl font-bold">Venue Not Found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-24">
      {/* Header Image */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl">
        <img src={venue.image} alt={venue.title} className="w-full aspect-[21/9] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end">
          <div className="p-6 text-white">
            <h1 className="text-3xl sm:text-4xl font-extrabold">{venue.title}</h1>
            <div className="flex items-center gap-2 mt-2 opacity-90 text-sm sm:text-base">
              <MapPin size={18} />
              <span>{venue.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Rating</div>
              <div className="flex items-center gap-1 text-xl font-bold mt-1 text-gray-800">
                <Star className="text-yellow-400 fill-yellow-400" size={24} /> 
                {venue.rating} <span className="text-gray-400 text-base font-normal">({venue.reviews} Reviews)</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Price</div>
              <div className="text-2xl font-bold text-green-600 mt-1">₹500 <span className="text-sm text-gray-400 font-normal">/hr</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" /> Select Date
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {dates.map((date) => {
                const dateObj = new Date(date);
                const day = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                const dayNum = dateObj.getDate();
                const isSelected = selectedDate === date;

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl border transition-all ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30' 
                        : 'border-gray-200 text-gray-600 hover:border-blue-400'
                    }`}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    <span className="text-2xl font-bold mt-1">{dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" /> Select Time Slot
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {slots.map((slot) => {
                const isBooked = bookedSlotsDict[selectedDate]?.includes(slot);
                const isSelected = selectedSlot === slot && !isBooked;

                return (
                  <button
                    key={slot}
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 px-2 rounded-xl border text-sm font-semibold transition-all ${
                      isBooked
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                        : isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'border-gray-200 text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sports Available */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Sports Available</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {[
                { name: "Pickleball", icon: "https://playo.gumlet.io/V3SPORTICONS/SP83.png" },
                { name: "Box Cricket", icon: "https://playo.gumlet.io/V3SPORTICONS/SP56.png" },
                { name: "Football", icon: "https://playo.gumlet.io/V3SPORTICONS/SP2.png" },
                { name: "Ultimate Frisbee", icon: "https://playo.gumlet.io/V3SPORTICONS/SP34.png" }
              ].map(sport => (
                <div key={sport.name} className="flex flex-col items-center p-2 sm:p-3 border rounded-xl hover:border-green-500 hover:shadow-md cursor-pointer transition-all">
                  <img src={sport.icon} alt={sport.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain mb-2" />
                  <span className="text-xs font-semibold text-center text-gray-700">{sport.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities & Map */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-y-4">
                {["Restroom", "Parking", "Drinking Water", "First Aid", "Changing Room"].map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                    <div className="min-w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-2">Location</h3>
              <p className="text-sm text-gray-600 mb-4">{venue.location}</p>
              <div className="rounded-xl overflow-hidden border">
                <iframe height="150" title="playo-map" loading="lazy" width="100%" frameBorder="0" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyB9q4uF6xjrDG-n2jvClxrtOV_jSXUAPUY&q=12.959791494419319,77.58374589999998&zoom=18" allowFullScreen=""></iframe>
              </div>
            </div>
          </div>

          {/* About Venue */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-xl font-bold mb-4">About Venue</h3>
            <div className="text-sm text-gray-600 space-y-4">
              <p><strong>Box Cricket:</strong><br/>Appropriate sports shoes are recommended for Box Cricket to ensure safety and grip.<br/>Sports equipment availability: bat, ball, and wickets.<br/>Barefoot play is strictly prohibited.</p>
              <p><strong>Football:</strong><br/>Wearing football studs while playing at the facility is recommended but not compulsory.<br/>Metal studs are not allowed.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Widget */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold mb-6">Booking Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold text-gray-800">{new Date(selectedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-semibold text-gray-800">{selectedSlot}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-semibold text-gray-800">1 Hour</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-green-600">₹500</span>
              </div>
            </div>

            <PaymentButton 
              venueId={venue.id}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              amount={500}
            />
            
            <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
              By proceeding to book, you agree to our Terms of Service. Secure payments powered by Razorpay.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
