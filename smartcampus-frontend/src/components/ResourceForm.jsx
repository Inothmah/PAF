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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
  };

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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {error && (
            <div className="p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl flex items-center gap-3 animate-pulse">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <p className="text-orange-700 font-bold text-sm">{error}</p>
            </div>
          )}

          {/* Primary Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest ml-1">
                <Info className="w-3 h-3 text-blue-600" /> Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold"
                placeholder="Lecture Hall 01"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest ml-1">
                <Type className="w-3 h-3 text-blue-600" /> Category
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold appearance-none"
              >
                <option value="">Select Category</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LABORATORY">Laboratory</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="CLASSROOM">Classroom</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest ml-1">
                <Users className="w-3 h-3 text-blue-600" /> Capacity
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest ml-1">
                <MapPin className="w-3 h-3 text-blue-600" /> Location
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold"
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-black uppercase tracking-widest">Time Windows</h3>
              <button 
                type="button" 
                onClick={addWindow}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.availabilityWindows.map((win, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-3 rounded-2xl">
                  <input 
                    placeholder="Day" 
                    value={win.day} 
                    onChange={e => updateWindow(idx, 'day', e.target.value)}
                    className="flex-1 bg-white border-none rounded-xl text-xs font-bold p-2"
                  />
                  <input 
                    placeholder="Start" 
                    value={win.startTime} 
                    onChange={e => updateWindow(idx, 'startTime', e.target.value)}
                    className="w-20 bg-white border-none rounded-xl text-xs font-bold p-2"
                  />
                  <input 
                    placeholder="End" 
                    value={win.endTime} 
                    onChange={e => updateWindow(idx, 'endTime', e.target.value)}
                    className="w-20 bg-white border-none rounded-xl text-xs font-bold p-2"
                  />
                  <button type="button" onClick={() => removeWindow(idx)} className="text-orange-500 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
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