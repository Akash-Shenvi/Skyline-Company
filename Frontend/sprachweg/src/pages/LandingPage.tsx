import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion, useInView } from 'framer-motion';
import {
    Star,
    Play,
    GraduationCap,
    ArrowRight,
    Award,
    Sparkles,
    Languages,
    Briefcase,
    Users,
    BookOpen,
    Globe,
    CheckCircle,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Header, Footer } from '../components/layout';
import UnifiedBookingForm from '../components/ui/UnifiedBookingForm';
import { formatTrainingPrice } from '../lib/trainingPricing';

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================

const EASE_OUT = [0.0, 0.0, 0.2, 1] as const;

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

const fadeInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

const fadeInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
};


// ============================================================================
// VIEWPORT-TRIGGERED SECTION WRAPPER
// ============================================================================

const AnimatedSection: React.FC<{
    children: React.ReactNode;
    className?: string;
    id?: string;
}> = ({ children, className = '', id }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.15 });
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.section
            ref={ref}
            id={id}
            initial={shouldReduceMotion ? false : 'hidden'}
            animate={isInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className={className}
        >
            {children}
        </motion.section>
    );
};

// ============================================================================
// HERO PARALLAX BACKGROUND
// ============================================================================

const HeroBackground: React.FC = () => {
    const shouldReduceMotion = useReducedMotion();
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 600], [0, shouldReduceMotion ? 0 : 200]);
    const y2 = useTransform(scrollY, [0, 600], [0, shouldReduceMotion ? 0 : -150]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);

    return (
        <motion.div
            style={{ opacity }}
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
            aria-hidden="true"
        >
            {/* Top-right warm glow */}
            <motion.div
                style={{ y: y1 }}
                animate={shouldReduceMotion ? {} : {
                    scale: [1, 1.15, 1],
                    opacity: [0.25, 0.45, 0.25],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-[15%] -right-[10%] h-[700px] w-[700px] rounded-full bg-gradient-to-br from-brand-gold/20 to-brand-red/8 blur-[140px]"
            />
            {/* Bottom-left cool glow */}
            <motion.div
                style={{ y: y2 }}
                animate={shouldReduceMotion ? {} : {
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.35, 0.15],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute top-[30%] -left-[15%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-brand-red/10 to-brand-gold/5 blur-[120px]"
            />
            {/* Subtle grain texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] brightness-100 contrast-150 mix-blend-overlay" />
            {/* Bottom fade for seamless section transition */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-brand-black to-transparent" />
        </motion.div>
    );
};

// ============================================================================
// STAR RATING COMPONENT
// ============================================================================

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                className={`w-4 h-4 ${star <= Math.floor(rating)
                        ? 'fill-brand-gold text-brand-gold'
                        : star <= rating
                            ? 'fill-brand-gold/50 text-brand-gold'
                            : 'fill-brand-surface text-brand-surface'
                    }`}
            />
        ))}
    </div>
);


// ============================================================================
// LANGUAGE COURSE TYPES & CARD
// ============================================================================

interface LanguageCourseStatic {
    _id: string;
    title: string;
    students: string;
    courses: number;
    reviews: string;
    levels: string[];
    price: string;
    image: string;
    rating: number;
    link: string;
    bgColor: string;
    borderColor: string;
}

const LanguageCard: React.FC<{ course: LanguageCourseStatic }> = ({ course }) => (
    <motion.div
        variants={fadeInUp}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        className={`relative rounded-2xl border-2 ${course.borderColor} ${course.bgColor} shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden group cursor-default`}
    >
        {/* Image */}
        <div className="h-48 relative overflow-hidden bg-brand-surface">
            <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
            />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
            <h3 className="text-xl font-sans font-bold text-center text-brand-black mb-5 line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
                {course.title}
            </h3>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 text-sm text-brand-olive-dark mb-4">
                <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-olive" />
                    <span className="font-medium">{course.students} students</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-brand-olive" />
                    <span className="font-medium">{course.courses} courses</span>
                </div>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center gap-2 mb-5">
                <StarRating rating={course.rating} />
                <span className="text-sm font-semibold text-brand-black">{course.rating}</span>
                <span className="text-sm text-brand-olive">({course.reviews} reviews)</span>
            </div>

            {/* Level Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-3">
                {course.levels.map((level) => (
                    <span
                        key={level}
                        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-brand-white text-brand-black border border-brand-surface shadow-sm"
                    >
                        {level}
                    </span>
                ))}
            </div>

            {/* Price and CTA */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-brand-surface">
                <div>
                    <span className="text-xs font-medium text-brand-olive block mb-1">Starting at</span>
                    <span className="text-2xl font-bold text-brand-black">{formatTrainingPrice(course.price)}</span>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                        to={course.link}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white rounded-lg font-semibold text-sm hover:bg-brand-red-hover transition-colors shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand-gold"
                    >
                        Explore
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </div>
    </motion.div>
);

// ============================================================================
// HOW IT WORKS STEP
// ============================================================================

interface StepData {
    number: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const HowItWorksStep: React.FC<{ step: StepData; index: number }> = ({ step, index }) => (
    <motion.div
        variants={index % 2 === 0 ? fadeInLeft : fadeInRight}
        className="group relative flex flex-col items-center text-center"
    >
        {/* Step Number Circle */}
        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-red text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform duration-300 mb-5">
            {step.icon}
        </div>
        {/* Step Label */}
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red mb-2">Step {step.number}</span>
        <h3 className="text-lg font-bold text-brand-black mb-2">{step.title}</h3>
        <p className="text-sm leading-relaxed text-brand-olive-dark max-w-[260px]">{step.description}</p>
    </motion.div>
);

// ============================================================================
// (Testimonial section removed per project requirements)
// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LandingPage: React.FC = () => {
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    // Scroll to top on mount for clean page entry
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // ── Static Data ──────────────────────────────────────────────────────
    const languageCourses: LanguageCourseStatic[] = [
        {
            _id: '1',
            title: 'German Training',
            students: '6,200+',
            courses: 38,
            reviews: '2.4k',
            levels: ['A1', 'A2', 'B1', 'B2', 'TELC / Goethe'],
            price: '15999',
            image: 'https://skylinetraining.in/api/uploads/static_files/germanhomecard.avif',
            rating: 4.8,
            link: '/training/german',
            bgColor: 'bg-brand-red/5',
            borderColor: 'border-brand-red/20',
        },
        {
            _id: '2',
            title: 'English Training',
            students: '8,500+',
            courses: 45,
            reviews: '2.4k',
            levels: ['Beginner', 'Intermediate', 'Advanced'],
            price: '9999',
            image: 'https://skylinetraining.in/api/uploads/static_files/englishhomecard.avif',
            rating: 4.9,
            link: '/training/english',
            bgColor: 'bg-brand-gold/5',
            borderColor: 'border-brand-surface',
        },
        {
            _id: '3',
            title: 'Japanese Training',
            students: '4,800+',
            courses: 32,
            reviews: '2.4k',
            levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
            price: '17999',
            image: 'https://skylinetraining.in/api/uploads/static_files/japnesehomecard.avif',
            rating: 4.9,
            link: '/training/japanese',
            bgColor: 'bg-brand-red/5',
            borderColor: 'border-brand-red/20',
        },
    ];

    const howItWorksSteps: StepData[] = [
        {
            number: '01',
            title: 'Enroll & Assess',
            description: 'Register for your chosen language program and take a placement assessment to find your level.',
            icon: <Languages className="w-7 h-7" />,
        },
        {
            number: '02',
            title: 'Learn with Experts',
            description: 'Attend live, interactive sessions with certified trainers and structured curriculum.',
            icon: <GraduationCap className="w-7 h-7" />,
        },
        {
            number: '03',
            title: 'Get Certified',
            description: 'Prepare for and clear internationally recognized exams like TELC, Goethe, or JLPT.',
            icon: <Award className="w-7 h-7" />,
        },
        {
            number: '04',
            title: 'Launch Your Career',
            description: 'Leverage global career guidance, visa support, and placement assistance to work abroad.',
            icon: <Briefcase className="w-7 h-7" />,
        },
    ];


    return (
        <div className="min-h-screen bg-brand-white font-sans overflow-x-hidden">
            {/* Skip to content */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 focus:z-50 focus:rounded-lg focus:bg-brand-white focus:px-6 focus:py-3 focus:font-bold focus:text-brand-black focus:shadow-2xl focus:ring-2 focus:ring-brand-gold"
            >
                Skip to content
            </a>

            <Header />

            {/* ================================================================
                SECTION 1 — HERO
            ================================================================ */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-black">
                <HeroBackground />

                <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-24">
                    <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: EASE_OUT }}
                        className="flex flex-col items-center text-center w-full mx-auto"
                    >
                        {/* Animated Badge */}
                        <motion.div
                            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="inline-block px-4 py-2 bg-brand-gold/10 backdrop-blur-sm rounded-full border border-brand-gold/20 mb-8"
                        >
                            <span className="text-brand-gold font-medium text-sm flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Summer 2026 batches now open
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <h1 className="font-sans text-[clamp(1.6rem,4.5vw,4.5rem)] font-bold text-white leading-[1.1] tracking-tight mx-auto mb-6">
                            Skyline Skilling <span className="text-brand-gold">&amp;</span> Training Center
                        </h1>

                        {/* Decorative gold line */}
                        <div className="w-[80px] h-[3px] bg-brand-gold mx-auto mb-6" aria-hidden="true" />

                        {/* Subtitle */}
                        <p className="text-lg md:text-xl text-white/70 leading-relaxed w-full max-w-2xl mx-auto mb-10">
                            Professional language training and international career guidance. From certification to placement — we empower your journey from day one.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Link
                                    to="/language-training"
                                    className="bg-brand-red hover:bg-brand-red-hover text-white font-semibold px-8 py-4 text-base sm:text-lg rounded-xl w-full sm:w-auto inline-flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-brand-gold transition-colors duration-300 shadow-lg hover:shadow-xl min-h-[52px]"
                                >
                                    Start learning
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                    onClick={() => setIsBookingFormOpen(true)}
                                    variant="outline"
                                    className="border-2 border-brand-gold text-brand-gold hover:bg-brand-gold/10 backdrop-blur-sm px-8 py-4 text-base sm:text-lg rounded-xl w-full sm:w-auto flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-brand-gold transition-colors duration-300 min-h-[52px]"
                                >
                                    <Play className="w-5 h-5" />
                                    Book free consultation
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>



            {/* ================================================================
                SECTION 3 — ABOUT US
            ================================================================ */}
            <AnimatedSection id="about" className="py-20 sm:py-24 bg-brand-off-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <span className="text-brand-red font-semibold text-sm tracking-widest uppercase">About us</span>
                        <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mt-4 mb-6">
                            Empowering Careers Through Excellence
                        </h2>
                        <div className="w-12 h-[3px] bg-brand-red mx-auto mb-6" aria-hidden="true" />
                        <p className="text-lg text-brand-olive-dark max-w-3xl mx-auto">
                            Part of SoVir Technologies LLP's commitment to professional development and global opportunities
                        </p>
                    </motion.div>

                    {/* About Cards */}
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
                        <motion.div
                            variants={fadeInLeft}
                            whileHover={{ y: -4, transition: { duration: 0.3 } }}
                            className="bg-brand-white rounded-[2rem] p-8 sm:p-10 border border-brand-surface shadow-[0_2px_12px_rgba(110,110,80,0.10)] hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="w-14 h-14 rounded-xl bg-brand-gold/10 flex items-center justify-center mb-6">
                                <Globe className="w-7 h-7 text-brand-red" />
                            </div>
                            <h3 className="font-sans text-2xl font-semibold text-brand-black mb-4">
                                Expert Language Training Programs
                            </h3>
                            <p className="text-brand-olive-dark leading-relaxed mb-6">
                                Skyline Language Academy specializes in immersive language education, with a strong focus on comprehensive German training. We prepare students, healthcare professionals, and engineers not just for certification exams like TELC and Goethe, but for seamless cultural and professional integration across the DACH region.
                            </p>
                            <div className="flex items-start gap-3 text-sm text-brand-olive-dark">
                                <CheckCircle className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                                <span>Specialized German curriculum from A1 to C2</span>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={fadeInRight}
                            whileHover={{ y: -4, transition: { duration: 0.3 } }}
                            className="bg-brand-white rounded-[2rem] p-8 sm:p-10 border border-brand-surface shadow-[0_2px_12px_rgba(110,110,80,0.10)] hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="w-14 h-14 rounded-xl bg-brand-gold/10 flex items-center justify-center mb-6">
                                <GraduationCap className="w-7 h-7 text-brand-red" />
                            </div>
                            <h3 className="font-sans text-2xl font-semibold text-brand-black mb-4">
                                Global Career & Visa Guidance
                            </h3>
                            <p className="text-brand-olive-dark leading-relaxed mb-6">
                                Skyline Skilling & Training Center goes beyond teaching you a language. We offer end-to-end guidance for international aspirants—from mastering advanced fluency and securing admission in top-tier European public universities, to navigating structured pathways for Job Seeker and EU Blue Card visas.
                            </p>
                            <div className="flex items-start gap-3 text-sm text-brand-olive-dark">
                                <CheckCircle className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                                <span>End-to-end support for international placements</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Mission & Vision */}
                    <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                        <motion.div
                            variants={fadeInUp}
                            className="bg-brand-gold/10 rounded-2xl p-6 sm:p-8 border border-brand-gold/20"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-brand-gold flex items-center justify-center">
                                    <Star className="w-5 h-5 text-brand-black" />
                                </div>
                                <h4 className="font-sans text-xl font-semibold text-brand-black">Our Mission</h4>
                            </div>
                            <p className="text-brand-olive-dark leading-relaxed">
                                To provide high-quality language training programs that break down communication barriers and enhance global employability for every student.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={fadeInUp}
                            className="bg-brand-gold/10 rounded-2xl p-6 sm:p-8 border border-brand-gold/20"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-brand-gold flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-brand-black" />
                                </div>
                                <h4 className="font-sans text-xl font-semibold text-brand-black">Our Vision</h4>
                            </div>
                            <p className="text-brand-olive-dark leading-relaxed">
                                To become a global leader in language education and international career integration, empowering individuals with fluid communication skills and boundless opportunities abroad.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </AnimatedSection>

            {/* ================================================================
                SECTION 4 — LANGUAGE COURSES
            ================================================================ */}
            <AnimatedSection id="main-content" className="py-20 sm:py-24 bg-brand-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <span className="text-brand-red font-semibold text-sm tracking-widest uppercase">Language training</span>
                        <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mt-4 mb-6">
                            Master Languages for Global Success
                        </h2>
                        <div className="w-12 h-[3px] bg-brand-red mx-auto mb-6" aria-hidden="true" />
                        <p className="text-lg text-brand-olive-dark max-w-3xl mx-auto">
                            Professional language training programs with internationally recognized certifications
                        </p>
                    </motion.div>

                    {/* Cards Grid */}
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
                        {languageCourses.map((course) => (
                            <LanguageCard key={course._id} course={course} />
                        ))}
                    </div>

                    {/* View All */}
                    <motion.div variants={fadeInUp} className="text-center mt-12">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                            <Link
                                to="/language-training"
                                className="bg-brand-red hover:bg-brand-red-hover text-white font-semibold px-8 py-3.5 rounded-xl inline-flex items-center gap-2 mx-auto focus-visible:ring-2 focus-visible:ring-brand-gold transition-colors shadow-md hover:shadow-lg"
                            >
                                View all courses
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </AnimatedSection>

            {/* ================================================================
                SECTION 5 — HOW IT WORKS
            ================================================================ */}
            <AnimatedSection className="py-20 sm:py-24 bg-brand-off-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <span className="text-brand-red font-semibold text-sm tracking-widest uppercase">How it works</span>
                        <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-black mt-4 mb-6">
                            Your Journey in 4 Steps
                        </h2>
                        <div className="w-12 h-[3px] bg-brand-red mx-auto mb-6" aria-hidden="true" />
                        <p className="text-lg text-brand-olive-dark max-w-2xl mx-auto">
                            A structured pathway from enrollment to international career success
                        </p>
                    </motion.div>

                    {/* Steps Grid */}
                    <div className="relative">
                        {/* Desktop connecting line */}
                        <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-[2px] bg-brand-surface" aria-hidden="true" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
                            {howItWorksSteps.map((step, index) => (
                                <HowItWorksStep key={step.number} step={step} index={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </AnimatedSection>


            {/* ================================================================
                SECTION 7 — CTA BANNER
            ================================================================ */}
            <AnimatedSection className="relative py-20 sm:py-28 bg-brand-black overflow-hidden">
                {/* Decorative glows */}
                <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-brand-red/8 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[400px] h-[400px] bg-brand-gold/8 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div variants={fadeInUp}>
                        <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-4 py-1.5 text-sm font-semibold text-brand-gold backdrop-blur-sm mb-8">
                            <Sparkles className="w-4 h-4" />
                            Start your journey today
                        </span>
                    </motion.div>

                    <motion.h2 variants={fadeInUp} className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                        Ready to Transform Your Career{' '}
                        <span className="text-brand-gold">with Language Skills?</span>
                    </motion.h2>

                    <motion.p variants={fadeInUp} className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Join thousands of successful graduates who built international careers through
                        Skyline's expert training and placement programs.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                to="/register"
                                className="bg-brand-red hover:bg-brand-red-hover text-white font-bold px-10 py-4 rounded-xl text-lg inline-flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-brand-gold transition-colors shadow-lg hover:shadow-xl min-h-[52px]"
                            >
                                Enroll now
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                to="/contact"
                                className="border-2 border-white/20 text-white hover:border-brand-gold hover:text-brand-gold font-semibold px-10 py-4 rounded-xl text-lg inline-flex items-center justify-center gap-2 transition-colors min-h-[52px]"
                            >
                                Talk to us
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </AnimatedSection>

            {/* Booking Modal */}
            <UnifiedBookingForm
                isOpen={isBookingFormOpen}
                onClose={() => setIsBookingFormOpen(false)}
            />

            <Footer />
        </div>
    );
};

export default LandingPage;
