// ... imports
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useAnimation, type Easing, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
    Star,
    BookOpen,
    Clock,
    TrendingUp,
    ArrowRight,
    GraduationCap,
    Shield,
    Zap,
    Users,
    Globe
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import UnifiedBookingForm from '../components/ui/UnifiedBookingForm';
import { languageAPI } from '../lib/api';
import { formatTrainingPrice, getCourseStartingPrice } from '../lib/trainingPricing';

// ... (keep all existing constants and subcomponents like stats, languageCards, benefits, StarRating, LanguageCard, BenefitCard)
const easeOut: Easing = [0.0, 0.0, 0.2, 1];

// Animation variants
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

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } }
};


// Animated section wrapper component
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

// Elevated Hero Background
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



// Language cards data
const languageCards = [
    {
        code: 'DE',
        title: 'German Training',
        students: '6,200+',
        courses: 38,
        rating: 4.8,
        reviews: '2.4k',
        levels: ['A1', 'A2', 'B1', 'B2', 'TELC / Goethe'],
        categories: [],
        price: '₹15,999',
        bgColor: 'bg-brand-red/5',
        borderColor: 'border-brand-red/20',
        route: '/training/german',
        image: "https://skylinetraining.in/api/uploads/static_files/germanhomecard.avif"
    },
    {
        code: 'GB',
        title: 'English Training',
        students: '8,500+',
        courses: 45,
        rating: 4.9,
        reviews: '2.4k',
        levels: ['Beginner', 'Intermediate', 'Advanced'],
        categories: ['Business', 'Academic'],
        price: '₹9,999',
        bgColor: 'bg-brand-gold/5',
        borderColor: 'border-brand-surface',
        route: '/training/english',
        image: "https://skylinetraining.in/api/uploads/static_files/englishhomecard.avif"
    },
    {
        code: 'JP',
        title: 'Japanese Training',
        students: '4,800+',
        courses: 32,
        rating: 4.9,
        reviews: '2.4k',
        levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
        categories: [],
        price: '₹17,999',
        bgColor: 'bg-brand-red/5',
        borderColor: 'border-brand-red/20',
        route: '/training/japanese',
        image: "https://skylinetraining.in/api/uploads/static_files/japnesehomecard.avif"
    }
];

const matchesLanguageCard = (card: typeof languageCards[number], title?: string) => {
    const normalizedTitle = String(title || '').trim().toLowerCase();

    if (card.route === '/training/english') {
        return normalizedTitle.includes('english');
    }

    if (card.route === '/training/german') {
        return normalizedTitle.includes('german');
    }

    if (card.route === '/training/japanese') {
        return normalizedTitle.includes('japanese');
    }

    return false;
};

// Benefits data
const benefits = [
    {
        icon: Users,
        title: 'Expert Instructors',
        description: 'Native speakers & certified trainers with 10+ years experience'
    },
    {
        icon: Clock,
        title: 'Flexible Learning',
        description: 'Live classes, self-paced modules, and hybrid options'
    },
    {
        icon: TrendingUp,
        title: 'Career Support',
        description: 'Job placement assistance and interview preparation'
    },
    {
        icon: Globe,
        title: 'Global Network',
        description: 'Connect with students and opportunities worldwide'
    }
];

// Star Rating Component
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.floor(rating)
                        ? 'fill-brand-gold text-brand-gold'
                        : star <= rating
                            ? 'fill-brand-gold/50 text-brand-gold'
                            : 'fill-brand-surface text-brand-olive-light'
                        }`}
                />
            ))}
        </div>
    );
};

// Language Card Component
const LanguageCard: React.FC<{
    card: typeof languageCards[0];
    index: number;
}> = ({ card, index: _index }) => {
    return (
        <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className={`relative rounded-2xl border-2 ${card.borderColor} ${card.bgColor} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group`}
        >
            {/* Image Area */}
            <div className="h-48 relative overflow-hidden bg-brand-surface z-20">
                <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />

            {/* Content wrapper with z-index */}
            <div className="relative z-10 p-6">
                {/* Title */}
                <h3 className="text-xl font-sans font-bold text-center text-brand-black mb-5">
                    {card.title}
                </h3>

                {/* Stats Row */}
                <div className="flex items-center justify-center gap-6 text-sm text-brand-olive-dark mb-4">
                    <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-brand-black" />
                        <span className="font-medium">{card.students} students</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-brand-black" />
                        <span className="font-medium">{card.courses} courses</span>
                    </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center gap-2 mb-5">
                    <StarRating rating={card.rating} />
                    <span className="text-sm font-semibold text-brand-black">{card.rating}</span>
                    <span className="text-sm text-brand-olive-dark">({card.reviews} reviews)</span>
                </div>

                {/* Level Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                    {card.levels.map((level) => (
                        <span
                            key={level}
                            className="px-3 py-1.5 text-xs font-semibold rounded-full bg-white text-brand-black border border-brand-surface shadow-sm"
                        >
                            {level}
                        </span>
                    ))}
                </div>

                {/* Category Tags */}
                {card.categories.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {card.categories.map((category) => (
                            <span
                                key={category}
                                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-brand-gold/10 text-brand-black border border-brand-surface"
                            >
                                {category}
                            </span>
                        ))}
                    </div>
                )}

                {/* Price and CTA */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-brand-surface">
                    <div>
                        <span className="text-xs font-medium text-brand-olive-dark block mb-1">Starting at</span>
                        <span className="text-2xl font-bold text-brand-black">{card.price}</span>
                    </div>
                    <Link to={card.route}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white rounded-lg font-semibold text-sm hover:bg-brand-red-hover transition-colors shadow-md hover:shadow-lg"
                        >
                            Explore
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

// Benefit Card Component
const BenefitCard: React.FC<{
    benefit: typeof benefits[0];
    index: number;
}> = ({ benefit, index: _index }) => {
    const Icon = benefit.icon;

    return (
        <motion.div
            variants={scaleIn}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
        >
            {/* Icon */}
            <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-gold/5 flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors"
            >
                <Icon className="w-8 h-8 text-brand-black" />
            </motion.div>

            {/* Title */}
            <h3 className="text-lg font-bold text-brand-black mb-2">
                {benefit.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-brand-olive-dark leading-relaxed">
                {benefit.description}
            </p>
        </motion.div>
    );
};

// Main Component
const LanguageTraining: React.FC = () => {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [cards, setCards] = useState(languageCards);

    useEffect(() => {
        const syncLanguagePrices = async () => {
            try {
                const courses = await languageAPI.getAll();

                setCards((currentCards) =>
                    currentCards.map((card) => {
                        const matchedCourse = courses.find((course: any) => matchesLanguageCard(card, course?.title));

                        if (!matchedCourse) {
                            return card;
                        }

                        const startingPrice = getCourseStartingPrice(matchedCourse);

                        return {
                            ...card,
                            price: startingPrice !== null ? formatTrainingPrice(startingPrice) : card.price,
                        };
                    })
                );
            } catch (error) {
                console.error('Failed to sync language prices:', error);
            }
        };

        syncLanguagePrices();
    }, []);

    return (
        <div className="min-h-screen bg-white transition-colors duration-300">
            <Header />

            {/* Hero Section */}
            <section className="relative py-28 sm:py-36 overflow-hidden bg-brand-black text-brand-white border-b-[8px] border-brand-red">
                <HeroBackground />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="max-w-2xl text-left"
                        >
                            <motion.div variants={fadeInUp} className="mb-8 flex justify-start">
                                <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-4 py-1.5 text-sm font-semibold text-brand-gold backdrop-blur-sm">
                                    <Star className="h-4 w-4 fill-current" />
                                    Global Language Certification
                                </span>
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="font-display mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
                            >
                                Master Languages for <br className="hidden sm:inline" />
                                <span className="text-brand-red">Global Success</span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="mb-10 max-w-2xl text-lg leading-relaxed text-brand-off-white sm:text-xl"
                            >
                                Learn German, English, or Japanese with live interactive classes, flexible schedules, and internationally recognized certifications.
                            </motion.p>

                            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 text-sm font-medium text-brand-white">
                                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/20 hover:border-brand-gold transition-colors">
                                    <Shield className="h-5 w-5 text-brand-gold" />
                                    <span>Official Certification</span>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/20 hover:border-brand-red transition-colors">
                                    <Zap className="h-5 w-5 text-brand-red" />
                                    <span>Fast-track Options</span>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative lg:h-[500px] h-[350px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-brand-surface group"
                        >
                            <img 
                                src="https://skylinetraining.in/api/uploads/static_files/languagetrainingpage.avif" 
                                alt="Students collaboratively learning languages" 
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 to-transparent"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Language Cards Section */}
            <section className="py-20 bg-brand-off-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AnimatedSection className="flex flex-col items-center text-center mb-16">
                        <motion.span
                            variants={fadeInUp}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold/10 text-brand-gold rounded-full text-sm font-medium mb-4"
                        >
                            <GraduationCap className="w-4 h-4" />
                            Our Programs
                        </motion.span>
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-brand-black mb-4 text-center mx-auto"
                        >
                            Choose Your Language Path
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg text-brand-olive-dark max-w-2xl mx-auto"
                        >
                            Professional training programs designed for global careers
                        </motion.p>
                    </AnimatedSection>

                    <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cards.map((card, index) => (
                            <LanguageCard key={card.code} card={card} index={index} />
                        ))}
                    </AnimatedSection>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AnimatedSection className="flex flex-col items-center text-center mb-16">
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-brand-black mb-4 text-center mx-auto"
                        >
                            Why Choose Skyline Academy?
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg text-brand-olive-dark max-w-2xl mx-auto"
                        >
                            World-class language training with proven results
                        </motion.p>
                    </AnimatedSection>

                    <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, index) => (
                            <BenefitCard key={index} benefit={benefit} index={index} />
                        ))}
                    </AnimatedSection>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative bg-brand-black py-20 overflow-hidden border-t-8 border-brand-red">
                {/* Animated background */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                        className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-brand-red/10 to-transparent rounded-full"
                    />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-gold/5 blur-[100px] rounded-full" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <AnimatedSection>
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-white mb-6"
                        >
                            Start Your Language Journey Today
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg text-brand-olive-light mb-10 max-w-2xl mx-auto"
                        >
                            Book a free trial class and experience our world-class teaching methodology
                        </motion.p>
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <motion.button
                                onClick={() => setIsBookingOpen(true)}
                                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(214, 177, 97, 0.4)' }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-brand-gold text-brand-black font-bold rounded-xl hover:bg-brand-gold-hover transition-all shadow-lg"
                            >
                                Book Free Trial
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white text-brand-black font-bold rounded-xl hover:bg-brand-surface transition-all shadow-lg"
                            >
                                Contact Us
                            </motion.button>
                        </motion.div>
                    </AnimatedSection>
                </div>
            </section>

            <UnifiedBookingForm isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
            <Footer />
        </div>
    );
};

export default LanguageTraining;
