import React, { useState } from 'react';
import { Booking } from '../types';
import { STUDENT_DATABASE } from '../data/students';
import { X, User, Users, Mail, Clock } from 'lucide-react';

interface DashboardProps {
  bookings: Booking[];
}

export function Dashboard({ bookings }: DashboardProps) {
  const [selectedFloor, setSelectedFloor] = useState<number>(2);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const bookingsByRoom = new Map<string, Booking>();
  bookings.forEach(b => bookingsByRoom.set(b.room_number, b));

  const getStudent = (regNo: string) => {
    return STUDENT_DATABASE.find(s => s['Reg. No.'] === regNo);
  };
  
  const getFirstName = (regNo: string) => {
    const fullName = getStudent(regNo)?.Name || regNo;
    return fullName.split(' ')[0];
  };

  const rooms = Array.from({ length: 40 }, (_, i) => {
    const roomNum = i + 1;
    return `${selectedFloor}${roomNum.toString().padStart(2, '0')}`;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hall 14 Occupancy Map</h2>
          <p className="text-sm text-slate-500">Live view of room reservations across all floors.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded-sm"></div>
            <span className="text-xs font-medium text-slate-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-50 border-2 border-indigo-500 rounded-sm"></div>
            <span className="text-xs font-medium text-slate-600">Reserved</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex overflow-x-auto gap-2 custom-scrollbar">
          {[2, 3, 4, 5, 6, 7, 8].map(f => (
            <button
              key={f}
              onClick={() => setSelectedFloor(f)}
              className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                selectedFloor === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              Floor {f}
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4">
            {rooms.map(room => {
              const booking = bookingsByRoom.get(room);
              const isBooked = !!booking;

              return (
                <button 
                  key={room}
                  onClick={() => isBooked && setSelectedBooking(booking)}
                  className={`
                    relative flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all h-28
                    ${isBooked 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm hover:bg-indigo-100 cursor-pointer' 
                      : 'bg-emerald-50/50 border-emerald-200 text-emerald-700 cursor-default'}
                  `}
                >
                  <span className={`text-lg font-bold ${isBooked ? 'text-indigo-700' : 'text-emerald-600'}`}>
                    {room}
                  </span>
                  
                  {isBooked && booking ? (
                    <div className="flex flex-col items-center mt-1 w-full text-[9px] font-bold uppercase tracking-wider text-indigo-700 leading-[1.2]">
                      <span className="truncate w-full text-center">{getFirstName(booking.student_reg)}</span>
                      <span className="truncate w-full text-center">{getFirstName(booking.roommate1_reg)}</span>
                      <span className="truncate w-full text-center">{getFirstName(booking.roommate2_reg)}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-wider text-center px-1 overflow-hidden text-ellipsis w-full">
                      Available
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Room {selectedBooking.room_number} (Floor {selectedBooking.floor})</h3>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <User size={18} />
                  <h4 className="font-bold uppercase tracking-wider text-xs">Registered By</h4>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="font-bold text-slate-900">{getStudent(selectedBooking.student_reg)?.Name || selectedBooking.student_reg}</p>
                  <p className="text-sm text-slate-500">{selectedBooking.student_reg} • {getStudent(selectedBooking.student_reg)?.Program}</p>
                  {selectedBooking.user_email && (
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 inline-flex">
                      <Mail size={14} />
                      {selectedBooking.user_email}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <Users size={18} />
                  <h4 className="font-bold uppercase tracking-wider text-xs">Roommates</h4>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                  <div>
                    <p className="font-bold text-slate-900">{getStudent(selectedBooking.roommate1_reg)?.Name || selectedBooking.roommate1_reg}</p>
                    <p className="text-sm text-slate-500">{selectedBooking.roommate1_reg} • {getStudent(selectedBooking.roommate1_reg)?.Program}</p>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <p className="font-bold text-slate-900">{getStudent(selectedBooking.roommate2_reg)?.Name || selectedBooking.roommate2_reg}</p>
                    <p className="text-sm text-slate-500">{selectedBooking.roommate2_reg} • {getStudent(selectedBooking.roommate2_reg)?.Program}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded justify-center border border-slate-100">
                <Clock size={14} />
                Booked on {new Date(selectedBooking.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
