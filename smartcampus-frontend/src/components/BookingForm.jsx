import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  AlertCircle,
  Globe
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { resourceService } from '../services/resourceService';

const BookingForm = ({ resource = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    resourceId: resource?.id || '',
    purpose: '',
    startTime: '',
    endTime: '',
    expectedAttendees: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);

  useEffect(() => {
    loadAvailableResources();
  }, []);

  const loadAvailableResources = async () => {
    try {
      setResourcesLoading(true);
      const data = await resourceService.getActiveResources();
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };

      await bookingService.createBooking(bookingData);
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-h-[95vh] overflow-hidden flex flex-col font-sans border border-slate-200">
      {/* Header: Consistent Branding */}
      <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black leading-none tracking-tighter">
              <span className="text-black">Uni</span>
              <span className="text-orange-500">Sphere</span>
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {resource ? `Facility Booking: ${resource.name}` : 'New Reservation Request'}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm group"
        >
          <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-xs font-black text-red-700 uppercase tracking-tight">{error}</span>
          </div>
        )}

        {/* Resource Logic */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Resource</label>
          {resource ? (
            <div className="p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{resource.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {resource.location} • {resource.type.replace('_', ' ')}
                </p>
              </div>
            </div>
          ) : (
            <select
              required
              value={formData.resourceId}
              onChange={(e) => handleChange('resourceId', e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-black text-slate-700 uppercase tracking-tight focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Select an Academic Facility</option>
              {resources.map((res) => (
                <option key={res.id} value={res.id} className="font-sans">
                  {res.name} — {res.location}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Purpose */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purpose of Stay</label>
          <textarea
            required
            rows="3"
            value={formData.purpose}
            onChange={(e) => handleChange('purpose', e.target.value)}
            placeholder="e.g., Research presentation, Team meeting, Study session..."
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 focus:bg-white focus:border-orange-500 outline-none transition-all placeholder:text-slate-300 placeholder:uppercase placeholder:text-[10px] placeholder:font-black"
          />
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Calendar className="w-3 h-3 text-blue-600" /> Start Schedule
            </label>
            <div className="relative group">
              <input
                type="datetime-local"
                required
                min={getMinDateTime()}
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-xs font-black text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer group-hover:border-blue-200"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Clock className="w-3 h-3 text-orange-500" /> End Schedule
            </label>
            <div className="relative group">
              <input
                type="datetime-local"
                required
                min={formData.startTime || getMinDateTime()}
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-xs font-black text-slate-700 focus:border-orange-500 focus:bg-white outline-none transition-all cursor-pointer group-hover:border-orange-200"
              />
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Users className="w-3 h-3 text-blue-600" /> Expected Personnel
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="1000"
              value={formData.expectedAttendees}
              onChange={(e) => handleChange('expectedAttendees', parseInt(e.target.value) || 1)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-black text-slate-700 focus:border-blue-500 outline-none transition-all"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">People</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-4 bg-slate-100 text-slate-400 hover:bg-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            Abort
          </button>
          <button
            type="submit"
            disabled={loading || resourcesLoading}
            className="flex-[2] py-4 bg-blue-600 text-white hover:bg-orange-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Commit Reservation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;