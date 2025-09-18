import axios from "../../../hooks/api";
import React, { useEffect, useState } from "react";
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

interface BookingSlot {
  date: string;
  time_slot: number;
  field: number;
  status: 'available' | 'booked' | 'selected';
  start_time: string;
  end_time: string;
}

const Booking = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<number | ''>('');
  const [timeSlots, setTimeSlots] = useState<Timeslot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'form' | 'timetable'>('form');
  const [selectedSlots, setSelectedSlots] = useState<BookingSlot[]>([]);
  const [availabilityData, setAvailabilityData] = useState<BookingSlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: '',
    playground: 0,
    date: "",
    time_slot: 0,
    duration: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fieldsRes, timeslotsRes] = await Promise.all([
          axios.get<Field[]>('/field/'),
          axios.get<Timeslot[]>('/timeslot/')
        ]);
        
        setFields(Array.isArray(fieldsRes.data) ? fieldsRes.data : []);
        setTimeSlots(Array.isArray(timeslotsRes.data) ? timeslotsRes.data : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load booking data');
      }
    };

    fetchData();
  }, []);

  // Fetch availability when field or date changes
  useEffect(() => {
    if (selectedField && selectedDate) {
      fetchAvailability(selectedField, selectedDate);
    }
  }, [selectedField, selectedDate]);

  const fetchAvailability = async (fieldId: number, date: string) => {
    setIsLoadingAvailability(true);
    try {
      // This would be your actual API endpoint for availability
      const response = await axios.get(`/availability/?field=${fieldId}&date=${date}`);
      setAvailabilityData(response.data);
    } catch (err) {
      console.error('Error fetching availability:', err);
      toast.error('Failed to load availability data');
      // For demo purposes, create mock data
      createMockAvailability(fieldId, date);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const createMockAvailability = (fieldId: number, date: string) => {
    // Create mock availability data for demonstration
    const mockData: BookingSlot[] = timeSlots.map(slot => ({
      date,
      time_slot: slot.id,
      field: fieldId,
      status: Math.random() > 0.5 ? 'available' : 'booked',
      start_time: slot.start_time,
      end_time: slot.end_time
    }));
    setAvailabilityData(mockData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "duration" ? Number(value) : value,
    }));
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : '';
    setSelectedField(value);
    setFormData(prev => ({ ...prev, playground: value || 0 }));
    setSelectedSlots([]);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, date }));
    setSelectedSlots([]);
  };

  const handleSlotSelection = (slot: BookingSlot) => {
    if (slot.status !== 'available') return;
    
    const isSelected = selectedSlots.some(s => 
      s.time_slot === slot.time_slot && s.date === slot.date
    );
    
    if (isSelected) {
      setSelectedSlots(selectedSlots.filter(s => 
        !(s.time_slot === slot.time_slot && s.date === slot.date)
      ));
    } else {
      // For single selection, replace previous selection
      // For multiple selection, add to array
      setSelectedSlots([slot]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!selectedField || !formData.date || selectedSlots.length === 0) {
      toast.error('Please fill all required fields and select at least one time slot');
      setIsSubmitting(false);
      return;
    }

    // Prepare booking data - for multiple slots
    const bookings = selectedSlots.map(slot => ({
      guest_name: formData.guest_name,
      guest_email: formData.guest_email,
      guest_phone: formData.guest_phone,
      playground: selectedField,
      date: formData.date,
      time_slot: slot.time_slot,
      duration: formData.duration
    }));

    try {
      // Send all bookings
      await Promise.all(bookings.map(booking => axios.post('/booking/', booking)));
      
      // Reset form
      setFormData({
        guest_name: "",
        guest_email: "",
        guest_phone: '',
        playground: 0,
        date: "",
        time_slot: 0,
        duration: 1,
      });
      setSelectedField('');
      setSelectedDate('');
      setSelectedSlots([]);
      
      toast.success("Booking Submitted Successfully!");
    } catch (err: any) {
      console.error('Booking error:', err);
      const errorMessage = err.response?.data?.message || 'Something went wrong!';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Your Playground</h1>
          <p className="text-gray-600">Reserve your perfect football field in just a few steps</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-center">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setViewMode('form')}
                  className={`px-6 py-3 text-sm font-medium rounded-l-lg ${
                    viewMode === 'form'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Standard Booking
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('timetable')}
                  className={`px-6 py-3 text-sm font-medium rounded-r-lg ${
                    viewMode === 'timetable'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Timetable View
                </button>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'form' ? (
          // Original form view
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
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
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Booking Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Choose Field *</label>
                      <select
                        value={selectedField}
                        onChange={handleFieldChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        required
                      >
                        <option value="">-- Select a Field --</option>
                        {fields.map((field) => (
                          <option key={field.id} value={field.id}>
                            {field.name} - {field.location} (${field.price_per_hour}/hour)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot *</label>
                        <select
                          name="time_slot"
                          value={formData.time_slot}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                          required
                        >
                          <option value="">-- Select Time --</option>
                          {timeSlots.map((time) => (
                            <option key={time.id} value={time.id}>
                              {time.start_time} - {time.end_time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours) *</label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          name="duration"
                          min="1"
                          max="6"
                          value={formData.duration}
                          onChange={handleChange}
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
          // Timetable view
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
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
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Select Field and Date</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Choose Field *</label>
                    <select
                      value={selectedField}
                      onChange={handleFieldChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      required
                    >
                      <option value="">-- Select a Field --</option>
                      {fields.map((field) => (
                        <option key={field.id} value={field.id}>
                          {field.name} - {field.location} (${field.price_per_hour}/hour)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      min={today}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours) *</label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        name="duration"
                        min="1"
                        max="6"
                        value={formData.duration}
                        onChange={handleChange}
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

              {selectedField && selectedDate ? (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Select Time Slots</h3>
                  
                  {isLoadingAvailability ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded bg-green-100 mr-2"></div>
                          <span className="text-sm text-gray-600">Available</span>
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
                          const isSelected = selectedSlots.some(s => s.time_slot === slot.time_slot);
                          return (
                            <div
                              key={slot.time_slot}
                              onClick={() => handleSlotSelection(slot)}
                              className={`p-4 rounded-lg border cursor-pointer text-center transition-all ${
                                isSelected
                                  ? 'bg-blue-100 border-blue-500'
                                  : slot.status === 'available'
                                  ? 'bg-green-100 border-green-300 hover:bg-green-200'
                                  : 'bg-red-100 border-red-300 cursor-not-allowed'
                              }`}
                            >
                              <div className="font-medium">
                                {slot.start_time} - {slot.end_time}
                              </div>
                              <div className="text-sm mt-1">
                                {isSelected
                                  ? 'Selected'
                                  : slot.status === 'available'
                                  ? 'Available'
                                  : 'Booked'
                                }
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
                  <p className="text-yellow-700">Please select a field and date to view available time slots</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-8">
                <div>
                  {selectedSlots.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{selectedSlots.length}</span> time slot(s) selected
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
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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