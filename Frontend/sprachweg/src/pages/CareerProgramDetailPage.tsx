import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    BadgeCheck,
    BriefcaseBusiness,
    Clock3,
    FileText,
    Globe2,
    ShieldCheck,
    Stethoscope,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { careerProgramsAPI } from '../lib/api';
import {
    formatCareerSalaryRange,
    getOrderedCareerSteps,
    getOrderedCareerTimelines,
    type CareerProgram,
} from '../types/careerProgram';

const sectionCardClassName = 'rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur';

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f6f4ef]">
                <Header />
                <main className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
                    <div className="flex min-h-[50vh] items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
                            <p className="mt-4 text-sm font-medium text-brand-olive-dark">Loading career program</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className="min-h-screen bg-[#f6f4ef]">
                <Header />
                <main className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
                    <div className="rounded-[32px] border border-brand-red/20 bg-white p-10 text-center shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-red">Career Program</p>
                        <h1 className="mt-4 text-3xl font-bold text-brand-black">Not available</h1>
                        <p className="mt-3 text-brand-olive-dark">{error || 'This career program could not be found.'}</p>
                        <Link
                            to="/careers"
                            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-olive-dark"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Careers
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const orderedSteps = getOrderedCareerSteps(program.processSteps);
    const orderedTimelines = getOrderedCareerTimelines(program.timelines);

    return (
        <div className="min-h-screen bg-[#f6f4ef]">
            <Header />

            <main className="pb-20">
                <section className="relative overflow-hidden bg-gradient-to-br from-brand-black via-brand-olive-dark to-[#1b3b52] pt-28 pb-20 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,177,97,0.18),transparent_38%),radial-gradient(circle_at_left,rgba(255,255,255,0.06),transparent_28%)]" />
                    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                        <Link
                            to="/careers"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-brand-gold/40 hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Careers
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45 }}
                            className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]"
                        >
                            <div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1.5 text-sm font-semibold text-brand-gold">
                                        <Stethoscope className="h-4 w-4" />
                                        Healthcare Career Abroad
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-white/80">
                                        <Globe2 className="h-4 w-4" />
                                        {program.country}
                                    </span>
                                </div>

                                <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl">
                                    {program.title}
                                </h1>
                                <p className="mt-5 max-w-3xl text-base leading-7 text-brand-olive-light sm:text-lg">
                                    {program.overview}
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    {program.eligibleProfiles.map((profile) => (
                                        <span
                                            key={profile}
                                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90"
                                        >
                                            {profile}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-gold">Salary Snapshot</p>
                                <div className="mt-6 space-y-4">
                                    <div className="rounded-2xl bg-white/10 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-olive-light">During Adaptation</p>
                                        <p className="mt-2 text-lg font-bold text-white">{formatCareerSalaryRange(program.salary.adaptation)}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-olive-light">After Recognition</p>
                                        <p className="mt-2 text-lg font-bold text-white">{formatCareerSalaryRange(program.salary.fullRecognition)}</p>
                                    </div>
                                    <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/10 p-4 text-brand-black">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6f2c]">Apply</p>
                                        <button
                                            type="button"
                                            disabled
                                            className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-brand-black/85 px-5 py-3 text-sm font-semibold text-white opacity-80"
                                        >
                                            <BriefcaseBusiness className="h-4 w-4" />
                                            Apply Now
                                        </button>
                                        <p className="mt-3 text-sm leading-6 text-brand-black/80">
                                            {program.ctaDescription}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className={sectionCardClassName}>
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-brand-gold/10 p-3 text-brand-gold-hover">
                                    <BadgeCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-gold-hover">Why Choose This Program</p>
                                    <h2 className="text-2xl font-bold text-brand-black">What makes this pathway strong</h2>
                                </div>
                            </div>
                            <ul className="mt-6 space-y-3">
                                {program.whyChoose.map((point) => (
                                    <li key={point} className="flex gap-3 rounded-2xl bg-brand-off-white/80 p-4 text-sm text-brand-olive-dark">
                                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-gold" />
                                        <span className="leading-6">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={sectionCardClassName}>
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-brand-gold/10 p-3 text-brand-gold-hover">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-gold-hover">Benefits</p>
                                    <h2 className="text-2xl font-bold text-brand-black">Additional support included</h2>
                                </div>
                            </div>
                            <ul className="mt-6 grid gap-3">
                                {program.salary.additionalBenefits.map((benefit) => (
                                    <li key={benefit} className="rounded-2xl bg-brand-off-white/80 p-4 text-sm leading-6 text-brand-olive-dark">
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className={sectionCardClassName}>
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-brand-gold/10 p-3 text-brand-gold-hover">
                                    <Clock3 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-gold-hover">Step By Step</p>
                                    <h2 className="text-2xl font-bold text-brand-black">Complete process</h2>
                                </div>
                            </div>

                            <div className="mt-6 space-y-5">
                                {orderedSteps.map((step) => (
                                    <div key={`${step.order}-${step.title}`} className="rounded-3xl border border-brand-surface bg-brand-off-white/70 p-5">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-black text-sm font-bold text-brand-gold">
                                                {step.order}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-brand-black">{step.title}</h3>
                                                <ul className="mt-3 space-y-2">
                                                    {step.points.map((point) => (
                                                        <li key={point} className="flex gap-3 text-sm leading-6 text-brand-olive-dark">
                                                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-gold" />
                                                            <span>{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className={sectionCardClassName}>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-brand-gold/10 p-3 text-brand-gold-hover">
                                        <Globe2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-gold-hover">Timelines</p>
                                        <h2 className="text-2xl font-bold text-brand-black">Placement pathways</h2>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    {orderedTimelines.map((timeline) => (
                                        <div key={`${timeline.order}-${timeline.title}`} className="rounded-3xl border border-brand-surface bg-brand-off-white/70 p-5">
                                            <h3 className="text-lg font-bold text-brand-black">{timeline.title}</h3>
                                            {timeline.intro && (
                                                <p className="mt-2 text-sm leading-6 text-brand-olive-dark">{timeline.intro}</p>
                                            )}
                                            <div className="mt-4 space-y-3">
                                                {timeline.phases.map((phase) => (
                                                    <div key={`${phase.label}-${phase.durationLabel}`} className="flex items-start justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                                                        <p className="text-sm font-medium text-brand-black">{phase.label}</p>
                                                        <p className="text-sm font-semibold text-brand-gold-hover">{phase.durationLabel}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 rounded-2xl bg-brand-black px-4 py-3 text-white">
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">Total Duration</p>
                                                <p className="mt-1 text-lg font-bold">{timeline.totalDurationLabel}</p>
                                            </div>
                                            {timeline.note && (
                                                <p className="mt-4 text-sm leading-6 text-brand-olive-dark">{timeline.note}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={sectionCardClassName}>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-brand-gold/10 p-3 text-brand-gold-hover">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-gold-hover">Documents</p>
                                        <h2 className="text-2xl font-bold text-brand-black">Required paperwork</h2>
                                    </div>
                                </div>

                                <ul className="mt-6 grid gap-3">
                                    {program.documentsRequired.map((document) => (
                                        <li key={document} className="rounded-2xl border border-brand-surface bg-brand-off-white/70 px-4 py-3 text-sm leading-6 text-brand-olive-dark">
                                            {document}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default CareerProgramDetailPage;
