import React, { useState } from 'react';

interface TimeSlot {
  time: string;
  status: 'available' | 'booked';
}

interface DaySchedule {
  day: string;
  date: string;
  slots: TimeSlot[];
}

const Timetable = () => {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  
  // Sample data with dates for the current week
  const currentDate = new Date();
  const schedule: DaySchedule[] = [
    {
      day: 'Monday',
      date: new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      slots: [
        { time: '08:00 - 09:00', status: 'available' },
        { time: '09:00 - 10:00', status: 'booked' },
        { time: '10:00 - 11:00', status: 'available' },
        { time: '11:00 - 12:00', status: 'available' },
        { time: '12:00 - 13:00', status: 'booked' },
        { time: '13:00 - 14:00', status: 'available' },
        { time: '14:00 - 15:00', status: 'booked' },
        { time: '15:00 - 16:00', status: 'available' },
      ],
    },
    {
      day: 'Tuesday',
      date: new Date(currentDate.setDate(currentDate.getDate() + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      slots: [
        { time: '08:00 - 09:00', status: 'available' },
        { time: '09:00 - 10:00', status: 'available' },
        { time: '10:00 - 11:00', status: 'booked' },
        { time: '11:00 - 12:00', status: 'available' },
        { time: '12:00 - 13:00', status: 'booked' },
        { time: '13:00 - 14:00', status: 'booked' },
        { time: '14:00 - 15:00', status: 'available' },
        { time: '15:00 - 16:00', status: 'available' },
      ],
    },
    {
      day: 'Wednesday',
      date: new Date(currentDate.setDate(currentDate.getDate() + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      slots: [
        { time: '08:00 - 09:00', status: 'booked' },
        { time: '09:00 - 10:00', status: 'booked' },
        { time: '10:00 - 11:00', status: 'booked' },
        { time: '11:00 - 12:00', status: 'available' },
        { time: '12:00 - 13:00', status: 'available' },
        { time: '13:00 - 14:00', status: 'available' },
        { time: '14:00 - 15:00', status: 'available' },
        { time: '15:00 - 16:00', status: 'booked' },
      ],
    },
    {
      day: 'Thursday',
      date: new Date(currentDate.setDate(currentDate.getDate() + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      slots: [
        { time: '08:00 - 09:00', status: 'available' },
        { time: '09:00 - 10:00', status: 'available' },
        { time: '10:00 - 11:00', status: 'available' },
        { time: '11:00 - 12:00', status: 'available' },
        { time: '12:00 - 13:00', status: 'booked' },
        { time: '13:00 - 14:00', status: 'booked' },
        { time: '14:00 - 15:00', status: 'available' },
        { time: '15:00 - 16:00', status: 'available' },
      ],
    },
    {
      day: 'Friday',
      date: new Date(currentDate.setDate(currentDate.getDate() + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      slots: [
        { time: '08:00 - 09:00', status: 'booked' },
        { time: '09:00 - 10:00', status: 'booked' },
        { time: '10:00 - 11:00', status: 'available' },
        { time: '11:00 - 12:00', status: 'available' },
        { time: '12:00 - 13:00', status: 'available' },
        { time: '13:00 - 14:00', status: 'booked' },
        { time: '14:00 - 15:00', status: 'booked' },
        { time: '15:00 - 16:00', status: 'booked' },
      ],
    },
  ];

  const handleSlotClick = (day: string, time: string, status: 'available' | 'booked') => {
    if (status === 'booked') return;
    
    const slotId = `${day}-${time}`;
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter(id => id !== slotId));
    } else {
      setSelectedSlots([...selectedSlots, slotId]);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h1 className="text-2xl font-bold">Weekly Schedule</h1>
          <p className="text-blue-100">Select available time slots for booking</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
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
              {schedule[0].slots.map((_, timeIndex) => (
                <tr key={timeIndex} className="hover:bg-gray-50">
                  <td className="p-3 border-b border-gray-200 text-sm text-gray-500 font-medium">
                    {schedule[0].slots[timeIndex].time}
                  </td>
                  {schedule.map((day) => {
                    const slot = day.slots[timeIndex];
                    const slotId = `${day.day}-${slot.time}`;
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
                        onClick={() => handleSlotClick(day.day, slot.time, slot.status)}
                      >
                        <div className={`text-sm font-medium ${
                          slot.status === 'available' 
                            ? isSelected ? 'text-indigo-700' : 'text-green-700'
                            : 'text-red-700'
                        }`}>
                          {slot.status === 'available' 
                            ? isSelected ? 'Selected' : 'Available' 
                            : 'Booked'
                          }
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
          >
            Book Selected ({selectedSlots.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timetable;