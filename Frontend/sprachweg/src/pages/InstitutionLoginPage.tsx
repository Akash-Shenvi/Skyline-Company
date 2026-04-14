import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Header } from '../components/layout';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { getDashboardPathForRole } from '../lib/authRouting';
import { institutionFieldWithIconClassName } from '../lib/formStyles';

// ─── All logic identical to original ─────────────────────────────────────────

const InstitutionLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { institutionLogin } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const redirectTarget = new URLSearchParams(location.search).get('redirect');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            await institutionLogin(formData.email, formData.password);
            const savedUser = localStorage.getItem('user');
            const nextUser = savedUser ? (JSON.parse(savedUser) as { role?: string }) : null;
            const nextPath =
                redirectTarget && redirectTarget.startsWith('/')
                    ? redirectTarget
                    : getDashboardPathForRole(nextUser?.role);

            navigate(nextPath);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Institution login failed.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Feature steps data ───────────────────────────────────────────────────

    const steps = [
        {
            number: '01',
            title: 'Register your institution',
            body: 'Create your institution account with contact details and brand identity.',
        },
        {
            number: '02',
            title: 'Add your students',
            body: 'Choose the German level and upload student names, emails, and passwords.',
        },
        {
            number: '03',
            title: 'Wait for approval',
            body: 'Admin approves the whole request and activates every student at once.',
        },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-[#F7F6F2]">
            <Header />

            <main className="flex-1 px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-10">

                        {/* ── LEFT: Marketing panel ──────────────────────────────── */}
                        <section className="relative overflow-hidden rounded-2xl bg-brand-black p-6 text-white shadow-xl sm:rounded-3xl sm:p-8 lg:p-10">
                            {/* Decorative circles */}
                            <span className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full border border-white/[0.04]" />
                            <span className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full border border-white/[0.04]" />
                            <span className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full border border-white/[0.04]" />

                            <div className="relative">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-brand-gold">
                                    <Building2 className="h-3.5 w-3.5" />
                                    Institution Portal
                                </span>

                                <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                                    Manage German enrollments{' '}
                                    <span className="text-brand-gold">for your students.</span>
                                </h1>

                                <p className="mt-4 text-sm leading-6 text-white/60 sm:text-base sm:leading-7">
                                    Sign in with your institution account to submit student batches, track approval
                                    status, and manage course requests separately from the student portal.
                                </p>

                                {/* Feature steps */}
                                <div className="mt-8 space-y-3">
                                    {steps.map((step) => (
                                        <div
                                            key={step.number}
                                            className="flex items-start gap-4 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.08]"
                                        >
                                            <span className="mt-0.5 shrink-0 text-lg font-black tabular-nums text-brand-gold/60">
                                                {step.number}
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{step.title}</p>
                                                <p className="mt-1 text-xs leading-5 text-white/50">{step.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ── RIGHT: Login form ──────────────────────────────────── */}
                        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8 lg:p-9">
                            {/* Section label */}
                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                                Institution Login
                            </p>
                            <h2 className="mt-2 text-xl font-bold text-brand-black sm:text-2xl lg:text-3xl">
                                Sign in to your portal
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-brand-olive-dark">
                                This login is for institution accounts only. Students should use the student sign-in.
                            </p>

                            {/* Error alert */}
                            {error && (
                                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                                            placeholder="institution@example.com"
                                            autoComplete="email"
                                            required
                                        />
                                    </div>
                                </div>

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
                                            placeholder="Enter institution password"
                                            autoComplete="current-password"
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
                                            Signing In…
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="my-6 flex items-center gap-3">
                                <div className="h-px flex-1 bg-gray-100" />
                                <span className="text-xs text-gray-400">or</span>
                                <div className="h-px flex-1 bg-gray-100" />
                            </div>

                            {/* Register CTA */}
                            <div className="rounded-xl border border-gray-100 bg-[#F7F6F2] px-4 py-4">
                                <p className="text-sm text-brand-olive-dark">
                                    Need a new institution account?{' '}
                                    <Link
                                        to="/institution/register"
                                        className="font-bold text-brand-red underline-offset-2 transition-colors duration-150 hover:text-brand-red-hover hover:underline"
                                    >
                                        Register here
                                    </Link>
                                </p>
                            </div>

                            {/* Student portal link */}
                            <p className="mt-4 text-center text-xs text-brand-olive-dark">
                                Student portal?{' '}
                                <Link
                                    to="/login"
                                    className="font-bold text-brand-red transition-colors duration-150 hover:text-brand-red-hover"
                                >
                                    Student Sign In
                                </Link>
                            </p>
                        </section>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default InstitutionLoginPage;