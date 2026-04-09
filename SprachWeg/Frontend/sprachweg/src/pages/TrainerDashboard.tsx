import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import {
    BookOpen,
    Users,
    Calendar,
    Upload,
    LogOut,
    Layers,
    ChevronRight,
    GraduationCap,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';


// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Batch {
    _id: string;
    courseTitle: string;
    name: string;
    studentCount: number;
    trainingType: 'language' | 'skill';
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
    hidden: { opacity: 0, y: 20 },
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

const SkeletonBatchCard: React.FC = () => (
    <div className="rounded-2xl border border-brand-surface bg-white p-6 animate-pulse">
        <div className="mb-5">
            <div className="mb-2 h-5 w-3/4 rounded-md bg-brand-surface" />
            <div className="h-4 w-1/3 rounded-md bg-brand-surface" />
        </div>
        <div className="space-y-3 mb-6">
            <div className="h-4 w-full rounded-md bg-brand-surface" />
            <div className="h-4 w-2/3 rounded-md bg-brand-surface" />
        </div>
        <div className="h-10 w-full rounded-xl bg-brand-surface" />
    </div>
);

// ============================================================================
// STAT BADGE (Hero inline stat)
// ============================================================================

const HeroStat: React.FC<{ value: string | number; label: string; loading?: boolean }> = ({ value, label, loading }) => (
    <div className="text-center px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <p className="text-3xl font-bold text-brand-gold">{loading ? '—' : value}</p>
        <p className="text-sm text-brand-olive-light mt-0.5">{label}</p>
    </div>
);

// ============================================================================
// BATCH CARD
// ============================================================================

const BatchCard: React.FC<{ batch: Batch; onManage: (batch: Batch) => void }> = ({ batch, onManage }) => (
    <motion.div
        variants={itemVariants}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="group relative flex flex-col rounded-2xl border border-brand-surface bg-white shadow-sm hover:shadow-xl overflow-hidden transition-shadow"
    >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-gold to-brand-gold" />

        <div className="flex flex-col flex-1 p-6">
            {/* Header */}
            <div className="mb-5">
                <div className={`mb-2 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${batch.trainingType === 'skill'
                    ? 'bg-brand-gold/10 text-brand-gold-hover'
                    : 'bg-brand-gold/5 text-brand-red'
                    }`}>
                    {batch.trainingType === 'skill' ? 'Skill Batch' : 'Language Batch'}
                </div>
                <div className="mb-2 inline-flex items-center rounded-md bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-olive-dark">
                    {batch.name}
                </div>
                <h3 className="mt-1.5 text-lg font-bold leading-snug text-brand-black line-clamp-2" title={batch.courseTitle}>
                    {batch.courseTitle}
                </h3>
            </div>

            {/* Stats */}
            <div className="flex-1 mb-5 space-y-2.5">
                <div className="flex items-center gap-2.5 rounded-xl bg-brand-off-white px-3.5 py-2.5">
                    <div className="h-7 w-7 rounded-lg bg-brand-gold/10 flex items-center justify-center shrink-0">
                        <Users className="h-3.5 w-3.5 text-brand-gold" />
                    </div>
                    <div>
                        <p className="text-xs text-brand-olive-light">Enrolled</p>
                        <p className="text-sm font-bold text-brand-black">
                            {batch.studentCount || 0} <span className="font-normal text-brand-olive">students</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-brand-off-white px-3.5 py-2.5">
                    <div className="h-7 w-7 rounded-lg bg-brand-olive/50/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-3.5 w-3.5 text-brand-olive" />
                    </div>
                    <div>
                        <p className="text-xs text-brand-olive-light">Module</p>
                        <p className="text-sm font-bold text-brand-black">Curriculum Active</p>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <button
                onClick={() => onManage(batch)}
                className="group/btn w-full flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-4 py-3 text-sm font-bold text-brand-black hover:bg-brand-gold-hover active:scale-[0.98] transition-all"
            >
                <Upload className="h-4 w-4" />
                Open Batch
                <ChevronRight className="h-4 w-4 ml-auto opacity-50 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
        </div>
    </motion.div>
);

// ============================================================================
// EMPTY STATE
// ============================================================================

const EmptyState: React.FC = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-surface bg-white py-20 px-6 text-center"
    >
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 200 }}
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-surface"
        >
            <GraduationCap className="h-8 w-8 text-brand-olive-light" />
        </motion.div>
        <p className="text-lg font-bold text-brand-olive-dark mb-2">No batches assigned yet</p>
        <p className="text-sm text-brand-olive-light max-w-xs leading-relaxed">
            Batches will appear here once an admin assigns them to your account.
        </p>
    </motion.div>
);



// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TrainerDashboard: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const batchResponse = await api.get('/trainer-batches/mine');

                const normalizedBatches: Batch[] = Array.isArray(batchResponse.data)
                    ? batchResponse.data.map((batch: any) => ({
                        _id: String(batch._id),
                        courseTitle: String(batch.courseTitle || '').trim(),
                        name: String(batch.name || '').trim(),
                        studentCount: Number(batch.studentCount || 0),
                        trainingType: batch.trainingType === 'skill' ? 'skill' : 'language',
                    }))
                    : [];

                setBatches(normalizedBatches);
            } catch (error) {
                console.error("Failed to fetch trainer dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);



    const handleBatchClick = (batch: Batch) => {
        navigate(
            batch.trainingType === 'skill' ? `/language-batch/${batch._id}` : `/language-batch/${batch._id}`,
            {
                state: {
                    from: `${location.pathname}${location.search}`,
                },
            }
        );
    };


    const totalStudents = batches.reduce((acc, batch) => acc + (batch.studentCount || 0), 0);

    return (
        <div className="min-h-screen bg-brand-off-white flex flex-col">
            <Header />

            {/* Hero */}
            <section className="relative bg-gradient-to-br from-brand-black via-brand-olive-dark to-[#1a365d] overflow-hidden py-24 sm:py-32 text-center">
                <HeroBackground />
                <div className="relative z-10 max-w-3xl mx-auto px-4">
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1.5 mb-5">
                            <Layers className="h-3.5 w-3.5 text-brand-gold" />
                            <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Trainer Portal</span>
                        </div>
                        <h1 className="mb-3 text-4xl font-bold font-sans md:text-5xl text-white">Trainer Dashboard</h1>
                        <p className="text-lg text-brand-olive-light mb-10">Manage your ongoing language and skill batches from one place.</p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <HeroStat value={batches.length} label="Active Batches" loading={loading} />
                            <HeroStat value={totalStudents} label="Total Students" loading={loading} />
                        </div>
                    </motion.div>
                </div>
            </section>

            <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Section Header Row */}
                <div className="flex items-center justify-between mb-7">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold/10">
                            <BookOpen className="h-5 w-5 text-brand-gold" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-brand-black">My Batches</h2>
                            {!loading && (
                                <p className="text-xs text-brand-olive-light mt-0.5">{batches.length} batch{batches.length !== 1 ? 'es' : ''} assigned</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-red bg-brand-red/5 hover:bg-brand-red/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>



                {/* Batch Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="skeleton"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {Array.from({ length: 3 }).map((_, i) => <SkeletonBatchCard key={i} />)}
                        </motion.div>
                    ) : batches.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <EmptyState />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {batches.map((batch) => (
                                <BatchCard key={`${batch.trainingType}-${batch._id}`} batch={batch} onManage={handleBatchClick} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
};

export default TrainerDashboard;
