import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Check, Clock, Award, AlertCircle, BookOpen, MessageCircle, FileText, Globe, Target, ChevronRight } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import EnrollmentModal from '../components/ui/EnrollmentModal';
import { languageAPI } from '../lib/api';
import type { SkillCourse } from '../types/skill';
import { tCourseDe, tCourseEn } from '../locales/germanCourseTranslations';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const fallbackGermanCourse: SkillCourse = {
  _id: 'german-fallback',
  title: 'German Training',
  description: 'Master German with our CEFR-aligned curriculum.',
  levels: [
    { name: 'A1 Beginner', duration: '3 Months', price: '₹15,999', features: ['Foundational grammar', 'Basic vocabulary', 'Everyday expressions', 'Simple conversations'], outcome: 'Achieve basic understanding and can interact in a simple way.', examPrep: { title: 'Goethe-Zertifikat A1', details: 'Preparation for A1 exam.' } },
    { name: 'A2 Elementary', duration: '3 Months', price: '₹17,999', features: ['Advanced beginner grammar', 'Sentences and frequently used expressions', 'Routine tasks requiring a direct exchange of information'], outcome: 'Understand sentences and express immediate needs.', examPrep: { title: 'Goethe-Zertifikat A2', details: 'Preparation for A2 exam.' } },
    { name: 'B1 Intermediate', duration: '4 Months', price: '₹22,999', features: ['Understand main points of clear standard input', 'Deal with most situations likely to arise while travelling', 'Produce simple connected text'], outcome: 'Communicate independently and handle daily situations.', examPrep: { title: 'Goethe-Zertifikat B1', details: 'Preparation for B1 exam.' } },
    { name: 'B2 Upper Intermediate', duration: '5 Months', price: '₹25,999', features: ['Understand the main ideas of complex text', 'Interact with a degree of fluency and spontaneity', 'Produce clear, detailed text'], outcome: 'Communicate with native speakers effectively.', examPrep: { title: 'Goethe-Zertifikat B2', details: 'Preparation for B2 exam.' } },
    { name: 'C1 Advanced', duration: '5 Months', price: '₹29,999', features: ['Understand a wide range of demanding, longer clauses', 'Express ideas fluently and spontaneously', 'Use language flexibly and effectively'], outcome: 'Achieve advanced proficiency in German.', examPrep: { title: 'Goethe-Zertifikat C1', details: 'Preparation for C1 exam.' } }
  ]
};

const SECTION_IDS = ['about', 'why-learn', 'levels', 'visa', 'faq'] as const;

interface CourseLevelCardProps {
  level: NonNullable<SkillCourse['levels']>[number];
  onEnroll: () => void;
  lang?: 'de' | 'en';
}

const CourseLevelCard: React.FC<CourseLevelCardProps> = ({ level, onEnroll, lang = 'de' }) => (
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
          <span className="text-sm font-medium text-brand-olive">/ {lang === 'de' ? 'Paket' : 'package'}</span>
        </div>
        <p className="mt-2 text-sm text-brand-olive-dark">
          {lang === 'de' ? `Umfassendes ${level.name} Training` : `Comprehensive ${level.name} training`}
        </p>
      </div>

      <div className="mb-8 flex-1 space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-olive-light">
          <Target className="h-4 w-4" />
          {lang === 'de' ? 'Was Du lernen wirst' : 'What You\'ll Learn'}
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
        <p className="text-xs font-bold uppercase tracking-wider text-brand-olive">
          {lang === 'de' ? 'Zielsetzung' : 'Target Outcome'}
        </p>
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
        {lang === 'de' ? 'Jetzt Anmelden' : 'Enroll Now'}
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  </motion.div>
);

