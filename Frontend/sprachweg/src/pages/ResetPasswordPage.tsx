import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import { authAPI } from '../lib/api';
import { Header } from '../components/layout';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Auto-fill email from query param
    const initialEmail = searchParams.get('email') || '';

    const [formData, setFormData] = useState({
        email: initialEmail,
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await authAPI.resetPassword({
                email: formData.email,
                otp: formData.otp,
                newPassword: formData.newPassword
            });
            setSubmitted(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Reset failed. Invalid OTP or request.');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 bg-brand-off-white font-sans text-left overflow-y-auto">
            <Header />

            <main className="min-h-screen flex items-center justify-center p-4 pt-20">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-brand-surface">
                        {!submitted && (
                            <Link
                                to="/forgot-password"
                                className="inline-flex items-center text-sm text-brand-olive hover:text-brand-black mb-6 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back
                            </Link>
                        )}

                        <div className="mb-6">
                            <h2 className="font-sans text-3xl font-bold text-[#0e5cad] mb-2">
                                {submitted ? 'Password Reset!' : 'Reset Password'}
                            </h2>
                            {!submitted && (
                                <p className="text-brand-olive">
                                    Enter the verification code and your new password.
                                </p>
                            )}
                        </div>

                        {submitted ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-brand-olive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-brand-olive" />
                                </div>
                                <h3 className="text-xl font-semibold text-brand-black mb-2">Success!</h3>
                                <p className="text-brand-olive mb-6">
                                    Your password has been reset successfully. <br />
                                    Redirecting to login...
                                </p>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-[#0e5cad] hover:bg-[#0a4a82] text-white py-3 rounded-xl font-semibold"
                                >
                                    Login Now
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="p-4 bg-brand-red/5 border border-brand-red/20 rounded-lg text-brand-red text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Email Field - Read Only if pre-filled, or editable */}
                                <div>
                                    <label className="block text-sm font-semibold text-brand-olive-dark mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full rounded-xl border border-brand-surface bg-brand-surface px-4 py-3 text-brand-olive transition-all focus:outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brand-olive-dark mb-1.5">
                                        Enter OTP Code
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="123456"
                                        className="w-full rounded-xl border border-brand-surface bg-brand-off-white px-4 py-3 text-center text-2xl tracking-widest font-mono text-brand-black placeholder:text-brand-olive-light transition-all focus:outline-none focus:ring-2 focus:ring-[#0e5cad] focus:bg-white"
                                        value={formData.otp}
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                        maxLength={6}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brand-olive-dark mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-olive-light group-focus-within:text-[#0e5cad] transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="w-full rounded-xl border border-brand-surface bg-brand-off-white px-4 py-3 pl-10 pr-10 text-brand-black placeholder:text-brand-olive-light transition-all focus:outline-none focus:ring-2 focus:ring-[#0e5cad] focus:bg-white"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
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

                                <div>
                                    <label className="block text-sm font-semibold text-brand-olive-dark mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-olive-light group-focus-within:text-[#0e5cad] transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="w-full rounded-xl border border-brand-surface bg-brand-off-white px-4 py-3 pl-10 pr-10 text-brand-black placeholder:text-brand-olive-light transition-all focus:outline-none focus:ring-2 focus:ring-[#0e5cad] focus:bg-white"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#0e5cad] hover:bg-[#0a4a82] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-900/10 transition-transform active:scale-[0.98]"
                                    disabled={loading}
                                >
                                    {loading ? 'Reseting...' : 'Reset Password'}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>,
        document.body
    );
};

export default ResetPasswordPage;
