import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Building2,
    BookOpen,
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Eye,
    Filter,
    GraduationCap,
    Loader2,
    Mail,
    Hash,
    Phone,
    Search,
    Trash2,
    User as UserIcon,
    X,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api, { getAssetUrl, trainingCheckoutAPI } from '../../lib/api';
import { formatPaymentState } from '../../lib/paymentFormatting';
import { formatTrainingPrice } from '../../lib/trainingPricing';

interface StudentProfile {
    _id?: string;
    name: string;
    email: string;
    phoneNumber?: string;
    institutionId?: string | null;
    institutionName?: string | null;
    germanLevel?: string;
    guardianName?: string;
    guardianPhone?: string;
    qualification?: string;
    dateOfBirth?: string;
    avatar?: string;
    role?: string;
    createdAt?: string;
}

interface Enrollment {
    _id: string;
    trainingType: 'language' | 'skill';
    userId: StudentProfile | null;
    courseTitle: string;
    name: string;
    status: string;
    institutionId?: string | null;
    institutionName?: string | null;
    createdAt?: string;
    payment: PaymentSnapshot | null;
}

interface PaymentSnapshot {
    status: string;
    amount: number | null;
    currency: string;
    method: string | null;
    gateway: string;
    transactionId: string | null;
    paymentId: string | null;
    bankReferenceNumber?: string | null;
    paidAt: string | null;
}

interface LanguageEnrollment {
    _id: string;
    courseTitle: string;
    name: string;
    status: string;
    batchId?: {
        _id: string;
        name: string;
        institutionId?: string | null;
        institutionName?: string | null;
    };
}

interface SkillEnrollment {
    _id: string;
    status: string;
    skillCourseId?: {
        _id: string;
        title: string;
    };
}

interface EnrollmentPagination {
    currentPage: number;
    totalPages: number;
    totalEnrollments: number;
    limit: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

interface TrainingPaymentAttempt {
    _id: string;
    userId?: StudentProfile | null;
    skillCourseId?: {
        _id: string;
        title: string;
    } | null;
    trainingType: 'language' | 'skill';
    origin: string;
    courseTitle: string;
    levelName?: string;
    amount: number;
    currency: string;
    paymentStatus?: string;
    paymentMethod?: string;
    transactionId?: string;
    paymentId?: string;
    bankReferenceNumber?: string;
    failureReason?: string;
    paymentErrorDescription?: string;
    paymentErrorReason?: string;
    status: 'created' | 'paid' | 'failed' | 'cancelled';
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
}

interface PaymentAttemptPagination {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

const ENROLLMENTS_PER_PAGE = 9;
const TRAINING_PAYMENT_ISSUES_PAGE_SIZE = 6;

const formatDateTime = (value?: string | null) => {
    if (!value) return 'Not available';

    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatEnrollmentStatus = (value?: string | null) => {
    const normalizedValue = String(value ?? '').trim().toLowerCase();

    if (!normalizedValue) return 'Unknown';
    if (normalizedValue === 'approved' || normalizedValue === 'active') return 'Approved';
    if (normalizedValue === 'pending') return 'Pending';
    if (normalizedValue === 'rejected' || normalizedValue === 'dropped') return 'Rejected';
    if (normalizedValue === 'completed') return 'Completed';

    return normalizedValue.charAt(0).toUpperCase() + normalizedValue.slice(1);
};

const getEnrollmentStatusClasses = (value?: string | null) => {
    const normalizedValue = String(value ?? '').trim().toLowerCase();

    if (normalizedValue === 'approved' || normalizedValue === 'active') {
        return 'bg-brand-olive/10 text-brand-olive-dark';
    }

    if (normalizedValue === 'pending') {
        return 'bg-brand-gold/10 text-brand-gold';
    }

    if (normalizedValue === 'completed') {
        return 'bg-brand-gold/10 text-brand-olive-dark';
    }

    return 'bg-brand-red/10 text-brand-red';
};

const getPaymentAttemptStatusMeta = (status: TrainingPaymentAttempt['status']) => {
    if (status === 'paid') {
        return 'border-brand-olive/20 bg-brand-olive/5 text-brand-olive-dark';
    }

    if (status === 'failed') {
        return 'border-brand-red/20 bg-brand-red/5 text-brand-red';
    }

    if (status === 'cancelled') {
        return 'border-brand-surface bg-brand-surface text-brand-olive-dark';
    }

    return 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold-hover';
};

const formatPaymentAttemptTitle = (attempt: TrainingPaymentAttempt) =>
    attempt.trainingType === 'language' && attempt.levelName
        ? `${attempt.courseTitle} - ${attempt.levelName}`
        : attempt.courseTitle;

const getNormalizedInstitutionName = (value?: string | null) => {
    const normalizedValue = String(value || '').trim();
    return normalizedValue || null;
};

const getEnrollmentInstitutionName = (enrollment?: Enrollment | null) =>
    getNormalizedInstitutionName(enrollment?.institutionName)
    || getNormalizedInstitutionName(enrollment?.userId?.institutionName);

const LanguageEnrollmentDetails: React.FC = () => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [levels, setLevels] = useState<string[]>(['All']);
    const [filterLevel, setFilterLevel] = useState('All');
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [pagination, setPagination] = useState<EnrollmentPagination>({
        currentPage: 1,
        totalPages: 1,
        totalEnrollments: 0,
        limit: ENROLLMENTS_PER_PAGE,
        hasPreviousPage: false,
        hasNextPage: false,
    });

    const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
    const [selectedStudentProfile, setSelectedStudentProfile] = useState<StudentProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [languageEnrollments, setLanguageEnrollments] = useState<LanguageEnrollment[]>([]);
    const [skillEnrollments, setSkillEnrollments] = useState<SkillEnrollment[]>([]);
    const [isAvatarFullScreen, setIsAvatarFullScreen] = useState(false);
    const [paymentIssueItems, setPaymentIssueItems] = useState<TrainingPaymentAttempt[]>([]);
    const [paymentIssuePagination, setPaymentIssuePagination] = useState<PaymentAttemptPagination>({
        page: 1,
        limit: TRAINING_PAYMENT_ISSUES_PAGE_SIZE,
        totalItems: 0,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
    });
    const [isPaymentIssuesOpen, setIsPaymentIssuesOpen] = useState(false);
    const [paymentIssuesLoading, setPaymentIssuesLoading] = useState(false);
    const [paymentIssuesError, setPaymentIssuesError] = useState('');
    const [paymentIssueDeletingId, setPaymentIssueDeletingId] = useState<string | null>(null);

    useEffect(() => {
        void fetchEnrollments();
    }, [pagination.currentPage, searchQuery, filterLevel]);

    useEffect(() => {
        void fetchPaymentIssues(1);
    }, []);

    useEffect(() => {
        if (!selectedEnrollment) {
            setIsAvatarFullScreen(false);
        }
    }, [selectedEnrollment]);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/admin/enrollments/pending', {
                params: {
                    page: pagination.currentPage,
                    limit: ENROLLMENTS_PER_PAGE,
                    search: searchQuery || undefined,
                    level: filterLevel !== 'All' ? filterLevel : undefined,
                },
            });

