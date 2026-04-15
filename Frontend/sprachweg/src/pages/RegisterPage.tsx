import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckCircle, Phone, User as UserIcon, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Header } from '../components/layout';
import { getDashboardPathForRole } from '../lib/authRouting';

// Elevated Hero Background for Auth Pages
const HeroBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                    x: [0, 30, 0],
                    y: [0, -20, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-brand-red/20 blur-[100px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.05, 0.15, 0.05],
                    x: [0, -20, 0]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[20%] -left-[10%] h-[400px] w-[400px] rounded-full bg-brand-gold/15 blur-[80px]"
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>
    );
};

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, verifyOtp, googleLogin } = useAuth();
    const [step, setStep] = useState<'register' | 'verify'>('register');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        otp: '',
    });

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                await googleLogin(tokenResponse.access_token);
                const savedUser = localStorage.getItem('user');
                const nextUser = savedUser ? JSON.parse(savedUser) as { role?: string } : null;
                navigate(getDashboardPathForRole(nextUser?.role));
            } catch (err: any) {
                setError(err.response?.data?.message || 'Google Login failed');
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            setError('Google Login Failed');
        },
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // Combine names for the API if needed
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();

        try {
            await register(fullName, formData.email, formData.phone, formData.password);
            setStep('verify');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await verifyOtp(formData.email, formData.otp);
            const savedUser = localStorage.getItem('user');
            const nextUser = savedUser ? JSON.parse(savedUser) as { role?: string } : null;
            navigate(getDashboardPathForRole(nextUser?.role));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            <Header />
            <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>

            <main id="main" role="main" className="min-h-screen pt-20 flex">
                {/* Left Panel - Hero */}
                <div className="hidden lg:flex lg:w-1/2 bg-brand-black text-white p-16 flex-col justify-between relative overflow-hidden">
                    <HeroBackground />

                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-5xl lg:text-7xl font-sans font-bold leading-[1.1] mb-8 tracking-tight">
                                Start Your<br />
                                Technical <span className="text-brand-red">Career</span><br />
                                <span className="text-white">Journey</span>
                            </h1>

                            <p className="text-white/60 text-lg mb-12 max-w-sm leading-relaxed">
                                Join thousands of successful students who have transformed their lives through industry-ready skills.
                            </p>

                            <div className="space-y-6">
                                {[
                                    "Access to complete technical curriculum",
                                    "Free career counseling session",
                                    "Join a community of professional learners"
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + (i * 0.1) }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm">
                                            <CheckCircle className="w-5 h-5 text-brand-red" />
                                        </div>
                                        <span className="text-white/80 font-medium">{item}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="relative z-10 text-sm text-white/40 tracking-widest uppercase font-bold">
                        Skyline Technologies LLP © {new Date().getFullYear()}
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                    <div className="w-full max-w-md">
                        {/* Mobile Header (Visible only on small screens) */}
                        <div className="lg:hidden flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-brand-black rounded-lg flex items-center justify-center text-white">
                                <span className="font-sans font-bold">S</span>
                            </div>
                            <span className="font-sans font-bold text-brand-black">SKYLINE</span>
                        </div>
                        {/* Tab Switcher */}
                        <div className="bg-white p-1.5 rounded-xl flex mb-8 shadow-sm border border-brand-surface w-full max-w-sm mx-auto">
                            <Link to="/login" className="flex-1">
                                <button
                                    className="w-full py-2.5 text-sm font-medium text-brand-olive hover:text-brand-black transition-all"
                                    aria-selected="false"
                                >
                                    Sign In
                                </button>
                            </Link>
                            <button
                                className="flex-1 py-2.5 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md transition-all"
                                aria-selected="true"
                            >
                                Create Account
                            </button>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white rounded-3xl shadow-xl p-8 border border-brand-surface"
                        >
                            <div className="mb-6">
                                <h2 className="font-sans text-3xl font-bold text-brand-black mb-2">Create Account</h2>
                                <p className="text-brand-olive">Start your learning journey today</p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-6 p-4 bg-brand-red/5 border border-brand-red/20 rounded-lg text-brand-red text-sm flex items-start gap-2"
                                    role="alert"
                                >
                                    <span className="mt-0.5">⚠️</span>
                                    {error}
                                </motion.div>
                            )}

                            <AnimatePresence mode="wait">
                                {step === 'register' ? (
                                    <motion.form
                                        key="register"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleRegister}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-brand-olive-dark mb-1.5">
                                                    First Name
                                                </label>
                                                <div className="relative group">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-olive-light group-focus-within:text-brand-gold transition-colors">
                                                        <UserIcon className="w-5 h-5" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="John"
                                                        className="w-full rounded-xl border border-brand-surface bg-brand-off-white px-4 py-3 pl-10 text-brand-black placeholder:text-brand-olive-light transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white"
                                                        value={formData.firstName}
                                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-brand-olive-dark mb-1.5">
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Doe"
                                                    className="w-full rounded-xl border border-brand-surface bg-brand-off-white px-4 py-3 text-brand-black placeholder:text-brand-olive-light transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white"
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-brand-olive-dark mb-1.5">
                                                Email
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-olive-light group-focus-within:text-brand-gold transition-colors">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    className="w-full rounded-xl border border-brand-surface bg-brand-off-white px-4 py-3 pl-10 text-brand-black placeholder:text-brand-olive-light transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-brand-olive-dark mb-1.5">
                                                Phone (Optional)
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-olive-light group-focus-within:text-brand-gold transition-colors">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    placeholder="+91 98765 43210"
                                                    className="w-full rounded-xl border border-brand-surface bg-brand-off-white px-4 py-3 pl-10 text-brand-black placeholder:text-brand-olive-light transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-brand-olive-dark mb-1.5">
                                                Password
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-olive-light group-focus-within:text-brand-gold transition-colors">
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Create a strong password"
                                                    className="w-full rounded-xl border border-brand-surface bg-brand-off-white px-4 py-3 pl-10 pr-10 text-brand-black placeholder:text-brand-olive-light transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    required
                                                    minLength={6}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-olive-light hover:text-brand-olive-dark focus:outline-none"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 pt-2">
                                            <input type="checkbox" id="terms" required className="mt-1 rounded border-brand-surface text-brand-gold focus:ring-brand-gold w-4 h-4 cursor-pointer" />
                                            <label htmlFor="terms" className="text-sm text-brand-olive-dark cursor-pointer">
                                                I agree to the <a href="#" className="text-brand-gold font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-brand-gold font-medium hover:underline">Privacy Policy</a>
                                            </label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-brand-red hover:bg-brand-red-hover text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-red-900/10 transition-transform active:scale-[0.98]"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                    Creating Account...
                                                </span>
                                            ) : 'Create Account'}
                                        </Button>

                                        <div className="mt-6 relative text-center">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-brand-surface" />
                                            </div>
                                            <div className="relative inline-block px-4 bg-white text-xs text-brand-olive-light uppercase tracking-widest font-semibold">
                                                OR CONTINUE WITH
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <button
                                                type="button"
                                                onClick={() => handleGoogleLogin()}
                                                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-brand-surface rounded-xl hover:bg-brand-off-white bg-white transition-all active:scale-[0.98]"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                                <span className="text-sm font-semibold text-brand-olive-dark">Continue with Google</span>
                                            </button>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <motion.form
                                        key="verify"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleVerifyOtp}
                                        className="space-y-6"
                                    >
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 bg-brand-gold/5 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-gold">
                                                <Mail className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-xl font-bold text-brand-black">Verify Your Email</h3>
                                            <p className="text-center text-brand-olive mt-2">
                                                We've sent a 6-digit verification code to <br />
                                                <span className="font-semibold text-brand-black">{formData.email}</span>
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-brand-olive-dark mb-1.5 text-center">
                                                Enter Verification Code
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="000000"
                                                className="w-full rounded-xl border border-brand-surface bg-brand-off-white px-4 py-4 text-brand-black placeholder:text-brand-olive-light transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white text-center tracking-[1em] text-2xl font-mono"
                                                value={formData.otp}
                                                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                                required
                                                maxLength={6}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-brand-red hover:bg-brand-red-hover text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-red-900/10 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                                            disabled={loading}
                                        >
                                            {loading ? 'Verifying...' : (
                                                <>
                                                    Verify & Continue
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </Button>

                                        <div className="pt-4 border-t border-brand-surface">
                                            <button
                                                type="button"
                                                onClick={() => setStep('register')}
                                                className="w-full text-center text-sm text-brand-olive hover:text-brand-olive-dark font-medium transition-colors"
                                            >
                                                ← Correct my email address
                                            </button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <p className="text-center text-xs text-brand-olive-light mt-8">
                            Protected by reCAPTCHA and subject to the Google Privacy Policy and Terms of Service.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;
