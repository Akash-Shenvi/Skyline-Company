import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import api from '../lib/api';
import { dashboardAPI, getAssetUrl } from '../lib/api';
import {
    BookOpen,
    Building2,
    User,
    Edit,
    Mail,
    Phone,
    GraduationCap,
    CalendarDays,
    MessageCircle,
    Layers,
    LogOut,
    Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Button from '../components/ui/Button';
import ProfileCompletionModal from '../components/auth/ProfileCompletionModal';
import LearnerQuickActions from '../components/layout/LearnerQuickActions';
import { getDashboardPathForRole } from '../lib/authRouting';
import { formatRoleLabel, isInstitutionStudentRole } from '../lib/roles';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ApprovedSkillCourse {
    id: string;
    batchId?: string | null;
    title: string;
    progress?: number;
    totalLessons?: number;
    completedLessons?: number;
    difficulty?: string;
    thumbnail?: string;
    trainerId?: string | { _id?: string; name?: string } | null;
}

// ============================================================================
// ANIMATIONS
// ============================================================================

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: custom * 0.1, ease: [0.22, 1, 0.36, 1] as const }
    })
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } }
};

// ============================================================================
// HERO BACKGROUND
// ============================================================================

const HeroBackground: React.FC = () => {
    const shouldReduceMotion = useReducedMotion();
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, shouldReduceMotion ? 0 : 150]);
    const y2 = useTransform(scrollY, [0, 500], [0, shouldReduceMotion ? 0 : -150]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);

    return (
        <motion.div
            style={{ opacity }}
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
            aria-hidden="true"
        >
            <motion.div
                style={{ y: y1 }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand-gold/20 to-red-500/10 blur-[120px]"
            />
            <motion.div
                style={{ y: y2 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-brand-gold/50/10 blur-[100px]"
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
        </motion.div>
    );
};

// ============================================================================
// SKELETON LOADERS
// ============================================================================

const SkeletonCourseCard: React.FC = () => (
    <div className="rounded-2xl border border-brand-surface bg-white p-6 animate-pulse">
        <div className="mb-3 h-5 w-3/4 rounded-md bg-brand-surface" />
        <div className="mb-2 h-4 w-1/2 rounded-md bg-brand-surface" />
        <div className="mt-4 flex gap-3">
            <div className="h-8 flex-1 rounded-lg bg-brand-surface" />
            <div className="h-8 w-20 rounded-lg bg-brand-surface" />
        </div>
    </div>
);

const getSkillCourseRoute = (title?: string) => {
    const normalizedTitle = String(title || '').trim().toLowerCase();

    if (normalizedTitle.includes('scada') || normalizedTitle.includes('hmi')) {
        return '/skill-training/scada';
    }

    if (normalizedTitle.includes('plc')) {
        return '/skill-training/plc';
    }

    if (normalizedTitle.includes('industrial drives') || normalizedTitle.includes('motion')) {
        return '/skill-training/drives';
    }

    if (normalizedTitle.includes('industry 4') || normalizedTitle.includes('advanced automation')) {
        return '/skill-training/industry4';
    }

    if (normalizedTitle.includes('corporate')) {
        return '/skill-training/corporate';
    }

    return '/skill-training';
};

const getTrainerId = (trainer: string | { _id?: string; name?: string } | null | undefined) => {
    if (!trainer) return null;
    return typeof trainer === 'string' ? trainer : trainer._id || null;
};

const getTrainerName = (
    trainer: string | { _id?: string; name?: string } | null | undefined,
    fallback: string = 'Trainer not assigned'
) => {
    if (!trainer) return fallback;
    if (typeof trainer === 'string') return fallback;
    return trainer.name || fallback;
};

const getChatButtonClasses = (hasUnread: boolean) => (
    hasUnread
        ? 'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-red/30 bg-brand-red text-white shadow-sm transition-colors hover:bg-brand-red-hover'
        : 'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red transition-colors hover:bg-brand-red/20'
);



// ============================================================================
// COURSE CARD
// ============================================================================

const CourseCard: React.FC<{ course: any }> = ({ course }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { hasUnreadConversation } = useNotifications();
    const myId = user?._id || (user as any)?.id;
    const trainerId = getTrainerId(course.trainerId);
    const trainerName = getTrainerName(course.trainerId, 'Unknown');
    const hasUnreadChat = Boolean(myId && trainerId && hasUnreadConversation(myId, trainerId));
    const currentPath = `${location.pathname}${location.search}`;

    const handleCardClick = () => {
        navigate(`/language-batch/${course._id}`, {
            state: {
                from: currentPath,
            },
        });
    };
    const handleChatClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!trainerId || !myId) return;
        navigate(`/chat/${myId}?trainerId=${encodeURIComponent(trainerId)}`, {
            state: {
                from: currentPath,
            },
        });
    };

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative rounded-2xl border border-brand-surface bg-white p-6 shadow-sm hover:shadow-xl cursor-pointer overflow-hidden transition-shadow"
            onClick={handleCardClick}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl bg-gradient-to-br from-brand-gold/[0.04] to-transparent" />
            <div className="relative">
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1 mr-2">
                        <div className="mb-1 inline-flex items-center rounded-md bg-brand-gold/10 px-2 py-0.5 text-xs font-semibold text-brand-gold uppercase tracking-wide">
                            Language Course
                        </div>
                        <h3 className="mt-2 text-lg font-bold leading-snug text-brand-black">{course.courseTitle}</h3>
                        <p className="mt-0.5 text-sm text-brand-olive">{course.name}</p>
                        <p className="mt-1 text-xs text-brand-olive-light">Trainer: <span className="text-brand-olive-dark font-medium">{trainerName}</span></p>
                    </div>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-black/5 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-brand-gold" />
                    </div>
                </div>
                <div className="mt-5 flex gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={handleCardClick}
                        className="flex-1 rounded-xl bg-brand-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                    >
                        <BookOpen className="h-4 w-4" />
                        View Materials
                    </button>
                    {trainerId && (
                        <button
                            type="button"
                            onClick={handleChatClick}
                            aria-label={`Chat with ${trainerName}`}
                            title={`Chat with ${trainerName}`}
                            className={getChatButtonClasses(hasUnreadChat)}
                        >
                            {hasUnreadChat && (
                                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-brand-black ring-2 ring-white" />
                            )}
                            <MessageCircle className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const SkillCourseCard: React.FC<{ course: ApprovedSkillCourse }> = ({ course }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { hasUnreadConversation } = useNotifications();
    const myId = user?._id || (user as any)?.id;
    const targetRoute = course.batchId ? `/skill-batch/${course.batchId}` : getSkillCourseRoute(course.title);
    const trainerId = getTrainerId(course.trainerId);
    const trainerName = getTrainerName(course.trainerId);
    const hasUnreadChat = Boolean(myId && trainerId && hasUnreadConversation(myId, trainerId));
    const currentPath = `${location.pathname}${location.search}`;
    const hasImageThumbnail =
        typeof course.thumbnail === 'string'
        && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('/'));

    const handleChatClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!trainerId || !myId) return;
        navigate(`/chat/${myId}?trainerId=${encodeURIComponent(trainerId)}`, {
            state: {
                from: currentPath,
            },
        });
    };

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-brand-surface bg-white p-6 shadow-sm transition-shadow hover:shadow-xl"
            onClick={() => navigate(targetRoute, {
                state: {
                    from: currentPath,
                },
            })}
        >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-gold/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
                <div className="mb-4 flex items-start justify-between">
                    <div className="mr-2 flex-1">
                        <div className="mb-1 inline-flex items-center rounded-md bg-brand-gold/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-gold">
                            Skill Course
                        </div>
                        <h3 className="mt-2 text-lg font-bold leading-snug text-brand-black">{course.title}</h3>
                        <p className="mt-0.5 text-sm text-brand-olive">{course.difficulty || 'Professional Training'}</p>
                        <p className="mt-1 text-xs text-brand-olive-light">Trainer: <span className="font-medium text-brand-olive-dark">{trainerName}</span></p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-black/5">
                        {hasImageThumbnail ? (
                            <img src={getAssetUrl(course.thumbnail!)} alt={course.title} className="h-full w-full object-cover" />
                        ) : (
                            <Cpu className="h-5 w-5 text-brand-gold" />
                        )}
                    </div>
                </div>

                <div className="mt-5 flex gap-3" onClick={(event) => event.stopPropagation()}>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            navigate(targetRoute, {
                                state: {
                                    from: currentPath,
                                },
                            });
                        }}
                        className="flex-1 rounded-xl bg-brand-black px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5"
                    >
                        <BookOpen className="h-4 w-4" />
                        View Materials
                    </button>
                    {trainerId && (
                        <button
                            type="button"
                            onClick={handleChatClick}
                            aria-label={`Chat with ${trainerName}`}
                            title={`Chat with ${trainerName}`}
                            className={getChatButtonClasses(hasUnreadChat)}
                        >
                            {hasUnreadChat && (
                                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-brand-black ring-2 ring-white" />
                            )}
                            <MessageCircle className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// ============================================================================
// PROFILE FIELD ROW
// ============================================================================

const ProfileField: React.FC<{ icon: React.ReactNode; label: string; value?: string | null }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-brand-off-white/80 hover:bg-brand-surface/80 transition-colors">
        <div className="mt-0.5 shrink-0 text-brand-gold">{icon}</div>
        <div className="min-w-0">
            <p className="text-xs font-medium text-brand-olive-light mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-brand-black truncate">{value || <span className="text-brand-olive-light font-normal italic">Not set</span>}</p>
        </div>
    </div>
);

// ============================================================================
// SECTION HEADER
// ============================================================================

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; count?: number }> = ({ icon, title, count }) => (
    <div className="flex items-center gap-2.5 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/10">
            {icon}
        </div>
        <h2 className="text-xl font-bold tracking-tight text-brand-black">{title}</h2>
        {count !== undefined && (
            <span className="ml-1 rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-xs font-bold text-brand-gold">
                {count}
            </span>
        )}
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const StudentDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<any[]>([]);
    const [skillCourses, setSkillCourses] = useState<ApprovedSkillCourse[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [batchesResponse, studentDashboardResponse] = await Promise.all([
                    api.get('/language-trainer/student/batches'),
                    dashboardAPI.getStudentData(),
                ]);
                setCourses(batchesResponse.data);
                setSkillCourses(studentDashboardResponse.courses || []);
            } catch (error) {
                console.error("Failed to fetch student dashboard data", error);
            } finally {
                setCoursesLoading(false);
            }
        };
        if (user) { fetchDashboardData(); }
    }, [user]);

    const showHeaderFooter = Boolean(user && !isInstitutionStudentRole(user.role));
    const institutionBrandingVisible = isInstitutionStudentRole(user?.role)
        && Boolean(user?.institutionName || user?.institutionLogo || user?.institutionTagline);

    return (
        <div className="flex min-h-screen flex-col bg-brand-off-white">
            {showHeaderFooter && <Header />}

            <div className={`flex-1 ${showHeaderFooter ? 'pt-20' : ''}`}>
                <LearnerQuickActions homeTo={getDashboardPathForRole(user?.role)} showFeedbackLink isGeneralPool={showHeaderFooter} />

                <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-brand-black focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold">
                    Skip to content
                </a>

                {/* Hero */}
                <section className="relative overflow-hidden bg-gradient-to-br from-brand-black via-brand-olive-dark to-[#1a365d] py-24 text-center sm:py-32">
                    <HeroBackground />
                    <div className="relative z-10 mx-auto max-w-3xl px-4">
                        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                            {institutionBrandingVisible ? (
                                <div className="mx-auto flex flex-col items-center justify-center">
                                    <div className="mb-6 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-brand-gold/30 bg-white shadow-2xl">
                                        {user?.institutionLogo ? (
                                            <img
                                                src={getAssetUrl(user.institutionLogo)}
                                                alt={user.institutionName || 'Institution logo'}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Building2 className="h-10 w-10 text-brand-gold" />
                                        )}
                                    </div>
                                    <h1 className="mb-3 text-4xl font-bold font-sans text-white md:text-5xl">
                                        {user?.institutionName}
                                    </h1>
                                    <p className="text-lg text-blue-100">
                                        {user?.institutionTagline ? (
                                            <>
                                                {user.institutionTagline} <span className="mx-2 text-brand-gold/50">•</span>
                                            </>
                                        ) : null}
                                        Welcome back, <span className="font-semibold text-brand-gold">{user?.name}</span>!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1.5">
                                        <Layers className="h-3.5 w-3.5 text-brand-gold" />
                                        <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Student Portal</span>
                                    </div>
                                    <h1 className="mb-3 text-4xl font-bold font-sans text-white md:text-5xl">Student Dashboard</h1>
                                    <p className="text-lg text-brand-olive-light">Welcome back, <span className="font-semibold text-brand-gold">{user?.name}</span>!</p>
                                </>
                            )}
                        </motion.div>
                    </div>
                </section>

                <main id="main-content" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-12">

                        {/* ── Profile Sidebar ── */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="lg:col-span-4"
                        >
                            <div className={`rounded-2xl border border-brand-surface bg-white shadow-sm overflow-hidden sticky ${showHeaderFooter ? 'top-26 lg:top-28' : 'top-6'}`}>
                                {/* Profile Header */}
                                <div className="relative bg-gradient-to-br from-brand-black to-brand-olive-dark px-6 pt-8 pb-10">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
                                    <div className="relative flex flex-col items-center text-center">
                                        <div className="h-24 w-24 rounded-full border-4 border-brand-gold/40 overflow-hidden bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold text-3xl mb-4 shadow-lg">
                                            {user?.avatar
                                                ? <img src={getAssetUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                                                : user?.name?.charAt(0).toUpperCase() || 'U'
                                            }
                                        </div>
                                        <h3 className="text-lg font-bold text-white">{user?.name}</h3>
                                        <span className="mt-1 inline-block rounded-full bg-brand-gold/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-brand-gold">
                                            {formatRoleLabel(user?.role)}
                                        </span>
                                        {institutionBrandingVisible && user?.institutionName && (
                                            <p className="mt-3 text-sm font-medium text-blue-100">
                                                {user.institutionName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex border-b border-brand-surface divide-x divide-brand-surface">
                                    <Button
                                        onClick={() => setIsProfileModalOpen(true)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-brand-olive-dark hover:text-brand-gold hover:bg-brand-off-white transition-colors"
                                        title="Edit Profile"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit Profile
                                    </Button>
                                    <button
                                        onClick={() => { logout(); navigate('/login'); }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-brand-red hover:bg-brand-red/5 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>

                                {/* Profile Fields */}
                                <div className="p-5 space-y-2">
                                    <ProfileField icon={<User className="h-4 w-4" />} label="Full Name" value={user?.name} />
                                    <ProfileField icon={<Mail className="h-4 w-4" />} label="Email Address" value={user?.email} />
                                    <ProfileField icon={<Phone className="h-4 w-4" />} label="Phone" value={user?.phoneNumber} />

                                    <ProfileField icon={<CalendarDays className="h-4 w-4" />} label="Date of Birth" value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : null} />
                                    <ProfileField icon={<GraduationCap className="h-4 w-4" />} label="Qualification" value={user?.qualification} />

                                    {(user?.guardianName || user?.guardianPhone) && (
                                        <div className="pt-2">
                                            <p className="text-xs font-bold uppercase tracking-widest text-brand-olive-light mb-2 px-1">Guardian Info</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="rounded-xl bg-brand-off-white/80 p-3">
                                                    <p className="text-xs text-brand-olive-light mb-0.5">Name</p>
                                                    <p className="text-sm font-semibold text-brand-black">{user?.guardianName || '—'}</p>
                                                </div>
                                                <div className="rounded-xl bg-brand-off-white/80 p-3">
                                                    <p className="text-xs text-brand-olive-light mb-0.5">Phone</p>
                                                    <p className="text-sm font-semibold text-brand-black">{user?.guardianPhone || '—'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* ── Main Content ── */}
                        <div className="lg:col-span-8 space-y-10">

                            {/* Enrolled Courses */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.5 }}
                            >
                                <SectionHeader
                                    icon={<BookOpen className="h-4 w-4 text-brand-gold" />}
                                    title="Enrolled Courses"
                                    count={!coursesLoading ? courses.length + skillCourses.length : undefined}
                                />
                                {coursesLoading ? (
                                    <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
                                        {Array.from({ length: 2 }).map((_, i) => <SkeletonCourseCard key={i} />)}
                                    </div>
                                ) : courses.length > 0 || skillCourses.length > 0 ? (
                                    <div className="space-y-8">
                                        {courses.length > 0 && (
                                            <div>
                                                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-brand-olive-light">
                                                    Language Courses
                                                </p>
                                                <motion.div
                                                    variants={containerVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2"
                                                >
                                                    {courses.map((course) => (
                                                        <CourseCard key={course._id} course={course} />
                                                    ))}
                                                </motion.div>
                                            </div>
                                        )}

                                        {skillCourses.length > 0 && (
                                            <div>
                                                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-brand-olive-light">
                                                    Skill Courses
                                                </p>
                                                <motion.div
                                                    variants={containerVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2"
                                                >
                                                    {skillCourses.map((course) => (
                                                        <SkillCourseCard key={course.id} course={course} />
                                                    ))}
                                                </motion.div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="rounded-2xl border-2 border-dashed border-brand-surface bg-white px-6 py-12 text-center"
                                    >
                                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-surface">
                                            <BookOpen className="h-6 w-6 text-brand-gold" />
                                        </div>
                                        <h3 className="text-lg font-bold text-brand-black">No courses enrolled yet</h3>
                                        <p className="mx-auto mt-2 max-w-md text-sm text-brand-olive">
                                            Start learning by enrolling in a language course.
                                        </p>
                                        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                                            <Button
                                                onClick={() => navigate('/language-training')}
                                                className="rounded-xl bg-brand-black px-5 py-3 text-white hover:bg-brand-olive-dark"
                                            >
                                                Enroll to Language Courses
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.section>
                        </div>
                    </div>
                </main>
            </div>

            {showHeaderFooter && <Footer />}

            <ProfileCompletionModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        </div>
    );
};

export default StudentDashboard;
