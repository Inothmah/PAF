import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ticket, Plus, X, AlertCircle, CheckCircle, ArrowLeft, Filter, 
  Trash2, Clock, MapPin, AlertTriangle,
  ShieldAlert, Activity, ChevronRight, Zap, Radiation
} from 'lucide-react';
import { ticketService } from '../services/ticketService';
import TicketForm from '../components/TicketForm';
import TicketImageGallery from '../components/TicketImageGallery';

const UserTicketManagement = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [filters, setFilters] = useState({ status: '' });

  useEffect(() => { loadUserTickets(); }, []);

  const loadUserTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getUserTickets();
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTickets(sorted);
    } catch (err) {
      setError("COMMUNICATION ERROR: Terminal sync failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSaved = () => {
    setShowTicketForm(false);
    setSuccessMessage('INCIDENT BROADCASTED: System log updated.');
    loadUserTickets();
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('WIPE DATA: Erase this incident log?')) return;
    try {
      await ticketService.deleteTicket(ticketId);
      setSuccessMessage('LOG PURGED: Entry removed.');
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("PURGE FAILED: Access denied.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-white text-blue-700 border-2 border-blue-700';
      case 'IN_PROGRESS': return 'bg-orange-500 text-white animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.4)]';
      case 'RESOLVED': return 'bg-green-600 text-white';
      case 'REJECTED': return 'bg-black text-white border-2 border-red-600';
      default: return 'bg-slate-200 text-black';
    }
  };

  const formatTime = (dateString) => {
    const diff = new Date() - new Date(dateString);
    const mins = Math.floor(diff / 60000);
    return mins < 60 ? `${mins} MINS AGO` : new Date(dateString).toLocaleDateString();
  };

  const filteredTickets = tickets.filter(t => !filters.status || t.status === filters.status);

  return (
    <div className="min-h-screen bg-slate-100 text-black font-sans pb-24">
      {/* Header - Non-Italic Industrial Style */}
      <header className="bg-black border-b-4 border-red-600 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="relative">
              <ShieldAlert className="w-10 h-10 text-red-600 animate-pulse" />
              <div className="absolute inset-0 bg-red-600/10 blur-xl animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase leading-none">
                Incident <span className="text-red-600">Response</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Surveillance Active</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowTicketForm(true)}
            className="flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg"
          >
            <Zap className="w-4 h-4 fill-white" /> Deploy Ticket
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* System Error Message */}
        {error && (
          <div className="mb-8 p-5 bg-red-600/10 border-l-8 border-red-600 text-red-600 rounded-2xl flex items-center gap-4 animate-in slide-in-from-left-4">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">CRITICAL ERROR</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-8 p-5 bg-black border-l-8 border-green-500 text-white rounded-2xl flex items-center gap-4 animate-in slide-in-from-left-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">{successMessage}</span>
          </div>
        )}

        {/* Tactical Filter Bar */}
        <div className="bg-white border-2 border-black p-4 rounded-3xl flex items-center gap-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-12">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map(s => (
              <button
                key={s}
                onClick={() => setFilters({ status: s === 'ALL' ? '' : s })}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  (filters.status || 'ALL') === s 
                  ? 'bg-red-600 text-white border-2 border-red-600' 
                  : 'bg-white border-2 border-slate-100 text-slate-400'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="py-24 text-center">
            <Activity className="w-12 h-12 text-black animate-spin mx-auto mb-4" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className={`bg-white rounded-[2.5rem] p-8 border-2 relative overflow-hidden transition-all ${
                    ticket.priority === 'CRITICAL' ? 'border-red-600' : 'border-black'
                  }`}
                >
                  {ticket.priority === 'CRITICAL' && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white px-8 py-1 rotate-45 translate-x-8 translate-y-2 text-[8px] font-black uppercase">
                      Critical
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-xl text-white shadow-lg">
                        {ticket.category === 'HARDWARE' ? '🔧' : ticket.category === 'SOFTWARE' ? '💻' : '⚙️'}
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase text-black">{ticket.category}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-red-600" />
                          <span className="text-[9px] font-black text-slate-500 uppercase">{ticket.location || 'Site Alpha'}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
                    <p className="text-xs font-black text-black leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-5 border-t-2 border-slate-100 mb-6 font-black text-[10px] uppercase">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-600" />
                      <span>{formatTime(ticket.createdAt)}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${ticket.priority === 'CRITICAL' ? 'text-red-600' : 'text-black'}`}>
                      <AlertTriangle className="w-4 h-4" />
                      <span>{ticket.priority}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => { setSelectedTicket(ticket); setShowTicketDetails(true); }}
                      className="flex-1 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      Examine <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="p-4 bg-white border-2 border-black text-black hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center px-10">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Radiation className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">System Log Empty</h3>
                <p className="text-slate-400 text-xs font-bold max-w-xs leading-relaxed uppercase tracking-widest">No active incidents detected in your proximity. Surveillance reporting zero threats.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Details Modal */}
      {showTicketDetails && selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[3rem] border-t-[12px] border-red-600 w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black uppercase text-black tracking-tighter">Diagnostic Report</h2>
              <button onClick={() => setShowTicketDetails(false)} className="p-3 bg-white rounded-2xl text-black border-2 border-black">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border-2 border-black">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Domain</p>
                  <p className="text-sm font-black text-black uppercase">{selectedTicket.category}</p>
                </div>
                <div className="p-6 bg-red-50 rounded-3xl border-2 border-red-600">
                  <p className="text-[10px] font-black text-red-600 uppercase mb-2">Priority</p>
                  <p className="text-sm font-black text-red-600 uppercase">{selectedTicket.priority}</p>
                </div>
              </div>
              <div className="p-8 bg-black rounded-[2rem] text-white font-mono text-xs">
                <p className="text-red-600 font-black mb-4 uppercase tracking-[0.3em]">-- Incident Data --</p>
                {selectedTicket.description}
              </div>

              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <TicketImageGallery attachments={selectedTicket.attachments} />
                </div>
              )}
            </div>
            
            <div className="p-8 bg-slate-50 text-center">
               <button onClick={() => setShowTicketDetails(false)} className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em]">Terminate View</button>
            </div>
          </div>
        </div>
      )}

      {showTicketForm && (
        <TicketForm onSave={handleTicketSaved} onCancel={() => setShowTicketForm(false)} />
      )}
    </div>
  );
};

export default UserTicketManagement;