import React, { useEffect, useState } from 'react';
import axios from '../../../hooks/api';

interface TimeSlot {
  start_time: string;
  end_time: string;
  status?: 'available' | 'booked'; // Optional status for /booking endpoint
}

interface DaySchedule {
  day: string;
  date: string;
  dateString: string; // YYYY-MM-DD for API calls
  slots: TimeSlot[];
}

const Timetable = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Generate dates for the current week (Monday to Friday)
  const generateWeekSchedule = (timeslots: TimeSlot[]) => {
    const currentDate = new Date('2025-09-18T10:40:00+03:00'); // Based on provided timestamp
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start on Monday

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    return days.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);
      const formattedDate = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dateString = dayDate.toISOString().split('T')[0]; // YYYY-MM-DD for API

      // Initialize slots with times from /timeslot/, default status 'available'
      const slots = timeslots.map((slot) => ({
        start_time: slot.start_time,
        end_time: slot.end_time,
        status: 'available' as 'available' | 'booked',
      }));

      return {
        day,
        date: formattedDate,
        dateString,
        slots,
      };
    });
  };

  useEffect(() => {
    const fetchTimeslotsAndAvailability = async () => {
      setError(null);

      try {
        // Fetch timeslots from /timeslot/
        const timeslotRes = await axios.get('/timeslot/');
        const timeslots: TimeSlot[] = timeslotRes.data;

        if (!timeslots.length) {
          setError('No timeslots available. Please try again later.');
          setSchedule([]);
          return;
        }

        // Generate initial schedule with timeslots
        const weekSchedule = generateWeekSchedule(timeslots);

        // Fetch availability for each day
        const updatedSchedule = await Promise.all(
          weekSchedule.map(async (day) => {
            try {
              const bookingRes = await axios.get(`/booking?date=${day.dateString}`);
              const bookingSlots: TimeSlot[] = bookingRes.data;

              // Merge availability with timeslots
              const updatedSlots = day.slots.map((slot) => {
                const matchingBooking = bookingSlots.find(
                  (b) => b.start_time === slot.start_time && b.end_time === slot.end_time
                );
                return {
                  ...slot,
                  status: matchingBooking ? matchingBooking.status : slot.status,
                };
              });

              return {
                ...day,
                slots: updatedSlots,
              };
            } catch (err) {
              console.error(`Failed to fetch availability for ${day.day}:`, err);
              return day; // Use default 'available' status on error
            }
          })
        );

        setSchedule(updatedSchedule);
      } catch (err) {
        setError('Failed to fetch timeslots or availability. Displaying default schedule.');
        console.error(err);
        setSchedule(generateWeekSchedule([])); // Empty schedule as fallback
      }
    };

    fetchTimeslotsAndAvailability();
  }, []);

  const handleSlotClick = (day: string, time: string, status: 'available' | 'booked') => {
    if (status === 'booked') return;

    const slotId = `${day}-${time}`;
    setSelectedSlots((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    day: string,
    time: string,
    status: 'available' | 'booked'
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSlotClick(day, time, status);
    }
  };

  if (error && !schedule.length) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h1 className="text-2xl font-bold">Weekly Schedule</h1>
          <p className="text-blue-100">Select available time slots for booking</p>
          {error && (
            <p className="text-yellow-200 text-sm mt-2">
              {error} Some days may show default availability.
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" role="grid" aria-label="Weekly schedule">
            <thead>
              <tr>
                <th className="p-4 border-b border-gray-200 bg-gray-50 text-left">Time</th>
                {schedule.map((day) => (
                  <th key={day.day} className="p-4 border-b border-gray-200 bg-gray-50 text-center">
                    <div className="font-semibold text-gray-700">{day.day}</div>
                    <div className="text-sm text-gray-500">{day.date}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule[0]?.slots.map((_, timeIndex) => (
                <tr key={timeIndex} className="hover:bg-gray-50">
                  <td className="p-3 border-b border-gray-200 text-sm text-gray-500 font-medium">
                    {`${schedule[0].slots[timeIndex].start_time} - ${schedule[0].slots[timeIndex].end_time}`}
                  </td>
                  {schedule.map((day) => {
                    const slot = day.slots[timeIndex];
                    const time = `${slot.start_time} - ${slot.end_time}`;
                    const slotId = `${day.day}-${time}`;
                    const isSelected = selectedSlots.includes(slotId);

                    return (
                      <td
                        key={`${day.day}-${timeIndex}`}
                        className={`p-3 border-b border-gray-200 text-center cursor-pointer transition-all duration-200 ${
                          slot.status === 'available'
                            ? isSelected
                              ? 'bg-indigo-100 border-2 border-indigo-500'
                              : 'bg-green-100 hover:bg-green-200'
                            : 'bg-red-100 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={() => handleSlotClick(day.day, time, slot.status)}
                        onKeyDown={(e) => handleKeyDown(e, day.day, time, slot.status)}
                        tabIndex={slot.status === 'available' ? 0 : -1}
                        role="button"
                        aria-label={`${slot.status === 'available' ? 'Available' : 'Booked'} slot on ${day.day} at ${time}`}
                      >
                        <div
                          className={`text-sm font-medium ${
                            slot.status === 'available'
                              ? isSelected
                                ? 'text-indigo-700'
                                : 'text-green-700'
                              : 'text-red-700'
                          }`}
                        >
                          {slot.status === 'available' ? (isSelected ? 'Selected' : 'Available') : 'Booked'}
                        </div>
                        {slot.status === 'available' && (
                          <div className="text-xs mt-1 text-gray-500">
                            Click to {isSelected ? 'deselect' : 'select'}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-green-100"></div>
            <span className="text-sm text-gray-600">Available</span>
            <div className="w-4 h-4 rounded bg-red-100 ml-4"></div>
            <span className="text-sm text-gray-600">Booked</span>
            <div className="w-4 h-4 rounded bg-indigo-100 ml-4"></div>
            <span className="text-sm text-gray-600">Selected</span>
          </div>

          <button
            className={`px-6 py-2 rounded-lg font-medium ${
              selectedSlots.length > 0
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={selectedSlots.length === 0}
            onClick={() => {
              // Add booking logic here, e.g., send selectedSlots to API
              console.log('Booking slots:', selectedSlots);
            }}
          >
            Book Selected ({selectedSlots.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timetable;