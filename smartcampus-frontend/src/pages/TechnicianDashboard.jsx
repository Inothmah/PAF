import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, Wrench, Hammer, AlertTriangle, CheckCircle, Clock, 
  Settings, FileText, Plus, RefreshCw, Eye, X, Activity, MapPin, User, ShieldCheck, Zap
} from 'lucide-react';
import { ticketService } from '../services/ticketService';
import TicketForm from '../components/TicketForm';
import NotificationBell from '../components/NotificationBell';

const TechnicianDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Logic States
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ openTickets: 0, inProgress: 0, resolved: 0, totalTasks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // UI States
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadAssignedTickets();
  }, []);

  const loadAssignedTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketService.getAssignedTickets();
      const ticketList = data || [];
      setTickets(ticketList);
      
      setStats({
        openTickets: ticketList.filter(t => t.status === 'OPEN').length,
        inProgress: ticketList.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: ticketList.filter(t => t.status === 'RESOLVED').length,
        totalTasks: ticketList.length
      });
    } catch (err) {
      setError("SYSTEM OFFLINE: Connection to central database interrupted.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus, notes = '') => {
    try {
      setError(null);
      const updateData = { status: newStatus, ...(notes && { resolutionNotes: notes }) };
      await ticketService.updateTicketStatus(ticketId, updateData);
      setSuccessMessage(`PROTOCOL UPDATED: ${newStatus.replace('_', ' ')}`);
      loadAssignedTickets();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket || !resolutionNotes.trim()) return;
    await handleUpdateStatus(selectedTicket.id, 'RESOLVED', resolutionNotes);
    setShowResolveModal(false);
    setSelectedTicket(null);
    setResolutionNotes('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Heavy-Duty Header */}
      <header className="bg-[#1e293b] border-b-4 border-orange-500 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-500 rounded-lg shadow-lg shadow-orange-950/20">
              <Zap className="w-8 h-8 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase leading-none text-white">
                TECH<span className="text-orange-500">TERMINAL</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-[0.2em]">Maintenance Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button onClick={logout} className="px-5 py-2 bg-slate-800 hover:bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Alerts & Messages */}
        {(error || successMessage) && (
          <div className={`mb-8 p-4 border-l-8 rounded-r-2xl flex items-center gap-4 bg-white shadow-md border-${error ? 'red-500' : 'orange-500'}`}>
            <Activity className={error ? 'text-red-500' : 'text-orange-500'} />
            <span className="text-xs font-black uppercase tracking-widest">{error || successMessage}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Technician Profile */}
          <section className="lg:col-span-1">
            <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] p-8 h-full shadow-sm hover:border-orange-500 transition-colors">
              <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center border-4 border-orange-500 mb-4 shadow-inner">
                  <User className="w-10 h-10 text-slate-800" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">{user?.name || "Field Agent"}</h3>
                <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 mt-2 rounded-full border border-orange-100 uppercase tracking-widest">Certified Technician</span>
              </div>
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operator ID</p>
                  <p className="font-mono text-sm font-bold bg-slate-50 p-3 rounded-xl border border-slate-100 text-blue-600">{user?.id || "ID-UNKNOWN"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Auth Email</p>
                  <p className="text-sm font-bold truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tactical Stats */}
          <section className="lg:col-span-2 grid grid-cols-2 gap-4">
            {[
              { label: 'Pending Ops', val: stats.openTickets, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Active Work', val: stats.inProgress, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Resolved', val: stats.resolved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Total Tasks', val: stats.totalTasks, icon: Hammer, color: 'text-blue-600', bg: 'bg-blue-50' }
            ].map((s, i) => (
              <div key={i} className="bg-white border-2 border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between hover:border-orange-500 transition-all group">
                <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <s.icon className={`w-7 h-7 ${s.color}`} />
                </div>
                <div>
                  <h4 className="text-5xl font-black mb-1 tracking-tighter">{s.val}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Action Grid */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2">
          <button onClick={() => setShowTicketForm(true)} className="flex items-center gap-3 px-10 py-5 bg-orange-500 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-orange-100 font-black uppercase text-xs tracking-[0.2em] whitespace-nowrap">
            <Plus className="w-5 h-5" /> Initialize Incident
          </button>
          <button onClick={() => navigate('/my-tickets')} className="flex items-center gap-3 px-10 py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl hover:border-orange-500 transition-all font-black uppercase text-xs tracking-[0.2em] whitespace-nowrap shadow-sm">
            <FileText className="w-5 h-5 text-orange-500" /> View Task Ledger
          </button>
        </div>

        {/* Maintenance Queue */}
        <div className="bg-white border-2 border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
          <div className="p-8 border-b-2 border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Wrench className="text-orange-500" /> Assigned Task Queue
            </h3>
            <button onClick={loadAssignedTickets} className="p-3 bg-white border-2 border-slate-200 rounded-2xl hover:border-orange-500 transition-colors">
              <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="py-20 flex justify-center"><Activity className="animate-spin text-orange-500 w-12 h-12" /></div>
            ) : tickets.length === 0 ? (
              <div className="py-20 text-center">
                <ShieldCheck className="mx-auto w-16 h-16 mb-4 text-slate-200" />
                <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">Station Secure: No active assignments</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] hover:border-orange-500 transition-all shadow-sm group">
                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${
                            ticket.status === 'OPEN' ? 'border-blue-600 text-blue-600' : 
                            ticket.status === 'IN_PROGRESS' ? 'bg-orange-500 text-white border-orange-500 animate-pulse' : 
                            'bg-green-600 text-white border-green-600'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${ticket.priority === 'CRITICAL' ? 'text-red-600' : 'text-slate-400'}`}>
                            {ticket.priority} PRIORITY
                          </span>
                        </div>
                        <h4 className="text-xl font-black uppercase mb-2 tracking-tight group-hover:text-orange-600 transition-colors">{ticket.category}</h4>
                        <p className="text-sm text-slate-500 font-bold mb-6 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border-l-4 border-orange-500">
                          "{ticket.description}"
                        </p>
                        <div className="flex flex-wrap gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> {ticket.location || 'Zone Delta'}</span>
                           <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex lg:flex-col gap-3 justify-center">
                        <button onClick={() => setSelectedTicket(ticket)} className="p-5 bg-slate-50 rounded-2xl hover:bg-orange-500 hover:text-white transition-all border border-slate-100 group">
                          <Eye className="w-6 h-6" />
                        </button>
                        {ticket.status === 'OPEN' && (
                          <button onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')} className="flex-1 lg:flex-none px-10 py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-orange-500 shadow-lg transition-all">
                            Start Op
                          </button>
                        )}
                        {ticket.status === 'IN_PROGRESS' && (
                          <button onClick={() => { setSelectedTicket(ticket); setShowResolveModal(true); }} className="flex-1 lg:flex-none px-10 py-5 bg-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-orange-600 shadow-xl shadow-orange-100 transition-all">
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Operation Resolution Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[3rem] border-t-[15px] border-orange-500 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h2 className="text-xl font-black uppercase tracking-tighter">Resolution Protocol</h2>
               <button onClick={() => setShowResolveModal(false)} className="p-2 border-2 border-slate-200 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-10 space-y-6">
              <textarea 
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="INPUT REPAIR LOG DATA..."
                className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[2rem] font-black text-slate-900 text-xs uppercase focus:border-orange-500 outline-none transition-all"
                rows="4"
              />
              <button onClick={handleResolve} disabled={!resolutionNotes.trim()} className="w-full py-6 bg-orange-500 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl disabled:opacity-20 shadow-xl shadow-orange-100 transition-all">
                Transmit Final Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Detail Modal */}
      {selectedTicket && !showResolveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[3rem] border-t-[15px] border-slate-900 w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-8 flex justify-between items-center">
               <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900">Incident Diagnostic</h2>
               <button onClick={() => setSelectedTicket(null)} className="p-2 bg-slate-50 rounded-xl"><X className="w-5 h-5 text-slate-900" /></button>
            </div>
            <div className="px-10 pb-10 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Current Status</p>
                        <p className="font-black uppercase text-orange-500">{selectedTicket.status}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Assigned Priority</p>
                        <p className="font-black uppercase text-red-600">{selectedTicket.priority}</p>
                    </div>
                </div>
                <div className="p-8 bg-slate-900 rounded-[2rem] text-white font-mono text-sm leading-relaxed border-l-8 border-orange-500 shadow-inner">
                   <p className="text-orange-500 font-black mb-4 uppercase tracking-[0.2em]">-- SYSTEM LOG READOUT --</p>
                   {selectedTicket.description}
                </div>
                <button onClick={() => setSelectedTicket(null)} className="w-full py-5 border-2 border-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-md">Close Report</button>
            </div>
          </div>
        </div>
      )}

      {showTicketForm && (
        <TicketForm 
          onSave={() => { setShowTicketForm(false); loadAssignedTickets(); }} 
          onCancel={() => setShowTicketForm(false)} 
        />
      )}
    </div>
  );
};

export default TechnicianDashboard;