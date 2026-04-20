import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const navigate = useNavigate();
    const { login, googleLogin, loading, error, clearError, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const validate = (field, value) => {
        let newErrors = { ...errors };
        if (field === 'email') {
            if (!value) newErrors.email = 'Email address is required';
            else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) 
                newErrors.email = 'Please enter a valid email address';
            else delete newErrors.email;
        }
        if (field === 'password') {
            if (!value) newErrors.password = 'Password is required';
            else if (value.length < 1) newErrors.password = 'Password is required';
            else delete newErrors.password;
        }
        setErrors(newErrors);
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        validate(field, field === 'email' ? email : password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();

        // Final validation check
        const emailValid = /\S+@\S+\.\S+/.test(email);
        const passValid = password.length > 0;

        if (!emailValid || !passValid) {
            setErrors({
                email: !emailValid ? 'Please enter a valid email address' : undefined,
                password: !passValid ? 'Password is required' : undefined
            });
            setTouched({ email: true, password: true });
            return;
        }
        
        try {
            await login({ email, password });
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential);
            navigate('/dashboard');
        } catch (error) {
            console.error('Google login failed:', error);
        }
    };

    const handleGoogleError = () => {
        console.error('Google login error');
    };

    return (
        <div className="min-h-screen bg-white flex overflow-hidden">
            {/* Left Side - Image with Reduced Blur */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img 
                    src="https://theredpen.in/wp-content/uploads/2022/06/Hero-Image-Final.jpg"
                    alt="UniSphere Smart Campus"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = "https://via.placeholder.com/1200x1600/1e3a8a/ffffff?text=UniSphere+Smart+Campus";
                    }}
                />
                
                {/* Reduced Blur + Balanced Opacity */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                
                {/* Brand Overlay on Image */}
                <div className="absolute inset-0 flex items-center justify-center z-10 px-12">
                    <div className="text-center text-white">
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl">
                                <Users className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-6xl font-bold tracking-tighter drop-shadow-2xl">UniSphere</h1>
                        <p className="text-2xl mt-4 text-white/95 drop-shadow-lg">Smart Campus Portal</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen p-6 md:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-xl">
                                <Users className="w-11 h-11 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900">UniSphere</h1>
                        <p className="text-slate-600 mt-2">Smart Campus Portal</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Login Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-slate-900 px-8 py-8 text-white">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <LogIn className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-semibold tracking-tight">Welcome Back</h2>
                                    <p className="text-slate-400 mt-1">Sign in to your UniSphere account</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (touched.email) validate('email', e.target.value);
                                            }}
                                            onBlur={() => handleBlur('email')}
                                            className={`w-full bg-slate-50 border transition-all duration-200 rounded-2xl pl-12 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 
                                                ${touched.email 
                                                    ? errors.email 
                                                        ? 'border-red-500 ring-red-100' 
                                                        : 'border-emerald-500 ring-emerald-100' 
                                                    : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'}`}
                                            placeholder="student@unisphere.edu"
                                        />
                                        {touched.email && !errors.email && email && (
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
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-slate-700">Password</label>
                                        <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                            Forgot password?
                                        </a>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (touched.password) validate('password', e.target.value);
                                            }}
                                            onBlur={() => handleBlur('password')}
                                            className={`w-full bg-slate-50 border transition-all duration-200 rounded-2xl pl-12 pr-12 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 
                                                ${touched.password 
                                                    ? errors.password 
                                                        ? 'border-red-500 ring-red-100' 
                                                        : 'border-emerald-500 ring-emerald-100' 
                                                    : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'}`}
                                            placeholder="••••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                        {touched.password && !errors.password && password && (
                                            <div className="absolute right-12 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in duration-300">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {touched.password && errors.password && (
                                        <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> {errors.password}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-orange-500/30 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Signing In...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5" />
                                            Sign In
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="my-6 flex items-center gap-4">
                                <div className="flex-1 h-px bg-slate-100" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Continue With</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>

                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    useOneTap
                                    theme="filled_blue"
                                    shape="circle"
                                    width="320"
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 bg-slate-50 px-8 py-6 rounded-b-3xl text-center">
                            <p className="text-slate-600">
                                Don't have an account?{' '}
                                <Link 
                                    to="/register" 
                                    className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-xs text-slate-500">
                        🔒 Secure Login • UniSphere Smart Campus • SSL Protected
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;