import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type Easing } from 'framer-motion';
import { ArrowRight, BriefcaseBusiness, MapPin, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { careerProgramsAPI, getAssetUrl } from '../lib/api';
import {
    formatCareerSalaryRange,
    getPrimaryCareerTimeline,
    type CareerProgram,
} from '../types/careerProgram';


const DEFAULT_CARD_IMAGE = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1400&auto=format&fit=crop';

const easeOut: Easing = [0.0, 0.0, 0.2, 1];

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1
        }
    }
};

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
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand-gold/20 to-brand-black/10 blur-[120px]"
            />
            <motion.div
                style={{ y: y2 }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[100px]"
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </motion.div>
    );
};

const CareersPage: React.FC = () => {
    const [programs, setPrograms] = useState<CareerProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchPrograms = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await careerProgramsAPI.getAll();

                if (!isMounted) return;
                setPrograms(response.programs || []);
            } catch (err: any) {
                console.error('Failed to fetch career programs:', err);
                if (!isMounted) return;
                setError(err.response?.data?.message || 'Failed to load career programs right now.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPrograms();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-brand-off-white flex flex-col font-sans text-brand-olive-dark">
            <Header />

            <section className="relative py-28 sm:py-36 overflow-hidden bg-brand-black text-brand-white border-b-[8px] border-brand-red">
                <HeroBackground />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="flex flex-col items-center text-center"
                    >
                        <motion.div variants={fadeInUp} className="mb-8 flex justify-center">
                            <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-4 py-1.5 text-sm font-semibold text-brand-gold backdrop-blur-sm">
                                <BriefcaseBusiness className="h-4 w-4" />
                                Global Career Programs
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="font-display mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
                        >
                            International pathways,<br className="hidden sm:inline" />
                            <span className="text-brand-red">built for success.</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="mb-10 max-w-2xl text-lg leading-relaxed text-brand-off-white sm:text-xl"
                        >
                            Explore career programs with eligibility guidance, salary expectations, step-by-step process clarity, and end-to-end relocation support.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4 text-sm font-medium text-brand-white">
                            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/20 hover:border-brand-gold transition-colors">
                                <Shield className="h-5 w-5 text-brand-gold" />
                                <span>Relocation Support</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/20 hover:border-brand-red transition-colors">
                                <Zap className="h-5 w-5 text-brand-red" />
                                <span>Career Guidance</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold text-brand-black">Available Programs</h2>
                    <div className="mx-auto mt-4 h-1 w-20 rounded bg-brand-gold" />
                </div>

                {loading ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="overflow-hidden rounded-[24px] border border-brand-surface bg-white shadow-sm">
                                <div className="h-48 animate-pulse bg-brand-surface/60" />
                                <div className="p-6">
                                    <div className="h-6 w-3/4 animate-pulse rounded-full bg-brand-surface" />
                                    <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-brand-surface" />
                                    <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-brand-surface" />
                                    <div className="mt-6 grid grid-cols-2 gap-3">
                                        <div className="h-16 animate-pulse rounded-xl bg-brand-surface" />
                                        <div className="h-16 animate-pulse rounded-xl bg-brand-surface" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="mx-auto max-w-2xl rounded-2xl border border-brand-red/20 bg-brand-red/5 px-6 py-12 text-center text-brand-red shadow-sm">
                        <p className="font-medium">{error}</p>
                    </div>
                ) : programs.length === 0 ? (
                    <div className="mx-auto max-w-2xl rounded-2xl border border-brand-surface bg-white px-6 py-16 text-center shadow-sm">
                        <BriefcaseBusiness className="mx-auto h-12 w-12 text-brand-olive-light" />
                        <h3 className="mt-4 text-lg font-bold text-brand-black">No Programs Available</h3>
                        <p className="mt-2 text-brand-olive">We are currently updating our career catalog. Please check back later.</p>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {programs.map((program, index) => {
                            const primaryTimeline = getPrimaryCareerTimeline(program);
                            const cardImage = getAssetUrl(program.cardImage || DEFAULT_CARD_IMAGE);

                            return (
                                <motion.article
                                    key={program._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    className="group flex flex-col overflow-hidden rounded-[28px] border border-brand-surface bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-[0_12px_40px_-12px_rgba(232,160,32,0.25)]"
                                >
                                    <div className="relative h-56 w-full overflow-hidden bg-brand-black">
                                        <img 
                                            src={cardImage} 
                                            alt={program.country}
                                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent" />
                                        
                                        <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-brand-black/60 px-3 py-1.5 text-xs font-bold tracking-wide text-white backdrop-blur-md border border-white/20">
                                            <MapPin className="h-3.5 w-3.5 text-brand-gold" />
                                            {program.country}
                                        </div>
                                        
                                        <h2 className="absolute bottom-4 left-6 right-6 text-2xl font-bold leading-tight text-white drop-shadow-md">
                                            {program.title}
                                        </h2>
                                    </div>

                                    <div className="flex flex-1 flex-col p-6">
                                        <p className="text-sm leading-relaxed text-brand-olive-dark">
                                            {program.shortDescription}
                                        </p>

                                        <div className="mt-6 flex flex-wrap gap-2">
                                            {program.eligibleProfiles.slice(0, 2).map((profile) => (
                                                <span key={profile} className="rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-olive-dark">
                                                    {profile}
                                                </span>
                                            ))}
                                            {program.tags.slice(0, 2).map((tag) => (
                                                <span key={tag} className="rounded-full bg-brand-gold/10 px-3 py-1 text-xs font-semibold text-brand-gold-hover">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-6 grid grid-cols-2 gap-3">
                                            <div className="rounded-2xl border border-brand-surface bg-brand-off-white px-4 py-3">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-olive">Est. Salary</p>
                                                <p className="mt-1 text-sm font-bold text-brand-black truncate">
                                                    {formatCareerSalaryRange(program.salary.fullRecognition).split('per')[0]}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-brand-surface bg-brand-off-white px-4 py-3">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-olive">Duration</p>
                                                <p className="mt-1 text-sm font-bold text-brand-black truncate">
                                                    {primaryTimeline?.totalDurationLabel || 'View Details'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6">
                                            <Link
                                                to={`/careers/${program.slug}`}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-black px-5 py-3.5 text-sm font-bold text-white transition-colors group-hover:bg-brand-gold group-hover:text-brand-black"
                                            >
                                                Explore Program
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default CareersPage;
