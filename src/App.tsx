import { useEffect, useState, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { BaseStudent } from './data/students';
import { Booking } from './types';
import { Loader2, Info, LogOut, ExternalLink, Map, CalendarRange } from 'lucide-react';
import { StudentSearch } from './components/StudentSearch';
import { RoomSelector } from './components/RoomSelector';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  
  
  // App View State
  const [currentView, setCurrentView] = useState<'booking' | 'dashboard'>('booking');
  
  // Booking State
  const [step, setStep] = useState(1);
  const [selfStudent, setSelfStudent] = useState<BaseStudent | null>(null);
  const [roommate1, setRoommate1] = useState<BaseStudent | null>(null);
  const [roommate2, setRoommate2] = useState<BaseStudent | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number>(2);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    setFetchingBookings(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*');
    
    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data as Booking[]);
    }
    setFetchingBookings(false);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setStep(1);
    setSelfStudent(null);
    setRoommate1(null);
    setRoommate2(null);
  };

  // Compute booked entities
  const bookedRegNos = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach(b => {
      if (b.student_reg) set.add(b.student_reg);
      if (b.roommate1_reg) set.add(b.roommate1_reg);
      if (b.roommate2_reg) set.add(b.roommate2_reg);
    });
    return set;
  }, [bookings]);

  const bookedRooms = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach(b => {
      if (b.room_number) set.add(b.room_number);
    });
    return set;
  }, [bookings]);

  const userBooking = useMemo(() => {
    if (!session) return null;
    return bookings.find(b => b.user_id === session.user.id);
  }, [session, bookings]);

  const userHasBooked = !!userBooking;

  // Combined Exclusions for the current session state
  const pendingExclusions = useMemo(() => {
    const set = new Set<string>();
    if (selfStudent) set.add(selfStudent['Reg. No.']);
    if (roommate1) set.add(roommate1['Reg. No.']);
    if (roommate2) set.add(roommate2['Reg. No.']);
    return set;
  }, [selfStudent, roommate1, roommate2]);

  const handleBookRoom = async (roomNumber: string) => {
    if (!session || !selfStudent || !roommate1 || !roommate2) return;
    
    setSubmitting(true);
    setError('');

    const newBooking = {
      user_id: session.user.id,
      user_email: session.user.email,
      student_reg: selfStudent['Reg. No.'],
      roommate1_reg: roommate1['Reg. No.'],
      roommate2_reg: roommate2['Reg. No.'],
      floor: selectedFloor,
      room_number: roomNumber
    };

    const { error: insertError } = await supabase
      .from('bookings')
      .insert([newBooking]);

    if (insertError) {
      console.error('Insert error:', insertError);
      setError(insertError.message || 'Failed to book room. Please try again.');
      setSubmitting(false);
    } else {
      await fetchBookings();
      setSubmitting(false);
      setStep(4); // Success step
    }
  };

  const handleDeleteBooking = async () => {
    if (!session) return;
    if (!window.confirm('Are you sure you want to cancel your room reservation? This will free up the room for others.')) return;
    
    setSubmitting(true);
    setError('');

    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('user_id', session.user.id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      setError(deleteError.message || 'Failed to cancel booking. Please try again.');
      setSubmitting(false);
    } else {
      await fetchBookings();
      setStep(1);
      setSelfStudent(null);
      setRoommate1(null);
      setRoommate2(null);
      setSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Student Identity";
      case 2: return "Roommate Selection";
      case 3: return "Select Your Room";
      case 4: return "Confirmation";
      default: return "Booking";
    }
  };

  const renderNavItems = () => {
    const navs = [
      { id: 1, label: "Student Identity" },
      { id: 2, label: "Roommate Selection" },
      { id: 3, label: "Floor & Room" },
      { id: 4, label: "Confirmation" }
    ];

    return navs.map(nav => {
      const isActive = step === nav.id;
      const isPast = step > nav.id;
      
      if (isActive) {
        return (
          <div key={nav.id} className="p-3 bg-slate-800 rounded-lg border border-indigo-500/30 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
            <span className="text-sm font-medium">{nav.label}</span>
          </div>
        );
      }
      
      return (
        <div key={nav.id} className="p-3 text-slate-400 flex items-center gap-3 cursor-default transition-colors hover:text-slate-300">
          <div className={`w-2 h-2 rounded-full ${isPast ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
          <span className="text-sm">{nav.label}</span>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
     return (
       <div className="flex h-screen w-full bg-slate-900 text-white font-sans overflow-hidden items-center justify-center px-4">
         <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-8 text-center shadow-2xl">
           <h1 className="text-2xl font-bold tracking-tight text-indigo-400 mb-2">HALL 14 BOOKER</h1>
           <p className="text-sm text-slate-400 mb-8 uppercase tracking-widest">NIT Durgapur • Unofficial</p>
           
           <button
             onClick={handleLogin}
             className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-3.5 px-4 rounded-lg hover:bg-slate-50 font-bold transition-all shadow-md"
           >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
             </svg>
             CONTINUE WITH GOOGLE
           </button>

         </div>
       </div>
     )
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col border-r border-slate-800 flex-shrink-0 hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-indigo-400">HALL 14 BOOKER</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">NIT Durgapur • Unofficial</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {renderNavItems()}
        </nav>
        <div className="p-6 border-t border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
              {selfStudent ? selfStudent.Name.charAt(0) : session.user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{selfStudent ? selfStudent.Name : session.user.email}</p>
              {selfStudent && <p className="text-xs text-slate-500 truncate">{selfStudent.Program} • {selfStudent['Reg. No.']}</p>}
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white flex-shrink-0 ml-2 p-1" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">
              {userHasBooked ? 'CONFIRMED' : `STEP ${step} OF 4`}
            </span>
            <h2 className="font-semibold text-slate-700 hidden sm:block">
              {userHasBooked ? 'Reservation Complete' : getStepTitle()}
            </h2>
          </div>
          {step === 3 && !userHasBooked && (
            <div className="flex gap-4 hidden sm:flex">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                <span className="text-xs text-slate-500">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-300 rounded-sm"></div>
                <span className="text-xs text-slate-500">Reserved</span>
              </div>
            </div>
          )}
          {/* Mobile Header Logout */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={() => setCurrentView(currentView === 'booking' ? 'dashboard' : 'booking')}
              className="text-slate-500 hover:text-slate-800 p-2 bg-slate-100 rounded-full"
            >
              {currentView === 'booking' ? <Map size={18} /> : <CalendarRange size={18} />}
            </button>
            <button onClick={handleLogout} className="text-slate-500 hover:text-slate-800 p-2" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-8 bg-slate-50 relative">
          <div className="max-w-6xl mx-auto">
            {/* View Toggle Tabs (Desktop) */}
            <div className="hidden md:flex justify-center mb-8">
              <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex shadow-sm">
                <button
                  onClick={() => setCurrentView('booking')}
                  className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                    currentView === 'booking'
                      ? 'bg-slate-900 text-white shadow'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CalendarRange size={16} />
                  BOOKING
                </button>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                    currentView === 'dashboard'
                      ? 'bg-slate-900 text-white shadow'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Map size={16} />
                  MAP DASHBOARD
                </button>
              </div>
            </div>

            {currentView === 'dashboard' ? (
              <Dashboard bookings={bookings} />
            ) : (
              <>
                {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {userHasBooked ? (
              <div className="max-w-xl mx-auto bg-white p-8 sm:p-10 rounded-xl border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Reservation Confirmed</h2>
                <p className="text-sm text-slate-500 mb-8">
                  Your room has been successfully booked. You can safely close this page.
                </p>
                
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 text-left">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Booking Account</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-center">
                      <span className="text-slate-500">Google Account</span>
                      <span className="font-medium text-slate-900">{session?.user?.email}</span>
                    </li>
                    {userBooking && (
                      <li className="flex justify-between items-center">
                        <span className="text-slate-500">Room</span>
                        <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded">Room {userBooking.room_number} (Floor {userBooking.floor})</span>
                      </li>
                    )}
                    <li className="flex justify-between items-center">
                      <span className="text-slate-500">Status</span>
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">Booked</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <button
                    onClick={handleDeleteBooking}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
                  >
                    CANCEL RESERVATION
                  </button>
                </div>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Step 1: Identify Yourself</h3>
                    
                    {!selfStudent ? (
                      <StudentSearch 
                        label="Search Database" 
                        pendingExclusions={pendingExclusions}
                        bookings={bookings}
                        onSelect={(student) => setSelfStudent(student)}
                      />
                    ) : (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-indigo-900">{selfStudent.Name}</p>
                          <p className="text-sm text-indigo-700 mt-1">{selfStudent['Reg. No.']} • {selfStudent.Program}</p>
                        </div>
                        <button 
                          onClick={() => setSelfStudent(null)}
                          className="text-xs font-bold bg-white text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded hover:bg-indigo-50"
                        >
                          CHANGE
                        </button>
                      </div>
                    )}

                    <div className="mt-8 flex justify-end">
                      <button
                        disabled={!selfStudent}
                        onClick={() => setStep(2)}
                        className="px-8 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        CONTINUE
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Roommate 1</h3>
                        {!roommate1 ? (
                          <StudentSearch 
                            label="Search Database" 
                            pendingExclusions={pendingExclusions}
                            bookings={bookings}
                            onSelect={(student) => setRoommate1(student)}
                          />
                        ) : (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-900">{roommate1.Name}</p>
                              <p className="text-sm text-slate-500 mt-1">{roommate1['Reg. No.']} • {roommate1.Program}</p>
                            </div>
                            <button 
                              onClick={() => setRoommate1(null)}
                              className="text-xs font-bold bg-white text-slate-600 border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-100"
                            >
                              REMOVE
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Roommate 2</h3>
                        {!roommate2 ? (
                          <StudentSearch 
                            label="Search Database" 
                            pendingExclusions={pendingExclusions}
                            bookings={bookings}
                            onSelect={(student) => setRoommate2(student)}
                          />
                        ) : (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-900">{roommate2.Name}</p>
                              <p className="text-sm text-slate-500 mt-1">{roommate2['Reg. No.']} • {roommate2.Program}</p>
                            </div>
                            <button 
                              onClick={() => setRoommate2(null)}
                              className="text-xs font-bold bg-white text-slate-600 border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-100"
                            >
                              REMOVE
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="text-sm font-bold text-slate-500 hover:text-slate-900 px-4 py-2 w-full sm:w-auto"
                      >
                        BACK
                      </button>
                      <button
                        disabled={!roommate1 || !roommate2}
                        onClick={() => setStep(3)}
                        className="px-8 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                      >
                        PROCEED TO ROOMS
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-4 space-y-6">
                      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Current Reservation Group</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                            <span className="text-sm font-medium truncate">{selfStudent?.Name}</span>
                            <span className="text-[10px] bg-slate-200 px-2 py-1 rounded ml-2 flex-shrink-0">SELF</span>
                          </div>
                          {roommate1 && (
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                              <span className="text-sm truncate">{roommate1.Name}</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded ml-2 flex-shrink-0">MALE</span>
                            </div>
                          )}
                          {roommate2 && (
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                              <span className="text-sm truncate">{roommate2.Name}</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded ml-2 flex-shrink-0">MALE</span>
                            </div>
                          )}
                        </div>
                      </section>
                      
                      <section className="bg-indigo-900 p-6 rounded-xl text-white hidden sm:block">
                        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Booking Guidelines</h3>
                        <ul className="text-sm space-y-2 text-indigo-100">
                          <li className="flex gap-2">• 3 people per room required</li>
                          <li className="flex gap-2">• Male-only occupancy for Hall 14</li>
                          <li className="flex gap-2">• Room locking is permanent</li>
                        </ul>
                      </section>

                      <button
                        onClick={() => setStep(2)}
                        disabled={submitting}
                        className="text-sm font-bold text-slate-500 hover:text-slate-900 px-4 py-2 w-full text-left hidden xl:block"
                      >
                        ← BACK TO ROOMMATES
                      </button>
                    </div>
                    
                    <div className="xl:col-span-8 flex flex-col gap-6">
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {[2, 3, 4, 5, 6, 7, 8].map(f => (
                          <button
                            key={f}
                            onClick={() => setSelectedFloor(f)}
                            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                              selectedFloor === f
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-500'
                            }`}
                          >
                            Floor {f}
                          </button>
                        ))}
                      </div>
                      
                      {fetchingBookings ? (
                         <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center min-h-[300px]">
                           <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                         </div>
                      ) : (
                        <RoomSelector 
                          floor={selectedFloor}
                          bookedRooms={bookedRooms}
                          onSelect={handleBookRoom}
                        />
                      )}
                      
                      <button
                        onClick={() => setStep(2)}
                        disabled={submitting}
                        className="text-sm font-bold text-slate-500 hover:text-slate-900 px-4 py-2 w-full text-center xl:hidden mt-4 bg-white rounded-lg border border-slate-200"
                      >
                        BACK TO ROOMMATES
                      </button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="max-w-xl mx-auto bg-white p-8 sm:p-10 rounded-xl border border-slate-200 shadow-sm text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Reservation Confirmed</h2>
                    <p className="text-sm text-slate-500 mb-8">
                      Your room has been successfully booked. You and your roommates are now registered.
                    </p>
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 text-left">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Booking Summary</h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex justify-between items-center">
                          <span className="text-slate-500">Room</span>
                          <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded">Floor {selectedFloor}</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-slate-500">Applicant</span>
                          <span className="font-medium text-slate-900">{selfStudent?.Name}</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-slate-500">Roommate 1</span>
                          <span className="font-medium text-slate-900">{roommate1?.Name}</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-slate-500">Roommate 2</span>
                          <span className="font-medium text-slate-900">{roommate2?.Name}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* End of view toggle wrapper */}
            </>
            )}

            {/* Submitting Overlay */}
            {submitting && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-200">
                  <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                  <span className="font-bold text-slate-900 text-sm tracking-wide">RESERVING ROOM...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

