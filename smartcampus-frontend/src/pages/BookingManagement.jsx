import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle,
  MapPin,
  ArrowLeft,
  Filter,
  Globe,
  Trash2
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import BookingForm from '../components/BookingForm';

const BookingManagement = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [filters, setFilters] = useState({ status: '' });

  useEffect(() => {
    loadUserBookings();
  }, []);

  const loadUserBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getUserBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = () => {
    setSelectedResource(null);
    setShowBookingForm(true);
  };

  const handleBookingFormClose = () => {
    setShowBookingForm(false);
    setSelectedResource(null);
  };

  const handleBookingSaved = () => {
    setShowBookingForm(false);
    setSelectedResource(null);
    setSuccessMessage('Booking request submitted successfully!');
    loadUserBookings();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancelBooking(bookingId);
      setSuccessMessage('Booking cancelled successfully');
      loadUserBookings();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusStyle = (status, isHovered) => {
    if (isHovered) return 'bg-white text-black border-white';
    switch (status) {
      case 'PENDING': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'APPROVED': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'REJECTED': return 'text-red-600 bg-red-50 border-red-100';
      case 'CANCELLED': return 'text-slate-400 bg-slate-100 border-slate-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-200">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-orange-500" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black leading-none tracking-tighter">
                <span className="text-black">Uni</span>
                <span className="text-orange-500">Sphere</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Booking Control</p>
            </div>
          </div>
          <button
            onClick={handleCreateBooking}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Reservation
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {successMessage && (
          <div className="mb-6 p-4 bg-white border-l-4 border-green-500 rounded-r-2xl shadow-sm flex items-center gap-3 animate-in slide-in-from-left-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{successMessage}</span>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-slate-500" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter">Filter Schedule</h3>
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-6 text-[10px] font-black uppercase tracking-widest focus:border-orange-500 transition-all outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Confirmed</option>
              <option value="REJECTED">Declined</option>
              <option value="CANCELLED">Voided</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retrieving Data...</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Facility</th>
                    <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                    <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="text-center py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings
                    .filter(b => !filters.status || b.status === filters.status)
                    .map((booking) => (
                      <tr 
                        key={booking.id} 
                        className="transition-all group hover:bg-orange-500 relative cursor-default"
                      >
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-white group-hover:text-orange-500 transition-all">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-white transition-colors">{booking.resourceName}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter group-hover:text-orange-100 transition-colors">Capacity: {booking.expectedAttendees}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="space-y-1">
                            <p className="text-slate-900 font-black text-xs uppercase group-hover:text-white transition-colors">{formatDate(booking.startTime)}</p>
                            <p className="text-slate-400 font-bold text-[10px] uppercase flex items-center gap-1 group-hover:text-orange-50 transition-colors">
                              <Clock className="w-3 h-3" />
                              {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border uppercase inline-block shadow-sm transition-all
                            ${getStatusStyle(booking.status, false)} group-hover:bg-white group-hover:text-orange-600 group-hover:border-white`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-6 px-8 text-center">
                          <div className="flex justify-center items-center gap-2">
                            {booking.status === 'APPROVED' || booking.status === 'PENDING' ? (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-widest border border-slate-100 transition-all
                                group-hover:bg-black group-hover:text-white group-hover:border-black hover:!bg-red-600"
                              >
                                <Trash2 className="w-4 h-4" /> Cancel
                              </button>
                            ) : (
                              <span className="text-[9px] font-black text-slate-300 uppercase italic group-hover:text-orange-200">History</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showBookingForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 relative">
            <button 
              onClick={handleBookingFormClose}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
            <BookingForm
              resource={selectedResource}
              onSave={handleBookingSaved}
              onCancel={handleBookingFormClose}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;