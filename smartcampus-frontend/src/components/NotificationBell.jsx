import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, X, Check, CheckCheck, Trash2, 
  Calendar, Ticket, MessageSquare, AlertCircle, Globe 
} from 'lucide-react';
import { notificationService } from '../services/notificationService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Polling for updates
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    const interval = setInterval(() => loadUnreadCount(), 30000);
    return () => clearInterval(interval);
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getMyNotifications();
      setNotifications(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count || 0);
    } catch (err) {
      setUnreadCount(0);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications();
      loadUnreadCount();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      loadUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      loadUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      notificationService.markAsRead(notification.id);
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
    if (notification.type === 'BOOKING') navigate('/my-bookings');
    else if (notification.type === 'TICKET') navigate('/my-tickets');
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'TICKET': return <Ticket className="w-4 h-4 text-orange-500" />;
      case 'COMMENT': return <MessageSquare className="w-4 h-4 text-green-600" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTime = (dateString) => {
    const diff = new Date() - new Date(dateString);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just Now';
    if (minutes < 60) return `${minutes}M Ago`;
    return `${Math.floor(minutes / 60)}H Ago`;
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* High-Visibility Bell Trigger */}
      <button
        onClick={handleToggle}
        className={`relative p-3 rounded-2xl transition-all border-2 group shadow-sm outline-none ${
          isOpen 
            ? 'bg-slate-900 border-slate-900 text-white' 
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-orange-500 hover:bg-white active:scale-95'
        }`}
      >
        <Bell className={`w-5 h-5 transition-transform group-hover:rotate-12 ${
          isOpen ? 'text-white' : 'text-slate-700 group-hover:text-orange-500'
        }`} />
        
        {/* Animated Glowing Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[1.5rem] h-6 px-1 bg-orange-500 text-white text-[10px] font-black rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)] border-2 border-white transition-all">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* UniSphere Styled Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-96 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
          {/* Header */}
          <div className="p-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-100">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-tighter text-slate-900">Intelligence Logs</h3>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all group"
                  title="Clear All Unread"
                >
                  <CheckCheck className="w-4 h-4 group-active:scale-90" />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[30rem] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin mx-auto" />
                <p className="text-[10px] font-black text-slate-300 uppercase mt-4 tracking-widest">Syncing Data...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200">
                  <Bell className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Terminal Clear</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">No pending notifications found</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-5 hover:bg-orange-50/50 cursor-pointer transition-all group border-l-4 ${
                      !n.isRead ? 'bg-blue-50/20 border-blue-600' : 'border-transparent active:bg-slate-50'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        !n.isRead ? 'bg-white shadow-md' : 'bg-slate-100'
                      }`}>
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] leading-relaxed ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                            {formatTime(n.createdAt)}
                          </span>
                          
                          {/* Item Actions */}
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!n.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                className="p-2 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm border border-slate-100 transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(n.id, e)}
                              className="p-2 bg-white text-slate-400 hover:bg-red-500 hover:text-white rounded-xl shadow-sm border border-slate-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Terminal Footer */}
          <button
            onClick={() => { setIsOpen(false); navigate('/notifications'); }}
            className="w-full p-5 bg-slate-900 text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-orange-600 transition-all"
          >
            Terminal View &gt;&gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;