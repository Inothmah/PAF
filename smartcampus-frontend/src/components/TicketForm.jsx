import React, { useState, useEffect } from 'react';
import { 
  Save, X, AlertCircle, Upload, Image as ImageIcon, 
  Trash2, MapPin, AlertTriangle, ShieldAlert, Activity,
  Database, Info
} from 'lucide-react';
import { ticketService } from '../services/ticketService';
import { resourceService } from '../services/resourceService';

const TicketForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    resourceId: '',
    location: '',
    category: 'HARDWARE',
    description: '',
    priority: 'MEDIUM',
    contactDetails: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resourcesLoading, setResourcesLoading] = useState(true);

  const categories = [
    { value: 'HARDWARE', label: 'Hardware', icon: '🔧' },
    { value: 'SOFTWARE', label: 'Software', icon: '💻' },
    { value: 'FACILITY', label: 'Facility', icon: '🏢' },
    { value: 'NETWORK', label: 'Network', icon: '🌐' },
    { value: 'SAFETY', label: 'Safety', icon: '🛡️' },
    { value: 'CLEANING', label: 'Cleaning', icon: '🧹' },
    { value: 'OTHER', label: 'Other', icon: '📋' }
  ];

  const priorities = [
    { value: 'LOW', label: 'Low', color: 'text-green-600', border: 'border-green-200' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-blue-600', border: 'border-blue-200' },
    { value: 'HIGH', label: 'High', color: 'text-orange-600', border: 'border-orange-200' },
    { value: 'CRITICAL', label: 'Critical', color: 'text-red-600', border: 'border-red-200' }
  ];

  useEffect(() => { loadAvailableResources(); }, []);

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
      if (!formData.resourceId && !formData.location.trim()) {
        throw new Error('IDENTIFICATION REQUIRED: Select a resource or specify location.');
      }
      await ticketService.createTicket(formData, attachments);
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 3) {
      setError('BUFFER OVERFLOW: Maximum 3 attachments allowed.');
      return;
    }
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('FORMAT REJECTED: Only image files are accepted.');
      return;
    }
    setAttachments(prev => [...prev, ...files]);
    setError(null);
  };

  const removeAttachment = (index) => setAttachments(prev => prev.filter((_, i) => i !== index));

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB'][i];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-black">Log Incident Report</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol: maintenance_request_v2</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-black p-2 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-5 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center gap-4 animate-in shake">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Resource Selection */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                <Database className="w-3.5 h-3.5" /> Related Resource
              </label>
              <select
                value={formData.resourceId}
                onChange={(e) => handleChange('resourceId', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black text-sm font-black text-black appearance-none"
              >
                <option value="">SCANNING: Select Resource...</option>
                {resources.map((res) => (
                  <option key={res.id} value={res.id}>{res.name}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                <MapPin className="w-3.5 h-3.5" /> Precise Location {formData.resourceId ? '(Optional)' : '*'}
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Ex: Room 402, Level 2"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black text-sm font-black text-black placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Category Grid */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Select Domain *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleChange('category', cat.value)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.category === cat.value
                      ? 'border-black bg-black text-white shadow-xl scale-95'
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-tighter">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Priority Matrix *</label>
            <div className="flex flex-wrap gap-3">
              {priorities.map((pri) => (
                <button
                  key={pri.value}
                  type="button"
                  onClick={() => handleChange('priority', pri.value)}
                  className={`flex-1 min-w-[100px] px-4 py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    formData.priority === pri.value
                      ? `bg-slate-50 ${pri.border} ${pri.color} shadow-sm`
                      : 'border-slate-100 text-slate-300'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {pri.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Diagnostic Description *</label>
            <textarea
              required
              rows="4"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Provide specific details about the anomaly..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-black text-sm font-black text-black placeholder:text-slate-300 resize-none"
            />
          </div>

          {/* Contact Details */}
          <div>
             <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                <Info className="w-3.5 h-3.5" /> Preferred Communication Channel
              </label>
            <input
              type="text"
              value={formData.contactDetails}
              onChange={(e) => handleChange('contactDetails', e.target.value)}
              placeholder="Email or Phone for follow-up"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black text-sm font-black text-black"
            />
          </div>

          {/* Attachments Section */}
          <div className="pt-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Visual Evidence (Max 3)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`h-32 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:border-black transition-all ${attachments.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Upload Frame</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={attachments.length >= 3}
                />
              </label>

              <div className="space-y-3">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl group">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-4 h-4 text-black" />
                      <div>
                        <p className="text-[10px] font-black text-black truncate max-w-[120px] uppercase">{file.name}</p>
                        <p className="text-[8px] font-bold text-slate-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeAttachment(index)} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex gap-4 pt-10">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
            >
              Abort Report
            </button>
            <button
              type="submit"
              disabled={loading || resourcesLoading}
              className="flex-[2] py-5 bg-black hover:bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save className="w-4 h-4" /> Finalize Submission</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;