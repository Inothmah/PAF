import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Plus, 
  MapPin, 
  Users,
  Info,
  Type,
  Clock,
  AlertCircle
} from 'lucide-react';

const ResourceForm = ({ resource = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    location: '',
    description: '',
    status: 'ACTIVE',
    availabilityWindows: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  // Sync form with resource prop for editing
  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || '',
        type: resource.type || '',
        capacity: resource.capacity?.toString() || '',
        location: resource.location || '',
        description: resource.description || '',
        status: resource.status || 'ACTIVE',
        availabilityWindows: resource.availabilityWindows || []
      });
    }
  }, [resource]);

  const validateField = (field, value) => {
    let errorMsg = '';
    switch (field) {
      case 'name':
        if (!value) errorMsg = 'Resource name is required';
        else if (value.length < 3) errorMsg = 'Name must be at least 3 characters';
        else if (value.length > 50) errorMsg = 'Name cannot exceed 50 characters';
        break;
      case 'type':
        if (!value) errorMsg = 'Please select a category';
        break;
      case 'capacity':
        const cap = parseInt(value, 10);
        if (!value) errorMsg = 'Capacity is required';
        else if (isNaN(cap) || cap < 1) errorMsg = 'Capacity must be at least 1';
        else if (cap > 1000) errorMsg = 'Capacity cannot exceed 1000';
        break;
      case 'location':
        if (!value) errorMsg = 'Location is required';
        else if (value.length < 5) errorMsg = 'Location must be at least 5 characters (e.g., "Block B, Room 101")';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
    return errorMsg;
  };

  const validateWindows = () => {
    const windowErrors = formData.availabilityWindows.map((win, index) => {
      const errors = {};
      if (!win.day) errors.day = 'Day is required';
      if (!win.startTime) errors.startTime = 'Start time is required';
      if (!win.endTime) errors.endTime = 'End time is required';
      if (win.startTime && win.endTime && win.startTime >= win.endTime) {
        errors.endTime = 'End time must be after start time';
      }
      return Object.keys(errors).length > 0 ? errors : null;
    });

    const hasErrors = windowErrors.some(err => err !== null);
    setErrors(prev => ({ ...prev, availabilityWindows: windowErrors }));
    return !hasErrors;
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = ['name', 'type', 'capacity', 'location'];
    
    fieldsToValidate.forEach(field => {
      const msg = validateField(field, formData[field]);
      if (msg) newErrors[field] = msg;
    });

    const windowsValid = validateWindows();
    
    return Object.keys(newErrors).length === 0 && windowsValid;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate everything before submission
    if (!validateForm()) {
      setError('Please correct the errors in the form before submitting.');
      // Scroll to top of form to see errors if needed (optional)
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. DATA SANITIZATION: Crucial for CRUD success
      const sanitizedData = {
        ...formData,
        // Ensure capacity is a Number for the database
        capacity: parseInt(formData.capacity, 10),
        // Clean up empty availability windows if they exist
        availabilityWindows: formData.availabilityWindows.filter(w => w.day && w.startTime)
      };

      // 2. TRIGGER SAVE (Parent handles Create vs Update logic)
      await onSave(sanitizedData);
      
      // 3. CLOSE FORM on success
      onCancel();
    } catch (err) {
      setError(err.message || 'Failed to process resource. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // --- Availability Window Logic ---
  const addWindow = () => {
    setFormData(prev => ({
      ...prev,
      availabilityWindows: [...prev.availabilityWindows, { day: '', startTime: '', endTime: '' }]
    }));
  };

  const removeWindow = (index) => {
    setFormData(prev => ({
      ...prev,
      availabilityWindows: prev.availabilityWindows.filter((_, i) => i !== index)
    }));
  };

  const updateWindow = (index, field, value) => {
    const updated = [...formData.availabilityWindows];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, availabilityWindows: updated }));
    
    // Trigger real-time validation for windows
    validateWindows();
  };

  const DAYS_OF_WEEK = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  return (
    /* Perfect Background: Darkened blur overlay for depth */
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-4 border-white flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b-2 border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 text-white">
              {resource ? <Save className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tighter leading-none">
                {resource ? 'Update Resource' : 'Register New'}
              </h2>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">UniSphere Inventory Engine</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="bg-slate-50 text-slate-400 hover:text-orange-500 p-3 rounded-2xl transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body - noValidate disables generic browser bubbles */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-8 space-y-8">
          {error && (
            <div className="p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <p className="text-orange-700 font-bold text-sm">{error}</p>
            </div>
          )}

          {/* Primary Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest ml-1">
                <span className="flex items-center gap-2 text-black">
                  <Info className="w-3 h-3 text-blue-600" /> Name
                </span>
                {errors.name && <span className="text-orange-500 lowercase tracking-normal font-bold">{errors.name}</span>}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={(e) => validateField('name', e.target.value)}
                className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold ${
                  errors.name ? 'border-orange-200 focus:border-orange-500 bg-orange-50/30' : 'border-transparent focus:border-blue-600 focus:bg-white'
                }`}
                placeholder="Lecture Hall 01"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest ml-1">
                <span className="flex items-center gap-2 text-black">
                  <Type className="w-3 h-3 text-blue-600" /> Category
                </span>
                {errors.type && <span className="text-orange-500 lowercase tracking-normal font-bold">{errors.type}</span>}
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold appearance-none ${
                  errors.type ? 'border-orange-200 focus:border-orange-500 bg-orange-50/30' : 'border-transparent focus:border-blue-600 focus:bg-white'
                }`}
              >
                <option value="">Select Category</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LABORATORY">Laboratory</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="CLASSROOM">Classroom</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest ml-1">
                <span className="flex items-center gap-2 text-black">
                  <Users className="w-3 h-3 text-blue-600" /> Capacity
                </span>
                {errors.capacity && <span className="text-orange-500 lowercase tracking-normal font-bold">{errors.capacity}</span>}
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                onBlur={(e) => validateField('capacity', e.target.value)}
                className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold ${
                  errors.capacity ? 'border-orange-200 focus:border-orange-500 bg-orange-50/30' : 'border-transparent focus:border-blue-600 focus:bg-white'
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest ml-1">
                <span className="flex items-center gap-2 text-black">
                  <MapPin className="w-3 h-3 text-blue-600" /> Location
                </span>
                {errors.location && <span className="text-orange-500 lowercase tracking-normal font-bold">{errors.location}</span>}
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                onBlur={(e) => validateField('location', e.target.value)}
                className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold ${
                  errors.location ? 'border-orange-200 focus:border-orange-500 bg-orange-50/30' : 'border-transparent focus:border-blue-600 focus:bg-white'
                }`}
                placeholder="Block B, 2nd Floor"
              />
            </div>
          </div>

          {/* Operational Status */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">System Status</label>
            <div className="grid grid-cols-3 gap-3">
              {['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleChange('status', s)}
                  className={`py-3 px-2 rounded-xl font-black text-[9px] uppercase border-2 transition-all ${
                    formData.status === s 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Windows */}
          <div className="pt-6 border-t-2 border-slate-50">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-xs font-black text-black uppercase tracking-widest">Availability Windows</h3>
              </div>
              <button 
                type="button" 
                onClick={addWindow}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg shadow-blue-100 hover:shadow-none active:scale-95"
              >
                <Plus className="w-3 h-3" /> Add Window
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.availabilityWindows.length === 0 ? (
                <div className="py-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <Clock className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No windows defined</p>
                </div>
              ) : (
                formData.availabilityWindows.map((win, idx) => {
                  const winError = errors.availabilityWindows?.[idx];
                  return (
                    <div key={idx} className="space-y-2">
                      <div className={`grid grid-cols-12 gap-3 items-center bg-white border-2 p-4 rounded-3xl transition-all group ${
                        winError ? 'border-orange-100 bg-orange-50/10' : 'border-slate-50 hover:border-blue-100'
                      }`}>
                        <div className="col-span-5 relative">
                          <select 
                            value={win.day} 
                            onChange={e => updateWindow(idx, 'day', e.target.value)}
                            className={`w-full border-none rounded-2xl text-[11px] font-black uppercase p-3 appearance-none outline-none transition-all ${
                              winError?.day ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 focus:bg-blue-50 focus:text-blue-700'
                            }`}
                          >
                            <option value="">Select Day</option>
                            {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        
                        <div className="col-span-3">
                          <input 
                            type="time"
                            value={win.startTime} 
                            onChange={e => updateWindow(idx, 'startTime', e.target.value)}
                            className={`w-full border-none rounded-2xl text-[11px] font-black p-3 outline-none transition-all ${
                              winError?.startTime ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 focus:bg-blue-50 focus:text-blue-700'
                            }`}
                          />
                        </div>

                        <div className="col-span-3">
                          <input 
                            type="time"
                            value={win.endTime} 
                            onChange={e => updateWindow(idx, 'endTime', e.target.value)}
                            className={`w-full border-none rounded-2xl text-[11px] font-black p-3 outline-none transition-all ${
                              winError?.endTime ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 focus:bg-blue-50 focus:text-blue-700'
                            }`}
                          />
                        </div>

                        <div className="col-span-1 flex justify-center">
                          <button 
                            type="button" 
                            onClick={() => removeWindow(idx)} 
                            className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-300 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-all active:scale-90"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {winError && (
                        <div className="flex gap-4 px-4 text-[9px] font-bold uppercase tracking-tight text-orange-500">
                          {winError.day && <span>• {winError.day}</span>}
                          {winError.startTime && <span>• {winError.startTime}</span>}
                          {winError.endTime && <span>• {winError.endTime}</span>}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50 border-t-2 border-slate-100 flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-xs uppercase text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Commit to System
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceForm;