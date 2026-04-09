import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, Check, AlertCircle, Mail, User, Globe, BookOpen, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// npm packages: framer-motion, lucide-react, react-router-dom

// Tokens
// --brand-black: #1C1C1A
// --brand-gold: #E8A020
// --brand-white: #ffffff

interface BookingFormProps {
    isOpen: boolean;
    onClose: () => void;
    originPath?: string;
    originLanguage?: 'german' | 'english' | 'japanese';
}

interface FormData {
    fullName: string;
    countryCode: string;
    phone: string;
    email: string;
    guardianName: string;
    guardianPhone: string;
    language: string;
    course: string;
    prepLevel: string; // Only for German prep courses
    comments: string;
}

const initialFormData: FormData = {
    fullName: '',
    countryCode: '+91',
    phone: '',
    email: '',
    guardianName: '',
    guardianPhone: '',
    language: '',
    course: '',
    prepLevel: '',
    comments: '',
};

const COURSES_BY_LANGUAGE: Record<string, string[]> = {
    german: [
        'A1 to B1', 'A1 to B2', 'A1', 'A2', 'B1', 'B2',
        'Preparation course 7 days (telc)', 'Preparation course 15 days (telc)'
    ],
    english: ['Academic IELTS', 'General IELTS'],
    japanese: ['N5', 'N4', 'N3', 'N2', 'N1']
};

const PREP_COURSES = ['Preparation course 7 days (telc)', 'Preparation course 15 days (telc)'];

