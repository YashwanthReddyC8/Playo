import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import PaymentButton from "../../../components/PaymentButton";
import { Calendar, Clock, MapPin, Star } from "lucide-react";
import axiosInstance from "../../../api/axios";
import axios from "axios";

const SPORT_ICON_BY_NAME = {
  Badminton: "https://playo.gumlet.io/V3SPORTICONS/SP83.png",
  Cricket: "https://playo.gumlet.io/V3SPORTICONS/SP56.png",
  Football: "https://playo.gumlet.io/V3SPORTICONS/SP2.png",
  Tennis: "https://playo.gumlet.io/V3SPORTICONS/SP42.png",
  Basketball: "https://playo.gumlet.io/V3SPORTICONS/SP7.png",
};

const pad = (value) => String(value).padStart(2, "0");
const toLocalDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parseDateKey = (dateKey) => {
  if (!dateKey) return new Date();
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const buildNextDates = (days = 14) => {
  const today = new Date();
  const result = [];
  for (let i = 0; i < days; i += 1) {
    const current = new Date(today);
    current.setDate(today.getDate() + i);
    result.push(toLocalDateKey(current));
  }
  return result;
};

const formatTime = (timeValue) => String(timeValue || "").slice(0, 5);
const toSlotLabel = (slot) => `${formatTime(slot.startTime)}-${formatTime(slot.endTime)}`;
const toWeekDay = (dateKey) => parseDateKey(dateKey).toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

const toMinutes = (timeValue) => {
  const [hour, minute] = formatTime(timeValue).split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;
  return (hour * 60) + minute;
};

const getCurrentLocalMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const toTimeString = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

const expandToHourlySlots = (slot) => {
  const startMinutes = toMinutes(slot.startTime);
  const endMinutes = toMinutes(slot.endTime);
  if (endMinutes <= startMinutes) return [];

  const expanded = [];
  for (let cursor = startMinutes; cursor + 60 <= endMinutes; cursor += 60) {
    expanded.push({
      id: `${slot.id}-${cursor}`,
      sourceSlotId: slot.id,
      startTime: toTimeString(cursor),
      endTime: toTimeString(cursor + 60),
      price: slot.price,
      maxPlayers: slot.maxPlayers,
    });
  }

  // If range is less than one hour, keep original slot as fallback.
  if (expanded.length === 0) {
    expanded.push({
      id: `${slot.id}-raw`,
      sourceSlotId: slot.id,
      startTime: formatTime(slot.startTime),
      endTime: formatTime(slot.endTime),
      price: slot.price,
      maxPlayers: slot.maxPlayers,
    });
  }

  return expanded;
};

export default function VenueDetails() {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [centerData, setCenterData] = useState(null);
  const [loadingCenter, setLoadingCenter] = useState(true);
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [playVisibility, setPlayVisibility] = useState("PRIVATE");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [bookedSlotsDict, setBookedSlotsDict] = useState({});
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const candidateDates = useMemo(() => buildNextDates(14), []);

  useEffect(() => {
    if (!id) return;
    setLoadingCenter(true);

    axiosInstance.get(`/api/owners/centers/public/${id}`).then(res => {
      const center = res.data;
      setCenterData(center);
      setVenue({
        id: center.id,
        title: center.name,
        location: `${center.address}, ${center.city}`,
        rating: 4.5,
        reviews: 0,
        price: center.price || "₹500",
        image: center.imageUrl || "https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=1200",
      });
      setLoadingCenter(false);
    }).catch(err => {
      console.error("Failed fetching dynamic venue details", err);
      setCenterData(null);
      setVenue(null);
      setLoadingCenter(false);
    });
  }, [id]);

  const availableFacilities = useMemo(
    () => (Array.isArray(centerData?.facilities) ? centerData.facilities : []),
    [centerData]
  );

  const sports = useMemo(
    () => availableFacilities.map((facility) => ({
      name: facility.sportType,
      icon: SPORT_ICON_BY_NAME[facility.sportType] || "https://playo.gumlet.io/V3SPORTICONS/SP83.png",
    })),
    [availableFacilities]
  );

  const selectedFacility = useMemo(
    () => availableFacilities.find((facility) => facility.sportType === selectedSport) || null,
    [availableFacilities, selectedSport]
  );

  const getFacilitySlotsForDate = (dateKey, facility) => {
    if (!facility || !Array.isArray(facility.slots)) return [];
    const weekday = toWeekDay(dateKey);

    return facility.slots
      .filter((slot) => slot?.isActive !== false)
      .filter((slot) => Array.isArray(slot.daysOfWeek) && slot.daysOfWeek.includes(weekday))
      .filter((slot) => !(Array.isArray(slot.inactiveDates) && slot.inactiveDates.includes(dateKey)))
      .flatMap((slot) => expandToHourlySlots(slot))
      .sort((a, b) => formatTime(a.startTime).localeCompare(formatTime(b.startTime)));
  };

  const activeDates = useMemo(() => {
    const centerInactiveDates = Array.isArray(centerData?.inactiveDates) ? centerData.inactiveDates : [];
    return candidateDates.filter((dateKey) => {
      if (centerInactiveDates.includes(dateKey)) return false;
      return getFacilitySlotsForDate(dateKey, selectedFacility).length > 0;
    });
  }, [candidateDates, centerData, selectedFacility]);

  const slotsForSelectedDate = useMemo(
    () => getFacilitySlotsForDate(selectedDate, selectedFacility),
    [selectedDate, selectedFacility]
  );

  const availableSlots = useMemo(() => {
    const bookedSlots = bookedSlotsDict[selectedDate] || {};
    const totalCourts = Number(selectedFacility?.totalCourts) > 0 ? Number(selectedFacility.totalCourts) : 1;
    const isSelectedDateToday = selectedDate === toLocalDateKey(new Date());
    const currentLocalMinutes = getCurrentLocalMinutes();
    return slotsForSelectedDate.map((slot) => {
      const slotLabel = toSlotLabel(slot);
      const bookedCount = Number(bookedSlots[slotLabel] || 0);
      const availableCourts = Math.max(totalCourts - bookedCount, 0);
      const slotStartMinutes = toMinutes(slot.startTime);
      const isPastForToday = isSelectedDateToday && slotStartMinutes <= currentLocalMinutes;
      const isAvailableNow = availableCourts > 0 && !isPastForToday;
      return {
        ...slot,
        slotLabel,
        totalCourts,
        bookedCount,
        availableCourts,
        isBooked: !isAvailableNow,
        isPastForToday,
      };
    });
  }, [bookedSlotsDict, selectedDate, selectedFacility, slotsForSelectedDate]);

  const selectedSlot = useMemo(
    () => availableSlots.find((slot) => slot.id === selectedSlotId && !slot.isBooked) || null,
    [availableSlots, selectedSlotId]
  );

  const selectedSlotLabel = selectedSlot ? selectedSlot.slotLabel : "";
  const selectedPrice = selectedSlot?.price ? Number(selectedSlot.price) : 0;

  const minFacilityPrice = useMemo(() => {
    if (!selectedFacility || !Array.isArray(selectedFacility.slots)) return 0;
    const prices = selectedFacility.slots
      .map((slot) => Number(slot?.price))
      .filter((price) => Number.isFinite(price) && price > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [selectedFacility]);

  useEffect(() => {
    if (!venue) return;
    const fetchBookings = async () => {
      try {
        setIsLoadingBookings(true);
        const res = await axiosInstance.get(`/api/owners/bookings/venue/${venue.id}`);
        const dict = {};
        res.data.forEach(b => {
          if (b.status === "CONFIRMED" || b.status === "PENDING") {
            if (!dict[b.bookingDate]) dict[b.bookingDate] = {};
            dict[b.bookingDate][b.timeSlot] = (dict[b.bookingDate][b.timeSlot] || 0) + 1;
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
    if (selectedSport && !sports.some((sport) => sport.name === selectedSport)) {
      setSelectedSport("");
    }
  }, [sports, selectedSport]);

  useEffect(() => {
    if (!selectedSport) {
      setSelectedDate("");
      return;
    }
    if (activeDates.length === 0) {
      setSelectedDate("");
      return;
    }
    if (!activeDates.includes(selectedDate)) {
      setSelectedDate(activeDates[0]);
    }
  }, [activeDates, selectedDate]);

  useEffect(() => {
    if (!selectedSport) {
      setSelectedSlotId(null);
      return;
    }
    if (!selectedSlot) {
      if (availableSlots.length > 0) {
        const firstOpenSlot = availableSlots.find((slot) => !slot.isBooked);
        setSelectedSlotId(firstOpenSlot ? firstOpenSlot.id : null);
      } else {
        setSelectedSlotId(null);
      }
    }
  }, [availableSlots, selectedSlot]);

  useEffect(() => {
    if (playVisibility !== "PUBLIC" && maxPlayers < 2) {
      setMaxPlayers(2);
    }
  }, [playVisibility, maxPlayers]);

  if (loadingCenter) return <div className="p-6 sm:p-10 text-center text-xl font-bold">Loading venue...</div>;
  if (!venue) return <div className="p-6 sm:p-10 text-center text-xl font-bold">Venue Not Found</div>;

  const latitude = Number(centerData?.latitude);
  const longitude = Number(centerData?.longitude);
  const hasCoords =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;
  const googleEmbedQuery = hasCoords
    ? `${latitude},${longitude}`
    : (venue.location || "Sports Center");

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
              <div className="text-2xl font-bold text-green-600 mt-1">
                ₹{minFacilityPrice || 0} <span className="text-sm text-gray-400 font-normal">/slot</span>
              </div>
            </div>
          </div>

          {/* Sports Available */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Sports Available</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {sports.map((sport) => (
                <button
                  key={sport.name}
                  type="button"
                  onClick={() => setSelectedSport(sport.name)}
                  className={`flex flex-col items-center p-2 sm:p-3 border rounded-xl hover:border-green-500 hover:shadow-md cursor-pointer transition-all ${selectedSport === sport.name ? "border-green-500 bg-green-50" : ""
                    }`}
                >
                  <img src={sport.icon} alt={sport.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain mb-2" />
                  <span className="text-xs font-semibold text-center text-gray-700">{sport.name}</span>
                </button>
              ))}
              {sports.length === 0 && (
                <p className="col-span-full text-sm text-gray-500">No sports configured for this center yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" /> Select Date
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {candidateDates.map((date) => {
                const dateObj = parseDateKey(date);
                const day = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                const dayNum = dateObj.getDate();
                const isSelected = selectedDate === date;
                const isDisabled = !selectedSport || !activeDates.includes(date);

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    disabled={isDisabled}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl border transition-all ${isDisabled
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      :
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
            {!selectedSport && (
              <p className="mt-3 text-sm text-gray-500">Select a sport first to see available dates.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" /> Select Time Slot
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {selectedSport && availableSlots.map((slot) => {
                const isBooked = slot.isBooked;
                const isSelected = selectedSlot?.id === slot.id && !isBooked;
                return (
                  <button
                    key={slot.id}
                    disabled={isBooked}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`py-3 px-2 rounded-xl border text-sm font-semibold transition-all ${isBooked
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                      : isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'border-gray-200 text-gray-700 hover:border-blue-400'
                      }`}
                  >
                    {slot.slotLabel}
                    <div className="text-[11px] font-medium mt-1 opacity-90">₹{slot.price}</div>
                    <div className="text-[10px] mt-1 opacity-80">
                      {slot.isPastForToday ? "" : slot.availableCourts > 0 ? `${slot.availableCourts} courts left` : "No courts left"}
                    </div>
                  </button>
                );
              })}
              {!selectedSport && (
                <p className="col-span-full text-sm text-gray-500">Select a sport first to view slots.</p>
              )}
              {selectedSport && availableSlots.length === 0 && (
                <p className="col-span-full text-sm text-gray-500">No active slots for selected date/sport.</p>
              )}
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
                <iframe
                  height="150"
                  title="playo-map"
                  loading="lazy"
                  width="100%"
                  frameBorder="0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(googleEmbedQuery)}&z=15&output=embed`}
                  allowFullScreen=""
                />
              </div>
            </div>
          </div>

          {/* About Venue */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-xl font-bold mb-4">About Venue</h3>
            <div className="text-sm text-gray-600 space-y-4">
              <p><strong>Box Cricket:</strong><br />Appropriate sports shoes are recommended for Box Cricket to ensure safety and grip.<br />Sports equipment availability: bat, ball, and wickets.<br />Barefoot play is strictly prohibited.</p>
              <p><strong>Football:</strong><br />Wearing football studs while playing at the facility is recommended but not compulsory.<br />Metal studs are not allowed.</p>
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
                <span className="font-semibold text-gray-800">{selectedDate ? parseDateKey(selectedDate).toLocaleDateString() : "Select date"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-semibold text-gray-800">{selectedSlotLabel || "Select a slot"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-semibold text-gray-800">1 Hour</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Sport</span>
                <span className="font-semibold text-gray-800">{selectedSport}</span>
              </div>
              <div className="space-y-2">
                <span className="text-gray-500 text-sm">Play Type</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlayVisibility("PRIVATE")}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${playVisibility === "PRIVATE"
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    Private
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayVisibility("PUBLIC")}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${playVisibility === "PUBLIC"
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    Public
                  </button>
                </div>
              </div>
              {playVisibility === "PUBLIC" && (
                <label className="block space-y-2">
                  <span className="text-gray-500 text-sm">Max Players</span>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Math.max(2, Number(e.target.value) || 2))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </label>
              )}
              <hr className="border-gray-100" />
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-green-600">₹{selectedPrice || 0}</span>
              </div>
            </div>

            <PaymentButton
              venueId={venue.id}
              venueName={venue.title}
              selectedDate={selectedDate}
              selectedSlot={selectedSlotLabel}
              amount={selectedPrice}
              sportName={selectedSport}
              facilityId={selectedFacility?.id || null}
              timeSlotId={selectedSlot?.sourceSlotId || null}
              playVisibility={playVisibility}
              maxPlayers={maxPlayers}
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
