import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Building2,
    ImagePlus,
    Mail,
    MapPin,
    Phone,
    User2,
    Lock,
    FileText,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Eye,
    EyeOff,
} from 'lucide-react';
import { Header } from '../components/layout';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { getDashboardPathForRole } from '../lib/authRouting';
import {
    institutionFieldClassName,
    institutionFieldWithIconClassName,
} from '../lib/formStyles';

// ─── All logic identical to original ─────────────────────────────────────────

const InstitutionRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { institutionRegister, institutionResendOtp, institutionVerifyOtp } = useAuth();

    const [step, setStep] = useState<'register' | 'verify'>('register');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        institutionName: '',
        contactPersonName: '',
        email: '',
        phoneNumber: '',
        password: '',
        city: '',
        state: '',
        address: '',
        tagline: '',
        otp: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (!logoFile) {
            setError('Institution logo is required.');
            setLoading(false);
            return;
        }

        try {
            await institutionRegister({
                institutionName: formData.institutionName,
                contactPersonName: formData.contactPersonName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
                city: formData.city,
                state: formData.state,
                address: formData.address,
                tagline: formData.tagline,
                logo: logoFile as File,
            });
            setStep('verify');
            setMessage('Verification code sent to your institution email.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Institution registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await institutionVerifyOtp(formData.email, formData.otp);
            const savedUser = localStorage.getItem('user');
            const nextUser = savedUser ? (JSON.parse(savedUser) as { role?: string }) : null;
            navigate(getDashboardPathForRole(nextUser?.role));
        } catch (err: any) {
            setError(err.response?.data?.message || 'OTP verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await institutionResendOtp(formData.email);
            setMessage('Verification code sent again.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Unable to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Feature bullets for the left panel ──────────────────────────────────

    const features = [
        {
            title: 'Basic contact profile',
            body: 'Institution name, contact person, phone, address, city, and state.',
        },
        {
            title: 'Brand identity',
            body: 'Upload your logo and add a tagline so students see your institution branding.',
        },
        {
            title: 'OTP verification',
            body: 'Your institution account becomes active after email verification.',
        },
        {
            title: 'Bulk student requests',
            body: 'Submit one German level per request and let admin approve the entire batch.',
        },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-[#F7F6F2]">
            <Header />

            <main className="flex-1 px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-10">

                        {/* ── LEFT: Marketing panel ──────────────────────────────── */}
                        <section className="relative overflow-hidden rounded-2xl bg-brand-black p-6 text-white shadow-xl sm:rounded-3xl sm:p-8 lg:sticky lg:top-28 lg:self-start lg:p-10">
                            {/* Decorative rings */}
                            <span className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full border border-white/[0.04]" />
                            <span className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full border border-white/[0.04]" />

                            <div className="relative">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-brand-gold">
                                    <Building2 className="h-3.5 w-3.5" />
                                    New Institution Registration
                                </span>

                                <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                                    Create a dedicated{' '}
                                    <span className="text-brand-gold">institution account.</span>
                                </h1>

                                <p className="mt-4 text-sm leading-6 text-white/60 sm:text-base sm:leading-7">
                                    Register once, verify your email, then submit German course requests for your
                                    students through a separate institution-only dashboard.
                                </p>

                                {/* Feature bullets */}
                                <div className="mt-7 space-y-3">
                                    {features.map((feat, i) => (
                                        <div
                                            key={feat.title}
                                            className="flex items-start gap-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.08]"
                                        >
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-[10px] font-black text-brand-gold">
                                                {i + 1}
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{feat.title}</p>
                                                <p className="mt-0.5 text-xs leading-5 text-white/50">{feat.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress indicator */}
                                <div className="mt-8 flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-300 ${step === 'register'
                                                    ? 'bg-brand-gold text-brand-black'
                                                    : 'bg-emerald-500 text-white'
                                                }`}
                                        >
                                            {step === 'register' ? '1' : <CheckCircle2 className="h-3.5 w-3.5" />}
                                        </span>
                                        <span className="text-xs font-semibold text-white/70">Registration</span>
                                    </div>
                                    <div
                                        className={`h-px flex-1 transition-colors duration-500 ${step === 'verify' ? 'bg-emerald-500/50' : 'bg-white/15'
                                            }`}
                                    />
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-300 ${step === 'verify'
                                                    ? 'bg-brand-gold text-brand-black'
                                                    : 'bg-white/15 text-white/40'
                                                }`}
                                        >
                                            2
                                        </span>
                                        <span className="text-xs font-semibold text-white/70">Verify Email</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── RIGHT: Form card ───────────────────────────────────── */}
                        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8 lg:p-9">
                            {/* Header */}
                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                                {step === 'register' ? 'Institution Register' : 'Verify Email'}
                            </p>
                            <h2 className="mt-2 text-xl font-bold text-brand-black sm:text-2xl lg:text-3xl">
                                {step === 'register'
                                    ? 'Create your institution account'
                                    : 'Enter verification code'}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-brand-olive-dark">
                                {step === 'register'
                                    ? 'Use the institution contact details that should receive approval updates and dashboard access.'
                                    : `We sent a 6-digit OTP to ${formData.email}.`}
                            </p>

                            {/* Alerts */}
                            {error && (
                                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {message && (
                                <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                    <span>{message}</span>
                                </div>
                            )}

                            {/* ── REGISTER FORM ─────────────────────────────────────── */}
                            {step === 'register' ? (
                                <form onSubmit={handleRegister} className="mt-6 space-y-5">

                                    {/* Row 1: Institution Name + Contact Person */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                                Institution Name
                                            </label>
                                            <div className="relative">
                                                <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-olive-light" />
                                                <input
                                                    type="text"
                                                    value={formData.institutionName}
                                                    onChange={(e) =>
                                                        setFormData((c) => ({ ...c, institutionName: e.target.value }))
                                                    }
                                                    className={institutionFieldWithIconClassName}
                                                    placeholder="Skyline Academy"
                                                    autoComplete="organization"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                                Contact Person
                                            </label>
                                            <div className="relative">
                                                <User2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-olive-light" />
                                                <input
                                                    type="text"
                                                    value={formData.contactPersonName}
                                                    onChange={(e) =>
                                                        setFormData((c) => ({
                                                            ...c,
                                                            contactPersonName: e.target.value,
                                                        }))
                                                    }
                                                    className={institutionFieldWithIconClassName}
                                                    placeholder="Full name"
                                                    autoComplete="name"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 2: Email + Phone */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                                Institution Email
                                            </label>
                                            <div className="relative">
                                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-olive-light" />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData((c) => ({ ...c, email: e.target.value }))
                                                    }
                                                    className={institutionFieldWithIconClassName}
                                                    placeholder="contact@institution.com"
                                                    autoComplete="email"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-olive-light" />
                                                <input
                                                    type="tel"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) =>
                                                        setFormData((c) => ({ ...c, phoneNumber: e.target.value }))
                                                    }
                                                    className={institutionFieldWithIconClassName}
                                                    placeholder="+91 00000 00000"
                                                    autoComplete="tel"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 3: City + State */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                                City
                                            </label>
                                            <div className="relative">
                                                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-olive-light" />
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={(e) =>
                                                        setFormData((c) => ({ ...c, city: e.target.value }))
                                                    }
                                                    className={institutionFieldWithIconClassName}
                                                    placeholder="Bangalore"
                                                    autoComplete="address-level2"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.state}
                                                onChange={(e) =>
                                                    setFormData((c) => ({ ...c, state: e.target.value }))
                                                }
                                                className={institutionFieldClassName}
                                                placeholder="Karnataka"
                                                autoComplete="address-level1"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                            Address
                                        </label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) =>
                                                setFormData((c) => ({ ...c, address: e.target.value }))
                                            }
                                            rows={3}
                                            className={`${institutionFieldClassName} resize-none`}
                                            placeholder="Street, building, area…"
                                            autoComplete="street-address"
                                            required
                                        />
                                    </div>

                                    {/* Tagline */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                            Institution Tagline
                                        </label>
                                        <div className="relative">
                                            <FileText className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-olive-light" />
                                            <input
                                                type="text"
                                                value={formData.tagline}
                                                onChange={(e) =>
                                                    setFormData((c) => ({ ...c, tagline: e.target.value }))
                                                }
                                                className={institutionFieldWithIconClassName}
                                                placeholder="Industry-ready German training for future engineers"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Logo upload */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                            Institution Logo
                                        </label>
                                        <div
                                            className={`flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 transition-colors duration-200 ${logoFile
                                                    ? 'border-emerald-300 bg-emerald-50'
                                                    : 'border-gray-200 bg-[#F7F6F2] hover:border-brand-gold/40'
                                                }`}
                                        >
                                            {logoFile ? (
                                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                            ) : (
                                                <ImagePlus className="h-4 w-4 shrink-0 text-brand-olive-light" />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                                    className="block w-full cursor-pointer text-sm text-brand-olive-dark file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-gold/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand-gold transition-all duration-150 hover:file:bg-brand-gold/20"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <p className="mt-1.5 text-xs text-gray-400">
                                            PNG, JPG, or any image format — max 5 MB
                                        </p>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-olive-light" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) =>
                                                    setFormData((c) => ({ ...c, password: e.target.value }))
                                                }
                                                className={`${institutionFieldWithIconClassName} pr-12`}
                                                placeholder="Minimum 6 characters"
                                                autoComplete="new-password"
                                                minLength={6}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-olive-light transition-colors hover:text-brand-black"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-brand-red-hover hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                                Creating Account…
                                            </>
                                        ) : (
                                            <>
                                                Create Institution Account
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                            ) : (
                                /* ── VERIFY FORM ────────────────────────────────────────── */
                                <form onSubmit={handleVerify} className="mt-6 space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                            Verification Code
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.otp}
                                            onChange={(e) =>
                                                setFormData((c) => ({ ...c, otp: e.target.value }))
                                            }
                                            className={`${institutionFieldClassName} text-center text-xl font-bold tracking-[0.5em]`}
                                            placeholder="——————"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            required
                                        />
                                        <p className="mt-2 text-center text-xs text-brand-olive">
                                            Check your inbox at{' '}
                                            <strong className="text-brand-black">{formData.email}</strong>
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-brand-red-hover hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                                Verifying…
                                            </>
                                        ) : (
                                            <>
                                                Verify and Continue
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-gold/40 bg-brand-gold/8 py-3 text-sm font-semibold text-brand-gold transition-all duration-200 hover:border-brand-gold/60 hover:bg-brand-gold/15 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Resend OTP
                                    </button>
                                </form>
                            )}

                            {/* Divider + Sign-in CTA */}
                            <div className="mt-7">
                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-gray-100" />
                                    <span className="text-xs text-gray-400">already registered?</span>
                                    <div className="h-px flex-1 bg-gray-100" />
                                </div>
                                <div className="mt-4 rounded-xl border border-gray-100 bg-[#F7F6F2] px-4 py-4">
                                    <p className="text-sm text-brand-olive-dark">
                                        Sign in to the institution portal?{' '}
                                        <Link
                                            to="/institution/login"
                                            className="font-bold text-brand-red underline-offset-2 transition-colors duration-150 hover:text-brand-red-hover hover:underline"
                                        >
                                            Login here
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default InstitutionRegisterPage;