const BookingForm: React.FC<BookingFormProps> = ({ isOpen, onClose, originPath, originLanguage }) => {
    const navigate = useNavigate();
    const shouldReduceMotion = useReducedMotion();
    const modalRef = useRef<HTMLDivElement>(null);

    // State
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Preselect language
    useEffect(() => {
        if (originLanguage && isOpen && !formData.language) {
            setFormData(prev => ({ ...prev, language: originLanguage }));
        }
    }, [originLanguage, isOpen]);

    // Focus Trap & Scroll Lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';

            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements?.[0] as HTMLElement;
            const lastElement = focusableElements?.[focusableElements?.length - 1] as HTMLElement;

            const handleTab = (e: KeyboardEvent) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement?.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement?.focus();
                        }
                    }
                }
            };

            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') handleClose();
            };

            document.addEventListener('keydown', handleTab);
            document.addEventListener('keydown', handleEscape);
            firstElement?.focus();

            return () => {
                document.body.style.overflow = '';
                document.removeEventListener('keydown', handleTab);
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isOpen]);

    const validateStep1 = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        let isValid = true;

        if (formData.fullName.trim().length < 2) { newErrors.fullName = 'Name must be at least 2 characters'; isValid = false; }
        if (!formData.phone.trim()) { newErrors.phone = 'Phone number is required'; isValid = false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { newErrors.email = 'Valid email is required'; isValid = false; }

        if (!formData.guardianName.trim()) { newErrors.guardianName = 'Guardian name is required'; isValid = false; }
        if (!formData.guardianPhone.trim()) { newErrors.guardianPhone = 'Guardian phone is required'; isValid = false; }

        setErrors(prev => ({ ...prev, ...newErrors }));
        return isValid;
    };

    const validateStep2 = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        let isValid = true;

        if (!formData.language) { newErrors.language = 'Please select a language'; isValid = false; }
        if (!formData.course) { newErrors.course = 'Please select a course'; isValid = false; }

        // Check Prep Level Logic
        if (formData.language === 'german' && PREP_COURSES.includes(formData.course)) {
            if (!formData.prepLevel) { newErrors.prepLevel = 'Select a level (B1 or B2)'; isValid = false; }
        }

        setErrors(prev => ({ ...prev, ...newErrors }));
        return isValid;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setIsSubmitting(true);
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            // Map form data to backend expected format
            // Backend expects: { courseTitle, levelName }
            const payload = {
                courseTitle: formData.course, // Assuming course name maps to title
                levelName: formData.prepLevel || 'Beginner' // Default or specific level
            };

            await axios.post('http://localhost:5000/api/language-training/enroll', payload, config);


            setShowSuccess(true);

            setTimeout(() => {
                handleClose(true);
            }, 2000);
        } catch (error: any) {
            console.error('Enrollment error:', error);
            // Show error to user (you might want to add a state for apiError)
            alert(error.response?.data?.message || 'Enrollment failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = (success = false) => {
        if (success && originPath?.includes('?redirect=confirm')) {
            navigate('/booking-confirmation');
        } else {
            // Simply close the modal without browser navigation
            if (originPath) navigate(originPath);
            onClose();
        }
        // Reset state on close
        setTimeout(() => {
            setStep(1);
            setFormData(initialFormData);
            setErrors({});
            setShowSuccess(false);
        }, 300);
    };

    const handleInputChange = (field: keyof FormData, value: any) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            // Reset dependent fields
            if (field === 'language') { next.course = ''; next.prepLevel = ''; }
            if (field === 'course') { next.prepLevel = ''; }
            return next;
        });
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center sm:items-end md:items-center"
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-title"
            >
                {/* Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleClose()}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    aria-hidden="true"
                />

                {/* Panel */}
                <motion.div
                    ref={modalRef}
                    initial={{ y: '100%', opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: '100%', opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300, duration: shouldReduceMotion ? 0 : 0.5 }}
                    className="relative flex h-[90vh] w-full flex-col overflow-hidden bg-white sm:h-auto sm:max-h-[85vh] sm:rounded-t-2xl md:h-auto md:w-full md:max-w-3xl md:rounded-2xl shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-brand-surface bg-white px-6 py-4">
                        <button
                            onClick={() => handleClose()}
                            className="group flex items-center gap-1 text-sm font-medium text-brand-olive transition-colors hover:text-brand-black"
                            aria-label="Close"
                        >
                            <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                            Back
                        </button>
                        <h2 id="booking-title" className="text-lg font-bold text-brand-black">
                            Book Free Trial
                        </h2>
                        <div className="flex items-center gap-1 text-xs font-medium text-brand-olive-light">
                            Step <span className="text-brand-gold">{step}</span>/2
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-brand-surface">
                        <motion.div
                            className="h-full bg-brand-gold"
                            initial={{ width: '0%' }}
                            animate={{ width: step === 1 ? '50%' : '100%' }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        {showSuccess ? (
                            <SuccessView />
                        ) : (
                            <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
                                {/* Error Summary */}
                                {Object.keys(errors).length > 0 && (
                                    <div className="rounded-lg bg-brand-red/5 p-4 text-sm text-brand-red flex gap-2 animate-pulse">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <span>Please correct the errors below.</span>
                                    </div>
                                )}

                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="mb-4">
                                                <h3 className="text-xl font-bold text-brand-black mb-1">Personal Details</h3>
                                                <p className="text-sm text-brand-olive">Tell us a bit about yourself</p>
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-2">
                                                <InputField
                                                    label="Full Name"
                                                    required
                                                    icon={<User className="h-4 w-4" />}
                                                    value={formData.fullName}
                                                    onChange={v => handleInputChange('fullName', v)}
                                                    error={errors.fullName}
                                                    placeholder="John Doe"
                                                />

                                                {/* Phone */}
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                                        Phone <span className="text-brand-red">*</span>
                                                    </label>
                                                    <div className="flex rounded-lg border border-brand-surface bg-white focus-within:ring-2 focus-within:ring-brand-gold">
                                                        <select
                                                            className="rounded-l-lg bg-brand-off-white px-2 text-sm text-brand-olive-dark focus:outline-none border-r border-brand-surface"
                                                            value={formData.countryCode}
                                                            onChange={e => handleInputChange('countryCode', e.target.value)}
                                                        >
                                                            <option value="+91">+91</option>
                                                            <option value="+1">+1</option>
                                                            <option value="+44">+44</option>
                                                            <option value="+49">+49</option>
                                                            <option value="+81">+81</option>
                                                        </select>
                                                        <input
                                                            type="tel"
                                                            className="w-full flex-1 rounded-r-lg bg-transparent px-3 py-2.5 text-brand-black placeholder:text-brand-olive-light focus:outline-none"
                                                            placeholder="9876543210"
                                                            value={formData.phone}
                                                            onChange={e => handleInputChange('phone', e.target.value)}
                                                        />
                                                    </div>
                                                    {errors.phone && <span className="mt-1 text-xs text-brand-red">{errors.phone}</span>}
                                                </div>

                                                <InputField
                                                    label="Email Address"
                                                    required
                                                    type="email"
                                                    icon={<Mail className="h-4 w-4" />}
                                                    value={formData.email}
                                                    onChange={v => handleInputChange('email', v)}
                                                    error={errors.email}
                                                    className="md:col-span-2"
                                                    placeholder="john@example.com"
                                                />
                                            </div>

                                            {/* Guardian Fields */}
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <InputField
                                                    label="Guardian Name"
                                                    required
                                                    value={formData.guardianName}
                                                    onChange={v => handleInputChange('guardianName', v)}
                                                    error={errors.guardianName}
                                                />
                                                <InputField
                                                    label="Guardian Phone"
                                                    required
                                                    type="tel"
                                                    value={formData.guardianPhone}
                                                    onChange={v => handleInputChange('guardianPhone', v)}
                                                    error={errors.guardianPhone}
                                                />
                                            </div>

                                            <div className="pt-4">
                                                <button
                                                    type="button"
                                                    onClick={handleNext}
                                                    className="w-full rounded-lg bg-brand-black py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-brand-olive-dark hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
                                                >
                                                    Continue
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-6"
                                        >
                                            <div className="mb-4">
                                                <h3 className="text-xl font-bold text-brand-black mb-1">Course Preferences</h3>
                                                <p className="text-sm text-brand-olive">Select your learning path</p>
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-2">
                                                <SelectField
                                                    label="Language"
                                                    required
                                                    value={formData.language}
                                                    onChange={v => handleInputChange('language', v)}
                                                    error={errors.language}
                                                    options={[
                                                        { label: 'Select Language', value: '' },
                                                        { label: 'German', value: 'german' },
                                                        { label: 'English', value: 'english' },
                                                        { label: 'Japanese', value: 'japanese' },
                                                    ]}
                                                    icon={<Globe className="h-4 w-4" />}
                                                />

                                                <SelectField
                                                    label="Course"
                                                    required
                                                    value={formData.course}
                                                    onChange={v => handleInputChange('course', v)}
                                                    error={errors.course}
                                                    disabled={!formData.language}
                                                    options={[
                                                        { label: 'Select Course', value: '' },
                                                        ...(COURSES_BY_LANGUAGE[formData.language] || []).map(c => ({ label: c, value: c }))
                                                    ]}
                                                    icon={<BookOpen className="h-4 w-4" />}
                                                />

                                                {/* Prep Level Conditional */}
                                                <AnimatePresence>
                                                    {formData.language === 'german' && PREP_COURSES.includes(formData.course) && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="md:col-span-2"
                                                        >
                                                            <SelectField
                                                                label="Target Level"
                                                                required
                                                                value={formData.prepLevel}
                                                                onChange={v => handleInputChange('prepLevel', v)}
                                                                error={errors.prepLevel}
                                                                options={[
                                                                    { label: 'Select Level', value: '' },
                                                                    { label: 'B1', value: 'B1' },
                                                                    { label: 'B2', value: 'B2' },
                                                                ]}
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Comments */}
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                                    Optional Comments
                                                </label>
                                                <textarea
                                                    rows={4}
                                                    className="w-full rounded-lg border border-brand-surface bg-white px-4 py-3 text-sm text-brand-black placeholder:text-brand-olive-light focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                                    placeholder="Any specific goals or questions?"
                                                    value={formData.comments}
                                                    onChange={e => handleInputChange('comments', e.target.value)}
                                                />
                                            </div>

                                            {/* Actions */}
                                            <div className="pt-4 flex flex-col gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full rounded-lg bg-brand-gold py-4 text-base font-bold text-brand-black shadow-lg transition-all hover:bg-brand-gold-hover hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 disabled:opacity-70"
                                                >
                                                    {isSubmitting ? 'Processing...' : 'Book Free Trial'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setStep(1)}
                                                    className="w-full text-sm font-semibold text-brand-olive hover:text-brand-black py-2"
                                                >
                                                    Back to Details
                                                </button>
                                            </div>
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

// --- Subcomponents ---

interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
    onChange: (value: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({ label, required, error, icon, className = '', onChange, ...props }) => (
    <div className={className}>
        <label className="mb-1.5 block text-sm font-semibold text-brand-black">
            {label} {required && <span className="text-brand-red">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-olive-light pointer-events-none">
                    {icon}
                </div>
            )}
            <input
                {...props}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full rounded-lg border bg-white px-4 py-2.5 text-brand-black transition-all placeholder:text-brand-olive-light focus:outline-none focus:ring-2
             ${icon ? 'pl-10' : ''}
             ${error ? 'border-brand-red focus:ring-brand-red/20' : 'border-brand-surface focus:ring-brand-gold'}
          `}
            />
        </div>
        {error && <span className="mt-1 text-xs text-brand-red">{error}</span>}
    </div>
);

interface SelectOption {
    label: string;
    value: string | number;
}

interface SelectFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    icon?: React.ReactNode;
    options: SelectOption[];
    disabled?: boolean;
    value: string | number;
    onChange: (value: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, required, error, icon, options, disabled, onChange, value }) => (
    <div>
        <label className="mb-1.5 block text-sm font-semibold text-brand-black">
            {label} {required && <span className="text-brand-red">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-olive-light pointer-events-none">
                    {icon}
                </div>
            )}
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className={`w-full appearance-none rounded-lg border bg-white px-4 py-2.5 text-brand-black transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:bg-brand-surface
             ${icon ? 'pl-10' : ''}
             ${error ? 'border-brand-red focus:ring-brand-red/20' : 'border-brand-surface focus:ring-brand-gold'}
          `}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-olive-light pointer-events-none" />
        </div>
        {error && <span className="mt-1 text-xs text-brand-red">{error}</span>}
    </div>
);

const SuccessView = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-full flex-col items-center justify-center text-center"
    >
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-olive/10 text-brand-olive animate-pulse">
            <Check className="h-12 w-12" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-brand-black">Request Sent!</h3>
        <p className="max-w-xs text-brand-olive-dark">
            We'll be in touch shortly to schedule your free trial.
        </p>

        {/* Confetti-lite CSS */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-brand-gold"
                    initial={{ x: '50%', y: '50%', opacity: 1, scale: 0 }}
                    animate={{
                        x: `${50 + (Math.random() - 0.5) * 100}%`,
                        y: `${50 + (Math.random() - 0.5) * 100}%`,
                        opacity: 0,
                        scale: 1
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{
                        width: Math.random() * 10 + 5,
                        height: Math.random() * 10 + 5,
                        borderRadius: '50%'
                    }}
                />
            ))}
        </div>
    </motion.div>
);

export default BookingForm;
