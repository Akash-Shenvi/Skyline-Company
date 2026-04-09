import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Building2,
    BookOpen,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Eye,
    Filter,
    GraduationCap,
    Loader2,
    Mail,
    Phone,
    Search,
    Trash2,
    User as UserIcon,
    Users,
    X,
} from 'lucide-react';
import api, { getAssetUrl } from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { Link } from 'react-router-dom';

interface Student {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    institutionId?: string | null;
    institutionName?: string | null;
    avatar?: string;
    guardianName?: string;
    guardianPhone?: string;
    qualification?: string;
    dateOfBirth?: string;
    germanLevel?: string;
    createdAt: string;
}

interface Trainer {
    _id: string;
    name: string;
    email: string;
}

interface BatchListItem {
    _id: string;
    courseTitle: string;
    name: string;
    institutionId?: string | null;
    institutionName?: string | null;
    studentCount: number;
    trainer: Trainer | null;
    trainingType: 'language' | 'skill';
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

interface BatchPagination {
    currentPage: number;
    totalPages: number;
    totalBatches: number;
    limit: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

interface StudentPagination {
    currentPage: number;
    totalPages: number;
    totalStudents: number;
    limit: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

const BATCHES_PER_PAGE = 6;
const STUDENTS_PER_PAGE = 8;
const activeClassTypeMeta = (trainingType: BatchListItem['trainingType']) =>
    trainingType === 'skill'
        ? {
            label: 'Skill',
            badgeClassName: 'border-brand-surface bg-brand-olive/10 text-brand-olive-dark',
            iconClassName: 'bg-brand-off-white0/10 text-brand-olive',
        }
        : {
            label: 'Language',
            badgeClassName: 'border-brand-surface bg-brand-gold/10 text-brand-olive-dark',
            iconClassName: 'bg-brand-gold/10 text-brand-gold',
        };

const getNormalizedInstitutionName = (value?: string | null) => {
    const normalizedValue = String(value || '').trim();
    return normalizedValue || null;
};

const getLanguageBatchScopeLabel = (batch?: Pick<BatchListItem, 'trainingType' | 'institutionName'> | null) => {
    if (!batch || batch.trainingType !== 'language') {
        return null;
    }

    return getNormalizedInstitutionName(batch.institutionName) || 'General Pool';
};
const getBatchDetailsPath = (batch: Pick<BatchListItem, '_id' | 'trainingType'>) =>
    batch.trainingType === 'skill' ? `/skill-batch/${batch._id}` : `/language-batch/${batch._id}`;

const LanguageBatches: React.FC = () => {
    const [batches, setBatches] = useState<BatchListItem[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [availableCourses, setAvailableCourses] = useState<string[]>(['All']);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCourse, setFilterCourse] = useState('All');
    const [batchPagination, setBatchPagination] = useState<BatchPagination>({
        currentPage: 1,
        totalPages: 1,
        totalBatches: 0,
        limit: BATCHES_PER_PAGE,
        hasPreviousPage: false,
        hasNextPage: false,
    });
    const [expandedBatch, setExpandedBatch] = useState<BatchListItem | null>(null);
    const [batchStudents, setBatchStudents] = useState<Student[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState('');
    const [studentPagination, setStudentPagination] = useState<StudentPagination>({
        currentPage: 1,
        totalPages: 1,
        totalStudents: 0,
        limit: STUDENTS_PER_PAGE,
        hasPreviousPage: false,
        hasNextPage: false,
    });
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<BatchListItem | null>(null);
    const [selectedTrainer, setSelectedTrainer] = useState('');
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [promoteEmail, setPromoteEmail] = useState('');
    const [promoting, setPromoting] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
    const [languageEnrollments, setLanguageEnrollments] = useState<LanguageEnrollment[]>([]);
    const [skillEnrollments, setSkillEnrollments] = useState<SkillEnrollment[]>([]);
    const [isAvatarFullScreen, setIsAvatarFullScreen] = useState(false);

    useEffect(() => {
        void fetchTrainers();
    }, []);

    useEffect(() => {
        void fetchBatches();
    }, [batchPagination.currentPage, searchQuery, filterCourse]);

    useEffect(() => {
        if (!isViewModalOpen) {
            setIsAvatarFullScreen(false);
        }
    }, [isViewModalOpen]);

    const fetchTrainers = async () => {
        try {
            const response = await api.get('/language-training/admin/trainers');
            setTrainers(response.data || []);
        } catch (err) {
            console.error('Failed to fetch trainers', err);
        }
    };

    const fetchBatches = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/admin/active-classes', {
                params: {
                    page: batchPagination.currentPage,
                    limit: BATCHES_PER_PAGE,
                    search: searchQuery || undefined,
                    course: filterCourse !== 'All' ? filterCourse : undefined,
                },
            });

            const nextBatches = response.data.batches || [];
            const nextPagination = response.data.pagination || {};

            setBatches(nextBatches);
            setAvailableCourses(response.data.availableCourses || ['All']);
            setBatchPagination({
                currentPage: nextPagination.currentPage || 1,
                totalPages: nextPagination.totalPages || 1,
                totalBatches: nextPagination.totalBatches || 0,
                limit: nextPagination.limit || BATCHES_PER_PAGE,
                hasPreviousPage: !!nextPagination.hasPreviousPage,
                hasNextPage: !!nextPagination.hasNextPage,
            });

            if (expandedBatch) {
                const refreshedExpandedBatch = nextBatches.find((batch: BatchListItem) => batch._id === expandedBatch._id) || null;

                if (!refreshedExpandedBatch) {
                    setExpandedBatch(null);
                    setBatchStudents([]);
                    setStudentsError('');
                    setStudentPagination({
                        currentPage: 1,
                        totalPages: 1,
                        totalStudents: 0,
                        limit: STUDENTS_PER_PAGE,
                        hasPreviousPage: false,
                        hasNextPage: false,
                    });
                } else {
                    setExpandedBatch(refreshedExpandedBatch);
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch batches', err);
            setError(err.response?.data?.message || 'Failed to fetch active classes.');
        } finally {
            setLoading(false);
        }
    };

    const fetchBatchStudents = async (batch: BatchListItem, page = 1) => {
        try {
            setStudentsLoading(true);
            setStudentsError('');

            const response = await api.get(`/admin/active-classes/${batch._id}/students`, {
                params: {
                    page,
                    limit: STUDENTS_PER_PAGE,
                    trainingType: batch.trainingType,
                },
            });

            const nextPagination = response.data.pagination || {};

            setExpandedBatch((currentBatch) => {
                if (!currentBatch || currentBatch._id !== batch._id) {
                    return batch;
                }

                return {
                    ...currentBatch,
                    studentCount: response.data.batch?.studentCount ?? currentBatch.studentCount,
                    trainer: response.data.batch?.trainer ?? currentBatch.trainer,
                };
            });
            setBatchStudents(response.data.students || []);
            setStudentPagination({
                currentPage: nextPagination.currentPage || 1,
                totalPages: nextPagination.totalPages || 1,
                totalStudents: nextPagination.totalStudents || 0,
                limit: nextPagination.limit || STUDENTS_PER_PAGE,
                hasPreviousPage: !!nextPagination.hasPreviousPage,
                hasNextPage: !!nextPagination.hasNextPage,
            });
        } catch (err: any) {
            console.error('Failed to fetch batch students', err);
            setStudentsError(err.response?.data?.message || 'Failed to load batch students.');
            setBatchStudents([]);
            setStudentPagination({
                currentPage: 1,
                totalPages: 1,
                totalStudents: 0,
                limit: STUDENTS_PER_PAGE,
                hasPreviousPage: false,
                hasNextPage: false,
            });
        } finally {
            setStudentsLoading(false);
        }
    };

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setBatchPagination((current) => ({ ...current, currentPage: 1 }));
        setSearchQuery(searchInput.trim());
    };