const CourseGermanPage: React.FC = () => {
  const [course, setCourse] = useState<SkillCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('about');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedLevelName, setSelectedLevelName] = useState("");
  const [apiError, setApiError] = useState(false);

  const [lang, setLang] = useState<'de' | 'en'>('de');
  const t = lang === 'de' ? tCourseDe : tCourseEn;

  // Refs for each section
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const setSectionRef = useCallback((id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  // Intersection Observer to track active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );

    for (const id of SECTION_IDS) {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [loading]);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courses = await languageAPI.getAll();
        const germanCourse = courses.find((c: SkillCourse) => c.title.includes('German'));
        setCourse(germanCourse || fallbackGermanCourse);
      } catch (error) {
        console.error('Failed to fetch course data', error);
        setApiError(true);
        setCourse(fallbackGermanCourse);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, []);

  const displayCourse = course || fallbackGermanCourse;
  const selectedLevelDetails = displayCourse.levels?.find((level) => level.name === selectedLevelName);

  const navItems = [
    { id: 'about', label: t.navigation.about },
    { id: 'why-learn', label: t.navigation.whyLearn },
    { id: 'levels', label: t.navigation.levels },
    { id: 'visa', label: t.navigation.visa },
    { id: 'faq', label: t.navigation.faq }
  ];

  return (
    <div className="relative min-h-screen bg-brand-white text-brand-black">
      <Header />

      {/* Floating Language Toggle */}
      <button
        onClick={() => setLang(lang === 'de' ? 'en' : 'de')}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex items-center justify-center gap-2 px-4 py-2.5 md:px-5 md:py-3 bg-brand-gold hover:bg-brand-gold-hover text-brand-black font-semibold md:font-bold text-xs md:text-sm rounded-full shadow-[0_4px_20px_rgba(214,177,97,0.4)] transition-all hover:-translate-y-1 active:scale-95"
      >
        <Globe className="w-4 h-4 md:w-4 md:h-4 animate-pulse shrink-0" />
        <span className="whitespace-nowrap">{lang === 'de' ? '🇬🇧 Translate to English' : '🇩🇪 Auf Deutsch lesen'}</span>
      </button>

      {/* Hero Section */}
      <section className="bg-brand-black text-brand-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden relative border-b-[8px] border-brand-red">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(232,160,32,0.05),transparent)]" aria-hidden="true" />
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-left">
            <div className="text-6xl sm:text-7xl mb-6">{t.hero.emoji}</div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-brand-white mb-6 leading-tight">
              {t.hero.titleBase}<br className="hidden sm:block"/> <span className="text-brand-red">{t.hero.titleHighlight}</span>
            </h1>
            <p className="text-lg sm:text-xl text-brand-off-white max-w-2xl mb-12 leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {t.hero.stats.map((stat, idx) => (
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
              src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Neuschwanstein Castle"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent"></div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Scroll Navigation */}
      <nav className="bg-brand-white/95 backdrop-blur-md shadow-md sticky top-0 md:top-20 z-30 border-b border-brand-surface">
        <div className="max-w-6xl mx-auto flex overflow-x-auto scrollbar-hide">
          {navItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`flex-1 min-w-max py-4 px-6 text-center font-bold text-sm whitespace-nowrap transition-all border-b-4 ${
                activeSection === tab.id
                  ? 'border-brand-red text-brand-red bg-brand-off-white'
                  : 'border-transparent text-brand-olive hover:text-brand-red hover:bg-brand-off-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Loading */}
      {loading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-red border-t-transparent"></div>
        </div>
      )}
      {apiError && !loading && (
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <div className="flex items-center gap-3 rounded-lg border border-brand-gold/30 bg-brand-gold/10 p-4 text-sm text-brand-black">
            <AlertCircle className="h-5 w-5 text-brand-gold" />
            <span>Showing cached course information. System couldn't reach the live server.</span>
          </div>
        </div>
      )}

      {!loading && (
        <main>
          {/* ═══════════════════════════════════════════════════
              Section 1: About Germany
             ═══════════════════════════════════════════════════ */}
          <section
            id="about"
            ref={setSectionRef('about')}
            className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-off-white"
          >
            <div className="max-w-6xl mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-14">
                <motion.div variants={fadeInUp} className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold text-brand-black mb-4">{t.about.title}</h2>
                  <div className="w-16 h-1 bg-brand-red mx-auto rounded"></div>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  className="w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden relative shadow-lg group mx-auto"
                >
                  <img src="https://images.unsplash.com/photo-1599946347371-68eb71b16afc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Berlin Cityscape" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-brand-white">
                    <div className="text-2xl md:text-3xl font-bold">{t.about.berlinLabel}</div>
                    <div className="text-sm md:text-base text-brand-off-white font-medium">{t.about.berlinDesc}</div>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-8">
                  {t.about.cards.map((card, idx) => (
                    <motion.div key={idx} variants={fadeInUp} className="bg-brand-white p-8 rounded-xl shadow-[0_2px_12px_rgba(110,110,80,0.10)] border-t-4 border-brand-red hover:border-brand-gold transition-all duration-300 hover:-translate-y-1">
                      <h3 className="text-xl font-bold text-brand-black mb-4">{card.title}</h3>
                      <p className="text-sm text-brand-olive-dark mb-4">{card.text}</p>
                      <span className="px-3 py-1 bg-brand-surface rounded-md text-xs font-bold text-brand-black">{card.highlight}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div variants={fadeInUp} className="max-w-3xl mx-auto border-l-4 border-brand-gold pl-8 py-4 space-y-10 relative">
                  {t.about.heritage.timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[45px] top-1 w-5 h-5 bg-brand-red border-4 border-brand-white rounded-full shadow"></div>
                      <h4 className="text-xl font-bold text-brand-black mb-2">{item.title}</h4>
                      <p className="text-brand-olive-dark">{item.desc}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Divider */}
          <div className="h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent"></div>

          {/* ═══════════════════════════════════════════════════
              Section 2: Why Learn German
             ═══════════════════════════════════════════════════ */}
          <section
            id="why-learn"
            ref={setSectionRef('why-learn')}
            className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-white"
          >
            <div className="max-w-6xl mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-12">
                <motion.div variants={fadeInUp} className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold text-brand-black mb-4">{t.whyLearn.title}</h2>
                  <div className="w-16 h-1 bg-brand-red mx-auto rounded"></div>
                </motion.div>

                <motion.div className="grid md:grid-cols-2 gap-6">
                  {t.whyLearn.list.map((item) => (
                    <motion.div variants={fadeInUp} key={item.id} className="flex bg-brand-white p-6 rounded-xl shadow-sm border-l-4 border-brand-gold shadow-[0_2px_12px_rgba(110,110,80,0.10)] hover:border-brand-red hover:-translate-y-1 transition-all duration-300">
                      <div className="text-4xl font-extrabold text-brand-surface mr-6">{item.id.toString().padStart(2, '0')}</div>
                      <div>
                        <h4 className="text-lg font-bold text-brand-black mb-1">{item.title}</h4>
                        <p className="text-sm text-brand-olive-dark">{item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Divider */}
          <div className="h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent"></div>

          {/* ═══════════════════════════════════════════════════
              Section 3: Course Levels
             ═══════════════════════════════════════════════════ */}
          <section
            id="levels"
            ref={setSectionRef('levels')}
            className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-off-white"
          >
            <div className="max-w-6xl mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-12">
                <motion.div variants={fadeInUp} className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold text-brand-black mb-4">{t.levels.title}</h2>
                  <div className="w-16 h-1 bg-brand-red mx-auto rounded"></div>
                </motion.div>

                <motion.div className="grid lg:grid-cols-3 gap-6">
                  {displayCourse.levels && displayCourse.levels.length > 0 ? (
                    displayCourse.levels.map((level, index) => (
                      <CourseLevelCard
                        key={index}
                        level={level}
                        onEnroll={() => { setSelectedLevelName(level.name); setIsEnrollModalOpen(true); }}
                        lang={lang}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-brand-olive-light p-12 text-center text-brand-olive col-span-3">No course levels available at the moment.</div>
                  )}
                </motion.div>

                <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-6 pt-4">
                  <div className="p-6 bg-brand-white rounded-xl shadow-[0_2px_12px_rgba(110,110,80,0.10)] border-t-4 border-brand-gold hover:-translate-y-1 transition-all duration-300">
                    <BookOpen className="w-8 h-8 text-brand-gold mb-4" />
                    <h3 className="font-bold text-brand-black mb-2">{lang === 'de' ? 'Lesen & Schreiben' : 'Reading & Writing'}</h3>
                    <p className="text-sm text-brand-olive-dark">{lang === 'de' ? 'Beherrsche Grammatik und Wortschatz, um Kommunikation problemlos zu bewältigen.' : 'Master grammar and vocabulary to handle communication smoothly.'}</p>
                  </div>
                  <div className="p-6 bg-brand-white rounded-xl shadow-[0_2px_12px_rgba(110,110,80,0.10)] border-t-4 border-brand-gold hover:-translate-y-1 transition-all duration-300">
                    <MessageCircle className="w-8 h-8 text-brand-gold mb-4" />
                    <h3 className="font-bold text-brand-black mb-2">{lang === 'de' ? 'Sprechen & Hören' : 'Speaking & Listening'}</h3>
                    <p className="text-sm text-brand-olive-dark">{lang === 'de' ? 'Umfangreiche Konversationspraxis mit Fokus auf korrekte Aussprache.' : 'Extensive conversational practice focusing on correct pronunciation.'}</p>
                  </div>
                  <div className="p-6 bg-brand-white rounded-xl shadow-[0_2px_12px_rgba(110,110,80,0.10)] border-t-4 border-brand-gold hover:-translate-y-1 transition-all duration-300">
                    <FileText className="w-8 h-8 text-brand-gold mb-4" />
                    <h3 className="font-bold text-brand-black mb-2">{lang === 'de' ? 'Prüfungsvorbereitung' : 'Exam Prep'}</h3>
                    <p className="text-sm text-brand-olive-dark">{lang === 'de' ? 'Gezieltes Training für offizielle Zertifizierungen.' : 'Targeted training for official certification.'}</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Divider */}
          <div className="h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent"></div>

          {/* ═══════════════════════════════════════════════════
              Section 4: Visa & Immigration
             ═══════════════════════════════════════════════════ */}
          <section
            id="visa"
            ref={setSectionRef('visa')}
            className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-white"
          >
            <div className="max-w-6xl mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-12">
                <motion.div variants={fadeInUp} className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold text-brand-black mb-4">{t.visa.title}</h2>
                  <div className="w-16 h-1 bg-brand-red mx-auto rounded"></div>
                </motion.div>

                <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {t.visa.types.map((visa, idx) => (
                    <motion.div key={idx} variants={fadeInUp} className="bg-brand-white p-6 rounded-xl shadow-[0_2px_12px_rgba(110,110,80,0.10)] border-t-4 border-brand-black hover:border-brand-red hover:-translate-y-1 transition-all duration-300">
                      <div className="text-3xl mb-3">{visa.icon}</div>
                      <h3 className="font-bold text-xl text-brand-black mb-2">{visa.title}</h3>
                      <p className="text-brand-olive-dark text-sm mb-4">{visa.desc}</p>
                      <span className="inline-block px-3 py-1 bg-brand-gold text-brand-black font-bold text-xs rounded-full">{visa.req}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Divider */}
          <div className="h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent"></div>

          {/* ═══════════════════════════════════════════════════
              Section 5: FAQ
             ═══════════════════════════════════════════════════ */}
          <section
            id="faq"
            ref={setSectionRef('faq')}
            className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-off-white"
          >
            <div className="max-w-3xl mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-12">
                <motion.div variants={fadeInUp} className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold text-brand-black mb-4">{t.faq.title}</h2>
                  <div className="w-16 h-1 bg-brand-red mx-auto rounded"></div>
                </motion.div>

                <motion.div variants={fadeInUp} className="space-y-4">
                  {t.faq.questions.map((faq, idx) => (
                    <div key={idx} className="bg-brand-white rounded-xl shadow-sm border border-brand-surface overflow-hidden">
                      <button
                        onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                        className="w-full px-6 py-5 flex items-center justify-between font-bold text-brand-black focus:outline-none hover:bg-brand-off-white transition-colors"
                      >
                        <span className="text-left text-lg">{faq.question}</span>
                        <span className={`text-brand-red text-2xl font-bold ml-4 transition-transform duration-200 ${openFAQ === idx ? 'rotate-45' : ''}`}>+</span>
                      </button>
                      <AnimatePresence>
                        {openFAQ === idx && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                            <div className="px-6 pb-5 text-brand-olive-dark pt-2 leading-relaxed">{faq.answer}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-brand-black py-20 px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-gold mb-6">
                {lang === 'de' ? 'Bereit, deine Reise zu beginnen?' : 'Ready to Start Your Journey?'}
              </h2>
              <p className="text-brand-off-white max-w-2xl mx-auto mb-10 text-lg">
                {lang === 'de' ? 'Melden Sie sich noch heute für den Sprachkurs an!' : 'Enroll in the Skyline German Course today!'}
              </p>
              <button
                onClick={() => { scrollToSection('levels'); }}
                className="inline-block px-10 py-4 bg-brand-red hover:bg-brand-red-hover text-brand-white font-bold text-lg rounded transition-colors shadow-xl"
              >
                {lang === 'de' ? 'Jetzt Teilnahme sichern' : 'Join Skyline German Course'}
              </button>
            </motion.div>
          </section>
        </main>
      )}

      <Footer />

      <EnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        origin="german"
        originPath="/training/german"
        selectedLevel={selectedLevelName}
        paymentAmount={selectedLevelDetails?.price}
      />
    </div>
  );
};

export default CourseGermanPage;
