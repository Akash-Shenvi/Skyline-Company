import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ImagePlus, Mail, MapPin, Phone, User2 } from 'lucide-react';
import { Header } from '../components/layout';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getDashboardPathForRole } from '../lib/authRouting';
import { institutionFieldClassName, institutionFieldWithIconClassName } from '../lib/formStyles';

const InstitutionRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        institutionRegister,
        institutionResendOtp,
        institutionVerifyOtp,
    } = useAuth();
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
            const nextUser = savedUser ? JSON.parse(savedUser) as { role?: string } : null;
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

    return (
        <div className="min-h-screen bg-brand-off-white">
            <Header />
            <main className="px-4 pt-28 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
                    <section className="rounded-[2rem] bg-brand-black p-8 text-brand-white shadow-2xl sm:p-10">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-brand-gold">
                            <Building2 className="h-4 w-4" />
                            New Institution Registration
                        </div>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                            Create a dedicated institution account.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-brand-off-white">
                            Register once, verify your email, then submit German course requests for your students
                            through a separate institution-only dashboard.
                        </p>
                        <div className="mt-10 space-y-4">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm font-semibold text-brand-gold">Basic contact profile</p>
                                <p className="mt-2 text-sm text-brand-off-white">Institution name, contact person, phone, address, city, and state.</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm font-semibold text-brand-gold">Brand identity</p>
                                <p className="mt-2 text-sm text-brand-off-white">Upload your logo and add a tagline so students see your institution branding in their learning portal.</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm font-semibold text-brand-gold">OTP verification</p>
                                <p className="mt-2 text-sm text-brand-off-white">Your institution account becomes active after email verification.</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm font-semibold text-brand-gold">Bulk student requests</p>
                                <p className="mt-2 text-sm text-brand-off-white">Submit one German level per request and let admin approve the entire batch.</p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[2rem] border border-brand-surface bg-brand-white  sm:p-10">
                        <div className="mb-8">
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-gold">
                                {step === 'register' ? 'Institution Register' : 'Verify Email'}
                            </p>
                            <h2 className="mt-3 text-3xl font-bold text-brand-black">
                                {step === 'register' ? 'Create your institution portal account' : 'Enter the verification code'}
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-brand-olive-dark">
                                {step === 'register'
                                    ? 'Use the institution contact details that should receive approval updates and dashboard access.'
                                    : `We sent a 6-digit OTP to ${formData.email}.`}
                            </p>
                        </div>

                        {error ? (
                            <div className="mb-6 rounded-2xl border border-brand-red/30 bg-brand-red/10-brand-red">
                                {error}
                            </div>
                        ) : null}

                        {message ? (
                            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50-emerald-700">
                                {message}
                            </div>
                        ) : null}

                        {step === 'register' ? (
                            <form onSubmit={handleRegister} className="space-y-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-brand-black">Institution Name</span>
                                        <div className="relative">
                                            <Building2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-olive-light" />
                                            <input
                                                type="text"
                                                value={formData.institutionName}
                                                onChange={(event) => setFormData((current) => ({ ...current, institutionName: event.target.value }))}
                                                className={institutionFieldWithIconClassName}
                                                autoComplete="organization"
                                                required
                                            />
                                        </div>
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-brand-black">Contact Person</span>
                                        <div className="relative">
                                            <User2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-olive-light" />
                                            <input
                                                type="text"
                                                value={formData.contactPersonName}
                                                onChange={(event) => setFormData((current) => ({ ...current, contactPersonName: event.target.value }))}
                                                className={institutionFieldWithIconClassName}
                                                autoComplete="name"
                                                required
                                            />
                                        </div>
                                    </label>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-brand-black">Institution Email</span>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-olive-light" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                                                className={institutionFieldWithIconClassName}
                                                autoComplete="email"
                                                required
                                            />
                                        </div>
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-brand-black">Phone Number</span>
                                        <div className="relative">
                                            <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-olive-light" />
                                            <input
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={(event) => setFormData((current) => ({ ...current, phoneNumber: event.target.value }))}
                                                className={institutionFieldWithIconClassName}
                                                autoComplete="tel"
                                                required
                                            />
                                        </div>
                                    </label>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-brand-black">City</span>
                                        <div className="relative">
                                            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-olive-light" />
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(event) => setFormData((current) => ({ ...current, city: event.target.value }))}
                                                className={institutionFieldWithIconClassName}
                                                autoComplete="address-level2"
                                                required
                                            />
                                        </div>
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-brand-black">State</span>
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={(event) => setFormData((current) => ({ ...current, state: event.target.value }))}
                                            className={institutionFieldClassName}
                                            autoComplete="address-level1"
                                            required
                                        />
                                    </label>
                                </div>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-brand-black">Address</span>
                                    <textarea
                                        value={formData.address}
                                        onChange={(event) => setFormData((current) => ({ ...current, address: event.target.value }))}
                                        rows={3}
                                        className={institutionFieldClassName}
                                        autoComplete="street-address"
                                        required
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-brand-black">Institution Tagline</span>
                                    <input
                                        type="text"
                                        value={formData.tagline}
                                        onChange={(event) => setFormData((current) => ({ ...current, tagline: event.target.value }))}
                                        className={institutionFieldClassName}
                                        placeholder="Example: Industry-ready German training for future engineers"
                                        required
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-brand-black">Institution Logo</span>
                                    <div className="relative">
                                        <ImagePlus className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-olive-light" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
                                            className={institutionFieldWithIconClassName}
                                            required
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 dark:text-brand-olive-light">
                                        PNG, JPG, or any image format up to 5 MB.
                                    </p>
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-brand-black">Password</span>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                                        className={institutionFieldClassName}
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                    />
                                </label>

                                <Button
                                    type="submit"
                                    className="w-full rounded-2xl bg-brand-red py-3 text-base font-semibold text-brand-white hover:bg-brand-red-hover transition-colors"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating Account...' : 'Create Institution Account'}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerify} className="space-y-5">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-brand-black">Verification Code</span>
                                    <input
                                        type="text"
                                        value={formData.otp}
                                        onChange={(event) => setFormData((current) => ({ ...current, otp: event.target.value }))}
                                        className={`${institutionFieldClassName} text-center text-lg tracking-[0.6em]`}
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        required
                                    />
                                </label>

                                <Button
                                    type="submit"
                                    className="w-full rounded-2xl bg-brand-red py-3 text-base font-semibold text-brand-white hover:bg-brand-red-hover transition-colors"
                                    disabled={loading}
                                >
                                    {loading ? 'Verifying...' : 'Verify and Continue'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full rounded-2xl border-brand-gold py-3 text-base font-semibold text-brand-gold"
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                >
                                    Resend OTP
                                </Button>
                            </form>
                        )}

                        <div className="mt-8 rounded-2xl border border-brand-surface bg-brand-gold/5 px-5 py-4 text-sm font-medium text-brand-black shadow-sm">
                            Already registered?{' '}
                            <Link to="/institution/login" className="font-bold text-brand-red underline hover:text-brand-red-hover transition-colors">
                                Sign in to the institution portal
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default InstitutionRegisterPage;
