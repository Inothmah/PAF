import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ArrowLeft, 
  Check, 
  CheckCheck, 
  Trash2, 
  Calendar, 
  Ticket, 
  MessageSquare,
  AlertCircle,
  Filter,
  X,
  Globe,
  MoreVertical
} from 'lucide-react';
import { notificationService } from '../services/notificationService';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); 
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getMyNotifications();
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (notificationId, event) => {
    if (event) event.stopPropagation();
    if (!window.confirm('Erase this notification from logs?')) return;
    
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      setSelectedNotifications(selectedNotifications.filter(id => id !== notificationId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedNotifications.length} selected records?`)) return;

    try {
      await Promise.all(selectedNotifications.map(id => notificationService.deleteNotification(id)));
      setNotifications(notifications.filter(n => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleSelect = (notificationId, event) => {
    event.stopPropagation();
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.type === 'BOOKING') navigate('/my-bookings');
    else if (notification.type === 'TICKET') navigate('/my-tickets');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING': return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'TICKET': return <Ticket className="w-5 h-5 text-orange-500" />;
      case 'COMMENT': return <MessageSquare className="w-5 h-5 text-green-600" />;
      default: return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const diff = new Date() - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return 'Just Now';
    if (minutes < 60) return `${minutes}M Ago`;
    if (hours < 24) return `${hours}H Ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !n.isRead;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Intelligence Logs</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-orange-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                <CheckCheck className="w-4 h-4" /> Clear Unread
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-xs font-black text-red-700 uppercase tracking-tight">{error}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-4 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-2">
              <Filter className="w-4 h-4 text-slate-500" />
            </div>
            {['ALL', 'UNREAD', 'BOOKING', 'TICKET', 'COMMENT'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {f === 'ALL' ? 'Total' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Control Bar */}
        {selectedNotifications.length > 0 && (
          <div className="mb-6 p-4 bg-slate-900 rounded-2xl flex items-center justify-between shadow-xl animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3 ml-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {selectedNotifications.length} Records Isolated
              </span>
            </div>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" /> Purge Selection
            </button>
          </div>
        )}

        {/* List Container */}
        <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Records...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                <Bell className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-slate-300">Terminal Clear</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">No active intelligence found for this filter</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {/* Table Header / Select All */}
              <div className="p-6 bg-slate-50/50 flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length}
                  onChange={selectAll}
                  className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch Selection Mode</span>
              </div>

              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative p-6 transition-all cursor-pointer border-l-4 ${
                    !notification.isRead ? 'bg-blue-50/10 border-blue-600' : 'border-transparent hover:bg-orange-50/30 hover:border-orange-500'
                  }`}
                >
                  <div className="flex items-start gap-6">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => toggleSelect(notification.id, e)}
                      className="mt-1.5 w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />

                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0 group-hover:scale-105 transition-transform">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${!notification.isRead ? 'text-blue-600' : 'text-slate-400'}`}>
                            {notification.type}
                          </span>
                          {!notification.isRead && (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-500 transition-colors">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>

                      <p className={`text-sm leading-relaxed ${!notification.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-600'} mb-3`}>
                        {notification.message}
                      </p>

                      {notification.referenceId && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">REF: {notification.referenceId}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Palette */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                          className="p-3 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-md border border-slate-100 transition-all"
                          title="Mark As Read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(notification.id, e)}
                        className="p-3 bg-white text-slate-400 hover:bg-red-500 hover:text-white rounded-xl shadow-md border border-slate-100 transition-all"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;