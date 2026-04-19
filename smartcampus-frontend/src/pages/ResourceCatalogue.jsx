import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  Home, 
  Building,
  Clock,
  Monitor,
  ArrowLeft,
  Globe,
  Info,
  ChevronRight
} from 'lucide-react';
import { resourceService } from '../services/resourceService';

const ResourceCatalogue = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    location: '',
    name: '',
    minCapacity: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadActiveResources();
  }, []);

  const loadActiveResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getActiveResources();
      setResources(data);
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
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.getAllResources(filters);
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({ type: '', status: '', location: '', name: '', minCapacity: '' });
    handleSearch();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'OUT_OF_SERVICE': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'MAINTENANCE': return 'text-orange-500 bg-orange-50 border-orange-100';
      case 'RESERVED': return 'text-slate-500 bg-slate-100 border-slate-200';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  const getTypeIcon = (type) => {
    const props = { className: "w-5 h-5" };
    switch (type) {
      case 'LECTURE_HALL': return <Building {...props} />;
      case 'LABORATORY': return <Monitor {...props} />;
      case 'MEETING_ROOM': return <Users {...props} />;
      default: return <Home {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      {/* UniSphere Header */}
      <header className="bg-white border-b-2 border-slate-50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 leading-none">UniSphere</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Catalogue</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Search Bar - High Contrast Uni Style */}
        <div className="mb-12">
          <div className="relative max-w-3xl mx-auto">
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-2 flex items-center shadow-xl shadow-blue-50">
              <div className="flex-1 flex items-center px-6">
                <Search className="w-5 h-5 text-blue-600 mr-4" />
                <input
                  type="text"
                  placeholder="Search campus resources..."
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full py-4 border-none focus:ring-0 text-slate-700 font-bold placeholder:text-slate-300"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-black text-sm transition-all shadow-lg shadow-blue-100"
              >
                Find Now
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Advanced Filters Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 sticky top-28">
              <div className="flex items-center gap-2 mb-8">
                <Filter className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Refine Sphere</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Resource Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">All Types</option>
                    <option value="LECTURE_HALL">Lecture Halls</option>
                    <option value="LABORATORY">Laboratories</option>
                    <option value="MEETING_ROOM">Meeting Rooms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Min Capacity</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minCapacity}
                    onChange={(e) => handleFilterChange('minCapacity', e.target.value)}
                    className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  onClick={handleClearFilters}
                  className="w-full py-3 text-[10px] font-black text-orange-500 uppercase tracking-widest hover:bg-orange-50 rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Resources Grid */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Sphere...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.map((resource) => (
                  <div key={resource.id} className="group bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 hover:border-blue-600 transition-all shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${getStatusStyle(resource.status)}`}>
                        {getTypeIcon(resource.type)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase ${getStatusStyle(resource.status)}`}>
                        {resource.status}
                      </span>
                    </div>

                    <h4 className="text-xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{resource.name}</h4>
                    
                    <div className="space-y-3 mb-8 flex-grow">
                      <div className="flex items-center gap-3 text-slate-400">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold">{resource.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold">Seats {resource.capacity}</span>
                      </div>
                      {resource.description && (
                        <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-slate-50">
                      <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase rounded-2xl transition-all">
                        Book Space
                      </button>
                      <button className="w-12 py-3 bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-2xl flex items-center justify-center transition-all">
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && resources.length === 0 && (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
                <Globe className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-800">No Resources Found</h3>
                <p className="text-sm text-slate-400 mb-8">Try expanding your search or clearing filters.</p>
                <button
                  onClick={handleClearFilters}
                  className="px-8 py-3 bg-blue-600 text-white rounded-full font-black text-xs uppercase"
                >
                  Reset Sphere
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResourceCatalogue;