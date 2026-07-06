import React, { useState } from 'react';

interface RoomSelectorProps {
  floor: number;
  onSelect: (roomNumber: string) => void;
  bookedRooms: Set<string>;
}

export function RoomSelector({ floor, onSelect, bookedRooms }: RoomSelectorProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Rooms are 01 to 40 for a given floor
  const rooms = Array.from({ length: 40 }, (_, i) => {
    const roomNum = i + 1;
    return `${floor}${roomNum.toString().padStart(2, '0')}`;
  });

  return (
    <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
        {rooms.map(room => {
          const isBooked = bookedRooms.has(room);
          const isSelected = selectedRoom === room;
          
          let btnClass = "h-12 border rounded text-xs font-medium transition-colors ";
          if (isBooked) {
             btnClass += "bg-slate-100 text-slate-400 cursor-not-allowed";
          } else if (isSelected) {
             btnClass += "border-2 border-indigo-500 bg-indigo-50 text-indigo-700 font-bold ring-2 ring-indigo-200";
          } else {
             btnClass += "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer";
          }

          return (
            <button
              key={room}
              disabled={isBooked}
              onClick={() => setSelectedRoom(room)}
              className={btnClass}
            >
              {room}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
        <button 
          disabled={!selectedRoom}
          onClick={() => selectedRoom && onSelect(selectedRoom)}
          className="px-8 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedRoom ? `RESERVE ROOM ${selectedRoom}` : 'SELECT A ROOM'}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}
