import axios from "../../../hooks/api";
import React, { useEffect, useState } from "react";
import Playgrounds from "./playgrounds";
import { toast } from "react-toastify";

interface Field {
  id: number;
  name: string;
  location: string;
  price_per_hour: string;
  image: string | null;
  is_active: boolean;
}

interface Timeslot {
  id: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const Booking = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState('');
  const [timeSlots, setTimeSlots] = useState<Timeslot[]>([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState('');
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: '',
    playground: 1,
    date: "",
    time_slot: 1,
    duration: 1,
  });

  useEffect(()=> {
    const fetchField = async ()=> {
      const res = await axios.get<Field[]>(`/field/`);
      setFields(Array.isArray(res.data) ? res.data : []);
    }
    const fetchTimeslot = async ()=> {
      const res = await axios.get<Timeslot[]>(`/timeslot/`);
      setTimeSlots(Array.isArray(res.data) ? res.data : []);
    }
    fetchTimeslot();
    fetchField();
  },[]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "playground" || name === "time_slot" || name === "duration"
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      Playground: Number(selectedField),
      timeSlot: Number(selectedTimeslot)
    }

    try{
      await axios.post(`/booking/`, payload);

      setFormData({
        guest_name: "",
        guest_email: "",
        guest_phone: '',
        playground: 1,
        date: "",
        time_slot: 1,
        duration: 1
      })
      toast.success("Booking Submitted Successfully!");
      console.log("Booking submitted:", formData);
    }catch(err){
      console.log('error booking', err)
      toast.error('something went wrong!')
    }
  };

  return (
    <section className="bg-gray-50 py-12 px-12 lg:px-20">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Book Your Playground
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="guest_name"
              value={formData.guest_name}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="guest_email"
              value={formData.guest_email}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              name="guest_phone"
              pattern="[0-9+ ]*"
              value={formData.guest_phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Choose Field</label>
            <select
              name="field"
              value={selectedField}
              onChange={(e)=> setSelectedField(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              required
            >
              <option value="">-- Select a Field --</option>
              {fields.map((field)=> (
                <option key={field.id} value={field.id}>{field.name}</option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Select Time</label>
              <select
                name="time"
                value={selectedTimeslot}
                onChange={(e)=> setSelectedTimeslot(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                required
              >
                <option value="">-- Select TIme --</option>
                {timeSlots.map((time)=> (
                  <option key={time.id} value={time.id}>{time.start_time} - {time.end_time}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Duration (hours)</label>
            <input
              type="number"
              name="duration"
              min="1"
              max="6"
              value={formData.duration}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold shadow hover:bg-green-700 transition"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </section>
  );
};

export default Booking;
