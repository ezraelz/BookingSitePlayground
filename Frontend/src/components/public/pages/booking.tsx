import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import axios from "axios"; // Adjust import based on your setup

type Sport = "football" | "basketball" | "tennis";
type PlanType = "single" | "1m" | "3m" | "6m";

interface Field {
  id: number;
  name: string;
  location: string;
  price_per_hour: string; // Backend returns string
  image: string | null;
  is_active: boolean;
  sport?: Sport;
}

interface Timeslot {
  id: number;
  start_time: string; // e.g., "12:00"
  end_time: string; // e.g., "14:00"
  is_active: boolean;
}

interface BookingSlot {
  date: string;
  time_slot: number;
  field: number;
  status: "available" | "booked" | "selected";
  start_time: string;
  end_time: string;
}

const Booking: React.FC = () => {
  // State
  const [sport, setSport] = useState<Sport>("football");
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<string>("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [availableSlots, setAvailableSlots] = useState<Timeslot[]>([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState<string>("");
  const [plan, setPlan] = useState<PlanType>("single");
  const [durationHours, setDurationHours] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"form" | "timetable">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<BookingSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<BookingSlot[]>([]);
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    notes: "",
    playground: 0,
    date: "",
    time_slot: 0,
    duration: 1,
  });

  // Fetch fields and timeslots on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fieldsRes, timeslotsRes] = await Promise.all([
          axios.get<Field[]>("/fields/"),
          axios.get<Timeslot[]>("/timeslot/"),
        ]);
        setFields(Array.isArray(fieldsRes.data) ? fieldsRes.data : []);
        setAvailableSlots(
          Array.isArray(timeslotsRes.data)
            ? timeslotsRes.data.filter((ts) => ts.is_active !== false)
            : []
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load booking data");
      }
    };
    fetchData();
  }, []);

  // Fetch availability when field or date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedField || !date) {
        setAvailableSlots([]);
        setSelectedTimeslot("");
        setAvailabilityData([]);
        return;
      }
      setIsLoadingAvailability(true);
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        const res = await axios.get<BookingSlot[]>("/availability/", {
          params: { field: selectedField, date: dateStr },
        });
        setAvailabilityData(Array.isArray(res.data) ? res.data : []);
        const activeSlots = res.data
          .filter((slot) => slot.status === "available")
          .map((slot) => ({
            id: slot.time_slot,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_active: true,
          }));
        setAvailableSlots(activeSlots);
        if (
          selectedTimeslot &&
          !activeSlots.some((ts) => String(ts.id) === selectedTimeslot)
        ) {
          setSelectedTimeslot("");
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
        toast.error("Failed to load availability data");
        // Fallback: Mock availability
        const mockData: BookingSlot[] = availableSlots.map((slot) => ({
          date: format(date, "yyyy-MM-dd"),
          time_slot: slot.id,
          field: Number(selectedField),
          status: Math.random() > 0.5 ? "available" : "booked",
          start_time: slot.start_time,
          end_time: slot.end_time,
        }));
        setAvailabilityData(mockData);
        setAvailableSlots(availableSlots); // Keep existing slots as fallback
      } finally {
        setIsLoadingAvailability(false);
      }
    };
    fetchAvailability();
  }, [selectedField, date]);

  // Derived values
  const selectedFieldObj = useMemo(
    () => fields.find((f) => String(f.id) === selectedField),
    [fields, selectedField]
  );

  const pricePerHour = selectedFieldObj
    ? Number(selectedFieldObj.price_per_hour || 0)
    : 0;

  const monthsForPlan: Record<PlanType, number> = {
    single: 0,
    "1m": 1,
    "3m": 3,
    "6m": 6,
  };

  const estimatedSessions =
    plan === "single" ? 1 : 4 * monthsForPlan[plan]; // One session per week
  const estimatedTotal =
    plan === "single"
      ? durationHours * pricePerHour
      : estimatedSessions * durationHours * pricePerHour;

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedField(e.target.value);
    setFormData((prev) => ({ ...prev, playground: Number(e.target.value) }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setDate(newDate);
    setFormData((prev) => ({ ...prev, date: e.target.value }));
  };

  const handleSlotSelection = (slot: BookingSlot) => {
    if (slot.status !== "available") return;
    setSelectedSlots((prev) => {
      const isSelected = prev.some((s) => s.time_slot === slot.time_slot);
      if (isSelected) {
        return prev.filter((s) => s.time_slot !== slot.time_slot);
      }
      return [
        ...prev,
        { ...slot, status: "selected" as const },
      ];
    });
    setSelectedTimeslot(String(slot.time_slot));
    setFormData((prev) => ({ ...prev, time_slot: slot.time_slot }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedField) return toast.error("Please choose a field");
    if (!date) return toast.error("Please pick a date");
    if (!selectedTimeslot && viewMode === "form")
      return toast.error("Please choose a timeslot");
    if (viewMode === "timetable" && selectedSlots.length === 0)
      return toast.error("Please select at least one timeslot");

    setIsSubmitting(true);
    try {
      const payload = {
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone,
        notes: formData.notes,
        sport,
        playground: Number(selectedField),
        date: format(date, "yyyy-MM-dd"),
        time_slot: Number(selectedTimeslot),
        duration: Number(durationHours),
        plan_type: plan,
        months: monthsForPlan[plan],
      };
      await axios.post("/booking/", payload);
      toast.success("Booking submitted successfully!");
      setFormData({
        guest_name: "",
        guest_email: "",
        guest_phone: "",
        notes: "",
        playground: 0,
        date: "",
        time_slot: 0,
        duration: 1,
      });
      setSelectedTimeslot("");
      setSelectedSlots([]);
      setDurationHours(1);
    } catch (err) {
      console.error("Booking error", err);
      toast.error("Something went wrong while booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Book Your Playground
          </h1>
          <p className="text-gray-600">
            Reserve your perfect football field in just a few steps
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-center">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setViewMode("form")}
                  className={`px-6 py-3 text-sm font-medium rounded-l-lg ${
                    viewMode === "form"
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Standard Booking
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("timetable")}
                  className={`px-6 py-3 text-sm font-medium rounded-r-lg ${
                    viewMode === "timetable"
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Timetable View
                </button>
              </div>
            </div>
          </div>
        </div>

        {viewMode === "form" ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="guest_name"
                        value={formData.guest_name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="guest_email"
                          value={formData.guest_email}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                          required
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="guest_phone"
                          value={formData.guest_phone}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                          required
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        placeholder="Any additional notes"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                    Booking Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Choose Field *
                      </label>
                      <select
                        value={selectedField}
                        onChange={handleFieldChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        required
                      >
                        <option value="">-- Select a Field --</option>
                        {fields.map((field) => (
                          <option key={field.id} value={field.id}>
                            {field.name} - {field.location} ($
                            {field.price_per_hour}/hour)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleDateChange}
                          min={today}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time Slot *
                        </label>
                        <select
                          name="time_slot"
                          value={formData.time_slot}
                          onChange={(e) => {
                            handleChange(e);
                            setSelectedTimeslot(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              time_slot: Number(e.target.value),
                            }));
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                          required
                        >
                          <option value="">-- Select Time --</option>
                          {availableSlots.map((time) => (
                            <option key={time.id} value={time.id}>
                              {time.start_time} - {time.end_time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (hours) *
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          name="duration"
                          min="1"
                          max="6"
                          value={formData.duration}
                          onChange={(e) => {
                            handleChange(e);
                            setDurationHours(Number(e.target.value));
                          }}
                          className="flex-1 mr-4"
                        />
                        <span className="text-lg font-semibold text-green-600 min-w-[30px] text-center">
                          {formData.duration}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1h</span>
                        <span>2h</span>
                        <span>3h</span>
                        <span>4h</span>
                        <span>5h</span>
                        <span>6h</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold">
                    Estimated Total: ${estimatedTotal.toFixed(2)}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="guest_name"
                      value={formData.guest_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="guest_email"
                      value={formData.guest_email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="guest_phone"
                      value={formData.guest_phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      required
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Any additional notes"
                  />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Select Field and Date
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Choose Field *
                    </label>
                    <select
                      value={selectedField}
                      onChange={handleFieldChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      required
                    >
                      <option value="">-- Select a Field --</option>
                      {fields.map((field) => (
                        <option key={field.id} value={field.id}>
                          {field.name} - {field.location} ($
                          {field.price_per_hour}/hour)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleDateChange}
                      min={today}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (hours) *
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        name="duration"
                        min="1"
                        max="6"
                        value={formData.duration}
                        onChange={(e) => {
                          handleChange(e);
                          setDurationHours(Number(e.target.value));
                        }}
                        className="flex-1 mr-4"
                      />
                      <span className="text-lg font-semibold text-green-600 min-w-[30px] text-center">
                        {formData.duration}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1h</span>
                      <span>2h</span>
                      <span>3h</span>
                      <span>4h</span>
                      <span>5h</span>
                      <span>6h</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedField && formData.date ? (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                    Select Time Slots
                  </h3>
                  {isLoadingAvailability ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded bg-green-100 mr-2"></div>
                          <span className="text-sm text-gray-600">
                            Available
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded bg-red-100 mr-2"></div>
                          <span className="text-sm text-gray-600">Booked</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded bg-blue-100 mr-2"></div>
                          <span className="text-sm text-gray-600">Selected</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {availabilityData.map((slot) => {
                          const isSelected = selectedSlots.some(
                            (s) => s.time_slot === slot.time_slot
                          );
                          return (
                            <div
                              key={slot.time_slot}
                              onClick={() => handleSlotSelection(slot)}
                              className={`p-4 rounded-lg border cursor-pointer text-center transition-all ${
                                isSelected
                                  ? "bg-blue-100 border-blue-500"
                                  : slot.status === "available"
                                  ? "bg-green-100 border-green-300 hover:bg-green-200"
                                  : "bg-red-100 border-red-300 cursor-not-allowed"
                              }`}
                            >
                              <div className="font-medium">
                                {slot.start_time} - {slot.end_time}
                              </div>
                              <div className="text-sm mt-1">
                                {isSelected
                                  ? "Selected"
                                  : slot.status === "available"
                                  ? "Available"
                                  : "Booked"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <p className="text-yellow-700">
                    Please select a field and date to view available time slots
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center mt-8">
                <div>
                  {selectedSlots.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{selectedSlots.length}</span>{" "}
                      time slot(s) selected
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || selectedSlots.length === 0}
                  className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Book ${selectedSlots.length} Slot(s)`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Booking;