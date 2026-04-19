import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Building,
  Users,
  MapPin,
  Settings,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Globe
} from 'lucide-react';
import { resourceService } from '../services/resourceService';
import ResourceForm from '../components/ResourceForm';

const ResourceManagement = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    location: '',
    name: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getAllResources(filters);
      setResources(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    await loadResources();
  };

  const handleClearFilters = () => {
    setFilters({ type: '', status: '', location: '', name: '' });
    loadResources();
  };

  const handleCreateResource = () => {
    setSelectedResource(null);
    setShowResourceForm(true);
  };

  const handleEditResource = (resource) => {
    setSelectedResource(resource);
    setShowResourceForm(true);
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await resourceService.deleteResource(resourceId);
      setSuccessMessage('Resource deleted successfully');
      loadResources();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) { setError(err.message); }
  };

  const handleResourceFormClose = () => {
    setShowResourceForm(false);
    setSelectedResource(null);
  };

  const handleResourceSave = async (resourceData) => {
    try {
      if (selectedResource) {
        await resourceService.updateResource(selectedResource.id, resourceData);
        setSuccessMessage('Resource updated successfully');
      } else {
        await resourceService.createResource(resourceData);
        setSuccessMessage('Resource created successfully');
      }
      handleResourceFormClose();
      loadResources();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) { setError(err.message); }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-blue-600 bg-white border-blue-100';
      case 'OUT_OF_SERVICE': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'MAINTENANCE': return 'text-amber-600 bg-white border-amber-100';
      default: return 'text-slate-500 bg-white border-slate-100';
    }
  };

  const getTypeIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'LECTURE_HALL': return <Building className={iconClass} />;
      case 'LABORATORY': return <Settings className={iconClass} />;
      case 'MEETING_ROOM': return <Users className={iconClass} />;
      default: return <Building className={iconClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black font-sans">
      {/* Header */}
      <header className="bg-white border-b-2 border-slate-50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-slate-50 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-black leading-none">Resource Control</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">UniSphere Fleet Management</p>
              </div>
            </div>
            <button
              onClick={handleCreateResource}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm shadow-xl shadow-blue-100 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Resource
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {successMessage && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 font-bold text-sm">{successMessage}</span>
          </div>
        )}

        {/* Search & Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4 flex items-center gap-3">
                  <Search className="w-4 h-4 text-blue-600" /> Quick Search
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-black placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 transition-all font-bold"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                </div>
                <button
                  onClick={handleSearch}
                  className="mt-4 w-full bg-black hover:bg-blue-600 text-white py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors shadow-lg shadow-slate-200"
                >
                  Apply Search
                </button>
              </div>
            </div>

            <div className="lg:w-80">
              <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-3">
                    <Filter className="w-4 h-4 text-orange-500" /> Filters
                  </h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700"
                  >
                    {showFilters ? 'Collapse' : 'Expand'}
                  </button>
                </div>

                {showFilters && (
                  <div className="space-y-4 animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-[10px] font-black text-black uppercase mb-2">Resource Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-black font-bold text-sm focus:ring-2 focus:ring-blue-600/20"
                      >
                        <option value="">All Categories</option>
                        <option value="LECTURE_HALL">Lecture Hall</option>
                        <option value="LABORATORY">Laboratory</option>
                        <option value="MEETING_ROOM">Meeting Room</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-black uppercase mb-2">Service Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-black font-bold text-sm focus:ring-2 focus:ring-blue-600/20"
                      >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="OUT_OF_SERVICE">Out of Service</option>
                      </select>
                    </div>
                    <button
                      onClick={handleClearFilters}
                      className="w-full py-2 px-4 text-[10px] font-black uppercase text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
                    >
                      Reset All
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Data Table */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scanning Database...</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="p-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/50">
                      <th className="py-5 px-6 text-[10px] font-black text-black uppercase tracking-widest">Incident/Resource</th>
                      <th className="py-5 px-6 text-[10px] font-black text-black uppercase tracking-widest">Type</th>
                      <th className="py-5 px-6 text-[10px] font-black text-black uppercase tracking-widest">Capacity</th>
                      <th className="py-5 px-6 text-[10px] font-black text-black uppercase tracking-widest">Status</th>
                      <th className="py-5 px-6 text-[10px] font-black text-black uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {resources.map((resource) => (
                      <tr 
                        key={resource.id} 
                        className="transition-all duration-200 group hover:bg-orange-500"
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center border-2 border-slate-100 bg-white text-blue-600 shadow-sm transition-colors group-hover:border-transparent">
                              {getTypeIcon(resource.type)}
                            </div>
                            <div>
                              <p className="text-black font-black text-sm transition-colors group-hover:text-white uppercase">
                                {resource.name}
                              </p>
                              <p className="text-slate-500 text-[11px] italic line-clamp-1 transition-colors group-hover:text-orange-100">
                                {resource.location}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className="text-xs font-bold text-black capitalize transition-colors group-hover:text-white">
                            {resource.type.replace('_', ' ').toLowerCase()}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-2 text-black font-bold text-xs transition-colors group-hover:text-white">
                            <Users className="w-3.5 h-3.5 text-blue-600 group-hover:text-orange-100" /> {resource.capacity}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 shadow-sm ${getStatusColor(resource.status)}`}>
                            {resource.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditResource(resource)} 
                              className="p-2.5 bg-blue-600 text-white hover:bg-black rounded-full transition-all shadow-md active:scale-90 group-hover:bg-white group-hover:text-blue-600"
                              title="Modify"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteResource(resource.id)} 
                              className="p-2.5 bg-white text-orange-600 hover:bg-black hover:text-white rounded-full transition-all shadow-md border border-orange-100 active:scale-90 group-hover:border-transparent"
                              title="Purge"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Resource Modal Overlay */}
      {showResourceForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border-4 border-white">
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

export default ResourceManagement;