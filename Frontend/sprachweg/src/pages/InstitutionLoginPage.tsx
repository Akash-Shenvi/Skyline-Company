import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail } from 'lucide-react';
import { Header } from '../components/layout';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getDashboardPathForRole } from '../lib/authRouting';
import { institutionFieldWithIconClassName } from '../lib/formStyles';

const InstitutionLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { institutionLogin } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
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
            const nextUser = savedUser ? JSON.parse(savedUser) as { role?: string } : null;
            const nextPath = redirectTarget && redirectTarget.startsWith('/')
                ? redirectTarget
                : getDashboardPathForRole(nextUser?.role);

            navigate(nextPath);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Institution login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-off-white">
            <Header />
            <main className="px-4 pt-28 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-[2rem] bg-brand-black p-8 text-brand-white shadow-2xl sm:p-10">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-brand-gold">
                            <Building2 className="h-4 w-4" />
                            Institution Portal
                        </div>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                            Manage German enrollments for your students.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-brand-off-white">
                            Sign in with your institution account to submit student batches, track approval status,
                            and manage course requests separately from the student portal.
                        </p>
                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm font-semibold text-brand-gold">1. Register</p>
                                <p className="mt-2 text-sm text-brand-off-white">Create your institution account with contact details.</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm font-semibold text-brand-gold">2. Add Students</p>
                                <p className="mt-2 text-sm text-brand-off-white">Choose the German level and upload student names, emails, and passwords.</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm font-semibold text-brand-gold">3. Wait for Approval</p>
                                <p className="mt-2 text-sm text-brand-off-white">Admin approves the whole request and activates every student at once.</p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[2rem] border border-brand-surface bg-brand-white  sm:p-10">
                        <div className="mb-8">
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-gold">Institution Login</p>
                            <h2 className="mt-3 text-3xl font-bold text-brand-black">Sign in to your portal</h2>
                            <p className="mt-3 text-sm leading-6 text-brand-olive-dark">
                                This login is only for institution accounts. Students should continue using the normal student sign in.
                            </p>
                        </div>

                        {error ? (
                            <div className="mb-6 rounded-2xl border border-brand-red/30 bg-brand-red/10-brand-red">
                                {error}
                            </div>
                        ) : null}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-brand-black">Institution Email</label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-olive-light" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                                        className={institutionFieldWithIconClassName}
                                        placeholder="institution@example.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-brand-black">Password</label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-olive-light" />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                                        className={institutionFieldWithIconClassName}
                                        placeholder="Enter institution password"
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full rounded-2xl bg-brand-red py-3 text-base font-semibold text-brand-white hover:bg-brand-red-hover transition-colors"
                                disabled={loading}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </form>

                        <div className="mt-8 rounded-2xl border border-brand-surface bg-brand-gold/5 px-5 py-4 text-sm font-medium text-brand-black shadow-sm">
                            Need a new institution account?{' '}
                            <Link to="/institution/register" className="font-bold text-brand-red underline hover:text-brand-red-hover transition-colors">
                                Register here
                            </Link>
                        </div>

                        <div className="mt-5 text-sm font-medium text-brand-olive-dark">
                            Student portal:{' '}
                            <Link to="/login" className="font-bold text-brand-red hover:text-brand-red-hover transition-colors">
                                Student Sign In
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default InstitutionLoginPage;
