import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ticket, 
  ArrowLeft,
  Filter,
  AlertCircle, 
  CheckCircle,
  X,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  User,
  MapPin,
  Clock,
  Globe,
  Briefcase,
  ChevronRight,
  Eye
} from 'lucide-react';
import { ticketService } from '../services/ticketService';
import TicketImageGallery from '../components/TicketImageGallery';

const AdminTicketManagement = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filters, setFilters] = useState({ status: '' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [filters.status]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = filters.status 
        ? await ticketService.getAllTickets(filters.status)
        : await ticketService.getAllTickets();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTicket = async (ticketId, technicianId) => {
    try {
      await ticketService.updateTicketStatus(ticketId, { status: 'IN_PROGRESS', assignedToId: technicianId });
      setSuccessMessage('Ticket assigned successfully');
      setShowAssignModal(false);
      loadTickets();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) { setError(err.message); }
  };

  const handleRejectTicket = async () => {
    if (!selectedTicket || !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    try {
      await ticketService.updateTicketStatus(selectedTicket.id, { status: 'REJECTED', rejectionReason: rejectionReason });
      setSuccessMessage('Ticket rejected successfully');
      setShowRejectModal(false);
      setSelectedTicket(null);
      setRejectionReason('');
      loadTickets();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) { setError(err.message); }
  };

  const openAssignModal = async (ticket) => {
    setSelectedTicket(ticket);
    setShowAssignModal(true);
    setSelectedTechnician('');
    try {
      setLoadingTechnicians(true);
      const techs = await ticketService.getTechnicians();
      setTechnicians(techs);
    } catch (err) { setError('Failed to load technicians: ' + err.message); }
    finally { setLoadingTechnicians(false); }
  };

  const openRejectModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'IN_PROGRESS': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'RESOLVED': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'REJECTED': return 'text-slate-400 bg-slate-100 border-slate-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-orange-600 font-black';
      case 'HIGH': return 'text-orange-500 font-bold';
      default: return 'text-blue-600 font-bold';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      {/* UniSphere Header */}
      <header className="bg-white border-b-2 border-slate-50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 leading-none">UniSphere</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ticket Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Alerts */}
        {successMessage && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 font-bold text-sm">{successMessage}</span>
          </div>
        )}

        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-800">Support <span className="text-orange-500">Queue</span></h2>
            <p className="text-slate-400 font-medium mt-1">Resolve technical logs and maintenance requests.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-full border border-slate-100 shadow-sm">
            <Filter className="w-4 h-4 ml-3 text-slate-400" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-600 pr-8"
            >
              <option value="">All Tickets</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-24 flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Logs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident</th>
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ownership</th>
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="py-5 px-6">
                        <p className="font-bold text-slate-800 text-sm">{ticket.category.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{ticket.description}</p>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`text-[11px] uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-700">{ticket.createdByName}</p>
                            <p className="text-[9px] font-black text-blue-500 uppercase">Applicant</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedTicket(ticket); setShowDetailsModal(true); }} 
                            className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black transition-all shadow-sm"
                            title="Examine Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {ticket.status === 'OPEN' && (
                            <>
                              <button onClick={() => openAssignModal(ticket)} className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button onClick={() => openRejectModal(ticket)} className="w-9 h-9 rounded-full bg-white border border-orange-200 text-orange-500 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {ticket.status === 'IN_PROGRESS' && (
                            <button className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase hover:bg-blue-600 hover:text-white transition-all">
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Branded Modals */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden animate-in zoom-in-95 p-8">
            <h3 className="text-2xl font-black text-slate-800 mb-2">Assign <span className="text-blue-600">Task</span></h3>
            <p className="text-sm text-slate-400 mb-8">Select a qualified technician to resolve this incident.</p>
            
            <div className="space-y-4 mb-8">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technician Selection</label>
              <select 
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Choose Staff Member</option>
                {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleAssignTicket(selectedTicket.id, selectedTechnician)}
                disabled={!selectedTechnician}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 disabled:opacity-50"
              >
                Confirm Assignment
              </button>
              <button onClick={() => setShowAssignModal(false)} className="w-full py-2 text-slate-400 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden animate-in zoom-in-95 p-8">
            <h3 className="text-2xl font-black text-slate-800 mb-2">Reject <span className="text-orange-500">Ticket</span></h3>
            <p className="text-sm text-slate-400 mb-8">Explain why this maintenance request cannot be completed.</p>
            
            <textarea
              rows="4"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reasoning for rejection..."
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 mb-8"
            />

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleRejectTicket}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-100"
              >
                Finalize Rejection
              </button>
              <button onClick={() => setShowRejectModal(false)} className="w-full py-2 text-slate-400 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[3rem] border-t-[12px] border-slate-900 w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black uppercase text-slate-900 tracking-tighter">Incident Diagnostic</h2>
              <button onClick={() => setShowDetailsModal(false)} className="p-3 bg-white rounded-2xl text-slate-900 border-2 border-slate-100 hover:border-slate-900 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Category</p>
                  <p className="text-sm font-black text-slate-900 uppercase">{selectedTicket.category}</p>
                </div>
                <div className="p-6 bg-orange-50 rounded-3xl border-2 border-orange-200">
                  <p className="text-[10px] font-black text-orange-600 uppercase mb-2">Priority</p>
                  <p className="text-sm font-black text-orange-600 uppercase">{selectedTicket.priority}</p>
                </div>
              </div>
              <div className="p-8 bg-slate-900 rounded-[2rem] text-white font-mono text-sm leading-relaxed border-l-8 border-orange-500 shadow-inner">
                <p className="text-orange-500 font-black mb-4 uppercase tracking-[0.3em]">-- Incident Log --</p>
                {selectedTicket.description}
              </div>

              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <TicketImageGallery attachments={selectedTicket.attachments} />
                </div>
              )}
            </div>
            
            <div className="p-8 bg-slate-50 text-center">
               <button onClick={() => setShowDetailsModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-slate-200">Terminate View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketManagement;