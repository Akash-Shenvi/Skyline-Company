import React, { useRef, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { motion, useScroll, useTransform, useReducedMotion, useInView, useAnimation } from 'framer-motion';
import { Award } from 'lucide-react';

// --- Theme Colors ---
// Black: #1C1C1A
// Gold: #E8A020

// --- Animation Variants ---
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: custom * 0.1, ease: [0.22, 1, 0.36, 1] as const }
    })
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
};

// Animated section wrapper
const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        }
    }, [isInView, controls]);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={staggerContainer}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Hero Background Component with parallax blobs + grain
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
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand-gold/20 to-red-500/10 blur-[120px]"
            />
            <motion.div
                style={{ y: y2 }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-brand-gold/50/10 blur-[100px]"
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </motion.div>
    );
};

const AboutPage: React.FC = () => {
    const shouldReduceMotion = useReducedMotion();

    return (
        <div className="min-h-screen bg-brand-off-white flex flex-col font-sans text-brand-black">
            <Header />
            <main id="main-content" className="flex-1">

                {/* --- HERO SECTION --- */}
                <section className="relative bg-gradient-to-br from-brand-black via-brand-olive-dark to-[#1a365d] overflow-hidden py-28 sm:py-36 text-center">
                    <HeroBackground />

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimatedSection className="flex flex-col items-center text-center">
                            <motion.div variants={fadeInUp} className="mb-6 flex justify-center">
                                <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-4 py-1.5 text-sm font-semibold text-brand-gold backdrop-blur-sm">
                                    <Award className="h-4 w-4 fill-current" />
                                    Learn. Automate. Communicate. Succeed.
                                </span>
                            </motion.div>
                            <motion.h1
                                variants={fadeInUp}
                                className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-white mb-6 leading-tight"
                            >
                                About Skyline Skilling &amp; <br />
                                <span className="text-brand-gold relative">
                                    Training Center
                                    <motion.span
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.8, duration: 0.6 }}
                                        className="absolute -bottom-2 left-0 w-full h-1 bg-brand-gold/50 rounded-full origin-left"
                                    />
                                </span>
                            </motion.h1>
                            <motion.p
                                variants={fadeInUp}
                                custom={1}
                                className="text-lg md:text-xl text-brand-olive-light max-w-3xl mx-auto mb-10 leading-relaxed"
                            >
                                Empowering Global Careers Through Language, Skills &amp; Automation
                            </motion.p>
                        </AnimatedSection>
                    </div>
                </section>

                {/* --- ABOUT US CONTENT + DIRECTOR SECTION --- */}
                <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">

                            {/* Left: About Text (takes 3 of 5 cols on desktop) */}
                            <motion.div
                                className="lg:col-span-3"
                                initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
                                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            >
                                {/* Section label */}
                                <div className="mb-4">
                                    <span className="text-brand-gold font-bold tracking-wide uppercase text-sm">About Us</span>
                                </div>

                                {/* Heading with animated underline */}
                                <h2 className="text-3xl sm:text-4xl font-semibold text-brand-black mb-8 relative inline-block">
                                    Who We Are
                                    <motion.span
                                        className="absolute -bottom-3 left-0 h-1 bg-brand-gold origin-left w-full"
                                        initial={{ scaleX: 0 }}
                                        whileInView={shouldReduceMotion ? undefined : { scaleX: 1 }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        viewport={{ once: true }}
                                    />
                                </h2>

                                {/* Content paragraphs */}
                                <div className="space-y-6 mt-10">
                                    <p className="text-base sm:text-lg text-brand-olive-dark leading-relaxed">
                                        At Skyline Skilling and Training Center, we are dedicated to helping individuals unlock their true potential by equipping them with the skills needed to succeed in today's competitive world.
                                    </p>

                                    <p className="text-base sm:text-lg text-brand-olive-dark leading-relaxed">
                                        From communication mastery to complete job readiness, we prepare you not just for a job—but for a successful career.
                                    </p>

                                    <div className="pt-4">
                                        <div className="w-12 h-[2px] bg-brand-gold/40 mb-6" aria-hidden="true" />
                                        <p className="text-base sm:text-lg font-medium text-brand-black leading-relaxed">
                                            Our mission is to bridge the gap between education and employment, ensuring every learner is confident, capable, and career-ready.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right: Director Profile (takes 2 of 5 cols on desktop) */}
                            <motion.div
                                className="lg:col-span-2 flex justify-center"
                                initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
                                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                            >
                                <div className="relative w-full max-w-sm">
                                    {/* Decorative background orbs */}
                                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-brand-gold/8 rounded-full blur-2xl" aria-hidden="true" />
                                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-brand-gold/5 rounded-full blur-xl" aria-hidden="true" />

                                    {/* Card */}
                                    <div className="relative z-10 bg-white rounded-3xl p-8 sm:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.06)] border border-brand-surface">

                                        {/* Director Photo */}
                                        <div className="flex justify-center mb-8">
                                            <motion.div
                                                whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                                                transition={{ duration: 0.3, ease: "easeOut" }}
                                                className="relative group cursor-default"
                                            >
                                                {/* Hover glow ring */}
                                                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" aria-hidden="true" />

                                                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-brand-gold/20 shadow-lg group-hover:border-brand-gold/40 transition-colors duration-300">
                                                    {/* Director photo placeholder */}
                                                    <div className="w-full h-full bg-gradient-to-br from-brand-surface via-brand-off-white to-brand-surface flex flex-col items-center justify-center">
                                                        <svg
                                                            className="w-16 h-16 sm:w-20 sm:h-20 text-brand-olive/25"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Director Name & Designation */}
                                        <div className="text-center">
                                            <h3 className="text-xl sm:text-2xl font-bold text-brand-black mb-1.5">
                                                Director Name
                                            </h3>
                                            <p className="text-brand-gold font-semibold text-sm tracking-wide uppercase mb-3">
                                                Director
                                            </p>
                                            <div className="w-10 h-[2px] bg-brand-gold/30 mx-auto mb-3" aria-hidden="true" />
                                            <p className="text-brand-olive text-sm">
                                                Skyline Skilling &amp; Training Center
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default AboutPage;
