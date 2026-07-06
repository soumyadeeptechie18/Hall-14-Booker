import React, { useState, useMemo } from 'react';
import { BaseStudent, STUDENT_DATABASE } from '../data/students';
import { Search, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Booking } from '../types';

interface StudentSearchProps {
  onSelect: (student: BaseStudent) => void;
  pendingExclusions: Set<string>;
  bookings: Booking[];
  label: string;
}

export function StudentSearch({ onSelect, pendingExclusions, bookings, label }: StudentSearchProps) {
  const [search, setSearch] = useState('');
  const [expandedRegNo, setExpandedRegNo] = useState<string | null>(null);

  const getBookingForStudent = (regNo: string) => {
    return bookings.find(b => 
      b.student_reg === regNo || 
      b.roommate1_reg === regNo || 
      b.roommate2_reg === regNo
    );
  };
  
  const getStudentName = (regNo: string) => {
    return STUDENT_DATABASE.find(s => s['Reg. No.'] === regNo)?.Name || regNo;
  };

  const filteredStudents = useMemo(() => {
    if (!search.trim() || search.length < 3) return [];
    
    const lowerSearch = search.toLowerCase();
    return STUDENT_DATABASE.filter(student => {
      if (pendingExclusions.has(student['Reg. No.'])) return false;
      if (student.Gender !== 'M') return false; // Enforce male only
      
      return student.Name.toLowerCase().includes(lowerSearch) || 
             student['Reg. No.'].toLowerCase().includes(lowerSearch);
    }).slice(0, 10); // Limit to 10 results for performance
  }, [search, pendingExclusions]);

  return (
    <div className="space-y-4">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50"
          placeholder="Search by Name or Reg. No. (min 3 chars)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredStudents.length > 0 && (
        <ul className="mt-2 divide-y divide-slate-100 border border-slate-200 rounded-lg max-h-80 overflow-y-auto bg-white shadow-sm custom-scrollbar">
          {filteredStudents.map((student) => {
            const booking = getBookingForStudent(student['Reg. No.']);
            const isBooked = !!booking;
            const isExpanded = expandedRegNo === student['Reg. No.'];

            if (isBooked) {
              return (
                <li key={student['Reg. No.']} className="p-3 bg-slate-50 flex flex-col gap-2 transition-colors">
                  <div className="flex justify-between items-center opacity-60">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{student.Name}</p>
                      <p className="text-xs text-slate-500">{student['Reg. No.']} - {student.Program}</p>
                    </div>
                    <button 
                      onClick={() => setExpandedRegNo(isExpanded ? null : student['Reg. No.'])}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      DETAILS {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                  
                  {isExpanded && (
                    <div className="text-xs text-slate-700 bg-white p-3 rounded border border-slate-200 flex flex-col gap-2 mt-1 shadow-sm">
                      <div className="flex items-center gap-1.5 text-red-600 font-bold mb-1 pb-2 border-b border-slate-100">
                        <Info size={14} />
                        ALREADY REGISTERED
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Booked By</span>
                          <span className="font-medium text-slate-900 truncate block">{booking.user_email || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Room Assigned</span>
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 inline-block">Room {booking.room_number} (Floor {booking.floor})</span>
                        </div>
                        <div className="col-span-2 mt-1">
                          <span className="text-slate-400 block mb-1 text-[10px] uppercase font-bold tracking-wider">Roommates</span>
                          <div className="bg-slate-50 rounded border border-slate-100 p-2 space-y-1 text-slate-600">
                            <div className="truncate">• {getStudentName(booking.student_reg)} ({booking.student_reg})</div>
                            <div className="truncate">• {getStudentName(booking.roommate1_reg)} ({booking.roommate1_reg})</div>
                            <div className="truncate">• {getStudentName(booking.roommate2_reg)} ({booking.roommate2_reg})</div>
                          </div>
                        </div>
                        <div className="col-span-2 text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span>Booked on: {new Date(booking.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            }

            return (
              <li 
                key={student['Reg. No.']} 
                className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors"
                onClick={() => {
                  onSelect(student);
                  setSearch('');
                }}
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{student.Name}</p>
                  <p className="text-xs text-slate-500">{student['Reg. No.']} - {student.Program}</p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  SELECT
                </span>
              </li>
            );
          })}
        </ul>
      )}
      
      {search.length >= 3 && filteredStudents.length === 0 && (
        <p className="text-sm text-slate-500 mt-2 text-center py-4">No matching students found or already selected.</p>
      )}
    </div>
  );
}
