import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Check, ChevronRight, BookOpen, Clock, Target, Award, Shield, Zap, Star, AlertCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import EnrollmentModal from '../components/ui/EnrollmentModal';
import { languageAPI } from '../lib/api';
import type { SkillCourse } from '../types/skill';

// --- Animation Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

// --- Components ---

interface CourseLevelCardProps {
  level: NonNullable<SkillCourse['levels']>[number];
  index: number;
  onEnroll: () => void;
}

const CourseLevelCard: React.FC<CourseLevelCardProps> = ({ level, onEnroll }) => (
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-surface bg-brand-white shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
  >
    <div className="absolute top-0 left-0 h-1.5 w-full bg-brand-red" />
    <div className="flex flex-1 flex-col p-8">
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

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-brand-black">{level.price}</span>
          <span className="text-sm font-medium text-brand-olive">/ package</span>
        </div>
        <p className="mt-2 text-sm text-brand-olive-dark">Comprehensive {level.name} training</p>
      </div>

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

      <div className="mb-8 rounded-xl bg-brand-off-white p-4 ring-1 ring-brand-surface">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-olive">Target Outcome</p>
        <p className="mt-1.5 text-sm font-medium leading-relaxed text-brand-black">{level.outcome}</p>
      </div>

      {level.examPrep && level.examPrep.title && (
        <div className="mb-8 rounded-xl border border-dashed border-brand-gold/40 bg-brand-gold/5 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-bold text-brand-black">
            <Award className="h-4 w-4" />
            {level.examPrep.title}
          </div>
          <p className="text-xs text-brand-olive-dark">{level.examPrep.details}</p>
        </div>
      )}

      <button
        onClick={onEnroll}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-red-hover hover:shadow-xl"
      >
        Enroll Now
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  </motion.div>
);

// FAQ
const faqs = [
  { id: '1', question: 'Do I need prior English knowledge?', answer: 'Our Beginner level welcomes complete beginners. We assess your level and place you in the right program.' },
  { id: '2', question: 'Are classes live or recorded?', answer: 'We offer both options. Live classes provide real-time interaction, while recorded sessions offer flexibility.' },
  { id: '3', question: 'Will I get a certificate?', answer: 'Yes! Upon completion, you receive a verified certificate recognized by employers and universities.' }
];

const FAQItem: React.FC<{ faq: typeof faqs[0]; isOpen: boolean; onToggle: () => void }> = ({ faq, isOpen, onToggle }) => (
  <div className="overflow-hidden border-b border-brand-surface last:border-0">
    <button onClick={onToggle} className="flex w-full items-center justify-between py-6 text-left focus:outline-none" aria-expanded={isOpen}>
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

// Static fallback data when API is unavailable
const fallbackEnglishCourse: SkillCourse = {
  _id: 'english-fallback',
  title: 'English Training',
  description: 'Master English with our comprehensive training program. From beginner conversation skills to advanced business communication, our expert instructors guide you every step of the way.',
  levels: [
    { name: 'Beginner', duration: '3 Months', price: '₹9,999', features: ['Foundational grammar & vocabulary', 'Basic conversation skills', 'Listening comprehension', 'Reading fundamentals', 'Writing basics', 'Pronunciation training'], outcome: 'Achieve basic conversational fluency and reading comprehension for everyday situations.', examPrep: { title: '', details: '' } },
    { name: 'Intermediate', duration: '4 Months', price: '₹14,999', features: ['Advanced grammar structures', 'Business English communication', 'Presentation skills', 'Academic writing', 'Debate & discussion techniques', 'Email & professional correspondence'], outcome: 'Communicate confidently in professional and academic settings with fluent English.', examPrep: { title: 'IELTS / TOEFL Preparation', details: 'Targeted preparation for international English proficiency exams.' } },
    { name: 'Advanced', duration: '3 Months', price: '₹19,999', features: ['Native-level fluency training', 'Advanced business negotiation', 'Public speaking mastery', 'Research & academic writing', 'Cross-cultural communication', 'Interview preparation'], outcome: 'Achieve near-native proficiency suitable for international careers and higher education.', examPrep: { title: 'Cambridge C1/C2 Preparation', details: 'Expert coaching for Cambridge Advanced and Proficiency certifications.' } }
  ]
};

const stats = [
  { value: '1.5B+', label: 'English Speakers Worldwide' },
  { value: '#1', label: 'Most Spoken Language' },
  { value: '80%', label: 'Internet Content in English' },
  { value: '100+', label: 'Countries Use English' },
];

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
        if (englishCourse) { setCourse(englishCourse); } else { setCourse(fallbackEnglishCourse); }
      } catch (error) {
        console.error('Failed to fetch course data', error);
        setApiError(true);
        setCourse(fallbackEnglishCourse);
      } finally { setLoading(false); }
    };
    fetchCourse();
  }, []);

  const displayCourse = course || fallbackEnglishCourse;
  const selectedLevelDetails = displayCourse.levels?.find((level) => level.name === selectedLevelName);

  return (
    <div className="relative min-h-screen bg-brand-white text-brand-black">
      <Header />

      {/* Hero Section — Dark theme matching German page */}
      <section className="bg-brand-black text-brand-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden relative border-b-[8px] border-brand-red">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(232,160,32,0.05),transparent)]" aria-hidden="true" />
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
            className="text-left"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1.5">
              <Star className="h-4 w-4 text-brand-gold fill-current" />
              <span className="text-sm font-semibold text-brand-gold">Premium English Certification</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-brand-white mb-6 leading-tight">
              Master English,<br className="hidden sm:block"/> Achieve <span className="text-brand-red">Global Success</span>
            </h1>
            <p className="text-lg sm:text-xl text-brand-off-white max-w-2xl mb-12 leading-relaxed">
              {displayCourse.description}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + (idx * 0.1) }}
                  className="bg-brand-surface/10 backdrop-blur-sm p-4 sm:p-5 rounded-xl border-l-4 border-brand-red hover:border-brand-gold transition duration-300"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-brand-gold mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm font-semibold text-brand-off-white">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] h-[400px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-brand-surface group"
          >
            <img
              src="https://skylinetraining.in/api/uploads/static_files/englishhomecard.avif"
              alt="Students learning English"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-brand-white">
              <div className="text-2xl md:text-3xl font-bold">Global Language</div>
              <div className="text-sm md:text-base text-brand-off-white font-medium">The Key to International Opportunities</div>
            </div>
          </motion.div>
        </div>
      </section>

      {loading && (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-red border-t-transparent"></div>
        </div>
      )}

      {apiError && !loading && (
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-4 text-sm text-brand-olive-dark">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-brand-gold" />
            <span>Showing cached course information. Live pricing may vary.</span>
          </div>
        </div>
      )}

      <main id="main-content" className="relative z-10">
        {/* Why English Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8 bg-brand-off-white">
          <div className="mx-auto max-w-6xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-brand-black mb-4">Why Learn English?</motion.h2>
              <div className="w-16 h-1 bg-brand-red mx-auto rounded"></div>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Shield className="h-8 w-8 text-brand-gold" />, title: 'Career Growth', text: 'English is required for most multinational & tech companies worldwide.' },
                { icon: <Zap className="h-8 w-8 text-brand-gold" />, title: 'Higher Education', text: 'Access top universities in the US, UK, Canada, and Australia.' },
                { icon: <Star className="h-8 w-8 text-brand-gold" />, title: 'Digital World', text: 'Over 80% of digital content and research papers are in English.' },
                { icon: <BookOpen className="h-8 w-8 text-brand-gold" />, title: 'Travel & Culture', text: 'Communicate confidently while traveling across 100+ countries.' },
              ].map((item, idx) => (
                <motion.div key={idx} variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className="bg-brand-white p-6 rounded-xl shadow-[0_2px_12px_rgba(110,110,80,0.10)] border-t-4 border-brand-red hover:border-brand-gold transition-all"
                >
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold text-brand-black mb-2">{item.title}</h3>
                  <p className="text-sm text-brand-olive-dark">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Levels Grid */}
        <section className="px-4 py-24 sm:px-6 lg:px-8 bg-brand-white">
          <div className="mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-brand-black sm:text-4xl">Choose Your Proficiency Level</h2>
              <div className="w-16 h-1 bg-brand-red mx-auto mt-4 mb-4 rounded" />
              <p className="mt-4 text-lg text-brand-olive-dark">Tailored curriculums designed by Skyline to meet your specific goals.</p>
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
        <section className="bg-brand-off-white px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-brand-black sm:text-4xl">Frequently Asked Questions</h2>
              <div className="w-16 h-1 bg-brand-red mx-auto mt-4 rounded" />
            </motion.div>
            <div className="rounded-2xl bg-brand-white p-6 shadow-[0_2px_12px_rgba(110,110,80,0.10)] sm:p-10">
              {faqs.map((faq) => (
                <FAQItem key={faq.id} faq={faq} isOpen={openFAQ === faq.id} onToggle={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-brand-black py-20 px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-gold mb-6">Ready to Transform Your Future?</h2>
          <p className="text-brand-off-white max-w-2xl mx-auto mb-10 text-lg">Join thousands of successful students mastering English with Skyline's expert-led courses.</p>
          <button
            onClick={() => { setSelectedLevelName('Beginner'); setIsEnrollModalOpen(true); }}
            className="inline-block px-10 py-4 bg-brand-red hover:bg-brand-red-hover text-brand-white font-bold text-lg rounded transition-colors shadow-xl"
          >
            Join Skyline English Course
          </button>
        </section>
      </main>

      <Footer />
      <EnrollmentModal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} origin="english" originPath="/training/english" selectedLevel={selectedLevelName} paymentAmount={selectedLevelDetails?.price} />
    </div>
  );
};

export default CourseEnglishPage;
