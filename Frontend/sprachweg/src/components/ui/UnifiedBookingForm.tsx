import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, Check, ChevronLeft, Languages, Loader2, Mail, User } from 'lucide-react';
import api, { languageAPI } from '../../lib/api';

interface UnifiedBookingFormProps {
    isOpen: boolean;
    onClose: () => void;
}

interface LanguageLevelOption {
    name: string;
    duration?: string;
}

interface LanguageCourseOption {
    _id: string;
    title: string;
    levels: LanguageLevelOption[];
}

interface FormData {
    fullName: string;
    countryCode: string;
    phone: string;
    email: string;
    languageCourseId: string;
    levelName: string;
    comments: string;
}

const initialFormData: FormData = {
    fullName: '',
    countryCode: '+91',
    phone: '',
    email: '',
    languageCourseId: '',
    levelName: '',
    comments: '',
};

const getLanguageDisplayName = (title: string) => {
    const trimmedTitle = String(title || '').trim();
    const displayName = trimmedTitle.replace(/\s+language\s+training$/i, '').trim();
    return displayName || trimmedTitle;
};

const UnifiedBookingForm: React.FC<UnifiedBookingFormProps> = ({ isOpen, onClose }) => {
    const shouldReduceMotion = useReducedMotion();
    const modalRef = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [languageCourses, setLanguageCourses] = useState<LanguageCourseOption[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [courseLoadError, setCourseLoadError] = useState('');

    const selectedLanguageCourse = languageCourses.find((course) => course._id === formData.languageCourseId);

    useEffect(() => {
        if (!isOpen) return;

        document.body.style.overflow = 'hidden';
        let active = true;

        const fetchLanguageCourses = async () => {
            setIsLoadingCourses(true);
            setCourseLoadError('');

            try {
                const response = await languageAPI.getAll();
                if (!active) return;

                const normalizedCourses = Array.isArray(response)
                    ? response
                        .filter((course: any) => course?._id && course?.title && Array.isArray(course?.levels))
                        .map((course: any) => ({
                            _id: String(course._id),
                            title: String(course.title),
                            levels: course.levels
                                .filter((level: any) => level?.name)
                                .map((level: any) => ({
                                    name: String(level.name),
                                    duration: typeof level.duration === 'string' ? level.duration : undefined,
                                })),
                        }))
                        .filter((course: LanguageCourseOption) => course.levels.length > 0)
                        .sort((a: LanguageCourseOption, b: LanguageCourseOption) => a.title.localeCompare(b.title))
                    : [];

                setLanguageCourses(normalizedCourses);
            } catch (error) {
                console.error('Failed to fetch language courses for the free-trial form:', error);
                if (active) {
                    setCourseLoadError('Unable to load the latest language catalog right now. Please try again.');
                }
            } finally {
                if (active) {
                    setIsLoadingCourses(false);
                }
            }
        };

        fetchLanguageCourses();

        return () => {
            active = false;
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const validateStep1 = () => {
        const nextErrors: Partial<Record<keyof FormData, string>> = {};

        if (formData.fullName.trim().length < 2) nextErrors.fullName = 'Name must be at least 2 characters';
        if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Valid email is required';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const validateStep2 = () => {
        const nextErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.languageCourseId) nextErrors.languageCourseId = 'Please select a language';
        if (!formData.levelName) nextErrors.levelName = 'Please select a level';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep2() || !selectedLanguageCourse) return;

        setIsSubmitting(true);

        try {
            await api.post('/trials', {
                fullName: formData.fullName.trim(),
                countryCode: formData.countryCode,
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                interest: 'Language',
                languageCourseId: selectedLanguageCourse._id,
                language: getLanguageDisplayName(selectedLanguageCourse.title),
                course: formData.levelName,
                comments: formData.comments.trim(),
            });

            setShowSuccess(true);
            setTimeout(() => handleClose(), 2500);
        } catch (error: any) {
            console.error('Trial request submission failed:', error);
            alert(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setStep(1);
            setFormData(initialFormData);
            setErrors({});
            setShowSuccess(false);
            setCourseLoadError('');
        }, 300);
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => {
            const next = { ...prev, [field]: value };
            if (field === 'languageCourseId') next.levelName = '';
            return next;
        });
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-end md:items-center" role="dialog" aria-modal="true">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => handleClose()}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    ref={modalRef}
                    initial={{ y: '100%', opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: '100%', opacity: 0, scale: 0.95 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.4, type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative flex h-[90vh] w-full flex-col overflow-hidden bg-white sm:h-auto sm:max-h-[85vh] sm:rounded-t-2xl md:h-auto md:w-full md:max-w-3xl md:rounded-2xl shadow-2xl"
                >
                    <div className="flex items-center justify-between border-b border-brand-surface bg-white px-6 py-4">
                        <button onClick={() => step > 1 ? setStep(1) : handleClose()} className="flex items-center gap-1 text-sm font-medium text-brand-olive hover:text-brand-black">
                            <ChevronLeft className="h-5 w-5" />
                            {step > 1 ? 'Back' : 'Close'}
                        </button>
                        <h2 className="text-lg font-bold text-brand-black">Book Free Trial</h2>
                        <div className="flex items-center gap-1 text-xs font-medium text-brand-olive-light">
                            Step <span className="text-brand-gold">{step}</span>/2
                        </div>
                    </div>

                    <div className="h-1 w-full bg-brand-surface">
                        <motion.div className="h-full bg-brand-gold" initial={{ width: '0%' }} animate={{ width: `${(step / 2) * 100}%` }} transition={{ duration: 0.3 }} />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        {showSuccess ? (
                            <SuccessView />
                        ) : (
                            <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
                                {Object.values(errors).some(Boolean) && (
                                    <div className="flex gap-2 rounded-lg bg-brand-red/5 p-4 text-sm text-brand-red animate-pulse">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <span>Please correct the errors below.</span>
                                    </div>
                                )}

                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                            <div>
                                                <h3 className="mb-1 text-xl font-bold text-brand-black">Personal Details</h3>
                                                <p className="text-sm text-brand-olive">Let&apos;s get to know you before we schedule the language trial.</p>
                                            </div>
                                            <div className="space-y-4">
                                                <InputField label="Full Name" required icon={<User className="h-4 w-4" />} value={formData.fullName} onChange={(value) => handleInputChange('fullName', value)} error={errors.fullName} placeholder="John Doe" />
                                                <InputField label="Email Address" required type="email" icon={<Mail className="h-4 w-4" />} value={formData.email} onChange={(value) => handleInputChange('email', value)} error={errors.email} placeholder="john@example.com" />
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-semibold text-brand-black">Phone <span className="text-brand-red">*</span></label>
                                                    <div className="flex rounded-lg border-[1.5px] border-brand-olive-light focus-within:border-brand-red focus-within:ring-2 focus-within:ring-brand-red/15">
                                                        <select className="rounded-l-lg border-r border-brand-surface bg-brand-off-white px-2 text-sm text-brand-olive-dark outline-none" value={formData.countryCode} onChange={(e) => handleInputChange('countryCode', e.target.value)}>
                                                            <option value="+91">+91</option>
                                                            <option value="+1">+1</option>
                                                            <option value="+44">+44</option>
                                                            <option value="+49">+49</option>
                                                            <option value="+81">+81</option>
                                                        </select>
                                                        <input type="tel" className="w-full flex-1 rounded-r-lg bg-transparent px-3 py-2.5 text-brand-black outline-none" placeholder="9876543210" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                                                    </div>
                                                    {errors.phone && <span className="mt-1 text-xs text-brand-red">{errors.phone}</span>}
                                                </div>
                                            </div>
                                            <button type="button" onClick={handleNext} className="w-full rounded-lg bg-brand-red py-4 font-bold text-white shadow-lg hover:bg-brand-red-hover">Continue</button>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                            <div>
                                                <h3 className="mb-1 text-xl font-bold text-brand-black">Language Preferences</h3>
                                                <p className="text-sm text-brand-olive">Choose the language and level you want to explore in your free trial.</p>
                                            </div>

                                            <div className="rounded-xl border border-brand-surface bg-brand-off-white p-4">
                                                <h4 className="mb-3 flex items-center gap-2 font-bold text-brand-red"><Languages className="h-4 w-4" /> Language Training</h4>

                                                {courseLoadError && (
                                                    <div className="mb-4 rounded-lg border border-brand-red/15 bg-brand-red/5 p-3 text-sm text-brand-red">
                                                        <p>{courseLoadError}</p>
                                                        <p className="mt-2">Close and reopen the form to retry.</p>
                                                    </div>
                                                )}

                                                <div className="space-y-3">
                                                    <SelectField
                                                        label="Select Language"
                                                        value={formData.languageCourseId}
                                                        onChange={(value) => handleInputChange('languageCourseId', value)}
                                                        error={errors.languageCourseId}
                                                        disabled={isLoadingCourses || languageCourses.length === 0}
                                                        options={[
                                                            { label: isLoadingCourses ? 'Loading languages...' : 'Select Language...', value: '' },
                                                            ...languageCourses.map((course) => ({ label: getLanguageDisplayName(course.title), value: course._id })),
                                                        ]}
                                                    />
                                                    <SelectField
                                                        label="Select Level"
                                                        value={formData.levelName}
                                                        onChange={(value) => handleInputChange('levelName', value)}
                                                        error={errors.levelName}
                                                        disabled={isLoadingCourses || !selectedLanguageCourse}
                                                        options={[
                                                            { label: isLoadingCourses ? 'Loading levels...' : selectedLanguageCourse ? 'Select Level...' : 'Select a language first', value: '' },
                                                            ...(selectedLanguageCourse?.levels || []).map((level) => ({ label: level.duration ? `${level.name} - ${level.duration}` : level.name, value: level.name })),
                                                        ]}
                                                    />
                                                    {isLoadingCourses && (
                                                        <div className="flex items-center gap-2 text-sm text-brand-olive">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            <span>Syncing the latest language catalog from the backend.</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-brand-black">Any Questions?</label>
                                                <textarea rows={3} className="w-full rounded-lg border-[1.5px] border-brand-olive-light bg-white p-3 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15" placeholder="Optional..." value={formData.comments} onChange={(e) => handleInputChange('comments', e.target.value)} />
                                            </div>

                                            <button type="submit" disabled={isSubmitting || isLoadingCourses || !!courseLoadError} className="w-full rounded-lg bg-brand-red py-4 font-bold text-white shadow-lg hover:bg-brand-red-hover disabled:opacity-70">
                                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const InputField: React.FC<{ label: string; required?: boolean; error?: string; icon?: React.ReactNode; onChange: (value: string) => void; value: string; type?: string; placeholder?: string }> = ({ label, required, error, icon, onChange, ...props }) => (
    <div>
        <label className="mb-1.5 block text-sm font-semibold text-brand-black">{label} {required && <span className="text-brand-red">*</span>}</label>
        <div className="relative">
            {icon && <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-olive-light">{icon}</div>}
            <input {...props} onChange={(e) => onChange(e.target.value)} className={`w-full rounded-lg border-[1.5px] bg-white px-4 py-2.5 text-brand-black focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/15 ${icon ? 'pl-10' : ''} ${error ? 'border-brand-red' : 'border-brand-olive-light'}`} />
        </div>
        {error && <span className="mt-1 text-xs text-brand-red">{error}</span>}
    </div>
);

const SelectField: React.FC<{ label: string; onChange: (value: string) => void; error?: string; options: { label: string; value: string }[]; value: string; disabled?: boolean }> = ({ label, onChange, error, options, value, disabled }) => (
    <div>
        <label className="mb-1.5 block text-sm font-semibold text-brand-black">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`w-full rounded-lg border-[1.5px] bg-white px-4 py-2.5 text-brand-black focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/15 disabled:cursor-not-allowed disabled:bg-brand-surface ${error ? 'border-brand-red' : 'border-brand-olive-light'}`}>
            {options.map((option) => <option key={`${option.value}-${option.label}`} value={option.value}>{option.label}</option>)}
        </select>
        {error && <span className="mt-1 text-xs text-brand-red">{error}</span>}
    </div>
);

const SuccessView = () => (
    <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-olive/10 text-brand-olive animate-pulse"><Check className="h-12 w-12" /></div>
        <h3 className="mb-2 text-2xl font-bold text-brand-black">Request Sent!</h3>
        <p className="max-w-xs text-brand-olive-dark">We&apos;ll be in touch shortly to schedule your free trial.</p>
    </div>
);

export default UnifiedBookingForm;
