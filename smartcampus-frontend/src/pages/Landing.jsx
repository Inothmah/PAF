import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, User, Mail, Calendar, Building, MapPin, 
  Users, Clock, AlertTriangle, Globe, ChevronRight, ShieldCheck 
} from 'lucide-react';
import { resourceService } from '../services/resourceService';
import { bookingService } from '../services/bookingService';
import NotificationBell from '../components/NotificationBell';

const Landing = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [activeResources, userBookings] = await Promise.all([
        resourceService.getActiveResources(),
        bookingService.getUserBookings()
      ]);
      setResources(activeResources.slice(0, 3));
      setBookings(userBookings.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'APPROVED': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'PENDING': return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Updated Balanced Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              {/* Branding: Uni in Black, Sphere in Orange */}
              <h1 className="text-xl font-black leading-none tracking-tighter">
                <span className="text-black">Uni</span>
                <span className="text-orange-500">Sphere</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest transition-all border border-transparent hover:border-red-100"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">
              Hello, <span className="text-blue-600">{user?.name?.split(' ')[0]}</span>
            </h2>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
              Campus Intelligence Ecosystem • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-black uppercase text-slate-700">Active Session</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-100">
                <User className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">{user?.name}</h3>
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-6">{user?.role || 'Academic Member'}</p>
              
              <div className="space-y-4 border-t border-slate-100 pt-6 text-slate-500">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-tighter">ID: {user?.id?.substring(0, 12)}...</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => navigate('/resources')} className="p-6 bg-blue-600 rounded-[2rem] text-white hover:bg-slate-900 transition-all shadow-lg shadow-blue-100 group text-left">
                <Building className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black uppercase tracking-widest">Inventory</p>
              </button>
              <button onClick={() => navigate('/my-bookings')} className="p-6 bg-orange-500 rounded-[2rem] text-white hover:bg-slate-900 transition-all shadow-lg shadow-orange-100 group text-left">
                <Calendar className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black uppercase tracking-widest">Schedule</p>
              </button>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-8">
            {/* Live Inventory (Light Grey Cards) */}
            <div className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900">Live Inventory</h3>
                </div>
                <button onClick={() => navigate('/resources')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:text-slate-900 transition-all">
                  Browse All <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {loading ? (
                <div className="py-10 text-center animate-pulse text-slate-300 font-black uppercase text-[10px]">Syncing...</div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <div key={resource.id} className="p-5 bg-slate-100 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-white hover:shadow-xl hover:shadow-blue-50 transition-all group">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border mb-3 inline-block ${getStatusStyle(resource.status)}`}>
                        {resource.status}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 line-clamp-1 mb-1">{resource.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{resource.location}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Reservations */}
            <div className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900">Active Reservations</h3>
                </div>
                <button onClick={() => navigate('/my-bookings')} className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1 hover:text-slate-900 transition-all">
                  Manage Schedule <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                {bookings.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                    <p className="text-xs font-bold text-slate-400 uppercase">No upcoming tasks</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{booking.resourceName}</p>
                          <p className="text-[10px] font-bold text-slate-400 italic">{new Date(booking.startTime).toDateString()}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black border ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Incident Report Section */}
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-slate-300">
              <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-red-900/30">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Report Incident</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                  Immediate assistance for facility damage, safety concerns, or tech failures.
                </p>
              </div>
              <button 
                onClick={() => navigate('/my-tickets')}
                className="px-8 py-4 bg-white text-slate-900 rounded-full font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl"
              >
                Log Ticket
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;