import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BriefcaseBusiness, Clock3, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { careerProgramsAPI } from '../lib/api';
import {
    formatCareerSalaryRange,
    getPrimaryCareerTimeline,
    type CareerProgram,
} from '../types/careerProgram';

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
        <div className="min-h-screen bg-[#f6f4ef] flex flex-col">
            <Header />

            <section className="relative overflow-hidden bg-gradient-to-br from-brand-black via-brand-olive-dark to-[#1b3b52] py-28 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,177,97,0.2),transparent_36%),radial-gradient(circle_at_left,rgba(255,255,255,0.06),transparent_24%)]" />
                <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="mx-auto max-w-4xl"
                    >
                        <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1.5 text-sm font-semibold text-brand-gold">
                            <BriefcaseBusiness className="h-4 w-4" />
                            Global Career Programs
                        </span>
                        <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
                            Structured international pathways,
                            <span className="block bg-gradient-to-r from-brand-gold to-[#f3d58d] bg-clip-text text-transparent">
                                not generic job posts
                            </span>
                        </h1>
                        <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-brand-olive-light sm:text-lg">
                            Explore career programs with eligibility guidance, salary expectations, process clarity, and end-to-end support from preparation to relocation.
                        </p>
                    </motion.div>
                </div>
            </section>

            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <div key={index} className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-sm">
                                <div className="h-5 w-40 animate-pulse rounded-full bg-brand-surface" />
                                <div className="mt-4 h-10 w-3/4 animate-pulse rounded-2xl bg-brand-surface" />
                                <div className="mt-4 h-20 animate-pulse rounded-2xl bg-brand-surface" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="rounded-[28px] border border-brand-red/20 bg-brand-red/5 px-6 py-12 text-center text-brand-red shadow-sm">
                        {error}
                    </div>
                ) : programs.length === 0 ? (
                    <div className="rounded-[28px] border border-brand-surface bg-white px-6 py-12 text-center text-brand-olive-dark shadow-sm">
                        No career programs are published yet. Check back later.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {programs.map((program, index) => {
                            const primaryTimeline = getPrimaryCareerTimeline(program);

                            return (
                                <motion.article
                                    key={program._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: index * 0.06 }}
                                    className="group flex flex-col rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-[0_0_40px_-12px_rgba(214,177,97,0.22)]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-black text-brand-gold">
                                            <Stethoscope className="h-5 w-5" />
                                        </div>
                                        <span className="rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6f2c]">
                                            {program.country}
                                        </span>
                                    </div>

                                    <h2 className="mt-5 text-2xl font-bold leading-tight text-brand-black">
                                        {program.title}
                                    </h2>
                                    <p className="mt-4 text-sm leading-7 text-brand-olive-dark">
                                        {program.shortDescription}
                                    </p>

                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl bg-brand-off-white px-4 py-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-olive">Salary</p>
                                            <p className="mt-1 text-sm font-bold text-brand-black">
                                                {formatCareerSalaryRange(program.salary.fullRecognition)}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl bg-brand-off-white px-4 py-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-olive">Fastest Path</p>
                                            <p className="mt-1 text-sm font-bold text-brand-black">
                                                {primaryTimeline?.totalDurationLabel || 'Timeline available on detail page'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {program.eligibleProfiles.map((profile) => (
                                            <span key={profile} className="rounded-full border border-brand-surface px-3 py-1 text-xs font-medium text-brand-olive-dark">
                                                {profile}
                                            </span>
                                        ))}
                                        {program.tags.slice(0, 3).map((tag) => (
                                            <span key={tag} className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-3 py-1 text-xs font-semibold text-[#8b6f2c]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {primaryTimeline && (
                                        <div className="mt-5 rounded-2xl border border-brand-surface bg-white px-4 py-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-brand-black">
                                                <Clock3 className="h-4 w-4 text-brand-gold-hover" />
                                                {primaryTimeline.title}
                                            </div>
                                            {primaryTimeline.intro && (
                                                <p className="mt-2 text-sm leading-6 text-brand-olive-dark">{primaryTimeline.intro}</p>
                                            )}
                                        </div>
                                    )}

                                    <Link
                                        to={`/careers/${program.slug}`}
                                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-olive-dark"
                                    >
                                        Explore Program
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
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
