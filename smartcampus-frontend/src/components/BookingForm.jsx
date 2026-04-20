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
  const [formErrors, setFormErrors] = useState({});
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

  const validateForm = () => {
    const errors = {};
    if (!formData.resourceId) errors.resourceId = "Please select an academic facility.";
    if (!formData.purpose || formData.purpose.trim().length < 5) {
      errors.purpose = "Purpose must be at least 5 characters.";
    }
    
    if (!formData.startTime) {
      errors.startTime = "Start schedule is required.";
    } else {
      const start = new Date(formData.startTime);
      const now = new Date();
      if (start < now) {
        errors.startTime = "Start time cannot be in the past.";
      }
    }

    if (!formData.endTime) {
      errors.endTime = "End schedule is required.";
    } else if (formData.startTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        errors.endTime = "End time must be after start time";
      }
    }

    if (!formData.expectedAttendees || formData.expectedAttendees < 1) {
      errors.expectedAttendees = "Must have at least 1 attendee.";
    } else if (formData.expectedAttendees > 1000) {
      errors.expectedAttendees = "Exceeds maximum limit of 1000.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setFormErrors({});

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
    const nextFormData = { ...formData, [field]: value };
    setFormData(nextFormData);

    const newErrors = { ...formErrors, [field]: undefined };

    // Apply strict real-time validation for dates
    if (field === 'startTime' || field === 'endTime') {
      if (nextFormData.startTime && nextFormData.endTime) {
        const start = new Date(nextFormData.startTime);
        const end = new Date(nextFormData.endTime);
        if (end <= start) {
          newErrors.endTime = "End time must be after start time";
        } else {
          newErrors.endTime = undefined;
        }
      }
    }

    setFormErrors(newErrors);
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
            <div className="relative">
              <select
                value={formData.resourceId}
                onChange={(e) => handleChange('resourceId', e.target.value)}
                className={`w-full bg-slate-50 border-2 rounded-2xl py-4 px-6 text-sm font-black text-slate-700 uppercase tracking-tight outline-none transition-all appearance-none cursor-pointer ${formErrors.resourceId ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-slate-100 focus:border-blue-500'}`}
              >
                <option value="">Select an Academic Facility</option>
                {resources.map((res) => (
                  <option key={res.id} value={res.id} className="font-sans">
                    {res.name} — {res.location}
                  </option>
                ))}
              </select>
              {formErrors.resourceId && (
                <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 flex items-center gap-1.5 uppercase tracking-wider animate-in slide-in-from-top-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.resourceId}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Purpose */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purpose of Stay</label>
          <textarea
            rows="3"
            value={formData.purpose}
            onChange={(e) => handleChange('purpose', e.target.value)}
            placeholder="e.g., Research presentation, Team meeting, Study session..."
            className={`w-full bg-slate-50 border-2 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 focus:bg-white outline-none transition-all placeholder:text-slate-300 placeholder:uppercase placeholder:text-[10px] placeholder:font-black ${formErrors.purpose ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-slate-100 focus:border-orange-500'}`}
          />
          {formErrors.purpose && (
            <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1.5 uppercase tracking-wider animate-in slide-in-from-top-1">
              <AlertCircle className="w-3.5 h-3.5" /> {formErrors.purpose}
            </p>
          )}
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
                min={getMinDateTime()}
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className={`w-full bg-slate-50 border-2 rounded-2xl py-4 px-6 text-xs font-black text-slate-700 focus:bg-white outline-none transition-all cursor-pointer ${formErrors.startTime ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-slate-100 focus:border-blue-500 group-hover:border-blue-200'}`}
              />
              {formErrors.startTime && (
                <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 flex items-center gap-1.5 uppercase tracking-wider animate-in slide-in-from-top-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> <span className="truncate">{formErrors.startTime}</span>
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Clock className="w-3 h-3 text-orange-500" /> End Schedule
            </label>
            <div className="relative group">
              <input
                type="datetime-local"
                min={formData.startTime || getMinDateTime()}
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className={`w-full bg-slate-50 border-2 rounded-2xl py-4 px-6 text-xs font-black text-slate-700 focus:bg-white outline-none transition-all cursor-pointer ${formErrors.endTime ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-slate-100 focus:border-orange-500 group-hover:border-orange-200'}`}
              />
              {formErrors.endTime && (
                <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 flex items-center gap-1.5 uppercase tracking-wider animate-in slide-in-from-top-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> <span className="truncate">{formErrors.endTime}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Users className="w-3 h-3 text-blue-600" /> Expected Personnel
          </label>
          <div>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1000"
                value={formData.expectedAttendees}
                onChange={(e) => handleChange('expectedAttendees', e.target.value === '' ? '' : parseInt(e.target.value))}
                className={`w-full bg-slate-50 border-2 rounded-2xl py-4 px-6 text-sm font-black text-slate-700 outline-none transition-all ${formErrors.expectedAttendees ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-slate-100 focus:border-blue-500'}`}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase pointer-events-none">People</span>
            </div>
            {formErrors.expectedAttendees && (
              <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 flex items-center gap-1.5 uppercase tracking-wider animate-in slide-in-from-top-1">
                <AlertCircle className="w-3.5 h-3.5" /> {formErrors.expectedAttendees}
              </p>
            )}
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