    const toggleBatch = async (batch: BatchListItem) => {
        if (expandedBatch?._id === batch._id) {
            setExpandedBatch(null);
            setBatchStudents([]);
            setStudentsError('');
            return;
        }

        setExpandedBatch(batch);
        setBatchStudents([]);
        setStudentPagination({
            currentPage: 1,
            totalPages: 1,
            totalStudents: 0,
            limit: STUDENTS_PER_PAGE,
            hasPreviousPage: false,
            hasNextPage: false,
        });
        await fetchBatchStudents(batch, 1);
    };

    const openAssignModal = (batch: BatchListItem, event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedBatch(batch);
        setSelectedTrainer(batch.trainer?._id || '');
        setShowAssignModal(true);
    };

    const handleAssignTrainer = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedBatch || !selectedTrainer) {
            return;
        }

        try {
            await api.put(`/admin/active-classes/${selectedBatch._id}/assign-trainer`, {
                trainerId: selectedTrainer,
                trainingType: selectedBatch.trainingType,
            });
            setShowAssignModal(false);
            await fetchBatches();

            if (expandedBatch?._id === selectedBatch._id) {
                await fetchBatchStudents(selectedBatch, studentPagination.currentPage);
            }

            window.alert('Trainer assigned successfully.');
        } catch (err) {
            console.error('Failed to assign trainer', err);
            window.alert('Failed to assign trainer.');
        }
    };

    const handlePromoteTrainer = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!promoteEmail.trim()) {
            return;
        }

        try {
            setPromoting(true);
            const { data } = await api.post('/language-training/admin/promote-trainer', { email: promoteEmail.trim() });
            window.alert(data.message);
            setPromoteEmail('');
            setShowPromoteModal(false);
            await fetchTrainers();
        } catch (err: any) {
            console.error('Failed to promote user', err);
            window.alert(err.response?.data?.message || 'Failed to promote user.');
        } finally {
            setPromoting(false);
        }
    };

    const handleRemoveStudent = async (batchId: string, studentId: string) => {
        if (!window.confirm('Are you sure you want to remove this student from the active class? This will cancel their enrollment.')) {
            return;
        }

        try {
            const batch = batches.find((currentBatch) => currentBatch._id === batchId) || expandedBatch;
            await api.delete(`/admin/active-classes/${batchId}/students/${studentId}`, {
                params: {
                    trainingType: batch?.trainingType,
                },
            });

            if (expandedBatch && expandedBatch._id === batchId) {
                const nextPage =
                    batchStudents.length === 1 && studentPagination.currentPage > 1
                        ? studentPagination.currentPage - 1
                        : studentPagination.currentPage;

                await fetchBatchStudents(expandedBatch, nextPage);
            }

            await fetchBatches();
        } catch (err) {
            console.error('Failed to remove student', err);
            window.alert('Failed to remove student.');
        }
    };

    const handleDeleteBatch = async (batchId: string) => {
        if (!window.confirm('WARNING: Are you sure you want to delete this entire batch? All students will be removed from the class and their enrollments will be rejected.')) {
            return;
        }

        try {
            const batch = batches.find((currentBatch) => currentBatch._id === batchId);
            await api.delete(`/admin/active-classes/${batchId}`, {
                params: {
                    trainingType: batch?.trainingType,
                },
            });

            if (expandedBatch?._id === batchId) {
                setExpandedBatch(null);
                setBatchStudents([]);
                setStudentsError('');
            }

            if (batches.length === 1 && batchPagination.currentPage > 1) {
                setBatchPagination((current) => ({ ...current, currentPage: current.currentPage - 1 }));
                return;
            }

            await fetchBatches();
        } catch (err) {
            console.error('Failed to delete batch', err);
            window.alert('Failed to delete batch.');
        }
    };

    const handleViewStudent = async (student: Student) => {
        setSelectedStudent(student);
        setIsViewModalOpen(true);
        setStudentDetailsLoading(true);
        setLanguageEnrollments([]);
        setSkillEnrollments([]);

        try {
            const response = await api.get(`/admin/students/${student._id}/details`);
            setSelectedStudent(response.data.student || student);
            setLanguageEnrollments(response.data.languageEnrollments || []);
            setSkillEnrollments(response.data.skillEnrollments || []);
        } catch (err) {
            console.error('Failed to load student details', err);
        } finally {
            setStudentDetailsLoading(false);
        }
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedStudent(null);
    };

    const batchStart = batches.length === 0 ? 0 : (batchPagination.currentPage - 1) * batchPagination.limit + 1;
    const batchEnd = batches.length === 0 ? 0 : Math.min(batchPagination.currentPage * batchPagination.limit, batchPagination.totalBatches);
    const studentStart = batchStudents.length === 0 ? 0 : (studentPagination.currentPage - 1) * studentPagination.limit + 1;
    const studentEnd = batchStudents.length === 0 ? 0 : Math.min(studentPagination.currentPage * studentPagination.limit, studentPagination.totalStudents);

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-brand-black">Active Classes</h1>
                        <p className="mt-1 text-brand-olive-dark">
                            Review active language and skill classes, assign trainers, and manage enrolled students.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPromoteModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-gold px-4 py-2 font-bold text-brand-black transition-colors hover:bg-brand-gold-hover"
                    >
                        <Users className="h-5 w-5" />
                        Promote New Trainer
                    </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="rounded-xl border border-brand-surface bg-white p-4 shadow-sm"
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-olive-light" />
                            <input
                                type="text"
                                placeholder="Search by class name or course..."
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                className="w-full rounded-lg border border-brand-surface bg-brand-off-white py-2 pl-10 pr-4 text-brand-black outline-none transition-all focus:border-brand-red focus:ring-2 focus:ring-brand-gold"
                            />
                        </div>
                    </form>

                    <div className="flex items-center gap-2 rounded-xl border border-brand-surface bg-white p-4 shadow-sm">
                        <Filter className="h-5 w-5 text-brand-olive" />
                        <select
                            value={filterCourse}
                            onChange={(event) => {
                                setFilterCourse(event.target.value);
                                setBatchPagination((current) => ({ ...current, currentPage: 1 }));
                            }}
                            className="w-full rounded-lg border border-brand-surface bg-brand-off-white px-3 py-2 text-brand-black outline-none transition-all focus:ring-2 focus:ring-brand-gold"
                        >
                            {availableCourses.map((course) => (
                                <option key={course} value={course}>
                                    {course}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="rounded-2xl border border-brand-surface bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-brand-olive-dark">
                            Showing <span className="font-semibold text-brand-black">{batchStart}</span> to{' '}
                            <span className="font-semibold text-brand-black">{batchEnd}</span> of{' '}
                            <span className="font-semibold text-brand-black">{batchPagination.totalBatches}</span> classes
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setBatchPagination((current) => ({ ...current, currentPage: Math.max(1, current.currentPage - 1) }))}
                                disabled={!batchPagination.hasPreviousPage}
                                className="inline-flex items-center gap-2 rounded-lg border border-brand-surface bg-brand-off-white px-4 py-2 text-sm font-medium text-brand-olive-dark transition-colors hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>
                            <span className="px-2 text-sm text-brand-olive-dark">
                                Page <span className="font-semibold text-brand-black">{batchPagination.currentPage}</span> of{' '}
                                <span className="font-semibold text-brand-black">{batchPagination.totalPages}</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => setBatchPagination((current) => ({ ...current, currentPage: Math.min(current.totalPages, current.currentPage + 1) }))}
                                disabled={!batchPagination.hasNextPage}
                                className="inline-flex items-center gap-2 rounded-lg border border-brand-surface bg-brand-off-white px-4 py-2 text-sm font-medium text-brand-olive-dark transition-colors hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-brand-gold" />
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-brand-red/20 bg-brand-red/5 p-4 text-center font-medium text-brand-red">
                        {error}
                    </div>
                ) : batches.length === 0 ? (
                    <div className="rounded-xl border border-brand-surface bg-white py-16 text-center">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-brand-olive-light" />
                        <h3 className="text-lg font-bold text-brand-black">No active classes found</h3>
                        <p className="text-brand-olive">Try changing the course filter or search term.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {batches.map((batch) => {
                            const isExpanded = expandedBatch?._id === batch._id;
                            const typeMeta = activeClassTypeMeta(batch.trainingType);
                            const institutionScopeLabel = getLanguageBatchScopeLabel(batch);

                            return (
                                <div
                                    key={batch._id}
                                    className={`overflow-hidden rounded-xl border bg-white transition-all ${
                                        isExpanded
                                            ? 'border-brand-gold ring-1 ring-brand-gold/20 shadow-md'
                                            : 'border-brand-surface shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                                        <button
                                            type="button"
                                            onClick={() => void toggleBatch(batch)}
                                            className="flex flex-1 items-center gap-4 text-left"
                                        >
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${typeMeta.iconClassName}`}>
                                                <BookOpen className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold text-brand-black sm:text-xl">
                                                    {batch.courseTitle}
                                                    <span className={`rounded-full border px-2 py-0.5 text-xs ${typeMeta.badgeClassName}`}>
                                                        {typeMeta.label}
                                                    </span>
                                                    <span className="rounded-full border border-brand-surface bg-brand-gold/10 px-2 py-0.5 text-xs text-brand-olive-dark">
                                                        {batch.name}
                                                    </span>
                                                    {institutionScopeLabel && (
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2 py-0.5 text-xs text-brand-gold-hover">
                                                            <Building2 className="h-3.5 w-3.5" />
                                                            {institutionScopeLabel}
                                                        </span>
                                                    )}
                                                </h2>
                                                <div className="mt-1 flex flex-wrap items-center gap-4 text-sm">
                                                    <p className="flex items-center gap-1.5 text-brand-olive">
                                                        <Users className="h-4 w-4" />
                                                        <span className="font-medium text-brand-black">{batch.studentCount}</span> Students
                                                    </p>
                                                    <p className="text-brand-olive">
                                                        <span className="font-medium">Trainer:</span>{' '}
                                                        {batch.trainer ? (
                                                            <span className="text-brand-black">{batch.trainer.name}</span>
                                                        ) : (
                                                            <span className="font-medium text-brand-red">Unassigned</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>

                                        <div className="flex items-center justify-end gap-3">
                                            <Link
                                                to={getBatchDetailsPath(batch)}
                                                className="inline-flex items-center gap-2 rounded-lg border border-brand-gold/30 bg-brand-gold/10 px-3 py-1.5 text-sm font-medium text-brand-gold transition-colors hover:bg-brand-gold/20"
                                                title="Visit this class as admin"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={(event) => openAssignModal(batch, event)}
                                                className="rounded-lg border border-brand-gold px-3 py-1.5 text-sm font-medium text-brand-gold transition-colors hover:bg-brand-gold/10"
                                            >
                                                {batch.trainer ? 'Reassign' : 'Assign Trainer'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteBatch(batch._id)}
                                                className="rounded-lg border border-transparent p-2 text-brand-red transition-colors hover:border-brand-red/20 hover:bg-brand-red/5"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void toggleBatch(batch)}
                                                className="text-brand-olive-light"
                                            >
                                                {isExpanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-brand-surface">
                                            <div className="flex flex-col gap-3 border-b border-brand-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                                <div>
                                                    <h3 className="text-base font-bold text-brand-black">Students in this class</h3>
                                                    <p className="text-sm text-brand-olive-dark">
                                                        Showing <span className="font-semibold text-brand-black">{studentStart}</span> to{' '}
                                                        <span className="font-semibold text-brand-black">{studentEnd}</span> of{' '}
                                                        <span className="font-semibold text-brand-black">{studentPagination.totalStudents}</span> students
                                                    </p>
                                                    {institutionScopeLabel && (
                                                        <p className="mt-1 text-sm text-brand-olive">
                                                            Batch scope: <span className="font-semibold text-brand-black">{institutionScopeLabel}</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-sm text-brand-olive">
                                                    Use <span className="font-semibold text-brand-black">View Profile</span> for full details and avatar preview.
                                                </p>
                                            </div>

                                            {studentsLoading ? (
                                                <div className="flex items-center justify-center py-16">
                                                    <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
                                                </div>
                                            ) : studentsError ? (
                                                <div className="px-6 py-8 text-center text-brand-red">{studentsError}</div>
                                            ) : batchStudents.length === 0 ? (
                                                <div className="px-6 py-12 text-center text-brand-olive">No students found for this class.</div>
                                            ) : (
                                                <>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-brand-surface">
                                                            <thead className="bg-brand-off-white">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-olive">Student</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-olive">Contact</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-olive">Joined</th>
                                                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-brand-olive">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-brand-surface bg-white">
                                                                {batchStudents.map((student) => (
                                                                    <tr key={student._id} className="hover:bg-brand-off-white">
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-brand-gold/30 bg-brand-gold/20 text-sm font-bold text-brand-gold">
                                                                                    {student.avatar ? (
                                                                                        <img src={getAssetUrl(student.avatar)} alt={student.name} className="h-full w-full object-cover" />
                                                                                    ) : (
                                                                                        student.name.charAt(0).toUpperCase()
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-semibold text-brand-black">{student.name}</p>
                                                                                    <p className="text-xs text-brand-olive">{student.qualification || 'Qualification not provided'}</p>
                                                                                    {batch.trainingType === 'language' && (
                                                                                        <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-gold-hover">
                                                                                            <Building2 className="h-3.5 w-3.5" />
                                                                                            {getNormalizedInstitutionName(student.institutionName) || 'General Pool'}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="space-y-1 text-sm">
                                                                                <p className="flex items-center gap-1.5 text-brand-olive-dark">
                                                                                    <Mail className="h-3.5 w-3.5" />
                                                                                    {student.email}
                                                                                </p>
                                                                                <p className="flex items-center gap-1.5 text-brand-olive">
                                                                                    <Phone className="h-3.5 w-3.5" />
                                                                                    {student.phoneNumber || 'Not provided'}
                                                                                </p>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-olive-dark">
                                                                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Not available'}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                                            <div className="flex justify-end gap-2">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => void handleViewStudent(student)}
                                                                                    className="inline-flex items-center gap-2 rounded-lg border border-brand-gold/30 bg-brand-gold/10 px-3 py-2 text-sm font-medium text-brand-gold transition-colors hover:bg-brand-gold/20"
                                                                                >
                                                                                    <Eye className="h-4 w-4" />
                                                                                    View Profile
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleRemoveStudent(batch._id, student._id)}
                                                                                    className="rounded-lg border border-brand-red/20 bg-brand-red/5 p-2 text-brand-red transition-colors hover:bg-brand-red/10"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    <div className="flex flex-col gap-4 border-t border-brand-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                                        <div className="text-sm text-brand-olive-dark">
                                                            Page <span className="font-semibold text-brand-black">{studentPagination.currentPage}</span> of{' '}
                                                            <span className="font-semibold text-brand-black">{studentPagination.totalPages}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => expandedBatch && void fetchBatchStudents(expandedBatch, studentPagination.currentPage - 1)}
                                                                disabled={!studentPagination.hasPreviousPage}
                                                                className="inline-flex items-center gap-2 rounded-lg border border-brand-surface bg-brand-off-white px-4 py-2 text-sm font-medium text-brand-olive-dark transition-colors hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <ChevronLeft className="h-4 w-4" />
                                                                Previous
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => expandedBatch && void fetchBatchStudents(expandedBatch, studentPagination.currentPage + 1)}
                                                                disabled={!studentPagination.hasNextPage}
                                                                className="inline-flex items-center gap-2 rounded-lg border border-brand-surface bg-brand-off-white px-4 py-2 text-sm font-medium text-brand-olive-dark transition-colors hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                Next
                                                                <ChevronRight className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {showAssignModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-2xl border border-brand-surface bg-white p-6 shadow-xl">
                            <h2 className="mb-4 text-xl font-bold">Assign Trainer</h2>
                            <p className="mb-4 text-sm text-brand-olive-dark">
                                Assigning trainer for <strong>{selectedBatch?.courseTitle} - {selectedBatch?.name}</strong>
                            </p>
                            <form onSubmit={handleAssignTrainer} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-brand-olive-dark">Select Trainer</label>
                                    <select
                                        value={selectedTrainer}
                                        onChange={(event) => setSelectedTrainer(event.target.value)}
                                        className="w-full rounded-lg border border-brand-surface bg-white p-2 outline-none focus:ring-2 focus:ring-brand-gold"
                                        required
                                    >
                                        <option value="">-- Select Trainer --</option>
                                        {trainers.map((trainer) => (
                                            <option key={trainer._id} value={trainer._id}>
                                                {trainer.name} ({trainer.email})
                                            </option>
                                        ))}
                                    </select>
                                    {trainers.length === 0 && (
                                        <p className="mt-1 text-xs text-brand-red">No trainers found. Promote a user to trainer first.</p>
                                    )}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAssignModal(false)}
                                        className="flex-1 rounded-lg bg-brand-surface py-2.5 font-medium text-brand-black transition-colors hover:bg-brand-surface"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-lg bg-brand-gold py-2.5 font-bold text-brand-black transition-colors hover:bg-brand-gold-hover"
                                    >
                                        Save Assignment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showPromoteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-2xl border border-brand-surface bg-white p-6 shadow-xl">
                            <h2 className="mb-4 text-xl font-bold">Promote User to Trainer</h2>
                            <p className="mb-4 text-sm text-brand-olive-dark">
                                Enter the email of a registered user to grant trainer access.
                            </p>
                            <form onSubmit={handlePromoteTrainer} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-brand-olive-dark">User Email</label>
                                    <input
                                        type="email"
                                        placeholder="user@example.com"
                                        value={promoteEmail}
                                        onChange={(event) => setPromoteEmail(event.target.value)}
                                        className="w-full rounded-lg border border-brand-surface bg-white p-2 outline-none focus:ring-2 focus:ring-brand-gold"
                                        required
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPromoteModal(false)}
                                        className="flex-1 rounded-lg bg-brand-surface py-2.5 font-medium text-brand-black transition-colors hover:bg-brand-surface"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={promoting}
                                        className="flex-1 rounded-lg bg-brand-gold py-2.5 font-bold text-brand-black transition-colors hover:bg-brand-gold-hover disabled:opacity-50"
                                    >
                                        {promoting ? 'Promoting...' : 'Promote'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <AnimatePresence>
                {isViewModalOpen && selectedStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={closeViewModal}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl"
                        >
                            <button
                                type="button"
                                onClick={closeViewModal}
                                className="absolute right-4 top-4 rounded-full p-2 text-brand-olive transition-colors hover:bg-brand-surface"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <div className="p-8">
                                <div className="mb-8 flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-brand-gold text-4xl font-bold text-brand-black shadow-lg sm:h-32 sm:w-32 sm:text-5xl">
                                        {selectedStudent.avatar ? (
                                            <img
                                                src={getAssetUrl(selectedStudent.avatar)}
                                                alt={selectedStudent.name}
                                                className="h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-80"
                                                onClick={() => setIsAvatarFullScreen(true)}
                                                title="Click to view full screen"
                                            />
                                        ) : (
                                            selectedStudent.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <h2 className="text-3xl font-bold text-brand-black">{selectedStudent.name}</h2>
                                        <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                                            <div className="flex items-center gap-2 rounded-lg bg-brand-gold/5 px-3 py-1.5 text-brand-red">
                                                <Mail className="h-4 w-4" />
                                                <span className="text-sm font-medium">{selectedStudent.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg bg-brand-olive/5 px-3 py-1.5 text-brand-olive">
                                                <Phone className="h-4 w-4" />
                                                <span className="text-sm font-medium">{selectedStudent.phoneNumber || 'Not Provided'}</span>
                                            </div>
                                            {getNormalizedInstitutionName(selectedStudent.institutionName) && (
                                                <div className="flex items-center gap-2 rounded-lg bg-brand-gold/15 px-3 py-1.5 text-brand-gold-hover">
                                                    <Building2 className="h-4 w-4" />
                                                    <span className="text-sm font-medium">{selectedStudent.institutionName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4">
                                        <div className="mb-2 flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-brand-olive" />
                                            <span className="text-sm font-semibold text-brand-olive">Date of Birth</span>
                                        </div>
                                        <p className="pl-8 font-bold text-brand-black">
                                            {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : 'Not Provided'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4">
                                        <div className="mb-2 flex items-center gap-3">
                                            <GraduationCap className="h-5 w-5 text-brand-gold" />
                                            <span className="text-sm font-semibold text-brand-olive">Qualification</span>
                                        </div>
                                        <p className="pl-8 font-bold text-brand-black">{selectedStudent.qualification || 'Not Provided'}</p>
                                    </div>
                                    {(expandedBatch?.trainingType === 'language' || getNormalizedInstitutionName(selectedStudent.institutionName)) && (
                                        <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4">
                                            <div className="mb-2 flex items-center gap-3">
                                                <Building2 className="h-5 w-5 text-brand-olive" />
                                                <span className="text-sm font-semibold text-brand-olive">Institution Scope</span>
                                            </div>
                                            <p className="pl-8 font-bold text-brand-black">
                                                {getNormalizedInstitutionName(selectedStudent.institutionName) || 'General Pool'}
                                            </p>
                                        </div>
                                    )}
                                    <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4">
                                        <div className="mb-2 flex items-center gap-3">
                                            <BookOpen className="h-5 w-5 text-brand-gold" />
                                            <span className="text-sm font-semibold text-brand-olive">German Level</span>
                                        </div>
                                        <p className="pl-8 font-bold text-brand-black">{selectedStudent.germanLevel || 'Not Provided'}</p>
                                    </div>
                                    <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4">
                                        <div className="mb-2 flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-brand-gold" />
                                            <span className="text-sm font-semibold text-brand-olive">Joined</span>
                                        </div>
                                        <p className="pl-8 font-bold text-brand-black">
                                            {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : 'Not Provided'}
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
                                                <p className="font-bold text-brand-black">{selectedStudent.guardianName || 'Not Provided'}</p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-brand-olive">Phone</p>
                                                <p className="font-bold text-brand-black">{selectedStudent.guardianPhone || 'Not Provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-brand-black">
                                        <BookOpen className="h-5 w-5 text-brand-gold" />
                                        Enrolled Courses
                                    </h3>

                                    {studentDetailsLoading ? (
                                        <div className="py-8 text-center">
                                            <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-brand-gold" />
                                            <p className="text-sm text-brand-olive">Loading courses...</p>
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
                                                                        enrollment.status === 'APPROVED'
                                                                            ? 'bg-brand-olive/10 text-brand-olive-dark'
                                                                            : enrollment.status === 'PENDING'
                                                                                ? 'bg-brand-gold/10 text-brand-gold'
                                                                                : 'bg-brand-red/10 text-brand-red'
                                                                    }`}>
                                                                        {enrollment.status}
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
                                                                        enrollment.status === 'APPROVED'
                                                                            ? 'bg-brand-olive/10 text-brand-olive-dark'
                                                                            : enrollment.status === 'PENDING'
                                                                                ? 'bg-brand-gold/10 text-brand-gold'
                                                                                : 'bg-brand-red/10 text-brand-red'
                                                                    }`}>
                                                                        {enrollment.status}
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
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {isAvatarFullScreen && selectedStudent?.avatar && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm" onClick={() => setIsAvatarFullScreen(false)}>
                    <button type="button" className="absolute right-4 top-4 p-2 text-white transition-colors hover:text-brand-olive-light" onClick={() => setIsAvatarFullScreen(false)}>
                        <X className="h-8 w-8" />
                    </button>
                    <img
                        src={getAssetUrl(selectedStudent.avatar)}
                        alt="Full Screen Avatar"
                        className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            )}
        </AdminLayout>
    );
};

export default LanguageBatches;
