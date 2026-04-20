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
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const navigate = useNavigate();
    const { register, loading, error, clearError, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const validateField = (name, value) => {
        let newErrors = { ...errors };
        
        switch (name) {
            case 'name':
                if (!value.trim()) newErrors.name = 'Full name is required';
                else if (value.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
                else delete newErrors.name;
                break;
            case 'email':
                if (!value) newErrors.email = 'Email address is required';
                else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) 
                    newErrors.email = 'Please enter a valid email address';
                else delete newErrors.email;
                break;
            case 'password':
                if (!value) newErrors.password = 'Password is required';
                else if (value.length < 8) newErrors.password = 'Password must be at least 8 characters';
                else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) 
                    newErrors.password = 'Password does not meet all security requirements';
                else delete newErrors.password;
                
                // Re-validate confirmation if it exists
                if (formData.confirmPassword && value !== formData.confirmPassword) {
                    newErrors.confirmPassword = 'Passwords do not match';
                } else if (formData.confirmPassword) {
                    delete newErrors.confirmPassword;
                }
                break;
            case 'confirmPassword':
                if (!value) newErrors.confirmPassword = 'Please confirm your password';
                else if (value !== formData.password) newErrors.confirmPassword = 'Passwords do not match';
                else delete newErrors.confirmPassword;
                break;
            default:
                break;
        }
        setErrors(newErrors);
    };

    const getPasswordRequirements = () => {
        const pass = formData.password;
        return [
            { label: 'At least 8 characters', met: pass.length >= 8 },
            { label: 'At least one uppercase letter', met: /[A-Z]/.test(pass) },
            { label: 'At least one lowercase letter', met: /[a-z]/.test(pass) },
            { label: 'At least one number', met: /\d/.test(pass) },
            { label: 'At least one special character (@$!%*?&)', met: /[@$!%*?&]/.test(pass) }
        ];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (touched[name]) validateField(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        
        // Final validation check for all fields
        const names = ['name', 'email', 'password', 'confirmPassword'];
        const currentTouched = {};
        names.forEach(n => {
            currentTouched[n] = true;
            validateField(n, formData[n]);
        });
        setTouched(currentTouched);

        // Check if there are any errors after manual validation trigger
        // Note: setErrors is async, so we manually check the values here for the current submission
        if (Object.keys(errors).length > 0 || !formData.name || !formData.email || !formData.password || formData.password !== formData.confirmPassword) {
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
                                            onBlur={handleBlur}
                                            className={`w-full bg-slate-50 border transition-all duration-200 rounded-2xl pl-12 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 
                                                ${touched.name 
                                                    ? errors.name 
                                                        ? 'border-red-500 ring-red-100' 
                                                        : 'border-emerald-500 ring-emerald-100' 
                                                    : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'}`}
                                            placeholder="John Doe"
                                        />
                                        {touched.name && !errors.name && formData.name && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in duration-300">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {touched.name && errors.name && (
                                        <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                                        </p>
                                    )}
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
                                            onBlur={handleBlur}
                                            className={`w-full bg-slate-50 border transition-all duration-200 rounded-2xl pl-12 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 
                                                ${touched.email 
                                                    ? errors.email 
                                                        ? 'border-red-500 ring-red-100' 
                                                        : 'border-emerald-500 ring-emerald-100' 
                                                    : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'}`}
                                            placeholder="student@unisphere.edu"
                                        />
                                        {touched.email && !errors.email && formData.email && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in duration-300">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {touched.email && errors.email && (
                                        <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                                        </p>
                                    )}
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
                                            onBlur={handleBlur}
                                            className={`w-full bg-slate-50 border transition-all duration-200 rounded-2xl pl-12 pr-12 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 
                                                ${touched.password 
                                                    ? errors.password 
                                                        ? 'border-red-500 ring-red-100' 
                                                        : 'border-emerald-500 ring-emerald-100' 
                                                    : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'}`}
                                            placeholder="Create password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Password Requirements Checklist */}
                                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Security Requirements</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                            {getPasswordRequirements().map((req, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-300 ${req.met ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                        {req.met && (
                                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className={`text-[11px] font-medium transition-colors duration-300 ${req.met ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                        {req.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {touched.password && errors.password && (
                                        <p className="mt-3 text-xs font-bold text-red-500 uppercase tracking-widest leading-tight animate-in fade-in slide-in-from-top-1 flex items-start gap-1.5 shrink-0">
                                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {errors.password}
                                        </p>
                                    )}
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
                                            onBlur={handleBlur}
                                            className={`w-full bg-slate-50 border transition-all duration-200 rounded-2xl pl-12 pr-12 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 
                                                ${touched.confirmPassword 
                                                    ? errors.confirmPassword 
                                                        ? 'border-red-500 ring-red-100' 
                                                        : 'border-emerald-500 ring-emerald-100' 
                                                    : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'}`}
                                            placeholder="Confirm password"
                                        />
                                        {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in duration-300">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {touched.confirmPassword && errors.confirmPassword && (
                                        <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> {errors.confirmPassword}
                                        </p>
                                    )}
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