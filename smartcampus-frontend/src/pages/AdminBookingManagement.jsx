import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  X, 
  AlertCircle,
  Users,
  MapPin,
  ArrowLeft,
  Filter,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Globe
} from 'lucide-react';
import { bookingService } from '../services/bookingService';

const AdminBookingManagement = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filters, setFilters] = useState({ status: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadBookings();
  }, [filters.status]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = filters.status 
        ? await bookingService.getBookingsByStatus(filters.status)
        : await bookingService.getAllBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await bookingService.approveBooking(bookingId);
      setSuccessMessage('Booking approved successfully');
      loadBookings();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectBooking = async () => {
    if (!selectedBooking || !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    try {
      await bookingService.rejectBooking(selectedBooking.id, rejectionReason);
      setSuccessMessage('Booking rejected successfully');
      setShowRejectModal(false);
      setSelectedBooking(null);
      setRejectionReason('');
      loadBookings();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const openRejectModal = (booking) => { setSelectedBooking(booking); setShowRejectModal(true); };
  const closeRejectModal = () => { setShowRejectModal(false); setSelectedBooking(null); setRejectionReason(''); };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'APPROVED': return 'text-green-600 bg-green-50 border-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-50 border-red-100';
      case 'CANCELLED': return 'text-slate-400 bg-slate-50 border-slate-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* UniSphere Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-800 leading-none">UniSphere</h1>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Booking Control</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Alerts */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-bold text-sm">{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-bold text-sm">{error}</span>
          </div>
        )}

        {/* Filter Toggle */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Reservations</h2>
            <p className="text-slate-500 font-medium">Review and process campus resource requests.</p>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all border ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Close Filters' : 'Filter Status'}
          </button>
        </div>

        {showFilters && (
          <div className="mb-8 p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm animate-in zoom-in-95">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Filter by Status</label>
            <div className="flex flex-wrap gap-2">
              {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilters({ status })}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${filters.status === status ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}
                >
                  {status || 'ALL BOOKINGS'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Syncing with Sphere...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant</th>
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-5 px-6">
                        <p className="font-bold text-slate-800">{booking.userName}</p>
                        <p className="text-xs font-medium text-slate-400">{booking.userId}</p>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 text-sm">{booking.resourceName}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">{booking.purpose}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-xs font-bold">{formatDate(booking.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${getStatusStyle(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleApproveBooking(booking.id)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                title="Approve"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openRejectModal(booking)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Reject"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            booking.rejectionReason && (
                              <div className="group relative">
                                <MessageSquare className="w-5 h-5 text-slate-300 hover:text-blue-500 cursor-help transition-colors" />
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-48 p-3 bg-slate-900 text-white text-[10px] rounded-xl shadow-xl z-10">
                                  <p className="font-bold mb-1 uppercase text-orange-400">Rejection Reason:</p>
                                  {booking.rejectionReason}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && bookings.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Reservations Found</h3>
              <p className="text-sm text-slate-500">The booking queue is currently empty.</p>
            </div>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {showRejectModal && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Reject Booking</h3>
                  <p className="text-xs font-bold text-red-500 uppercase mt-1">Declining Request</p>
                </div>
                <button onClick={closeRejectModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Booking Info</p>
                <p className="text-sm font-bold text-slate-700">{selectedBooking.resourceName}</p>
                <p className="text-xs text-slate-500 italic mt-1">"{selectedBooking.purpose}"</p>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Reason for Rejection *</label>
                <textarea
                  rows="4"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide details for the applicant..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm font-medium"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRejectBooking}
                  disabled={!rejectionReason.trim()}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-100 disabled:opacity-50 disabled:shadow-none"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={closeRejectModal}
                  className="w-full py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingManagement;