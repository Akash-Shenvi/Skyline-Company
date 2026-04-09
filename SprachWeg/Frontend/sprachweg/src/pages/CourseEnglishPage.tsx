import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, BookOpen, Clock, Target, Award, Shield, Zap, Star, AlertCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import EnrollmentModal from '../components/ui/EnrollmentModal';
import { languageAPI } from '../lib/api';
import type { SkillCourse } from '../types/skill';

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: custom * 0.1, ease: [0.22, 1, 0.36, 1] as const }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

// --- Components ---

const HeroBackground: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, shouldReduceMotion ? 0 : 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, shouldReduceMotion ? 0 : -150]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div style={{ y: y1 }} animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-brand-gold/20 blur-[120px]" />
      <motion.div style={{ y: y2 }} animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[100px]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
    </motion.div>
  );
};

interface CourseLevelCardProps {
  level: NonNullable<SkillCourse['levels']>[number];
  index: number;
  onEnroll: () => void;
}

const CourseLevelCard: React.FC<CourseLevelCardProps> = ({ level, index, onEnroll }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div variants={fadeInUp} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} whileHover={shouldReduceMotion ? {} : { y: -8, transition: { duration: 0.3 } }} className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-brand-surface bg-brand-white shadow-[0_2px_12px_rgba(110,110,80,0.10)] transition-all duration-500 hover:shadow-2xl hover:border-t-brand-gold">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 h-1 w-full bg-brand-red" />

      <div className="flex flex-1 flex-col p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="inline-flex items-center gap-2 rounded bg-brand-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-black">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{level.name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-brand-olive">
            <Clock className="h-4 w-4" />
            {level.duration}
          </div>
        </div>

        {/* Price & Title */}
        <div className="mb-8">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-brand-black">{level.price}</span>
            <span className="text-sm font-medium text-brand-olive">/ package</span>
          </div>
          <p className="mt-2 text-sm text-brand-olive-dark">Comprehensive {level.name} training</p>
        </div>

        {/* Features List */}
        <div className="mb-8 flex-1 space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-olive-light">
            <Target className="h-4 w-4" />
            What You'll Learn
          </h4>
          <ul className="space-y-3">
            {level.features.slice(0, 8).map((item: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-brand-olive-dark">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-red" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Outcome Box */}
        <div className="mb-8 rounded-xl bg-brand-off-white p-4 ring-1 ring-brand-surface">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-olive">Target Outcome</p>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-brand-black">{level.outcome}</p>
        </div>

        {/* Exam Prep (Conditional) */}
        {level.examPrep && level.examPrep.title && (
          <div className="mb-8 rounded-xl border border-dashed border-brand-gold/40 bg-brand-gold/5 p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-bold text-brand-black">
              <Award className="h-4 w-4" />
              {level.examPrep.title}
            </div>
            <p className="text-xs text-brand-olive-dark">{level.examPrep.details}</p>
          </div>
        )}

        {/* CTA */}
        <motion.button onClick={onEnroll} whileHover={shouldReduceMotion ? {} : { scale: 1.02 }} whileTap={shouldReduceMotion ? {} : { scale: 0.98 }} className="group relative flex w-full items-center justify-center gap-2 rounded bg-brand-red py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-red-hover hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2">
          Enroll Now
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </motion.button>
      </div>
    </motion.div>
  );
};

// FAQ
const faqs = [
  { id: '1', question: 'Do I need prior English knowledge?', answer: 'Our Beginner level welcomes complete beginners. We assess your level and place you in the right program.' },
  { id: '2', question: 'Are classes live or recorded?', answer: 'We offer both options. Live classes provide real-time interaction, while recorded sessions offer flexibility.' },
  { id: '3', question: 'Will I get a certificate?', answer: 'Yes! Upon completion, you receive a verified certificate recognized by employers and universities.' }
];

const FAQItem: React.FC<{ faq: typeof faqs[0]; isOpen: boolean; onToggle: () => void }> = ({ faq, isOpen, onToggle }) => (
  <div className="overflow-hidden border-b border-brand-surface last:border-0">
    <button onClick={onToggle} className="flex w-full items-center justify-between py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-inset" aria-expanded={isOpen}>
      <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-brand-red' : 'text-brand-black'}`}>{faq.question}</span>
      <span className={`ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all ${isOpen ? 'bg-brand-red text-white rotate-180' : 'bg-brand-surface text-brand-olive'}`}>
        <ChevronRight className="h-5 w-5 rotate-90" />
      </span>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
          <p className="pb-6 text-base leading-relaxed text-brand-olive-dark">{faq.answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// --- Main Page Component ---

// Static fallback data when API is unavailable
const fallbackEnglishCourse: SkillCourse = {
  _id: 'english-fallback',
  title: 'English Training',
  description: 'Master English with our comprehensive training program. From beginner conversation skills to advanced business communication, our expert instructors guide you every step of the way.',
  levels: [
    {
      name: 'Beginner',
      duration: '3 Months',
      price: '₹9,999',
      features: [
        'Foundational grammar & vocabulary',
        'Basic conversation skills',
        'Listening comprehension',
        'Reading fundamentals',
        'Writing basics',
        'Pronunciation training'
      ],
      outcome: 'Achieve basic conversational fluency and reading comprehension for everyday situations.',
      examPrep: { title: '', details: '' }
    },
    {
      name: 'Intermediate',
      duration: '4 Months',
      price: '₹14,999',
      features: [
        'Advanced grammar structures',
        'Business English communication',
        'Presentation skills',
        'Academic writing',
        'Debate & discussion techniques',
        'Email & professional correspondence'
      ],
      outcome: 'Communicate confidently in professional and academic settings with fluent English.',
      examPrep: { title: 'IELTS / TOEFL Preparation', details: 'Targeted preparation for international English proficiency exams.' }
    },
    {
      name: 'Advanced',
      duration: '3 Months',
      price: '₹19,999',
      features: [
        'Native-level fluency training',
        'Advanced business negotiation',
        'Public speaking mastery',
        'Research & academic writing',
        'Cross-cultural communication',
        'Interview preparation'
      ],
      outcome: 'Achieve near-native proficiency suitable for international careers and higher education.',
      examPrep: { title: 'Cambridge C1/C2 Preparation', details: 'Expert coaching for Cambridge Advanced and Proficiency certifications.' }
    }
  ]
};

const CourseEnglishPage: React.FC = () => {
  const [course, setCourse] = useState<SkillCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedLevelName, setSelectedLevelName] = useState("");
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courses = await languageAPI.getAll();
        const englishCourse = courses.find((c: any) => c.title.includes('English'));
        if (englishCourse) {
          setCourse(englishCourse);
        } else {
          setCourse(fallbackEnglishCourse);
        }
      } catch (error) {
        console.error('Failed to fetch course data', error);
        setApiError(true);
        setCourse(fallbackEnglishCourse);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, []);

  // Use fallback while loading to prevent blank screen
  const displayCourse = course || fallbackEnglishCourse;

  const selectedLevelDetails = displayCourse.levels?.find((level) => level.name === selectedLevelName);

  return (
    <div className="relative min-h-screen bg-brand-white text-brand-black">
      <Header />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 focus:z-50 focus:rounded-lg focus:bg-brand-white focus:px-6 focus:py-3 focus:font-bold focus:text-brand-black focus:shadow-2xl focus:ring-2 focus:ring-brand-gold">
        Skip to content
      </a>

      {loading && (
        <div className="flex h-64 items-center justify-center pt-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-red border-t-transparent"></div>
        </div>
      )}

      {apiError && !loading && (
        <div className="mx-auto max-w-3xl px-4 pt-24 pb-4">
          <div className="flex items-center gap-3 rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-4 text-sm text-brand-olive-dark">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-brand-gold" />
            <span>Showing cached course information. Live pricing may vary.</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-28 sm:py-36 text-center overflow-hidden bg-brand-off-white">
        <HeroBackground />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-4xl">
            <motion.div variants={fadeInUp} className="mb-8 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-red/20 bg-brand-red/10 px-4 py-1.5 text-sm font-semibold text-brand-red">
                <Star className="h-4 w-4 fill-current" />
                Premium English Certification
              </span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="font-display mb-6 text-5xl font-bold tracking-tight text-brand-black sm:text-6xl lg:text-7xl">
              Master English for <br className="hidden sm:inline" />
              <span className="text-brand-red">Global Success</span>
            </motion.h1>
            <div className="w-[60px] h-[3px] bg-brand-red mx-auto mb-6" />
            <motion.p variants={fadeInUp} className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-brand-olive-dark sm:text-xl">
              {displayCourse.description}
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4 text-sm font-medium text-brand-olive-dark">
              <div className="flex items-center gap-2 rounded-lg bg-brand-white px-4 py-2 border border-brand-surface">
                <Shield className="h-5 w-5 text-brand-red" />
                <span>Official Certification</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-brand-white px-4 py-2 border border-brand-surface">
                <Zap className="h-5 w-5 text-brand-red" />
                <span>Fast-track Options</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <main id="main-content" className="relative z-10">
        {/* Levels Grid */}
        <section className="px-4 py-24 sm:px-6 lg:px-8 bg-brand-white">
          <div className="mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-brand-black sm:text-4xl">Choose Your Proficiency Level</h2>
              <div className="w-12 h-[3px] bg-brand-red mx-auto mt-4 mb-4" />
              <p className="mt-4 text-lg text-brand-olive-dark">Tailored curriculums designed to meet your specific goals.</p>
            </motion.div>
            {displayCourse.levels && displayCourse.levels.length > 0 ? (
              <div className="grid gap-8 lg:grid-cols-3">
                {displayCourse.levels.map((level, index) => (
                  <CourseLevelCard key={index} level={level} index={index} onEnroll={() => { setSelectedLevelName(level.name); setIsEnrollModalOpen(true); }} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-brand-olive-light p-12 text-center text-brand-olive">No course levels available at the moment.</div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-brand-surface px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-brand-black sm:text-4xl">Frequently Asked Questions</h2>
              <div className="w-12 h-[3px] bg-brand-red mx-auto mt-4" />
            </motion.div>
            <div className="rounded-2xl bg-brand-white p-6 shadow-[0_2px_12px_rgba(110,110,80,0.10)] sm:p-10">
              {faqs.map((faq) => (
                <FAQItem key={faq.id} faq={faq} isOpen={openFAQ === faq.id} onToggle={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-24 sm:px-6 lg:px-8 bg-brand-white">
          <div className="mx-auto max-w-5xl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl bg-brand-red px-6 py-16 text-center text-white shadow-2xl sm:px-12 sm:py-20">
              <div className="relative z-10">
                <Zap className="mx-auto mb-6 h-12 w-12 text-white" />
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Ready to Transform Your Future?</h2>
                <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80">Join thousands of successful students mastering English with our expert-led courses.</p>
              </div>
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-brand-black/10 blur-3xl"></div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <EnrollmentModal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} origin="english" originPath="/training/english" selectedLevel={selectedLevelName} paymentAmount={selectedLevelDetails?.price} />
    </div>
  );
};

export default CourseEnglishPage;
