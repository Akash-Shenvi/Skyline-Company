import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    CheckCircle2,
    Globe2,
    LogOut,
    Mail,
    MapPin,
    Phone,
    Plus,
    Send,
    Trash2,
    Users,
    ClipboardList,
    AlertCircle,
    Eye,
    EyeOff,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { institutionAPI } from '../lib/api';
import { institutionFieldClassName } from '../lib/formStyles';

// ─── Interfaces (unchanged) ───────────────────────────────────────────────────

interface InstitutionProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    phoneNumber?: string;
    institutionName?: string;
    institutionLogo?: string;
    institutionTagline?: string;
    contactPersonName?: string;
    city?: string;
    state?: string;
    address?: string;
}

interface GermanLevel {
    name: string;
    duration: string;
    price: string;
    outcome: string;
}

interface GermanCourse {
    _id: string;
    title: string;
    levels: GermanLevel[];
}

interface InstitutionSubmission {
    _id: string;
    courseTitle: string;
    levelName: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    studentCount: number;
    students: Array<{ name: string; email: string; createdUserId?: string | null }>;
    rejectionReason?: string | null;
}

interface DashboardResponse {
    institution: InstitutionProfile;
    language: 'German';
    course: GermanCourse | null;
    submissions: InstitutionSubmission[];
}

interface StudentRow {
    id: number;
    name: string;
    email: string;
    password: string;
}

// ─── Helpers (unchanged) ──────────────────────────────────────────────────────

const createStudentRow = (id: number): StudentRow => ({
    id,
    name: '',
    email: '',
    password: '',
});

const MAX_STUDENTS_PER_REQUEST = 25;

const getStatusConfig = (status: InstitutionSubmission['status']) => {
    if (status === 'APPROVED') {
        return {
            classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
            dot: 'bg-emerald-500',
        };
    }
    if (status === 'REJECTED') {
        return {
            classes: 'bg-red-50 text-red-700 ring-1 ring-red-200',
            dot: 'bg-red-500',
        };
    }
    return {
        classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        dot: 'bg-amber-500',
    };
};

// ─── Component ────────────────────────────────────────────────────────────────

const InstitutionDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
    const [selectedLevelName, setSelectedLevelName] = useState('');
    const [studentRows, setStudentRows] = useState<StudentRow[]>([createStudentRow(1)]);
    const [nextRowId, setNextRowId] = useState(2);
    const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // ── All logic unchanged ──

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await institutionAPI.getDashboard() as DashboardResponse;
            setDashboardData(response);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load institution dashboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchDashboard();
    }, []);

    useEffect(() => {
        if (!selectedLevelName && dashboardData?.course?.levels?.length) {
            setSelectedLevelName(dashboardData.course.levels[0].name);
        }
    }, [dashboardData, selectedLevelName]);

    const handleLogout = () => {
        logout();
        navigate('/institution/login');
    };

    const updateStudentRow = (id: number, key: keyof Omit<StudentRow, 'id'>, value: string) => {
        setStudentRows((current) =>
            current.map((row) => (row.id === id ? { ...row, [key]: value } : row))
        );
    };

    const addStudentRow = () => {
        if (studentRows.length >= MAX_STUDENTS_PER_REQUEST) {
            setError(`You can add up to ${MAX_STUDENTS_PER_REQUEST} students in one request.`);
            return;
        }
        setError('');
        setStudentRows((current) => [...current, createStudentRow(nextRowId)]);
        setNextRowId((current) => current + 1);
    };

    const removeStudentRow = (id: number) => {
        setStudentRows((current) =>
            current.length === 1 ? current : current.filter((row) => row.id !== id)
        );
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        setMessage('');

        if (!dashboardData?.course) {
            setError('German course data is not available yet. Please contact admin.');
            setSubmitting(false);
            return;
        }

        const payloadStudents = studentRows.map((row) => ({
            name: row.name.trim(),
            email: row.email.trim().toLowerCase(),
            password: row.password,
        }));

        if (!selectedLevelName) {
            setError('Please select a German level.');
            setSubmitting(false);
            return;
        }

        if (payloadStudents.some((s) => !s.name || !s.email || !s.password)) {
            setError('Every student row must include name, email, and password.');
            setSubmitting(false);
            return;
        }

        const duplicateEmails = payloadStudents
            .map((s) => s.email)
            .filter((email, index, col) => col.indexOf(email) !== index);

        if (duplicateEmails.length > 0) {
            setError('Duplicate student emails are not allowed in one submission.');
            setSubmitting(false);
            return;
        }

        if (payloadStudents.length > MAX_STUDENTS_PER_REQUEST) {
            setError(`You can submit up to ${MAX_STUDENTS_PER_REQUEST} students in one request.`);
            setSubmitting(false);
            return;
        }

        try {
            await institutionAPI.createSubmission({
                language: 'German',
                courseTitle: dashboardData.course.title,
                levelName: selectedLevelName,
                students: payloadStudents,
            });

            setMessage('Institution request submitted successfully and is now pending admin approval.');
            setStudentRows([createStudentRow(1)]);
            setNextRowId(2);
            await fetchDashboard();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit institution request.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render ──

    return (
        <div className="flex min-h-screen flex-col bg-[#F7F6F2]">
            <Header />

            <main className="flex-1 px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl space-y-6">

                    {/* ── Hero Banner ─────────────────────────────────────────────── */}
                    <section className="relative overflow-hidden rounded-2xl bg-brand-black px-5 py-7 text-white shadow-xl sm:rounded-3xl sm:px-8 sm:py-9 lg:px-10 lg:py-10">
                        {/* decorative rings */}
                        <span className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/[0.05]" />
                        <span className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/[0.05]" />

                        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-brand-gold">
                                    <Building2 className="h-3.5 w-3.5" />
                                    Institution Dashboard
                                </span>
                                <h1 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl xl:text-4xl">
                                    Submit German course requests{' '}
                                    <span className="text-brand-gold">for your students.</span>
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base sm:leading-7">
                                    Choose one German level, add student credentials, and submit the batch for admin
                                    approval. Students are activated only after the full request is accepted.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/80 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.12] hover:text-white active:scale-95"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </section>

                    {/* ── Alerts ──────────────────────────────────────────────────── */}
                    {error && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    {message && (
                        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span>{message}</span>
                        </div>
                    )}

                    {/* ── Loading ─────────────────────────────────────────────────── */}
                    {loading ? (
                        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-gold border-t-transparent" />
                                <p className="text-sm font-medium text-brand-olive">Loading dashboard…</p>
                            </div>
                        </div>
                    ) : dashboardData ? (
                        <div className="grid gap-6 xl:grid-cols-[minmax(320px,380px)_1fr] xl:items-start xl:gap-8">

                            {/* ── LEFT COLUMN ───────────────────────────────────────── */}
                            <div className="space-y-6">

                                {/* Institution Profile card */}
                                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                                                Institution Profile
                                            </p>
                                            <h2 className="mt-2 truncate text-lg font-bold text-brand-black sm:text-xl">
                                                {dashboardData.institution.institutionName ||
                                                    dashboardData.institution.name}
                                            </h2>
                                            <p className="mt-1 text-sm text-brand-olive-dark">
                                                Contact:{' '}
                                                <span className="font-medium">
                                                    {dashboardData.institution.contactPersonName || 'Not provided'}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="shrink-0 rounded-xl bg-brand-gold/10 p-2.5">
                                            <Users className="h-5 w-5 text-brand-gold" />
                                        </div>
                                    </div>

                                    <div className="mt-5 divide-y divide-gray-100">
                                        <div className="flex items-center gap-3 py-2.5">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                                                <Mail className="h-3.5 w-3.5 text-brand-gold" />
                                            </div>
                                            <span className="truncate text-sm text-brand-olive-dark">
                                                {dashboardData.institution.email}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 py-2.5">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                                                <Phone className="h-3.5 w-3.5 text-brand-gold" />
                                            </div>
                                            <span className="text-sm text-brand-olive-dark">
                                                {dashboardData.institution.phoneNumber || 'Phone not provided'}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-3 py-2.5">
                                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                                                <MapPin className="h-3.5 w-3.5 text-brand-gold" />
                                            </div>
                                            <span className="text-sm leading-5 text-brand-olive-dark">
                                                {dashboardData.institution.address || 'Address not provided'}
                                                {(dashboardData.institution.city || dashboardData.institution.state) && (
                                                    <>
                                                        {', '}
                                                        {dashboardData.institution.city || ''}
                                                        {dashboardData.institution.city &&
                                                            dashboardData.institution.state &&
                                                            ', '}
                                                        {dashboardData.institution.state || ''}
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Request Settings card */}
                                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                                        Request Settings
                                    </p>

                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center gap-3 rounded-xl bg-[#F7F6F2] px-4 py-3">
                                            <Globe2 className="h-4 w-4 shrink-0 text-brand-gold" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-olive">
                                                    Language
                                                </p>
                                                <p className="mt-0.5 text-sm font-semibold text-brand-black">
                                                    {dashboardData.language}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-[#F7F6F2] px-4 py-3">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-olive">
                                                Course
                                            </p>
                                            <p className="mt-0.5 text-sm font-semibold text-brand-black">
                                                {dashboardData.course?.title || 'German course not configured'}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                                German Level
                                            </label>
                                            <select
                                                value={selectedLevelName}
                                                onChange={(event) => setSelectedLevelName(event.target.value)}
                                                className={`${institutionFieldClassName} cursor-pointer`}
                                                disabled={!dashboardData.course}
                                            >
                                                {dashboardData.course?.levels.map((level) => (
                                                    <option key={level.name} value={level.name}>
                                                        {level.name} — {level.duration}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── RIGHT COLUMN ──────────────────────────────────────── */}
                            <div className="space-y-6">

                                {/* New Submission card */}
                                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
                                    {/* Card header */}
                                    <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                                                New Submission
                                            </p>
                                            <h2 className="mt-1.5 text-base font-bold text-brand-black sm:text-lg lg:text-xl">
                                                Add students for one German level
                                            </h2>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addStudentRow}
                                            disabled={studentRows.length >= MAX_STUDENTS_PER_REQUEST}
                                            className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-brand-gold/40 bg-brand-gold/[0.06] px-4 py-2 text-sm font-semibold text-brand-gold transition-all duration-200 hover:border-brand-gold/60 hover:bg-brand-gold/15 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                                        >
                                            <Plus className="h-4 w-4" />
                                            {studentRows.length >= MAX_STUDENTS_PER_REQUEST
                                                ? 'Limit Reached'
                                                : 'Add Student'}
                                        </button>
                                    </div>

                                    {/* Quota info banner */}
                                    <div className="mx-5 mt-4 flex items-center gap-2.5 rounded-xl border border-brand-gold/20 bg-brand-gold/[0.06] px-4 py-2.5 text-sm text-brand-olive-dark sm:mx-6">
                                        <ClipboardList className="h-4 w-4 shrink-0 text-brand-gold" />
                                        <span>
                                            Up to <strong className="text-brand-black">{MAX_STUDENTS_PER_REQUEST}</strong>{' '}
                                            students per request &mdash; Current draft:{' '}
                                            <strong className="text-brand-black">{studentRows.length}</strong>
                                        </span>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                                        {studentRows.map((row, index) => (
                                            <div
                                                key={row.id}
                                                className="group rounded-xl border border-gray-100 bg-[#FAFAF8] p-3.5 transition-all duration-200 hover:border-brand-gold/30 hover:shadow-sm sm:p-4"
                                            >
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold/15 text-[10px] font-bold text-brand-gold">
                                                            {index + 1}
                                                        </span>
                                                        <p className="text-sm font-semibold text-brand-black">
                                                            Student {index + 1}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeStudentRow(row.id)}
                                                        disabled={studentRows.length === 1}
                                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-400 transition-all duration-150 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="grid gap-3 sm:grid-cols-3">
                                                    <input
                                                        type="text"
                                                        value={row.name}
                                                        onChange={(e) => updateStudentRow(row.id, 'name', e.target.value)}
                                                        className={institutionFieldClassName}
                                                        placeholder="Full name"
                                                        autoComplete="name"
                                                        required
                                                    />
                                                    <input
                                                        type="email"
                                                        value={row.email}
                                                        onChange={(e) => updateStudentRow(row.id, 'email', e.target.value)}
                                                        className={institutionFieldClassName}
                                                        placeholder="student@example.com"
                                                        autoComplete="email"
                                                        required
                                                    />
                                                    <div className="relative">
                                                        <input
                                                            type={showPasswords[row.id] ? 'text' : 'password'}
                                                            value={row.password}
                                                            onChange={(e) => updateStudentRow(row.id, 'password', e.target.value)}
                                                            className={`${institutionFieldClassName} pr-10`}
                                                            placeholder="Set login password"
                                                            autoComplete="new-password"
                                                            minLength={6}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords(prev => ({ ...prev, [row.id]: !prev[row.id] }))}
                                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-olive-light transition-colors hover:text-brand-black"
                                                        >
                                                            {showPasswords[row.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="submit"
                                            disabled={submitting || !dashboardData.course}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-brand-red-hover hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                                        >
                                            <Send className="h-4 w-4" />
                                            {submitting ? 'Submitting Request…' : 'Submit for Admin Approval'}
                                        </button>
                                    </form>
                                </div>

                                {/* Submission History card */}
                                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
                                    {/* Card header */}
                                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                                                Submission History
                                            </p>
                                            <h2 className="mt-1.5 text-base font-bold text-brand-black sm:text-lg lg:text-xl">
                                                Track request status
                                            </h2>
                                        </div>
                                        <span className="rounded-full bg-brand-gold/10 px-3 py-1 text-xs font-bold text-brand-gold">
                                            {dashboardData.submissions.length} request
                                            {dashboardData.submissions.length !== 1 && 's'}
                                        </span>
                                    </div>

                                    <div className="space-y-3 px-5 py-4 sm:px-6 sm:py-5">
                                        {dashboardData.submissions.length === 0 ? (
                                            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-10 text-center">
                                                <ClipboardList className="h-8 w-8 text-gray-300" />
                                                <p className="text-sm text-brand-olive">
                                                    No institution requests submitted yet.
                                                </p>
                                            </div>
                                        ) : (
                                            dashboardData.submissions.map((submission) => {
                                                const statusConfig = getStatusConfig(submission.status);
                                                return (
                                                    <div
                                                        key={submission._id}
                                                        className="rounded-xl border border-gray-100 bg-[#FAFAF8] p-4 transition-all duration-200 hover:border-gray-200 hover:shadow-sm sm:p-5"
                                                    >
                                                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="truncate text-sm font-bold text-brand-black sm:text-base">
                                                                    {submission.courseTitle} — {submission.levelName}
                                                                </h3>
                                                                <p className="mt-0.5 text-xs text-brand-olive">
                                                                    {new Date(submission.createdAt).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.classes}`}
                                                            >
                                                                <span
                                                                    className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                                                                />
                                                                {submission.status}
                                                            </span>
                                                        </div>

                                                        <div className="mt-3 flex items-center gap-2 text-xs text-brand-olive-dark">
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-brand-gold" />
                                                            <span>
                                                                <strong className="text-brand-black">
                                                                    {submission.studentCount}
                                                                </strong>{' '}
                                                                student{submission.studentCount !== 1 && 's'} in this request
                                                            </span>
                                                        </div>

                                                        {submission.rejectionReason && (
                                                            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                                                                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                                <span>{submission.rejectionReason}</span>
                                                            </div>
                                                        )}

                                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                                            {submission.students.map((student) => (
                                                                <span
                                                                    key={`${submission._id}-${student.email}`}
                                                                    className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-brand-black ring-1 ring-gray-200 transition-all duration-150 hover:ring-brand-gold/40"
                                                                >
                                                                    {student.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    ) : null}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default InstitutionDashboard;