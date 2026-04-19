import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, Plus, Settings, Shield, Activity, Database, AlertCircle, Calendar, Clock, CheckCircle, Ticket, Globe } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import ResourceForm from '../components/ResourceForm';
import { resourceService } from '../services/resourceService';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    technicianUsers: 0,
    regularUsers: 0
  });

  useEffect(() => {
    // Preserve original mock data logic
    setStats({
      totalUsers: 150,
      adminUsers: 5,
      technicianUsers: 12,
      regularUsers: 133
    });
  }, []);

  const handleLogout = () => logout();
  const handleCreateResource = () => { setSelectedResource(null); setShowResourceForm(true); };
  const handleResourceFormClose = () => { setShowResourceForm(false); setSelectedResource(null); };

  const handleResourceSave = async (resourceData) => {
    try {
      setLoading(true);
      setError(null);
      await resourceService.createResource(resourceData);
      setSuccess('Resource created successfully!');
      handleResourceFormClose();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create resource');
    } finally {
      setLoading(false);
    }
  };

  const navigateToResources = () => navigate('/resources');
  const navigateToResourceManagement = () => navigate('/admin/resources');
  const navigateToBookingManagement = () => navigate('/admin/bookings');
  const navigateToTicketManagement = () => navigate('/admin/tickets');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Alerts */}
      <div className="fixed top-24 right-8 z-[110] space-y-4 max-w-sm w-full">
        {success && (
          <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300 font-bold text-xs uppercase tracking-widest border-2 border-white">
            <CheckCircle className="w-5 h-5 text-white" />
            {success}
          </div>
        )}
        {error && (
          <div className="bg-orange-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300 font-bold text-xs uppercase tracking-widest border-2 border-white">
            <AlertCircle className="w-5 h-5 text-white" />
            {error}
          </div>
        )}
      </div>
      {/* UniSphere Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-200">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-800">
                  Uni<span className="text-orange-500">Sphere</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all font-bold text-sm border border-orange-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2">
            Control <span className="text-orange-500">Center</span>
          </h2>
          <p className="text-slate-500 text-lg">
            Monitor campus operations, manage resources, and oversee support tickets.
          </p>
        </div>

        {/* Admin Profile & Overview Stats */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Profile Card */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-[2rem] p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-slate-800">
              <Shield className="w-5 h-5 text-orange-500" />
              Profile Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Administrator</label>
                <p className="text-slate-900 font-bold text-lg leading-tight">{user?.name || 'Authorized Admin'}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">System Email</label>
                <p className="text-slate-600 font-medium truncate">{user?.email}</p>
              </div>
              <div className="pt-4 flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-tighter">Admin ID: {user?.id}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', val: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Admins', val: stats.adminUsers, icon: Shield, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Technicians', val: stats.technicianUsers, icon: Settings, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Regular', val: stats.regularUsers, icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 p-6 rounded-[1.5rem] flex flex-col items-center justify-center text-center shadow-sm">
                <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 leading-none mb-1">{s.val}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Modules */}
        <div className="space-y-10">
          
          {/* Booking Management */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
              <Calendar className="w-5 h-5 text-blue-600" />
              Booking & Reservations
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
                <div>
                  <Calendar className="w-8 h-8 text-blue-600 mb-4" />
                  <h4 className="text-lg font-bold text-slate-900">Manage Requests</h4>
                  <p className="text-slate-500 text-sm mb-6">Review, approve, or decline user reservation requests.</p>
                </div>
                <button onClick={navigateToBookingManagement} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-100">
                  Manage Bookings
                </button>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
                <div>
                  <Users className="w-8 h-8 text-orange-500 mb-4" />
                  <h4 className="text-lg font-bold text-slate-900">Queue Overview</h4>
                  <p className="text-slate-500 text-sm mb-6">Real-time view of pending resource approvals.</p>
                </div>
                <button onClick={navigateToBookingManagement} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-orange-100">
                  View Pending
                </button>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
                <div>
                  <CheckCircle className="w-8 h-8 text-blue-600 mb-4" />
                  <h4 className="text-lg font-bold text-slate-900">Usage Data</h4>
                  <p className="text-slate-500 text-sm mb-6">Comprehensive analytics on resource utilization.</p>
                </div>
                <button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2.5 px-4 rounded-xl transition-colors">
                  View Analytics
                </button>
              </div>
            </div>
          </section>

          {/* Ticket Management */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
              <Ticket className="w-5 h-5 text-orange-500" />
              Technical Tickets
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100 flex flex-col justify-between">
                <div>
                  <Ticket className="w-8 h-8 text-orange-600 mb-4" />
                  <h4 className="text-lg font-bold text-slate-900">Active Tickets</h4>
                  <p className="text-slate-500 text-sm mb-6">Oversee all maintenance and support threads.</p>
                </div>
                <button onClick={navigateToTicketManagement} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl transition-colors">
                  Manage Tickets
                </button>
              </div>
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex flex-col justify-between">
                <div>
                  <AlertCircle className="w-8 h-8 text-blue-600 mb-4" />
                  <h4 className="text-lg font-bold text-slate-900">Open Issues</h4>
                  <p className="text-slate-500 text-sm mb-6">High-priority unresolved technical issues.</p>
                </div>
                <button onClick={navigateToTicketManagement} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors">
                  View Open
                </button>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
                <div>
                  <Activity className="w-8 h-8 text-slate-600 mb-4" />
                  <h4 className="text-lg font-bold text-slate-900">Support Staff</h4>
                  <p className="text-slate-500 text-sm mb-6">Manage technician availability and assignments.</p>
                </div>
                <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl transition-colors">
                  Manage Staff
                </button>
              </div>
            </div>
          </section>

          {/* Resource Management */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
              <Plus className="w-5 h-5 text-blue-600" />
              Campus Inventory
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <button onClick={handleCreateResource} className="flex flex-col items-center p-6 rounded-[1.5rem] border border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-all group">
                <Plus className="w-8 h-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-800 text-sm">Add Resource</span>
              </button>
              <button onClick={navigateToResourceManagement} className="flex flex-col items-center p-6 rounded-[1.5rem] border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <Shield className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-800 text-sm">Edit Inventory</span>
              </button>
              <button onClick={navigateToResources} className="flex flex-col items-center p-6 rounded-[1.5rem] border border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-all group">
                <Globe className="w-8 h-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-800 text-sm">Portal View</span>
              </button>
              <button className="flex flex-col items-center p-6 rounded-[1.5rem] border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <Clock className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-800 text-sm">Asset Stats</span>
              </button>
            </div>
          </section>

          {/* Activity Log */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-slate-800">Recent System Activity</h3>
            <div className="space-y-3">
              {[
                { label: "Admin login detected", sub: `${user?.email} - Just now`, color: "bg-orange-500" },
                { label: "Inventory update: Smart Lab 2", sub: "12 minutes ago", color: "bg-blue-500" },
                { label: "Support ticket #402 Closed", sub: "1 hour ago", color: "bg-blue-400" }
              ].map((act, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <div className={`w-2 h-2 rounded-full ${act.color}`}></div>
                  <div>
                    <p className="text-slate-900 font-bold text-sm leading-none mb-1">{act.label}</p>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-tight">{act.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Form Modal */}
      {showResourceForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl">
            <ResourceForm
              resource={selectedResource}
              onSave={handleResourceSave}
              onCancel={handleResourceFormClose}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;