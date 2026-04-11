import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Briefcase,
    Building,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    FileText,
    GraduationCap,
    Hash,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Search,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAssetUrl, internshipApplicationAPI } from '../../lib/api';
import { formatPaymentState } from '../../lib/paymentFormatting';
import { formatInternshipMode, formatInternshipPrice } from '../../types/internship';

type InternshipApplicationStatus = 'submitted' | 'accepted' | 'rejected' | 'reviewed' | 'shortlisted';
type DisplayStatus = 'submitted' | 'accepted' | 'rejected';

interface InternshipApplicantUser {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    role: string;
    avatar?: string;
}

interface InternshipApplication {
    _id: string;
    userId?: InternshipApplicantUser;
    paymentAttemptId?: string;
    accountName: string;
    accountEmail: string;
    accountPhoneNumber?: string;
    internshipTitle: string;
    internshipPrice?: number;
    internshipMode?: string;
    paymentGateway?: string;
    paymentStatus?: string;
    paymentAmount?: number;
    paymentCurrency?: string;
    paymentMethod?: string;
    transactionId?: string;
    paymentId?: string;
    bankReferenceNumber?: string;
    paidAt?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    whatsapp: string;
    college: string;
    registration: string;
    department: string;
    semester: string;
    passingYear: string;
    address: string;
    source: string;
    resumeUrl: string;
    resumeOriginalName: string;
    status: InternshipApplicationStatus;
    referenceCode: string;
    createdAt: string;
    updatedAt: string;
}

interface LinkedInternshipApplication {
    _id: string;
    referenceCode: string;
    status: InternshipApplicationStatus;
    createdAt: string;
}

