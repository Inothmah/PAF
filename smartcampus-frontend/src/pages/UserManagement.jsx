import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Settings, 
  Trash2, 
  Search, 
  ArrowLeft, 
  ChevronDown, 
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Loader2,
  Filter,
  UserPlus
} from 'lucide-react';
import { userService } from '../services/userService';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSuccess(`Role updated to ${newRole} efficiently.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to update role: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      setIsDeleting(userId);
      await userService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setSuccess('User removed from the system.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to delete user: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    technicians: users.filter(u => u.role === 'TECHNICIAN').length,
    regular: users.filter(u => u.role === 'USER').length
  };

  const RoleBadge = ({ role }) => {
    const styles = {
      ADMIN: 'bg-orange-100 text-orange-600 border-orange-200',
      TECHNICIAN: 'bg-blue-100 text-blue-600 border-blue-200',
      USER: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[role] || styles.USER}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      {/* Notifications */}
      <div className="fixed top-8 right-8 z-[100] space-y-4 max-w-sm w-full">
        {success && (
          <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300 font-bold text-xs uppercase tracking-widest border-2 border-white">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}
        {error && (
          <div className="bg-orange-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300 font-bold text-xs uppercase tracking-widest border-2 border-white">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase">
                  User <span className="text-orange-500">Administration</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage system access & roles</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', val: stats.total, icon: Users, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: 'Administrators', val: stats.admins, icon: Shield, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Technicians', val: stats.technicians, icon: Settings, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Student Users', val: stats.regular, icon: Users, color: 'text-slate-500', bg: 'bg-slate-100' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 p-6 rounded-[1.5rem] shadow-sm flex flex-col items-center">
              <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 leading-none mb-1">{s.val}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-center">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold uppercase tracking-widest outline-none cursor-pointer text-slate-600"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admins</option>
                <option value="TECHNICIAN">Technicians</option>
                <option value="USER">Users</option>
              </select>
            </div>
            
            <button 
              onClick={fetchUsers}
              className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              title="Refresh List"
            >
              <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          {loading && users.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-6"></div>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Accessing User Directory...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No users found</h3>
              <p className="text-slate-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Role</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{user.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <select 
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                        >
                          <option value="USER">User</option>
                          <option value="TECHNICIAN">Technician</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-8 py-5">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isDeleting === user.id}
                            className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                            title="Remove User"
                          >
                            {isDeleting === user.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserManagement;
