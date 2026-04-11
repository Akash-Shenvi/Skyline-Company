import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { institutionAPI } from '../../lib/api';

interface InstitutionRequest {
    _id: string;
    institutionId: {
        _id: string;
        name: string;
        email: string;
        phoneNumber?: string;
        institutionName?: string;
        contactPersonName?: string;
        city?: string;
        state?: string;
    };
    courseTitle: string;
    levelName: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    studentCount: number;
    rejectionReason?: string | null;
    students: Array<{ name: string; email: string; createdUserId?: string | null }>;
}

interface InstitutionRequestResponse {
    requests: InstitutionRequest[];
    availableStatuses: string[];
    summary?: { pending: number; approved: number; rejected: number; total: number };
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalRequests: number;
        limit: number;
        hasPreviousPage: boolean;
        hasNextPage: boolean;
    };
}

const REQUESTS_PER_PAGE = 10;

const statusClasses: Record<InstitutionRequest['status'], string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    APPROVED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-red-100 text-red-800',
};

const AdminInstitutionRequests: React.FC = () => {
    const [requests, setRequests] = useState<InstitutionRequest[]>([]);
    const [availableStatuses, setAvailableStatuses] = useState<string[]>(['All', 'PENDING', 'APPROVED', 'REJECTED']);
    const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRequests: 0,
        limit: REQUESTS_PER_PAGE,
        hasPreviousPage: false,
        hasNextPage: false,
    });
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const fetchRequests = async (page = pagination.currentPage) => {
        try {
            setLoading(true);
            setError('');
            const response = await institutionAPI.getAdminRequests({
                page,
                limit: REQUESTS_PER_PAGE,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                search: searchQuery || undefined,
            }) as InstitutionRequestResponse;

            setRequests(response.requests || []);
            setAvailableStatuses(response.availableStatuses || ['All', 'PENDING', 'APPROVED', 'REJECTED']);
            setSummary(response.summary || { pending: 0, approved: 0, rejected: 0, total: 0 });
            setPagination({
                currentPage: response.pagination?.currentPage ?? page,
                totalPages: response.pagination?.totalPages ?? 1,
                totalRequests: response.pagination?.totalRequests ?? 0,
                limit: response.pagination?.limit ?? REQUESTS_PER_PAGE,
                hasPreviousPage: response.pagination?.hasPreviousPage ?? false,
                hasNextPage: response.pagination?.hasNextPage ?? false,
            });
            setExpandedIds([]);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load institution requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchRequests();
    }, [pagination.currentPage, searchQuery, statusFilter]);

    const refreshAfterAction = async () => {
        if (requests.length === 1 && pagination.currentPage > 1) {
            setPagination((current) => ({ ...current, currentPage: current.currentPage - 1 }));
            return;
        }
        await fetchRequests();
    };

    const toggleExpanded = (requestId: string) => {
        setExpandedIds((current) =>
            current.includes(requestId)
                ? current.filter((id) => id !== requestId)
                : [...current, requestId]
        );
    };

    const handleApprove = async (requestId: string) => {
        if (!window.confirm('Approve this institution request and create all student accounts now?')) return;
        try {
            setProcessingId(requestId);
            await institutionAPI.approveRequest(requestId);
            await refreshAfterAction();
        } catch (err: any) {
            window.alert(err.response?.data?.message || 'Failed to approve institution request.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId: string) => {
        if (!window.confirm('Reject this institution request? No student accounts will be created.')) return;
        try {
            setProcessingId(requestId);
            await institutionAPI.rejectRequest(requestId);
            await refreshAfterAction();
        } catch (err: any) {
            window.alert(err.response?.data?.message || 'Failed to reject institution request.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (request: InstitutionRequest) => {
        if (request.status === 'PENDING') {
            window.alert('Pending institution requests cannot be deleted.');
            return;
        }

        const confirmed = window.confirm(
            request.status === 'APPROVED'
                ? 'Delete this approved request from the list? Created student accounts will stay active.'
                : 'Delete this rejected request? This cannot be undone.'
        );
        if (!confirmed) return;

        try {
            setProcessingId(request._id);
            await institutionAPI.deleteRequest(request._id);
            await refreshAfterAction();
        } catch (err: any) {
            window.alert(err.response?.data?.message || 'Failed to delete institution request.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <Link to="/admin-dashboard" className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#d6b161]">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Institution Requests</h1>
                        <span className="rounded-full bg-[#d6b161] px-3 py-1 text-sm font-semibold text-[#0a192f]">
                            {summary.pending} Pending
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Review institution submissions, approve entire batches, reject requests, and delete resolved entries.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#112240]"><div className="text-sm text-gray-500">Pending</div><div className="mt-1 text-3xl font-bold">{summary.pending}</div></div>
                    <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#112240]"><div className="text-sm text-gray-500">Approved</div><div className="mt-1 text-3xl font-bold">{summary.approved}</div></div>
                    <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#112240]"><div className="text-sm text-gray-500">Rejected</div><div className="mt-1 text-3xl font-bold">{summary.rejected}</div></div>
                    <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#112240]"><div className="text-sm text-gray-500">Total</div><div className="mt-1 text-3xl font-bold">{summary.total}</div></div>
                </div>

                <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#112240]">
                    <div className="flex flex-col gap-4 xl:flex-row">
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                setPagination((current) => ({ ...current, currentPage: 1 }));
                                setSearchQuery(searchInput.trim());
                            }}
                            className="relative flex-1"
                        >
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Search institution, contact, student, course, or email"
                                className="w-full rounded-xl border bg-gray-50 py-3 pl-10 pr-4 outline-none focus:border-[#d6b161]"
                            />
                        </form>
                        <div className="flex flex-wrap gap-2">
                            {availableStatuses.map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setPagination((current) => ({ ...current, currentPage: 1 }));
                                    }}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                                        statusFilter === status ? 'bg-[#d6b161] text-[#0a192f]' : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {status === 'All' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-[#d6b161]" /></div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">{error}</div>
                ) : requests.length === 0 ? (
                    <div className="rounded-2xl border bg-white py-20 text-center shadow-sm dark:bg-[#112240]">
                        <Building2 className="mx-auto mb-4 h-10 w-10 text-gray-400" />
                        <div className="text-lg font-semibold">No institution requests found</div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => {
                            const isExpanded = expandedIds.includes(request._id);
                            const isProcessing = processingId === request._id;
                            const institutionName = request.institutionId.institutionName || request.institutionId.name;
                            return (
                                <div key={request._id} className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-[#112240]">
                                    <div className="flex flex-col gap-5 xl:flex-row xl:justify-between">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="text-xl font-bold">{institutionName}</h2>
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[request.status]}`}>{request.status}</span>
                                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{request.courseTitle}</span>
                                                <span className="rounded-full bg-[#d6b161]/10 px-3 py-1 text-xs font-semibold text-[#9a7420]">{request.levelName}</span>
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                <div><div className="text-xs uppercase text-gray-500">Contact</div><div className="font-medium">{request.institutionId.contactPersonName || 'Not provided'}</div></div>
                                                <div><div className="text-xs uppercase text-gray-500">Email</div><div className="font-medium break-all">{request.institutionId.email}</div></div>
                                                <div><div className="text-xs uppercase text-gray-500">Phone</div><div className="font-medium">{request.institutionId.phoneNumber || 'Not provided'}</div></div>
                                                <div><div className="text-xs uppercase text-gray-500">Students</div><div className="font-medium">{request.studentCount}</div></div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Submitted {new Date(request.createdAt).toLocaleString()}
                                                {request.institutionId.city || request.institutionId.state
                                                    ? ` • ${[request.institutionId.city, request.institutionId.state].filter(Boolean).join(', ')}`
                                                    : ''}
                                            </div>
                                            {request.rejectionReason ? (
                                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                                    {request.rejectionReason}
                                                </div>
                                            ) : null}
                                            <div className="rounded-xl border bg-gray-50 p-4">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleExpanded(request._id)}
                                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#0a192f]"
                                                >
                                                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    {isExpanded ? 'Hide students' : 'Show students'}
                                                </button>
                                                {isExpanded ? (
                                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                        {request.students.map((student) => (
                                                            <div key={`${request._id}-${student.email}`} className="rounded-lg border bg-white px-4 py-3">
                                                                <div className="font-medium">{student.name}</div>
                                                                <div className="text-sm text-gray-500">{student.email}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-col gap-2">
                                            {request.status === 'PENDING' ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleApprove(request._id)}
                                                        disabled={isProcessing}
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 disabled:opacity-60"
                                                    >
                                                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                        Accept
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleReject(request._id)}
                                                        disabled={isProcessing}
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
                                                    >
                                                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                                        Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => void handleDelete(request)}
                                                    disabled={isProcessing}
                                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
                                                >
                                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="flex flex-col gap-4 rounded-2xl border bg-white px-5 py-4 shadow-sm dark:bg-[#112240] sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-600">
                                Page <span className="font-semibold">{pagination.currentPage}</span> of <span className="font-semibold">{pagination.totalPages}</span>
                                {' '}• Total {pagination.totalRequests} requests
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPagination((current) => ({ ...current, currentPage: current.currentPage - 1 }))}
                                    disabled={!pagination.hasPreviousPage}
                                    className="inline-flex items-center gap-2 rounded-lg border bg-gray-50 px-4 py-2 text-sm disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPagination((current) => ({ ...current, currentPage: current.currentPage + 1 }))}
                                    disabled={!pagination.hasNextPage}
                                    className="inline-flex items-center gap-2 rounded-lg border bg-gray-50 px-4 py-2 text-sm disabled:opacity-50"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminInstitutionRequests;
