import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import {
    ArrowRight,
    ArrowLeft,
    BadgeCheck,
    BriefcaseBusiness,
    Clock3,
    FileText,
    Globe2,
    MapPin,
    ShieldCheck,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { careerProgramsAPI, getAssetUrl } from '../lib/api';
import {
    formatCareerSalaryRange,
    getOrderedCareerSteps,
    getOrderedCareerTimelines,
    type CareerProgram,
} from '../types/careerProgram';

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================

const EASE_OUT = [0.0, 0.0, 0.2, 1] as const;

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
};

// Viewport-triggered section wrapper for scroll animations
const AnimatedSection: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            ref={ref}
            initial={shouldReduceMotion ? false : 'hidden'}
            animate={isInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// ============================================================================
// CONSTANTS
// ============================================================================

const sectionCardClassName = 'overflow-hidden rounded-[32px] border border-brand-surface bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]';
const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1516549655134-f62dce69a1e0?q=80&w=2600&auto=format&fit=crop';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CareerProgramDetailPage: React.FC = () => {
    const { slug = '' } = useParams();
    const [program, setProgram] = useState<CareerProgram | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchProgram = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await careerProgramsAPI.getBySlug(slug);

                if (!isMounted) return;
                setProgram(response.program || null);
            } catch (err: any) {
                console.error('Failed to fetch career program:', err);
                if (!isMounted) return;
                setProgram(null);
                setError(err.response?.data?.message || 'This career program is not available right now.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProgram();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    // Scroll to top on mount for clean page entry
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    // ── Loading State ────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-brand-off-white">
                <Header />
                {/* Skeleton Hero */}
                <div className="relative bg-brand-black pt-24 pb-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="h-8 w-32 animate-pulse rounded-full bg-white/10 mb-6" />
                        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                            <div>
                                <div className="flex gap-2 mb-8">
                                    <div className="h-8 w-36 animate-pulse rounded-full bg-white/10" />
                                    <div className="h-8 w-28 animate-pulse rounded-full bg-white/10" />
                                </div>
                                <div className="h-12 w-3/4 animate-pulse rounded-xl bg-white/10 mb-4" />
                                <div className="h-12 w-1/2 animate-pulse rounded-xl bg-white/10 mb-6" />
                                <div className="h-6 w-full animate-pulse rounded-lg bg-white/10 mb-2" />
                                <div className="h-6 w-2/3 animate-pulse rounded-lg bg-white/10" />
                            </div>
                            <div className="rounded-[32px] bg-white/5 border border-white/10 p-8 space-y-4">
                                <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
                                <div className="h-20 animate-pulse rounded-2xl bg-white/10" />
                                <div className="h-20 animate-pulse rounded-2xl bg-white/10" />
                                <div className="h-14 animate-pulse rounded-2xl bg-white/10 mt-4" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Skeleton Content */}
                <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div className="rounded-[32px] bg-white border border-brand-surface p-8">
                            <div className="h-6 w-48 animate-pulse rounded bg-brand-surface mb-6" />
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-16 animate-pulse rounded-2xl bg-brand-surface/60" />
                                ))}
                            </div>
                        </div>
                        <div className="rounded-[32px] bg-white border border-brand-surface p-8">
                            <div className="h-6 w-40 animate-pulse rounded bg-brand-surface mb-6" />
                            <div className="flex flex-wrap gap-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-12 w-36 animate-pulse rounded-2xl bg-brand-surface/60" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // ── Error / Not Found State ──────────────────────────────────────────
    if (error || !program) {
        return (
            <div className="min-h-screen bg-brand-off-white">
                <Header />
                <main className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
                    <div className="rounded-[32px] border border-brand-red/20 bg-white p-12 text-center shadow-lg">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-red">Career program not found</p>
                        <h1 className="mt-6 text-3xl font-extrabold text-brand-black">We couldn't load this pathway</h1>
                        <p className="mt-4 text-brand-olive-dark">{error || 'This career program could not be found or has been removed.'}</p>
                        <Link
                            to="/careers"
                            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-red px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-brand-red-hover focus-visible:ring-2 focus-visible:ring-brand-gold"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to all careers
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const orderedSteps = getOrderedCareerSteps(program.processSteps);
    const orderedTimelines = getOrderedCareerTimelines(program.timelines);
    const heroImage = getAssetUrl(program.heroImage || DEFAULT_HERO_IMAGE);

    return (
        <div className="min-h-screen bg-brand-off-white font-sans text-brand-olive-dark">
            <Header />

            <main className="pb-24">
                {/* ── Immersive Hero Section ── */}
                <section className="relative flex min-h-[70vh] items-end pt-24 pb-16 lg:pt-32 lg:pb-24">
                    {/* Hero Background Image */}
                    <div className="absolute inset-0">
                        <img 
                            src={heroImage} 
                            alt={program.title} 
                            className="h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/60 to-brand-black/20" />
                    </div>

                    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Back Button */}
                        <div className="mb-6">
                            <Link
                                to="/careers"
                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-brand-red hover:text-white focus-visible:ring-2 focus-visible:ring-brand-gold"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to programs
                            </Link>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1.2fr_0.8fr] lg:gap-16">
                            {/* Left Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-brand-black shadow-lg">
                                        <BriefcaseBusiness className="h-3 w-3" />
                                        Career program
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-white shadow-lg">
                                        <MapPin className="h-3 w-3 text-brand-gold" />
                                        {program.country}
                                    </span>
                                </div>

                                <h1 className="mt-8 max-w-4xl text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-white drop-shadow-lg">
                                    {program.title}
                                </h1>
                                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#eaeae4] drop-shadow-md">
                                    {program.overview}
                                </p>

                                <div className="mt-10 flex flex-wrap gap-3">
                                    {program.eligibleProfiles.map((profile) => (
                                        <span
                                            key={profile}
                                            className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
                                        >
                                            {profile}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Right Floating Salary Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="relative rounded-[32px] border border-white/20 bg-[#161615]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl lg:sticky lg:top-28 self-start"
                            >
                                {/* Subtle Euro Watermark */}
                                <div className="pointer-events-none absolute -right-10 -top-6 text-[180px] font-bold text-white/5 select-none" aria-hidden="true">
                                    €
                                </div>
                                <div className="relative">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Salary snapshot</p>
                                    <div className="mt-8 space-y-4">
                                        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#a8a89f]">During adaptation</p>
                                            <p className="mt-2 text-xl font-extrabold text-white">{formatCareerSalaryRange(program.salary.adaptation)}</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#a8a89f]">After recognition</p>
                                            <p className="mt-2 text-xl font-extrabold text-brand-gold">{formatCareerSalaryRange(program.salary.fullRecognition)}</p>
                                        </div>
                                        
                                        <div className="pt-6">
                                            <button
                                                type="button"
                                                disabled
                                                className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-brand-black opacity-90 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-transform"
                                            >
                                                <BriefcaseBusiness className="h-4 w-4" />
                                                Apply for program
                                            </button>
                                            <p className="mt-4 text-center text-xs font-medium leading-relaxed text-[#a8a89f]">
                                                {program.ctaDescription}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── Main Content Grid ── */}
                <section className="mx-auto relative z-10 max-w-7xl px-4 pt-12 sm:pt-20 sm:px-6 lg:px-8">
                    <AnimatedSection className="grid gap-8 lg:grid-cols-2">
                        {/* Why Choose */}
                        <motion.div variants={fadeInUp} className={sectionCardClassName}>
                            <div className="flex items-center gap-4 border-b border-brand-surface pb-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-black text-brand-gold">
                                    <BadgeCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-olive">Advantage</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-brand-black">Why choose this program</h2>
                                </div>
                            </div>
                            <ul className="mt-8 space-y-4">
                                {program.whyChoose.map((point) => (
                                    <li key={point} className="flex gap-4 rounded-2xl bg-brand-off-white/80 p-4 sm:p-5 transition-colors hover:bg-brand-gold/5 border border-transparent hover:border-brand-gold/20">
                                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-black">
                                            <ArrowRight className="h-3 w-3" />
                                        </div>
                                        <span className="text-sm leading-relaxed text-brand-olive-dark font-medium">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Benefits */}
                        <motion.div variants={fadeInUp} className={sectionCardClassName}>
                            <div className="flex items-center gap-4 border-b border-brand-surface pb-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-black text-brand-gold">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-olive">Included</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-brand-black">Additional benefits</h2>
                                </div>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-3">
                                {program.salary.additionalBenefits.map((benefit) => (
                                    <div key={benefit} className="inline-flex w-full sm:w-auto items-center gap-3 rounded-2xl border border-brand-surface bg-brand-off-white px-5 py-4 shadow-sm">
                                        <div className="h-2 w-2 rounded-full bg-brand-gold" />
                                        <span className="text-sm font-semibold text-brand-black">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatedSection>

                    <AnimatedSection className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
                        {/* Process Steps */}
                        <motion.div variants={fadeInUp} className={sectionCardClassName}>
                            <div className="flex items-center gap-4 border-b border-brand-surface pb-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-black text-brand-gold">
                                    <Clock3 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-olive">Roadmap</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-brand-black">Step-by-step process</h2>
                                </div>
                            </div>

                            <div className="mt-10 relative">
                                {/* Vertical connector line */}
                                <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-brand-surface" aria-hidden="true" />
                                
                                <div className="space-y-10">
                                    {orderedSteps.map((step) => (
                                        <div key={`${step.order}-${step.title}`} className="relative flex items-start gap-4 sm:gap-6">
                                            <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[4px] border-white bg-brand-black text-base font-extrabold text-brand-gold shadow-md">
                                                {step.order}
                                            </div>
                                            <div className="flex-1 rounded-3xl border border-brand-surface bg-brand-off-white p-5 sm:p-6 shadow-sm transition-all hover:border-brand-gold/30 hover:shadow-md">
                                                <h3 className="text-lg font-extrabold text-brand-black">{step.title}</h3>
                                                <ul className="mt-4 space-y-3">
                                                    {step.points.map((point) => (
                                                        <li key={point} className="flex gap-3 text-sm leading-relaxed text-brand-olive-dark">
                                                            <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-olive/40" />
                                                            <span>{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Timelines & Documents — Sticky sidebar */}
                        <div className="space-y-8 lg:sticky lg:top-28 self-start">
                            <AnimatedSection>
                                <motion.div variants={fadeInUp} className={sectionCardClassName}>
                                    <div className="flex items-center gap-4 border-b border-brand-surface pb-6">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-black text-brand-gold">
                                            <Globe2 className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-olive">Pathways</p>
                                            <h2 className="text-xl sm:text-2xl font-bold text-brand-black">Timelines</h2>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-6">
                                        {orderedTimelines.map((timeline) => (
                                            <div key={`${timeline.order}-${timeline.title}`} className="rounded-3xl border border-brand-surface bg-brand-off-white/50 p-5 sm:p-6">
                                                <h3 className="text-lg font-bold text-brand-black">{timeline.title}</h3>
                                                {timeline.intro && (
                                                    <p className="mt-2 text-sm leading-relaxed text-brand-olive-dark">{timeline.intro}</p>
                                                )}
                                                
                                                <div className="mt-6 space-y-2">
                                                    {timeline.phases.map((phase) => (
                                                        <div key={`${phase.label}-${phase.durationLabel}`} className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 shadow-sm border border-brand-surface/50">
                                                            <p className="text-sm font-semibold text-brand-black">{phase.label}</p>
                                                            <p className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-brand-gold-hover bg-brand-gold/10 px-2 py-1 rounded-md">{phase.durationLabel}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <div className="mt-6 flex items-center justify-between rounded-xl bg-brand-black px-5 py-4 text-white shadow-lg">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#a8a89f]">Total duration</p>
                                                    <p className="text-lg font-extrabold text-brand-gold">{timeline.totalDurationLabel}</p>
                                                </div>
                                                
                                                {timeline.note && (
                                                    <p className="mt-4 text-xs font-medium leading-relaxed text-brand-olive italic">
                                                        * {timeline.note}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatedSection>

                            <AnimatedSection>
                                <motion.div variants={fadeInUp} className={sectionCardClassName}>
                                    <div className="flex items-center gap-4 border-b border-brand-surface pb-6">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-black text-brand-gold">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-olive">Required</p>
                                            <h2 className="text-xl sm:text-2xl font-bold text-brand-black">Documents</h2>
                                        </div>
                                    </div>

                                    <ul className="mt-8 space-y-3">
                                        {program.documentsRequired.map((document) => (
                                            <li key={document} className="flex items-center gap-3 rounded-xl border border-brand-surface bg-brand-off-white px-5 py-3.5 shadow-sm">
                                                <div className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                                                <span className="text-sm font-semibold text-brand-black">{document}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </AnimatedSection>
                        </div>
                    </AnimatedSection>
                </section>
            </main>

            {/* ── Mobile Sticky Apply Bar ── */}
            <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-brand-surface bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-brand-olive truncate">After recognition</p>
                        <p className="text-sm font-extrabold text-brand-black truncate">
                            {formatCareerSalaryRange(program.salary.fullRecognition)}
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled
                        className="shrink-0 cursor-not-allowed rounded-xl bg-brand-black px-5 py-3 text-sm font-bold text-white opacity-90"
                    >
                        Apply for program
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CareerProgramDetailPage;
