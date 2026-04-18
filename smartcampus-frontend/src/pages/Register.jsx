import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, UserPlus, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();
    const { register, loading, error, clearError, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            await register({ 
                name: formData.name,
                email: formData.email, 
                password: formData.password 
            });
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-white flex overflow-hidden">
            {/* Left Side - New Image with Decreased Blur */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img 
                    src="https://images.stockcake.com/public/3/e/7/3e71e854-72c8-4b63-89b8-ffd86821a150_large/students-walking-outdoors-stockcake.jpg"
                    alt="UniSphere Students Walking"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = "https://via.placeholder.com/1200x1600/1e3a8a/ffffff?text=UniSphere+Campus";
                    }}
                />
                
                {/* Decreased Blur + Balanced Opacity */}
                <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
                
                {/* Brand Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10 px-12">
                    <div className="text-center text-white">
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl">
                                <UserPlus className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-6xl font-bold tracking-tighter drop-shadow-2xl">UniSphere</h1>
                        <p className="text-2xl mt-4 text-white/95 drop-shadow-lg">Smart Campus Portal</p>
                        <p className="mt-6 text-lg text-white/80 max-w-xs mx-auto">
                            Join our vibrant campus community today
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Compact Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen p-6 md:p-10">
                <div className="w-full max-w-md">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="flex justify-center mb-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-xl">
                                <UserPlus className="w-9 h-9 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
                        <p className="text-slate-600 mt-1">Join UniSphere</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Compact Register Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-slate-900 px-7 py-6 text-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/10 rounded-xl">
                                    <UserPlus className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold tracking-tight">Create Account</h2>
                                    <p className="text-slate-400 text-sm mt-0.5">Start your campus journey</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-7">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                            placeholder="student@unisphere.edu"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                            placeholder="Create password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                            placeholder="Confirm password"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-orange-500/30 active:scale-[0.98] mt-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            Create Account
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="border-t border-slate-100 bg-slate-50 px-7 py-5 text-center text-sm">
                            <p className="text-slate-600">
                                Already have an account?{' '}
                                <Link 
                                    to="/login" 
                                    className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 text-center text-xs text-slate-500">
                        🔒 Secure Registration • UniSphere Smart Campus
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;