interface InternshipPaymentAttempt {
    _id: string;
    userId?: InternshipApplicantUser;
    applicationId?: LinkedInternshipApplication;
    internshipTitle: string;
    internshipPrice: number;
    internshipMode?: string;
    amount: number;
    currency: string;
    firstName: string;
    lastName: string;
    email: string;
    whatsapp: string;
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

const normalizeStatus = (status: InternshipApplicationStatus): DisplayStatus => {
    if (status === 'accepted') return 'accepted';
    if (status === 'rejected') return 'rejected';
    return 'submitted';
};

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const getStatusMeta = (status: DisplayStatus) => {
    if (status === 'accepted') {
        return {
            label: 'Accepted',
            badgeClass: 'bg-brand-olive/10 text-brand-olive-dark border-brand-olive/20',
            actionClass: 'bg-brand-olive/5 text-brand-olive-dark border-brand-olive/20',
        };
    }

    if (status === 'rejected') {
        return {
            label: 'Rejected',
            badgeClass: 'bg-brand-red/10 text-brand-red border-brand-red/20',
            actionClass: 'bg-brand-red/5 text-brand-red border-brand-red/20',
        };
    }

    return {
        label: 'Pending Review',
        badgeClass: 'bg-brand-gold/15 text-brand-gold border-brand-gold/30',
        actionClass: 'bg-brand-gold/10 text-brand-gold border-brand-gold/25',
    };
};

const getPaymentAttemptStatusMeta = (status: InternshipPaymentAttempt['status']) => {
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

const AdminInternshipApplications: React.FC = () => {
    const APPLICATIONS_PER_PAGE = 10;
    const PAYMENT_ISSUES_PAGE_SIZE = 6;
    const [applications, setApplications] = useState<InternshipApplication[]>([]);
    const [paymentIssueItems, setPaymentIssueItems] = useState<InternshipPaymentAttempt[]>([]);
    const [paymentIssuePagination, setPaymentIssuePagination] = useState<PaymentAttemptPagination>({
        page: 1,
        limit: PAYMENT_ISSUES_PAGE_SIZE,
        totalItems: 0,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
    });
    const [selectedApplication, setSelectedApplication] = useState<InternshipApplication | null>(null);
    const [isAvatarFullScreen, setIsAvatarFullScreen] = useState(false);
    const [isPaymentIssuesOpen, setIsPaymentIssuesOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [paymentIssuesLoading, setPaymentIssuesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentIssuesError, setPaymentIssuesError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [paymentIssueDeletingId, setPaymentIssueDeletingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | DisplayStatus>('submitted');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const syncPaymentIssueState = (
        paymentAttempts: InternshipPaymentAttempt[],
        pagination?: Partial<PaymentAttemptPagination>,
        fallbackPage = 1
    ) => {
        setPaymentIssueItems(paymentAttempts);
        setPaymentIssuePagination({
            page: pagination?.page ?? fallbackPage,
            limit: pagination?.limit ?? PAYMENT_ISSUES_PAGE_SIZE,
            totalItems: pagination?.totalItems ?? paymentAttempts.length,
            totalPages: pagination?.totalPages ?? 1,
            hasPreviousPage: pagination?.hasPreviousPage ?? false,
            hasNextPage: pagination?.hasNextPage ?? false,
        });
    };

    const fetchPaymentIssues = async (page = 1, options?: { showLoader?: boolean }) => {
        try {
            if (options?.showLoader) {
                setPaymentIssuesLoading(true);
            }

            setPaymentIssuesError(null);

            const paymentAttemptResponse = await internshipApplicationAPI.getAllPaymentAttemptsAdmin({
                page,
                limit: PAYMENT_ISSUES_PAGE_SIZE,
                issuesOnly: true,
            });

            syncPaymentIssueState(
                paymentAttemptResponse.paymentAttempts || [],
                paymentAttemptResponse.pagination,
                page
            );
        } catch (err: any) {
            console.error('Failed to fetch internship payment issues:', err);
            setPaymentIssuesError(err.response?.data?.message || 'Failed to load payment issues.');
        } finally {
            if (options?.showLoader) {
                setPaymentIssuesLoading(false);
            }
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            const [applicationResponse, paymentAttemptResponse] = await Promise.all([
                internshipApplicationAPI.getAllAdmin(),
                internshipApplicationAPI.getAllPaymentAttemptsAdmin({
                    page: 1,
                    limit: PAYMENT_ISSUES_PAGE_SIZE,
                    issuesOnly: true,
                }),
            ]);
            setApplications(applicationResponse.applications || []);
            syncPaymentIssueState(
                paymentAttemptResponse.paymentAttempts || [],
                paymentAttemptResponse.pagination
            );
        } catch (err: any) {
            console.error('Failed to fetch internship applications:', err);
            setError(err.response?.data?.message || 'Failed to load internship applications.');
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (application: InternshipApplication, nextStatus: 'accepted' | 'rejected') => {
        const normalizedStatus = normalizeStatus(application.status);
        const confirmationText =
            nextStatus === 'accepted'
                ? 'Accept this internship application?'
                : normalizedStatus === 'accepted'
                    ? 'Mark this accepted internship application as rejected?'
                    : 'Reject this internship application?';

        if (!window.confirm(confirmationText)) {
            return;
        }

        try {
            setProcessingId(application._id);
            const response = await internshipApplicationAPI.updateStatus(application._id, nextStatus);
            const updatedApplication = response.application as InternshipApplication;

            setApplications((currentApplications) =>
                currentApplications.map((currentApplication) =>
                    currentApplication._id === updatedApplication._id ? updatedApplication : currentApplication
                )
            );

            setSelectedApplication((currentSelectedApplication) =>
                currentSelectedApplication?._id === updatedApplication._id ? updatedApplication : currentSelectedApplication
            );
        } catch (err: any) {
            console.error(`Failed to ${nextStatus} internship application:`, err);
            window.alert(err.response?.data?.message || 'Failed to update internship application status.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteRejectedApplication = async (application: InternshipApplication) => {
        if (normalizeStatus(application.status) !== 'rejected') {
            window.alert('Only rejected internship applications can be deleted.');
            return;
        }

        if (!window.confirm('Delete this rejected internship application? The uploaded resume will also be deleted.')) {
            return;
        }

        try {
            setProcessingId(application._id);
            await internshipApplicationAPI.deleteRejected(application._id);

            setApplications((currentApplications) =>
                currentApplications.filter((currentApplication) => currentApplication._id !== application._id)
            );

            setSelectedApplication((currentSelectedApplication) =>
                currentSelectedApplication?._id === application._id ? null : currentSelectedApplication
            );
        } catch (err: any) {
            console.error('Failed to delete rejected internship application:', err);
            window.alert(err.response?.data?.message || 'Failed to delete internship application.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleOpenPaymentIssues = async () => {
        setIsPaymentIssuesOpen(true);
        await fetchPaymentIssues(1, { showLoader: true });
    };

    const handleDeletePaymentIssue = async (attempt: InternshipPaymentAttempt) => {
        if (!window.confirm('Delete this payment issue record? If no application was created, its uploaded resume will also be deleted.')) {
            return;
        }

        try {
            setPaymentIssueDeletingId(attempt._id);
            await internshipApplicationAPI.deletePaymentAttemptAdmin(attempt._id);

            const nextPage =
                paymentIssueItems.length === 1 && paymentIssuePagination.page > 1
                    ? paymentIssuePagination.page - 1
                    : paymentIssuePagination.page;

            await fetchPaymentIssues(nextPage, { showLoader: true });
        } catch (err: any) {
            console.error('Failed to delete internship payment issue:', err);
            window.alert(err.response?.data?.message || 'Failed to delete payment issue.');
        } finally {
            setPaymentIssueDeletingId(null);
        }
    };

    const filteredApplications = [...applications]
        .filter((application) => {
            const normalizedStatus = normalizeStatus(application.status);
            const matchesFilter = statusFilter === 'all' || normalizedStatus === statusFilter;
            const combinedSearch = [
                application.firstName,
                application.lastName,
                application.email,
                application.whatsapp,
                application.internshipTitle,
                application.internshipMode,
                application.paymentStatus,
                application.paymentId,
                application.transactionId,
                application.college,
                application.referenceCode,
            ]
                .join(' ')
                .toLowerCase();

            return matchesFilter && combinedSearch.includes(searchTerm.toLowerCase().trim());
        })
        .sort((left, right) => {
            const statusPriority: Record<DisplayStatus, number> = {
                submitted: 0,
                accepted: 1,
                rejected: 2,
            };

            const statusDifference =
                statusPriority[normalizeStatus(left.status)] - statusPriority[normalizeStatus(right.status)];

            if (statusDifference !== 0) {
                return statusDifference;
            }

            return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        });

    const statusCounts = {
        submitted: applications.filter((application) => normalizeStatus(application.status) === 'submitted').length,
        accepted: applications.filter((application) => normalizeStatus(application.status) === 'accepted').length,
        rejected: applications.filter((application) => normalizeStatus(application.status) === 'rejected').length,
    };
    const paymentIssueCount = paymentIssuePagination.totalItems;
    const paymentIssueStart =
        paymentIssueCount === 0
            ? 0
            : (paymentIssuePagination.page - 1) * paymentIssuePagination.limit + 1;
    const paymentIssueEnd =
        paymentIssueCount === 0
            ? 0
            : Math.min(
                paymentIssuePagination.page * paymentIssuePagination.limit,
                paymentIssueCount
            );

    const totalPages = Math.max(1, Math.ceil(filteredApplications.length / APPLICATIONS_PER_PAGE));
    const paginatedApplications = filteredApplications.slice(
        (currentPage - 1) * APPLICATIONS_PER_PAGE,
        currentPage * APPLICATIONS_PER_PAGE
    );

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (!selectedApplication) {
            setIsAvatarFullScreen(false);
        }
    }, [selectedApplication]);

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link
                            to="/admin-dashboard"
                            className="inline-flex items-center text-sm text-brand-olive hover:text-brand-gold mb-2 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-serif font-bold text-brand-black flex items-center gap-3">
                            Internship Hub Requests
                            <span className="bg-brand-gold text-brand-black text-sm font-bold px-3 py-1 rounded-full">
                                {statusCounts.submitted} Pending
                            </span>
                        </h1>
                        <p className="text-brand-olive-dark mt-1">
                            Review and manage internship applications submitted through the internship hub.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-5">
                        <p className="text-sm font-medium text-brand-olive-dark">Pending Review</p>
                        <p className="mt-2 text-3xl font-bold text-brand-black">{statusCounts.submitted}</p>
                    </div>
                    <div className="rounded-2xl border border-brand-olive/20 bg-brand-olive/5 p-5">
                        <p className="text-sm font-medium text-brand-olive-dark">Accepted</p>
                        <p className="mt-2 text-3xl font-bold text-brand-black">{statusCounts.accepted}</p>
                    </div>
                    <div className="rounded-2xl border border-brand-red/20 bg-brand-red/5 p-5">
                        <p className="text-sm font-medium text-brand-red">Rejected</p>
                        <p className="mt-2 text-3xl font-bold text-brand-black">{statusCounts.rejected}</p>
                    </div>
                    <div className="rounded-2xl border border-brand-surface bg-white p-5">
                        <p className="text-sm font-medium text-brand-olive-dark">Total Applications</p>
                        <p className="mt-2 text-3xl font-bold text-brand-black">{applications.length}</p>
                    </div>
                    <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/5 p-5">
                        <p className="text-sm font-medium text-brand-gold">Payment Issues</p>
                        <p className="mt-2 text-3xl font-bold text-brand-black">{paymentIssueCount}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-brand-surface shadow-sm flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-olive-light w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, internship, mode, college, or reference..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-surface bg-brand-off-white text-brand-black focus:ring-2 focus:ring-brand-gold focus:border-brand-red outline-none"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: 'Pending', value: 'submitted' },
                            { label: 'Accepted', value: 'accepted' },
                            { label: 'Rejected', value: 'rejected' },
                            { label: 'All', value: 'all' },
                        ].map((filterOption) => (
                            <button
                                key={filterOption.value}
                                onClick={() => setStatusFilter(filterOption.value as 'all' | DisplayStatus)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    statusFilter === filterOption.value
                                        ? 'bg-brand-gold text-brand-black'
                                        : 'bg-brand-surface text-brand-olive-dark hover:bg-brand-surface'
                                }`}
                            >
                                {filterOption.label}
                            </button>
                        ))}
                    </div>
                </div>

                {!loading && !error && (
                    <div className="rounded-2xl border border-brand-surface bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-brand-black">Payment Issue Center</h2>
                                <p className="text-sm text-brand-olive-dark">
                                    Keep failed and cancelled payment attempts out of the main list. Open the dedicated view to review, paginate, and delete issue records.
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
                                <p className="mt-2 text-2xl font-bold text-brand-black">{PAYMENT_ISSUES_PAGE_SIZE}</p>
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
                                    Remove old failed or cancelled attempts without cluttering the main application feed.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-brand-red/20 bg-brand-red/5 px-6 py-8 text-center text-brand-red">
                        {error}
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-brand-surface">
                        <div className="bg-brand-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-brand-olive-light" />
                        </div>
                        <h3 className="text-lg font-bold text-brand-black mb-2">No internship requests found</h3>
                        <p className="text-brand-olive">Try adjusting the search or status filter.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paginatedApplications.map((application) => {
                            const normalizedStatus = normalizeStatus(application.status);
                            const statusMeta = getStatusMeta(normalizedStatus);
                            const isPending = normalizedStatus === 'submitted';
                            const isAccepted = normalizedStatus === 'accepted';
                            const isRejected = normalizedStatus === 'rejected';
                            const isProcessing = processingId === application._id;

                            return (
                                <div
                                    key={application._id}
                                    className="bg-white rounded-2xl p-6 border border-brand-surface shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-xl font-bold text-brand-black">
                                                    {application.firstName} {application.lastName}
                                                </h3>
                                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}>
                                                    {statusMeta.label}
                                                </span>
                                                <span className="inline-flex items-center rounded-full border border-brand-surface bg-brand-gold/5 px-3 py-1 text-xs font-semibold text-brand-olive-dark">
                                                    {application.internshipTitle}
                                                </span>
                                                <span className="inline-flex items-center rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1 text-xs font-semibold text-brand-gold-hover">
                                                    {formatInternshipMode(application.internshipMode)}
                                                </span>
                                                {application.paymentStatus && (
                                                    <span className="inline-flex items-center rounded-full border border-brand-olive/20 bg-brand-olive/5 px-3 py-1 text-xs font-semibold text-brand-olive-dark">
                                                        Payment {formatPaymentState(application.paymentStatus)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-sm text-brand-olive">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Mail className="w-4 h-4" />
                                                    {application.email}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Phone className="w-4 h-4" />
                                                    {application.whatsapp}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(application.createdAt)}
                                                </span>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                                                <div className="rounded-xl border border-brand-surface bg-brand-off-white p-3">
                                                    <p className="text-xs uppercase tracking-wide text-brand-olive">Reference</p>
                                                    <p className="mt-1 font-semibold text-brand-black">{application.referenceCode}</p>
                                                </div>
                                                <div className="rounded-xl border border-brand-surface bg-brand-off-white p-3">
                                                    <p className="text-xs uppercase tracking-wide text-brand-olive">Fee Paid</p>
                                                    <p className="mt-1 font-semibold text-brand-black">
                                                        {formatInternshipPrice(application.paymentAmount ?? application.internshipPrice, application.paymentCurrency || 'INR')}
                                                    </p>
                                                </div>
                                                <div className="rounded-xl border border-brand-surface bg-brand-off-white p-3">
                                                    <p className="text-xs uppercase tracking-wide text-brand-olive">Payment</p>
                                                    <p className="mt-1 font-semibold text-brand-black">{formatPaymentState(application.paymentStatus)}</p>
                                                </div>
                                                <div className="rounded-xl border border-brand-surface bg-brand-off-white p-3">
                                                    <p className="text-xs uppercase tracking-wide text-brand-olive">Payment ID</p>
                                                    <p className="mt-1 font-mono text-xs font-semibold text-brand-black">{application.paymentId || 'Not available'}</p>
                                                </div>
                                                <div className="rounded-xl border border-brand-surface bg-brand-off-white p-3">
                                                    <p className="text-xs uppercase tracking-wide text-brand-olive">College</p>
                                                    <p className="mt-1 font-semibold text-brand-black">{application.college}</p>
                                                </div>
                                                <div className="rounded-xl border border-brand-surface bg-brand-off-white p-3">
                                                    <p className="text-xs uppercase tracking-wide text-brand-olive">Department</p>
                                                    <p className="mt-1 font-semibold text-brand-black">{application.department}</p>
                                                </div>
                                                <div className="rounded-xl border border-brand-surface bg-brand-off-white p-3">
                                                    <p className="text-xs uppercase tracking-wide text-brand-olive">Semester</p>
                                                    <p className="mt-1 font-semibold text-brand-black">{application.semester}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row xl:flex-col gap-2 shrink-0">
                                            <button
                                                onClick={() => setSelectedApplication(application)}
                                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-sm font-medium text-brand-gold hover:bg-brand-gold/20 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>

                                            <a
                                                href={getAssetUrl(application.resumeUrl)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-surface bg-brand-gold/5 px-4 py-2 text-sm font-medium text-brand-olive-dark hover:bg-brand-gold/10 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                Resume
                                            </a>

                                            {isRejected ? (
                                                <button
                                                    onClick={() => handleDeleteRejectedApplication(application)}
                                                    disabled={isProcessing}
                                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-red/20 bg-brand-red/5 px-4 py-2 text-sm font-medium text-brand-red hover:bg-brand-red/10 transition-colors disabled:opacity-60"
                                                >
                                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    Delete
                                                </button>
                                            ) : (
                                                <>
                                                    {isPending && (
                                                        <button
                                                            onClick={() => handleDecision(application, 'accepted')}
                                                            disabled={isProcessing}
                                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-olive/20 bg-brand-olive/5 px-4 py-2 text-sm font-medium text-brand-olive-dark hover:bg-brand-olive/10 transition-colors disabled:opacity-60"
                                                        >
                                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                                            Accept
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDecision(application, 'rejected')}
                                                        disabled={isProcessing}
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-red/20 bg-brand-red/5 px-4 py-2 text-sm font-medium text-brand-red hover:bg-brand-red/10 transition-colors disabled:opacity-60"
                                                    >
                                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                                        {isAccepted ? 'Mark Rejected' : 'Reject'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="flex flex-col gap-4 rounded-2xl border border-brand-surface bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-brand-olive-dark">
                                Showing{' '}
                                <span className="font-semibold text-brand-black">
                                    {Math.min((currentPage - 1) * APPLICATIONS_PER_PAGE + 1, filteredApplications.length)}
                                </span>{' '}
                                to{' '}
                                <span className="font-semibold text-brand-black">
                                    {Math.min(currentPage * APPLICATIONS_PER_PAGE, filteredApplications.length)}
                                </span>{' '}
                                of{' '}
                                <span className="font-semibold text-brand-black">{filteredApplications.length}</span>{' '}
                                applications
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center gap-2 rounded-lg border border-brand-surface bg-brand-off-white px-4 py-2 text-sm font-medium text-brand-olive-dark transition-colors hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </button>

                                <span className="px-3 text-sm font-medium text-brand-olive-dark">
                                    Page <span className="text-brand-black">{currentPage}</span> of{' '}
                                    <span className="text-brand-black">{totalPages}</span>
                                </span>

                                <button
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center gap-2 rounded-lg border border-brand-surface bg-brand-off-white px-4 py-2 text-sm font-medium text-brand-olive-dark transition-colors hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
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
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => {
                                setIsPaymentIssuesOpen(false);
                                setPaymentIssuesError(null);
                            }}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.98 }}
                            className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-brand-surface bg-white shadow-2xl"
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setIsPaymentIssuesOpen(false);
                                    setPaymentIssuesError(null);
                                }}
                                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-surface text-brand-olive transition-colors hover:bg-brand-surface"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="border-b border-brand-surface px-6 py-5">
                                <div className="pr-12">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-brand-black">Payment Issues</h2>
                                            <p className="mt-1 text-sm text-brand-olive-dark">
                                                Review failed or cancelled checkout attempts and delete stale records when needed.
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center rounded-full border border-brand-gold/20 bg-brand-gold/5 px-3 py-1 text-xs font-semibold text-brand-gold">
                                            {paymentIssueCount} total
                                        </span>
                                    </div>
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
                                        No failed or cancelled payment attempts right now.
                                    </div>
                                ) : (
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        {paymentIssueItems.map((attempt) => {
                                            const isDeleting = paymentIssueDeletingId === attempt._id;

                                            return (
                                                <article
                                                    key={attempt._id}
                                                    className="rounded-2xl border border-brand-surface bg-brand-off-white p-5"
                                                >
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="text-base font-bold text-brand-black">
                                                                {attempt.firstName} {attempt.lastName}
                                                            </h3>
                                                            <p className="mt-1 text-sm font-medium text-brand-olive-dark">
                                                                {attempt.internshipTitle}
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
                                                            <p className="font-semibold text-brand-black">{attempt.email}</p>
                                                            <p className="text-brand-olive-dark">{attempt.whatsapp}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-brand-olive">Amount</p>
                                                            <p className="font-semibold text-brand-black">
                                                                {formatInternshipPrice(attempt.amount / 100, attempt.currency)}
                                                            </p>
                                                            <p className="text-brand-olive-dark">
                                                                {formatInternshipMode(attempt.internshipMode)}
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
                                                            <span className="font-semibold text-brand-black">{formatDate(attempt.createdAt)}</span>
                                                        </p>
                                                        {attempt.applicationId && (
                                                            <p className="text-brand-olive">
                                                                Linked application:{' '}
                                                                <span className="font-semibold text-brand-black">
                                                                    {attempt.applicationId.referenceCode}
                                                                </span>
                                                            </p>
                                                        )}
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
                {selectedApplication && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedApplication(null)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.98 }}
                            className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-brand-surface bg-white shadow-2xl"
                        >
                            <button
                                onClick={() => setSelectedApplication(null)}
                                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-surface text-brand-olive transition-colors hover:bg-brand-surface"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8 space-y-8">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        {selectedApplication.userId?.avatar ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsAvatarFullScreen(true)}
                                                className="flex h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-brand-gold/40 bg-brand-gold/10 transition-transform hover:scale-[1.03]"
                                                title="Click to view profile photo"
                                            >
                                                <img
                                                    src={getAssetUrl(selectedApplication.userId.avatar)}
                                                    alt={`${selectedApplication.firstName} ${selectedApplication.lastName}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </button>
                                        ) : (
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-gold text-2xl font-bold text-brand-black">
                                                {selectedApplication.firstName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="text-3xl font-bold text-brand-black">
                                                    {selectedApplication.firstName} {selectedApplication.lastName}
                                                </h2>
                                                <span
                                                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                                                        getStatusMeta(normalizeStatus(selectedApplication.status)).badgeClass
                                                    }`}
                                                >
                                                    {getStatusMeta(normalizeStatus(selectedApplication.status)).label}
                                                </span>
                                            </div>
                                            <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-brand-surface bg-brand-gold/5 px-3 py-1 text-sm font-medium text-brand-olive-dark">
                                                <Briefcase className="w-4 h-4" />
                                                {selectedApplication.internshipTitle}
                                            </p>
                                            <p className="mt-3 inline-flex items-center rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1 text-sm font-medium text-brand-gold-hover">
                                                Mode: {formatInternshipMode(selectedApplication.internshipMode)}
                                            </p>
                                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-brand-olive">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4" />
                                                    Applied {formatDate(selectedApplication.createdAt)}
                                                </span>
                                                {selectedApplication.paidAt && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <FileText className="w-4 h-4" />
                                                        Paid {formatDate(selectedApplication.paidAt)}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Hash className="w-4 h-4" />
                                                    {selectedApplication.referenceCode}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <a
                                        href={getAssetUrl(selectedApplication.resumeUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-3 text-sm font-semibold text-brand-gold hover:bg-brand-gold/20 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Open Resume
                                    </a>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl border border-brand-surface bg-brand-off-white p-5">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-brand-black">
                                            <User className="w-5 h-5 text-brand-gold" />
                                            Contact Details
                                        </h3>
                                        <div className="mt-4 space-y-3 text-sm">
                                            <div>
                                                <p className="text-brand-olive">Application Email</p>
                                                <p className="font-semibold text-brand-black">{selectedApplication.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">WhatsApp / Phone</p>
                                                <p className="font-semibold text-brand-black">{selectedApplication.whatsapp}</p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">Account Snapshot</p>
                                                <p className="font-semibold text-brand-black">{selectedApplication.accountName}</p>
                                                <p className="text-brand-olive-dark">{selectedApplication.accountEmail}</p>
                                                {selectedApplication.accountPhoneNumber && (
                                                    <p className="text-brand-olive-dark">{selectedApplication.accountPhoneNumber}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-brand-surface bg-brand-off-white p-5">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-brand-black">
                                            <GraduationCap className="w-5 h-5 text-brand-gold" />
                                            Academic Details
                                        </h3>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                                            <div>
                                                <p className="text-brand-olive">College</p>
                                                <p className="font-semibold text-brand-black">{selectedApplication.college}</p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">Registration No.</p>
                                                <p className="font-semibold text-brand-black">{selectedApplication.registration}</p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">Department</p>
                                                <p className="font-semibold text-brand-black">{selectedApplication.department}</p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">Internship Mode</p>
                                                <p className="font-semibold text-brand-black">{formatInternshipMode(selectedApplication.internshipMode)}</p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">Semester</p>
                                                <p className="font-semibold text-brand-black">{selectedApplication.semester}</p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">Passing Year</p>
                                                <p className="font-semibold text-brand-black">{selectedApplication.passingYear}</p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">Source</p>
                                                <p className="font-semibold text-brand-black">{selectedApplication.source}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-brand-surface bg-brand-off-white p-5">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-brand-black">
                                            <Calendar className="w-5 h-5 text-brand-gold" />
                                            Personal Details
                                        </h3>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                                            <div>
                                                <p className="text-brand-olive">Date of Birth</p>
                                                <p className="font-semibold text-brand-black">
                                                    {new Date(selectedApplication.dateOfBirth).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">Resume File</p>
                                                <p className="font-semibold text-brand-black">{selectedApplication.resumeOriginalName}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="text-brand-olive">Address</p>
                                                <p className="font-semibold text-brand-black">{selectedApplication.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-brand-surface bg-brand-off-white p-5">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-brand-black">
                                            <Hash className="w-5 h-5 text-brand-gold" />
                                            Payment Details
                                        </h3>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                                            <div>
                                                <p className="text-brand-olive">Amount</p>
                                                <p className="font-semibold text-brand-black">
                                                    {formatInternshipPrice(selectedApplication.paymentAmount ?? selectedApplication.internshipPrice, selectedApplication.paymentCurrency || 'INR')}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">Gateway Status</p>
                                                <p className="font-semibold text-brand-black">{formatPaymentState(selectedApplication.paymentStatus)}</p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">Method</p>
                                                <p className="font-semibold text-brand-black">{selectedApplication.paymentMethod || 'Not available'}</p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">Paid At</p>
                                                <p className="font-semibold text-brand-black">
                                                    {selectedApplication.paidAt ? formatDate(selectedApplication.paidAt) : 'Not available'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">Transaction ID</p>
                                                <p className="font-mono text-xs font-semibold text-brand-black">
                                                    {selectedApplication.transactionId || 'Not available'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-brand-olive">Payment ID</p>
                                                <p className="font-mono text-xs font-semibold text-brand-black">
                                                    {selectedApplication.paymentId || 'Not available'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-brand-surface bg-brand-off-white p-5">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-brand-black">
                                            <Building className="w-5 h-5 text-brand-gold" />
                                            Profile Snapshot
                                        </h3>
                                        <div className="mt-4 space-y-3 text-sm">
                                            <div>
                                                <p className="text-brand-olive">Profile Image</p>
                                                {selectedApplication.userId?.avatar ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsAvatarFullScreen(true)}
                                                        className="mt-2 inline-flex items-center gap-3 rounded-xl border border-brand-surface bg-white px-3 py-2 text-left transition-colors hover:border-brand-gold hover:bg-brand-gold/5"
                                                    >
                                                        <img
                                                            src={getAssetUrl(selectedApplication.userId.avatar)}
                                                            alt={`${selectedApplication.firstName} ${selectedApplication.lastName}`}
                                                            className="h-12 w-12 rounded-xl object-cover"
                                                        />
                                                        <span className="font-semibold text-brand-black">Click to view photo</span>
                                                    </button>
                                                ) : (
                                                    <p className="font-semibold text-brand-black">Not provided</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-brand-black">
                                                <Mail className="w-4 h-4 text-brand-olive-light" />
                                                <span className="font-semibold">
                                                    {selectedApplication.userId?.email || selectedApplication.accountEmail}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-brand-black">
                                                <Phone className="w-4 h-4 text-brand-olive-light" />
                                                <span className="font-semibold">
                                                    {selectedApplication.userId?.phoneNumber || selectedApplication.accountPhoneNumber || 'Not provided'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-brand-black">
                                                <User className="w-4 h-4 text-brand-olive-light" />
                                                <span className="font-semibold">
                                                    {selectedApplication.userId?.name || selectedApplication.accountName}
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2 text-brand-black">
                                                <MapPin className="w-4 h-4 text-brand-olive-light mt-0.5" />
                                                <span className="font-semibold">{selectedApplication.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {normalizeStatus(selectedApplication.status) !== 'rejected' && (
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                        {normalizeStatus(selectedApplication.status) === 'submitted' && (
                                            <button
                                                onClick={() => handleDecision(selectedApplication, 'accepted')}
                                                disabled={processingId === selectedApplication._id}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-olive/20 bg-brand-olive/5 px-5 py-3 text-sm font-semibold text-brand-olive-dark hover:bg-brand-olive/10 transition-colors disabled:opacity-60"
                                            >
                                                {processingId === selectedApplication._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <FileText className="w-4 h-4" />
                                                )}
                                                Accept Application
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDecision(selectedApplication, 'rejected')}
                                            disabled={processingId === selectedApplication._id}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-red/20 bg-brand-red/5 px-5 py-3 text-sm font-semibold text-brand-red hover:bg-brand-red/10 transition-colors disabled:opacity-60"
                                        >
                                            {processingId === selectedApplication._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <X className="w-4 h-4" />
                                            )}
                                            {normalizeStatus(selectedApplication.status) === 'accepted' ? 'Mark Rejected' : 'Reject Application'}
                                        </button>
                                    </div>
                                )}

                                {normalizeStatus(selectedApplication.status) === 'rejected' && (
                                    <div className="pt-2">
                                        <button
                                            onClick={() => handleDeleteRejectedApplication(selectedApplication)}
                                            disabled={processingId === selectedApplication._id}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-red/20 bg-brand-red/5 px-5 py-3 text-sm font-semibold text-brand-red hover:bg-brand-red/10 transition-colors disabled:opacity-60"
                                        >
                                            {processingId === selectedApplication._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            Delete Rejected Application
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {selectedApplication?.userId?.avatar && isAvatarFullScreen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
                    onClick={() => setIsAvatarFullScreen(false)}
                >
                    <button
                        type="button"
                        onClick={() => setIsAvatarFullScreen(false)}
                        className="absolute right-4 top-4 rounded-full p-2 text-white transition-colors hover:bg-white/10"
                    >
                        <X className="h-7 w-7" />
                    </button>
                    <img
                        src={getAssetUrl(selectedApplication.userId.avatar)}
                        alt={`${selectedApplication.firstName} ${selectedApplication.lastName}`}
                        className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminInternshipApplications;
