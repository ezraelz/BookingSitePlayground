import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

import axios from "../../../hooks/api";
import { toast } from "react-toastify";

type Sport = "football" | "basketball" | "tennis";

interface Field {
  id: number;
  name: string;
  location: string;
  price_per_hour: string; // backend returns string; we’ll cast to number when needed
  image: string | null;
  is_active: boolean;
  sport?: Sport;
}

interface Timeslot {
  id: number;
  start_time: string; // "12:00"
  end_time: string;   // "14:00"
  is_active: boolean;
}

type PlanType = "single" | "1m" | "3m" | "6m";

const Booking: React.FC = () => {
  // ---------- Filters / selections ----------
  const [sport, setSport] = useState<Sport>("football");
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<string>("");

  const [date, setDate] = useState<Date | null>(new Date());
  const [availableSlots, setAvailableSlots] = useState<Timeslot[]>([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState<string>("");

  const [plan, setPlan] = useState<PlanType>("single"); // single | 1m | 3m | 6m
  const [durationHours, setDurationHours] = useState<number>(1);

  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    notes: "",
  });

  // ---------- Fetch fields (by sport) ----------
  useEffect(() => {
    const fetchFields = async () => {
      try {
        // If your API filters by sport, use: `/field/?sport=${sport}`
        const res = await axios.get<Field[]>(`/field/`, {
          params: { sport },
        });
        const list = Array.isArray(res.data) ? res.data : [];
        setFields(list.filter(f => f.is_active !== false));
        // Reset field selection if it doesn’t match filter anymore
        if (selectedField && !list.some(f => String(f.id) === selectedField)) {
          setSelectedField("");
        }
      } catch (e) {
        console.error("Failed to fetch fields", e);
        toast.error("Could not load fields");
      }
    };
    fetchFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sport]);

  // ---------- Fetch availability whenever field/date changes ----------
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedField || !date) {
        setAvailableSlots([]);
        setSelectedTimeslot("");
        return;
      }
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        // Adjust this endpoint to your actual API:
        // e.g., /timeslot/available?field_id=1&date=2025-09-18
        const res = await axios.get<Timeslot[]>(`/timeslot/available`, {
          params: { field_id: selectedField, date: dateStr },
        });

        const list = Array.isArray(res.data) ? res.data : [];
        // Only active slots
        const active = list.filter(ts => ts.is_active !== false);
        setAvailableSlots(active);
        // Clear picked timeslot if not in the new list
        if (selectedTimeslot && !active.some(ts => String(ts.id) === selectedTimeslot)) {
          setSelectedTimeslot("");
        }
      } catch (e) {
        console.error("Failed to fetch availability, falling back to all timeslots", e);
        // Fallback: get all timeslots (if your API doesn’t have /available yet)
        try {
          const resAll = await axios.get<Timeslot[]>(`/timeslot/`);
          const listAll = Array.isArray(resAll.data) ? resAll.data : [];
          const active = listAll.filter(ts => ts.is_active !== false);
          setAvailableSlots(active);
        } catch (err) {
          console.error("Failed to fetch timeslots", err);
          setAvailableSlots([]);
        }
      }
    };
    fetchAvailability();
  }, [selectedField, date, selectedTimeslot]);

  // ---------- Derived values ----------
  const selectedFieldObj = useMemo(
    () => fields.find(f => String(f.id) === selectedField),
    [fields, selectedField]
  );

  const pricePerHour = selectedFieldObj ? Number(selectedFieldObj.price_per_hour || 0) : 0;

  const monthsForPlan: Record<PlanType, number> = { single: 0, "1m": 1, "3m": 3, "6m": 6 };

  // A very simple price model (replace with your business rules):
  // - Single session: hours * price_per_hour
  // - Monthly plans: assume 4 weeks/month, 1 session per week
  //   (adjust as needed; real systems often let you pick days-of-week)
  const estimatedSessions =
    plan === "single" ? 1 : 4 * monthsForPlan[plan]; // one per week
  const estimatedTotal =
    plan === "single"
      ? durationHours * pricePerHour
      : estimatedSessions * durationHours * pricePerHour;

  // ---------- Handlers ----------
  const onInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedField) return toast.error("Please choose a field");
    if (!date) return toast.error("Please pick a date");
    if (!selectedTimeslot) return toast.error("Please choose a timeslot");

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
      plan_type: plan,                 // "single" | "1m" | "3m" | "6m"
      months: monthsForPlan[plan],     // 0 | 1 | 3 | 6
    };

    try {
      await axios.post(`/booking/`, payload);
      toast.success("Booking submitted successfully!");

      // Reset minimal fields
      setFormData({ guest_name: "", guest_email: "", guest_phone: "", notes: "" });
      setSelectedTimeslot("");
      setDurationHours(1);
      // keep field/sport/date; users often book multiple
    } catch (err) {
      console.error("Booking error", err);
      toast.error("Something went wrong while booking.");
    }
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 lg:px-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {/* -------- Left: Form -------- */}
        <div className="md:col-span-2 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
            Book a Field
          </h2>

          <form onSubmit={submit} className="space-y-6">
            {/* Contact */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="guest_name"
                  value={formData.guest_name}
                  onChange={onInput}
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="guest_email"
                  value={formData.guest_email}
                  onChange={onInput}
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="guest_phone"
                  pattern="[0-9+ ]*"
                  value={formData.guest_phone}
                  onChange={onInput}
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Sport</label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value as Sport)}
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="football">⚽ Football</option>
                  <option value="basketball">🏀 Basketball</option>
                  <option value="tennis">🎾 Tennis</option>
                </select>
              </div>
            </div>

            {/* Field + Date + Plan */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Choose Field</label>
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Select a Field --</option>
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.location ? `• ${f.location}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                <div className="w-full">
                  <DatePicker
                    selected={date}
                    onChange={(d) => setDate(d)}
                    dateFormat="yyyy-MM-dd"
                    minDate={new Date()}
                    className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholderText="Select date"
                  />
                </div>
              </div>

              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Plan</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as PlanType)}
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="single">Single session</option>
                  <option value="1m">1 month</option>
                  <option value="3m">3 months</option>
                  <option value="6m">6 months</option>
                </select>
              </div>
            </div>

            {/* Time + Duration */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Available Times (for selected date)
                </label>
                <select
                  value={selectedTimeslot}
                  onChange={(e) => setSelectedTimeslot(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Select Time --</option>
                  {availableSlots.length === 0 ? (
                    <option disabled value="">
                      No slots available for this day
                    </option>
                  ) : (
                    availableSlots.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.start_time} – {t.end_time}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Duration (hours)</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Math.max(1, Math.min(6, Number(e.target.value || 1))))}
                  className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={onInput}
                rows={3}
                className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Team name, special requests, etc."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow hover:bg-indigo-700 transition"
            >
              Confirm Booking
            </button>
          </form>
        </div>

        {/* -------- Right: Summary / Field card -------- */}
        <aside className="space-y-4 rounded-2xl bg-white p-6 shadow">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">Summary</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Sport</span>
              <span className="font-medium capitalize">{sport}</span>
            </div>
            <div className="flex justify-between">
              <span>Field</span>
              <span className="font-medium">
                {selectedFieldObj ? selectedFieldObj.name : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span className="font-medium">
                {date ? format(date, "yyyy-MM-dd") : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Time</span>
              <span className="font-medium">
                {selectedTimeslot
                  ? (() => {
                      const t = availableSlots.find(s => String(s.id) === selectedTimeslot);
                      return t ? `${t.start_time} – ${t.end_time}` : "—";
                    })()
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Plan</span>
              <span className="font-medium">
                {plan === "single" ? "Single session" : `${monthsForPlan[plan]} month(s)`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Duration</span>
              <span className="font-medium">{durationHours} hour(s)</span>
            </div>
            <div className="flex justify-between">
              <span>Rate</span>
              <span className="font-medium">
                {pricePerHour ? `$${pricePerHour.toFixed(2)}/hr` : "—"}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Estimated total</span>
              <span className="text-base font-bold">
                {pricePerHour ? `$${estimatedTotal.toFixed(2)}` : "—"}
              </span>
            </div>
            <p className="mt-1 text-xs opacity-80">
              Final amount may vary based on your facility’s pricing rules and promotions.
            </p>
          </div>

          {selectedFieldObj?.image && (
            <img
              src={selectedFieldObj.image}
              alt={selectedFieldObj.name}
              className="mt-4 h-40 w-full rounded-lg object-cover"
            />
          )}
        </aside>
      </div>
    </section>
  );
};

export default Booking;