            const nextPagination = response.data.pagination || {};

            setEnrollments(response.data.enrollments || []);
            setLevels(response.data.availableLevels || ['All']);
            setPagination({
                currentPage: nextPagination.currentPage || 1,
                totalPages: nextPagination.totalPages || 1,
                totalEnrollments: nextPagination.totalEnrollments || 0,
                limit: nextPagination.limit || ENROLLMENTS_PER_PAGE,
                hasPreviousPage: !!nextPagination.hasPreviousPage,
                hasNextPage: !!nextPagination.hasNextPage,
            });
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.response?.data?.message || 'Failed to fetch enrollments');
        } finally {
            setLoading(false);
        }
    };

    const syncPaymentIssueState = (
        paymentAttempts: TrainingPaymentAttempt[],
        nextPagination?: Partial<PaymentAttemptPagination>,
        fallbackPage = 1
    ) => {
        setPaymentIssueItems(paymentAttempts);
        setPaymentIssuePagination({
            page: nextPagination?.page ?? fallbackPage,
            limit: nextPagination?.limit ?? TRAINING_PAYMENT_ISSUES_PAGE_SIZE,
            totalItems: nextPagination?.totalItems ?? paymentAttempts.length,
            totalPages: nextPagination?.totalPages ?? 1,
            hasPreviousPage: nextPagination?.hasPreviousPage ?? false,
            hasNextPage: nextPagination?.hasNextPage ?? false,
        });
    };

    const fetchPaymentIssues = async (page = 1, options?: { showLoader?: boolean }) => {
        try {
            if (options?.showLoader) {
                setPaymentIssuesLoading(true);
            }

            setPaymentIssuesError('');

            const response = await trainingCheckoutAPI.getAllPaymentAttemptsAdmin({
                page,
                limit: TRAINING_PAYMENT_ISSUES_PAGE_SIZE,
                issuesOnly: true,
            });

            syncPaymentIssueState(
                response.paymentAttempts || [],
                response.pagination,
                page
            );
        } catch (err: any) {
            console.error('Failed to fetch training payment issues:', err);
            setPaymentIssuesError(err.response?.data?.message || 'Failed to load payment issues.');
        } finally {
            if (options?.showLoader) {
                setPaymentIssuesLoading(false);
            }
        }
    };

    const refreshAfterDecision = async () => {
        if (enrollments.length === 1 && pagination.currentPage > 1) {
            setPagination((current) => ({ ...current, currentPage: current.currentPage - 1 }));
            return;
        }

        await fetchEnrollments();
    };

    const handleApprove = async (enrollment: Enrollment, event?: React.MouseEvent) => {
        event?.stopPropagation();
        if (processingId) return;
        setProcessingId(enrollment._id);

        try {
            if (enrollment.trainingType === 'skill') {
                await api.post('/enrollment/accept', { enrollmentId: enrollment._id });
            } else {
                await api.post(`/language-training/admin/enroll/${enrollment._id}/approve`);
            }

            if (selectedEnrollment?._id === enrollment._id) {
                setSelectedEnrollment(null);
                setSelectedStudentProfile(null);
            }
            await refreshAfterDecision();
        } catch (err) {
            console.error('Failed to approve enrollment', err);
            window.alert('Failed to approve enrollment.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (enrollment: Enrollment, event?: React.MouseEvent) => {
        event?.stopPropagation();
        if (processingId) return;
        if (!window.confirm('Are you sure you want to reject this enrollment?')) return;
        setProcessingId(enrollment._id);

        try {
            if (enrollment.trainingType === 'skill') {
                await api.post('/enrollment/reject', { enrollmentId: enrollment._id });
            } else {
                await api.post(`/language-training/admin/enroll/${enrollment._id}/reject`);
            }

            if (selectedEnrollment?._id === enrollment._id) {
                setSelectedEnrollment(null);
                setSelectedStudentProfile(null);
            }
            await refreshAfterDecision();
        } catch (err) {
            console.error('Failed to reject enrollment', err);
            window.alert('Failed to reject enrollment.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setPagination((current) => ({ ...current, currentPage: 1 }));
        setSearchQuery(searchInput.trim());
    };

    const handleOpenEnrollment = async (enrollment: Enrollment) => {
        setSelectedEnrollment(enrollment);
        setSelectedStudentProfile(enrollment.userId);
        setProfileLoading(true);
        setLanguageEnrollments([]);
        setSkillEnrollments([]);

        if (!enrollment.userId?._id) {
            setProfileLoading(false);
            return;
        }

        try {
            const response = await api.get(`/admin/students/${enrollment.userId._id}/details`);
            setSelectedStudentProfile(response.data.student || enrollment.userId);
            setLanguageEnrollments(response.data.languageEnrollments || []);
            setSkillEnrollments(response.data.skillEnrollments || []);
        } catch (err) {
            console.error('Failed to load student details', err);
        } finally {
            setProfileLoading(false);
        }
    };

    const closeProfile = () => {
        setSelectedEnrollment(null);
        setSelectedStudentProfile(null);
    };

    const handleOpenPaymentIssues = async () => {
        setIsPaymentIssuesOpen(true);
        await fetchPaymentIssues(1, { showLoader: true });
    };

    const handleDeletePaymentIssue = async (attempt: TrainingPaymentAttempt) => {
        if (!window.confirm('Delete this training payment issue record?')) {
            return;
        }

        try {
            setPaymentIssueDeletingId(attempt._id);
            await trainingCheckoutAPI.deletePaymentAttemptAdmin(attempt._id);

            const nextPage =
                paymentIssueItems.length === 1 && paymentIssuePagination.page > 1
                    ? paymentIssuePagination.page - 1
                    : paymentIssuePagination.page;

            await fetchPaymentIssues(nextPage, { showLoader: true });
        } catch (err: any) {
            console.error('Failed to delete training payment issue:', err);
            window.alert(err.response?.data?.message || 'Failed to delete training payment issue.');
        } finally {
            setPaymentIssueDeletingId(null);
        }
    };

    const enrollmentStart = enrollments.length === 0 ? 0 : (pagination.currentPage - 1) * pagination.limit + 1;
    const enrollmentEnd = enrollments.length === 0 ? 0 : Math.min(pagination.currentPage * pagination.limit, pagination.totalEnrollments);
    const paymentIssueCount = paymentIssuePagination.totalItems;
    const paymentIssueStart =
        paymentIssueCount === 0
            ? 0
            : (paymentIssuePagination.page - 1) * paymentIssuePagination.limit + 1;
    const paymentIssueEnd =
        paymentIssueCount === 0
            ? 0
            : Math.min(paymentIssuePagination.page * paymentIssuePagination.limit, paymentIssueCount);

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-brand-black">Verify Enrollments</h1>
                        <p className="text-brand-olive-dark mt-1">
                            Review language and skill training requests with paginated loading and full student profiles.
                        </p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-brand-surface shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-olive-light w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by student, email, phone, course..."
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-brand-surface bg-brand-off-white text-brand-black focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                        />
                    </form>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="text-brand-olive w-5 h-5" />
                        <span className="text-sm text-brand-olive-dark whitespace-nowrap">Filter by Language Level:</span>
                        <select
                            value={filterLevel}
                            onChange={(event) => {
                                setFilterLevel(event.target.value);
                                setPagination((current) => ({ ...current, currentPage: 1 }));
                            }}
                            className="flex-1 md:w-44 px-3 py-2 rounded-lg border border-brand-surface bg-brand-off-white text-brand-black focus:ring-2 focus:ring-brand-gold outline-none cursor-pointer"
                        >
                            {levels.map((level) => (
                                <option key={level} value={level}>
                                    {level}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="rounded-2xl border border-brand-surface bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-brand-black">Payment Issue Center</h2>
                            <p className="text-sm text-brand-olive-dark">
                                Review failed and cancelled training payments separately from the pending enrollment queue.
                            </p>
                        </div>
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                            <span className="inline-flex items-center rounded-full border border-brand-gold/20 bg-brand-gold/5 px-3 py-1 text-xs font-semibold text-brand-gold">
                                {paymentIssueCount} issue{paymentIssueCount === 1 ? '' : 's'}
                            </span>
                            <button
                                type="button"
                                onClick={() => void handleOpenPaymentIssues()}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-sm font-semibold text-brand-gold transition-colors hover:bg-brand-gold/20"
                            >
                                <Eye className="h-4 w-4" />
                                View Payment Issues
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-3">
                        <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/5/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                                Queue Size
                            </p>
                            <p className="mt-2 text-2xl font-bold text-brand-black">{paymentIssueCount}</p>
                            <p className="mt-2 text-sm text-brand-olive-dark">
                                Failed and cancelled attempts waiting for admin review.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-brand-surface bg-brand-off-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-olive">
                                Page Size
                            </p>
                            <p className="mt-2 text-2xl font-bold text-brand-black">{TRAINING_PAYMENT_ISSUES_PAGE_SIZE}</p>
                            <p className="mt-2 text-sm text-brand-olive-dark">
                                Each page in the modal shows a compact batch of payment issues.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-brand-surface bg-brand-off-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-olive">
                                Cleanup
                            </p>
                            <p className="mt-2 text-2xl font-bold text-brand-black">Delete</p>
                            <p className="mt-2 text-sm text-brand-olive-dark">
                                Remove stale failed or cancelled attempts without cluttering the main enrollment list.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-brand-surface bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-brand-olive-dark">
                            Showing <span className="font-semibold text-brand-black">{enrollmentStart}</span> to{' '}
                            <span className="font-semibold text-brand-black">{enrollmentEnd}</span> of{' '}
                            <span className="font-semibold text-brand-black">{pagination.totalEnrollments}</span> pending enrollments
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPagination((current) => ({ ...current, currentPage: Math.max(1, current.currentPage - 1) }))}
                                disabled={!pagination.hasPreviousPage}
                                className="inline-flex items-center gap-2 rounded-lg border border-brand-surface bg-brand-off-white px-4 py-2 text-sm font-medium text-brand-olive-dark transition-colors hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>
                            <span className="px-2 text-sm text-brand-olive-dark">
                                Page <span className="font-semibold text-brand-black">{pagination.currentPage}</span> of{' '}
                                <span className="font-semibold text-brand-black">{pagination.totalPages}</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => setPagination((current) => ({ ...current, currentPage: Math.min(current.totalPages, current.currentPage + 1) }))}
                                disabled={!pagination.hasNextPage}
                                className="inline-flex items-center gap-2 rounded-lg border border-brand-surface bg-brand-off-white px-4 py-2 text-sm font-medium text-brand-olive-dark transition-colors hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-10 w-10 animate-spin text-brand-gold" />
                    </div>
                ) : error ? (
                    <div className="bg-brand-red/5 text-brand-red p-4 rounded-lg text-center">
                        {error}
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-brand-surface">
                        <div className="bg-brand-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-brand-olive-light" />
                        </div>
                        <h3 className="text-lg font-bold text-brand-black mb-1">No Pending Requests</h3>
                        <p className="text-brand-olive">All caught up. There are no enrollment requests pending approval.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {enrollments.map((enrollment) => {
                            const institutionName = getEnrollmentInstitutionName(enrollment);

                            return (
                            <div
                                key={enrollment._id}
                                className="bg-[#0B1221] text-white rounded-xl border border-brand-olive-dark p-6 shadow-lg hover:shadow-xl transition-all relative group cursor-pointer"
                                onClick={() => void handleOpenEnrollment(enrollment)}
                            >
                                <div className="flex justify-between items-start mb-4 gap-3">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-[#1A2333] flex items-center justify-center text-brand-gold font-bold text-xl border border-brand-olive-dark overflow-hidden shrink-0">
                                            {enrollment.userId?.avatar ? (
                                                <img
                                                    src={getAssetUrl(enrollment.userId.avatar)}
                                                    alt={enrollment.userId.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                enrollment.userId?.name?.charAt(0).toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white text-lg truncate">
                                                {enrollment.userId?.name || 'Unknown User'}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-xs text-brand-olive-light truncate">
                                                <Mail className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{enrollment.userId?.email || 'No Email'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1E3A8A] text-brand-olive-light border border-brand-olive-dark">
                                            {enrollment.trainingType === 'language' ? enrollment.name : 'Skill Training'}
                                        </span>
                                        {enrollment.payment?.status && (
                                            <span className="inline-flex items-center rounded-full border border-brand-olive-dark/60 bg-brand-olive/50/10 px-3 py-1 text-xs font-semibold text-brand-olive-light">
                                                Payment {formatPaymentState(enrollment.payment.status)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="p-4 rounded-lg bg-[#111827] border border-brand-olive-dark">
                                        <p className="text-xs text-brand-olive uppercase tracking-wide font-semibold mb-1">Applying For</p>
                                        <p className="text-base font-medium text-white flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-brand-gold" />
                                            {enrollment.courseTitle}
                                        </p>
                                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-brand-olive-light">
                                            {enrollment.trainingType === 'language' ? 'Language Training' : 'Skill Training'}
                                        </p>
                                        {institutionName && (
                                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2.5 py-1 text-xs font-semibold text-[#f0d79a]">
                                                <Building2 className="h-3.5 w-3.5" />
                                                {institutionName}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="rounded-lg border border-brand-olive-dark bg-[#111827] p-3">
                                            <p className="text-xs uppercase tracking-wide text-brand-olive">Phone</p>
                                            <p className="mt-1 text-white font-medium">{enrollment.userId?.phoneNumber || 'Not provided'}</p>
                                        </div>
                                        <div className="rounded-lg border border-brand-olive-dark bg-[#111827] p-3">
                                            <p className="text-xs uppercase tracking-wide text-brand-olive">Requested</p>
                                            <p className="mt-1 text-white font-medium">
                                                {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : 'Not available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-auto">
                                    <button
                                        onClick={(event) => handleApprove(enrollment, event)}
                                        disabled={!!processingId}
                                        className={`flex-1 bg-brand-red hover:bg-brand-red-hover text-white py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg ${processingId ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {processingId === enrollment._id ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Approve
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={(event) => handleReject(enrollment, event)}
                                        disabled={!!processingId}
                                        className={`flex-1 bg-transparent border border-red-900/50 text-brand-red hover:bg-red-900/20 py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${processingId ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        <X className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>

                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye className="w-5 h-5 text-brand-olive-light hover:text-white" />
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isPaymentIssuesOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsPaymentIssuesOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
                        >
                            <div className="border-b border-brand-surface">
                                <div className="flex items-start justify-between gap-4 p-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-brand-black">Payment Issues</h2>
                                        <p className="mt-1 text-sm text-brand-olive-dark">
                                            Review failed or cancelled training checkout attempts and delete stale records when needed.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsPaymentIssuesOpen(false)}
                                        className="rounded-full p-2 text-brand-olive transition-colors hover:bg-brand-surface"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[70vh] overflow-y-auto p-6">
                                {paymentIssuesLoading ? (
                                    <div className="flex justify-center py-16">
                                        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
                                    </div>
                                ) : paymentIssuesError ? (
                                    <div className="rounded-2xl border border-brand-red/20 bg-brand-red/5 px-6 py-8 text-center text-brand-red">
                                        {paymentIssuesError}
                                    </div>
                                ) : paymentIssueItems.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-brand-surface px-4 py-12 text-center text-sm text-brand-olive">
                                        No failed or cancelled training payment attempts right now.
                                    </div>
                                ) : (
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        {paymentIssueItems.map((attempt) => {
                                            const isDeleting = paymentIssueDeletingId === attempt._id;
                                            const displayName = attempt.userId?.name || 'Unknown User';
                                            const displayEmail = attempt.userId?.email || 'Not available';
                                            const displayPhone = attempt.userId?.phoneNumber || 'Not available';

                                            return (
                                                <article
                                                    key={attempt._id}
                                                    className="rounded-2xl border border-brand-surface bg-brand-off-white p-5"
                                                >
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="text-base font-bold text-brand-black">
                                                                {displayName}
                                                            </h3>
                                                            <p className="mt-1 text-sm font-medium text-brand-olive-dark">
                                                                {formatPaymentAttemptTitle(attempt)}
                                                            </p>
                                                            <p className="mt-1 text-xs uppercase tracking-wide text-brand-olive">
                                                                {attempt.trainingType === 'language' ? 'Language Training' : 'Skill Training'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentAttemptStatusMeta(attempt.status)}`}>
                                                                {formatPaymentState(attempt.status)}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => void handleDeletePaymentIssue(attempt)}
                                                                disabled={isDeleting}
                                                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-red/20 bg-brand-red/5 px-3 py-2 text-xs font-semibold text-brand-red transition-colors hover:bg-brand-red/10 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                                                        <div>
                                                            <p className="text-brand-olive">Contact</p>
                                                            <p className="font-semibold text-brand-black">{displayEmail}</p>
                                                            <p className="text-brand-olive-dark">{displayPhone}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-brand-olive">Amount</p>
                                                            <p className="font-semibold text-brand-black">
                                                                {formatTrainingPrice(attempt.amount / 100, attempt.currency)}
                                                            </p>
                                                            <p className="text-brand-olive-dark">
                                                                {attempt.levelName || (attempt.trainingType === 'skill' ? 'Skill Training' : 'Language Training')}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-brand-olive">Transaction ID</p>
                                                            <p className="font-mono text-xs font-semibold text-brand-black">
                                                                {attempt.transactionId || 'Not created'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-brand-olive">Payment ID</p>
                                                            <p className="font-mono text-xs font-semibold text-brand-black">
                                                                {attempt.paymentId || 'Not available'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-brand-olive">Gateway Status</p>
                                                            <p className="font-semibold text-brand-black">
                                                                {formatPaymentState(attempt.paymentStatus)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-brand-olive">Payment Method</p>
                                                            <p className="font-semibold text-brand-black">
                                                                {attempt.paymentMethod || 'Not available'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 space-y-2 text-sm">
                                                        <p className="text-brand-olive">
                                                            Failure reason:{' '}
                                                            <span className="font-semibold text-brand-black">
                                                                {attempt.failureReason || attempt.paymentErrorDescription || attempt.paymentErrorReason || 'Not available'}
                                                            </span>
                                                        </p>
                                                        <p className="text-brand-olive">
                                                            Recorded:{' '}
                                                            <span className="font-semibold text-brand-black">{formatDateTime(attempt.createdAt)}</span>
                                                        </p>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-brand-surface px-6 py-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-brand-olive-dark">
                                        Showing{' '}
                                        <span className="font-semibold text-brand-black">{paymentIssueStart}</span>{' '}
                                        to{' '}
                                        <span className="font-semibold text-brand-black">{paymentIssueEnd}</span>{' '}
                                        of{' '}
                                        <span className="font-semibold text-brand-black">{paymentIssueCount}</span>{' '}
                                        issues
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => void fetchPaymentIssues(paymentIssuePagination.page - 1, { showLoader: true })}
                                            disabled={!paymentIssuePagination.hasPreviousPage || paymentIssuesLoading}
                                            className="inline-flex items-center gap-2 rounded-lg border border-brand-surface bg-brand-off-white px-4 py-2 text-sm font-medium text-brand-olive-dark transition-colors hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </button>

                                        <span className="px-3 text-sm font-medium text-brand-olive-dark">
                                            Page{' '}
                                            <span className="text-brand-black">{paymentIssuePagination.page}</span>{' '}
                                            of{' '}
                                            <span className="text-brand-black">{paymentIssuePagination.totalPages}</span>
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => void fetchPaymentIssues(paymentIssuePagination.page + 1, { showLoader: true })}
                                            disabled={!paymentIssuePagination.hasNextPage || paymentIssuesLoading}
                                            className="inline-flex items-center gap-2 rounded-lg border border-brand-surface bg-brand-off-white px-4 py-2 text-sm font-medium text-brand-olive-dark transition-colors hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedEnrollment && selectedStudentProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={closeProfile}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl"
                        >
                            <button
                                type="button"
                                onClick={closeProfile}
                                className="absolute right-4 top-4 rounded-full p-2 text-brand-olive transition-colors hover:bg-brand-surface"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <div className="p-8">
                                <div className="mb-8 flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-brand-gold text-4xl font-bold text-brand-black shadow-lg sm:h-32 sm:w-32 sm:text-5xl">
                                        {selectedStudentProfile.avatar ? (
                                            <img
                                                src={getAssetUrl(selectedStudentProfile.avatar)}
                                                alt={selectedStudentProfile.name}
                                                className="h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-80"
                                                onClick={() => setIsAvatarFullScreen(true)}
                                                title="Click to view full screen"
                                            />
                                        ) : (
                                            selectedStudentProfile.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <h2 className="text-3xl font-bold text-brand-black">{selectedStudentProfile.name}</h2>
                                        <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                                            <div className="flex items-center gap-2 rounded-lg bg-brand-gold/5 px-3 py-1.5 text-brand-red">
                                                <Mail className="h-4 w-4" />
                                                <span className="text-sm font-medium">{selectedStudentProfile.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg bg-brand-olive/5 px-3 py-1.5 text-brand-olive">
                                                <Phone className="h-4 w-4" />
                                                <span className="text-sm font-medium">{selectedStudentProfile.phoneNumber || 'Not Provided'}</span>
                                            </div>
                                            {getEnrollmentInstitutionName(selectedEnrollment) && (
                                                <div className="flex items-center gap-2 rounded-lg bg-brand-gold/15 px-3 py-1.5 text-brand-gold-hover">
                                                    <Building2 className="h-4 w-4" />
                                                    <span className="text-sm font-medium">{getEnrollmentInstitutionName(selectedEnrollment)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4">
                                        <div className="mb-2 flex items-center gap-3">
                                            <BookOpen className="h-5 w-5 text-brand-gold" />
                                            <span className="text-sm font-semibold text-brand-olive">Requested Course</span>
                                        </div>
                                        <p className="pl-8 font-bold text-brand-black">{selectedEnrollment.courseTitle}</p>
                                    </div>
                                    <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4">
                                        <div className="mb-2 flex items-center gap-3">
                                            <BookOpen className="h-5 w-5 text-brand-red" />
                                            <span className="text-sm font-semibold text-brand-olive">
                                                {selectedEnrollment.trainingType === 'language' ? 'Level' : 'Training Type'}
                                            </span>
                                        </div>
                                        <p className="pl-8 font-bold text-brand-black">
                                            {selectedEnrollment.trainingType === 'language' ? selectedEnrollment.name : 'Skill Training'}
                                        </p>
                                    </div>
                                    {(selectedEnrollment.trainingType === 'language' || getEnrollmentInstitutionName(selectedEnrollment)) && (
                                        <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4">
                                            <div className="mb-2 flex items-center gap-3">
                                                <Building2 className="h-5 w-5 text-brand-olive" />
                                                <span className="text-sm font-semibold text-brand-olive">Institution Scope</span>
                                            </div>
                                            <p className="pl-8 font-bold text-brand-black">
                                                {getEnrollmentInstitutionName(selectedEnrollment) || 'General Pool'}
                                            </p>
                                        </div>
                                    )}
                                    <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4">
                                        <div className="mb-2 flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-brand-olive" />
                                            <span className="text-sm font-semibold text-brand-olive">Date of Birth</span>
                                        </div>
                                        <p className="pl-8 font-bold text-brand-black">
                                            {selectedStudentProfile.dateOfBirth ? new Date(selectedStudentProfile.dateOfBirth).toLocaleDateString() : 'Not Provided'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4">
                                        <div className="mb-2 flex items-center gap-3">
                                            <GraduationCap className="h-5 w-5 text-brand-gold" />
                                            <span className="text-sm font-semibold text-brand-olive">Qualification</span>
                                        </div>
                                        <p className="pl-8 font-bold text-brand-black">{selectedStudentProfile.qualification || 'Not Provided'}</p>
                                    </div>
                                    <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4">
                                        <div className="mb-2 flex items-center gap-3">
                                            <BookOpen className="h-5 w-5 text-brand-gold" />
                                            <span className="text-sm font-semibold text-brand-olive">German Level</span>
                                        </div>
                                        <p className="pl-8 font-bold text-brand-black">{selectedStudentProfile.germanLevel || 'Not Provided'}</p>
                                    </div>
                                    <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4">
                                        <div className="mb-2 flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-brand-gold" />
                                            <span className="text-sm font-semibold text-brand-olive">Requested On</span>
                                        </div>
                                        <p className="pl-8 font-bold text-brand-black">
                                            {selectedEnrollment.createdAt ? new Date(selectedEnrollment.createdAt).toLocaleDateString() : 'Not Provided'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4 sm:col-span-2">
                                        <div className="mb-3 flex items-center gap-3">
                                            <UserIcon className="h-5 w-5 text-brand-red" />
                                            <span className="text-sm font-semibold text-brand-olive">Guardian Details</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 pl-8 sm:grid-cols-2">
                                            <div>
                                                <p className="mb-1 text-xs text-brand-olive">Name</p>
                                                <p className="font-bold text-brand-black">{selectedStudentProfile.guardianName || 'Not Provided'}</p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-brand-olive">Phone</p>
                                                <p className="font-bold text-brand-black">{selectedStudentProfile.guardianPhone || 'Not Provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4 sm:col-span-2">
                                        <div className="mb-3 flex items-center gap-3">
                                            <CreditCard className="h-5 w-5 text-brand-olive" />
                                            <span className="text-sm font-semibold text-brand-olive">Payment Details</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 pl-8 sm:grid-cols-2">
                                            <div>
                                                <p className="mb-1 text-xs text-brand-olive">Amount</p>
                                                <p className="font-bold text-brand-black">
                                                    {selectedEnrollment.payment?.amount !== null && selectedEnrollment.payment?.amount !== undefined
                                                        ? formatTrainingPrice(selectedEnrollment.payment.amount, selectedEnrollment.payment.currency || 'INR')
                                                        : 'Not available'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-brand-olive">Gateway Status</p>
                                                <p className="font-bold text-brand-black">
                                                    {formatPaymentState(selectedEnrollment.payment?.status)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-brand-olive">Method</p>
                                                <p className="font-bold text-brand-black">{selectedEnrollment.payment?.method || 'Not available'}</p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-brand-olive">Gateway</p>
                                                <p className="font-bold text-brand-black">{selectedEnrollment.payment?.gateway || 'Not available'}</p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-brand-olive">Paid At</p>
                                                <p className="font-bold text-brand-black">{formatDateTime(selectedEnrollment.payment?.paidAt)}</p>
                                            </div>
                                            <div>
                                                <p className="mb-1 flex items-center gap-1 text-xs text-brand-olive">
                                                    <Hash className="h-3.5 w-3.5" />
                                                    Transaction ID
                                                </p>
                                                <p className="font-mono text-xs font-bold text-brand-black">
                                                    {selectedEnrollment.payment?.transactionId || 'Not available'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 flex items-center gap-1 text-xs text-brand-olive">
                                                    <Hash className="h-3.5 w-3.5" />
                                                    Payment ID
                                                </p>
                                                <p className="font-mono text-xs font-bold text-brand-black">
                                                    {selectedEnrollment.payment?.paymentId || 'Not available'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-brand-black">
                                        <BookOpen className="h-5 w-5 text-brand-gold" />
                                        Enrolled Courses
                                    </h3>

                                    {profileLoading ? (
                                        <div className="py-8 text-center">
                                            <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-brand-gold" />
                                            <p className="text-sm text-brand-olive">Loading profile details...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {languageEnrollments.length > 0 && (
                                                <div>
                                                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-olive">Language Trainings</h4>
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {languageEnrollments.map((enrollment) => (
                                                            <div key={enrollment._id} className="rounded-lg border border-brand-surface bg-white p-3">
                                                                <div className="mb-1 font-bold text-brand-black">{enrollment.courseTitle}</div>
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-brand-olive-dark">{enrollment.name}</span>
                                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                        getEnrollmentStatusClasses(enrollment.status)
                                                                    }`}>
                                                                        {formatEnrollmentStatus(enrollment.status)}
                                                                    </span>
                                                                </div>
                                                                {enrollment.batchId && (
                                                                    <div className="mt-2 text-xs font-medium text-brand-red">
                                                                        Assigned Batch: Class - {enrollment.batchId.name}
                                                                        {getNormalizedInstitutionName(enrollment.batchId.institutionName)
                                                                            ? ` (${enrollment.batchId.institutionName})`
                                                                            : ''}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {skillEnrollments.length > 0 && (
                                                <div className={languageEnrollments.length > 0 ? 'mt-6' : ''}>
                                                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-olive">Skill Trainings</h4>
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {skillEnrollments.map((enrollment) => (
                                                            <div key={enrollment._id} className="rounded-lg border border-brand-surface bg-white p-3">
                                                                <div className="mb-1 font-bold text-brand-black">
                                                                    {enrollment.skillCourseId?.title || 'Unknown Course'}
                                                                </div>
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-brand-olive-dark">Skill Development</span>
                                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                        getEnrollmentStatusClasses(enrollment.status)
                                                                    }`}>
                                                                        {formatEnrollmentStatus(enrollment.status)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {languageEnrollments.length === 0 && skillEnrollments.length === 0 && (
                                                <div className="rounded-xl border border-dashed border-brand-surface bg-brand-off-white py-6 text-center">
                                                    <p className="text-brand-olive">No course enrollments found.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        onClick={() => handleApprove(selectedEnrollment)}
                                        disabled={!!processingId}
                                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-red px-6 py-3 font-bold text-white transition-colors hover:bg-brand-red-hover ${processingId ? 'cursor-not-allowed opacity-70' : ''}`}
                                    >
                                        {processingId === selectedEnrollment._id ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Approve Enrollment
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedEnrollment)}
                                        disabled={!!processingId}
                                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-red/30 bg-brand-red/5 px-6 py-3 font-bold text-brand-red transition-colors hover:bg-brand-red/10 ${processingId ? 'cursor-not-allowed opacity-70' : ''}`}
                                    >
                                        <X className="w-4 h-4" />
                                        Reject Enrollment
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {isAvatarFullScreen && selectedStudentProfile?.avatar && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm" onClick={() => setIsAvatarFullScreen(false)}>
                    <button type="button" className="absolute right-4 top-4 p-2 text-white transition-colors hover:text-brand-olive-light" onClick={() => setIsAvatarFullScreen(false)}>
                        <X className="h-8 w-8" />
                    </button>
                    <img
                        src={getAssetUrl(selectedStudentProfile.avatar)}
                        alt="Full Screen Avatar"
                        className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            )}
        </AdminLayout>
    );
};

export default LanguageEnrollmentDetails;
