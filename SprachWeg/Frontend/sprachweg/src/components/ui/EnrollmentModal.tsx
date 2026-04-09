import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, Check, AlertCircle, GraduationCap, Phone, Mail, User, BookOpen, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { trainingCheckoutAPI } from '../../lib/api';
import { buildPaymentBreakdown } from '../../lib/paymentPricing';

interface EnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    origin: string;
    originPath?: string;
    selectedLevel?: string;
    paymentAmount?: string;
    paymentCurrency?: string;
}

interface FormData {
    name: string;
    phone: string;
    countryCode: string;
    email: string;
    dob: string;
    education: string;
    educationOther: string;
    guardianName: string;
    guardianPhone: string;
}

const initialFormData: FormData = {
    name: '', phone: '', countryCode: '+91', email: '', dob: '',
    education: '', educationOther: '', guardianName: '', guardianPhone: '',
};

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
    isOpen, onClose, origin, originPath, selectedLevel,
    paymentAmount, paymentCurrency = 'INR',
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const shouldReduceMotion = useReducedMotion();
    const modalRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const paymentBreakdown = buildPaymentBreakdown(paymentAmount, paymentCurrency);

    useEffect(() => {
        if (user && isOpen) {
            let formattedDob = '';
            if (user.dateOfBirth) {
                try {
                    const date = new Date(user.dateOfBirth);
                    if (!isNaN(date.getTime())) formattedDob = date.toISOString().split('T')[0];
                } catch (e) { console.error("Invalid DOB in profile", e); }
            }
            setFormData(prev => ({
                ...prev, name: user.name || '', email: user.email || '',
                phone: user.phoneNumber || '', education: user.qualification || '',
                guardianName: user.guardianName || '', guardianPhone: user.guardianPhone || '',
                dob: formattedDob,
            }));
        }
    }, [user, isOpen]);

    useEffect(() => { if (!isOpen) { setErrors({}); setIsSubmitting(false); } }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements?.[0] as HTMLElement;
            const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

            const handleTab = (e: KeyboardEvent) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) { e.preventDefault(); lastElement?.focus(); }
                    } else {
                        if (document.activeElement === lastElement) { e.preventDefault(); firstElement?.focus(); }
                    }
                }
            };
            const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') handleBack(); };
            document.addEventListener('keydown', handleTab);
            document.addEventListener('keydown', handleEscape);
            firstElement?.focus();
            modalRef.current?.scrollTo({ top: 0, behavior: 'auto' });
            return () => { document.removeEventListener('keydown', handleTab); document.removeEventListener('keydown', handleEscape); };
        }
    }, [isOpen]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        let isValid = true;
        if (!formData.name.trim()) { newErrors.name = 'Name is required'; isValid = false; }
        if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) { newErrors.phone = 'Valid phone number is required (10 digits)'; isValid = false; }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { newErrors.email = 'Valid email is required'; isValid = false; }
        if (!formData.dob) { newErrors.dob = 'Date of birth is required'; isValid = false; } else {
            const birthDate = new Date(formData.dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
            if (age < 16) { newErrors.dob = 'You must be at least 16 years old to enroll'; isValid = false; }
        }
        if (!formData.education) { newErrors.education = 'Education level is required'; isValid = false; }
        if (formData.education === 'Other' && !formData.educationOther.trim()) { newErrors.educationOther = 'Please specify your education'; isValid = false; }
        if (!formData.guardianName.trim()) { newErrors.guardianName = 'Guardian name is required'; isValid = false; }
        if (!formData.guardianPhone.trim()) { newErrors.guardianPhone = 'Guardian phone is required'; isValid = false; }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const response = await trainingCheckoutAPI.create({
                origin, selectedLevel,
                payerName: formData.name, payerEmail: formData.email, payerPhone: formData.phone,
            });
            const checkout = response.checkout;
            if (!checkout?.attemptId || !checkout?.redirectUrl || !checkout?.transactionId) throw new Error('Payment checkout details are incomplete.');
            window.location.assign(checkout.redirectUrl);
        } catch (error: any) {
            console.error('Enrollment error:', error);
            alert(error.response?.data?.message || error.message || 'Failed to start payment');
            setIsSubmitting(false);
        }
    };

    const handleBack = () => { onClose(); if (originPath) navigate(originPath); };
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={handleBack} className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm" aria-hidden="true" />

                <motion.div ref={modalRef} initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300, duration: shouldReduceMotion ? 0 : 0.5 }} className="relative flex h-full w-full flex-col overflow-y-auto bg-brand-white md:h-auto md:max-h-[90vh] md:w-full md:max-w-4xl md:rounded-2xl shadow-2xl">
                    <>
                        {/* Sticky Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-surface bg-brand-white/95 px-6 py-4 backdrop-blur">
                            <button onClick={handleBack} className="group flex items-center gap-1.5 text-sm font-medium text-brand-olive transition-colors hover:text-brand-black" aria-label="Back to course">
                                <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                                Back
                            </button>
                            <h2 id="modal-title" className="text-lg font-bold text-brand-black">Enrollment</h2>
                            <div className="w-16" />
                        </div>

                        <div className="flex flex-col md:flex-row h-full">
                            {/* Visual Side Panel */}
                            <div className="hidden md:flex md:w-1/3 flex-col justify-between bg-brand-black p-8 text-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-brand-black" />
                                <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand-gold/10 blur-2xl" />
                                <div className="relative z-10">
                                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                                        <BookOpen className="h-6 w-6 text-brand-gold" />
                                    </div>
                                    <h3 className="mb-2 text-2xl font-bold">Start Your Journey</h3>
                                    <p className="text-white/75">Join thousands of students mastering new skills and languages today.</p>
                                </div>
                                <div className="relative z-10 space-y-4 text-sm text-white/75">
                                    <div className="flex items-center gap-3"><Check className="h-4 w-4 text-brand-gold" /><span>Verified Certificates</span></div>
                                    <div className="flex items-center gap-3"><Check className="h-4 w-4 text-brand-gold" /><span>Expert Instructors</span></div>
                                    <div className="flex items-center gap-3"><Check className="h-4 w-4 text-brand-gold" /><span>Lifetime Access</span></div>
                                </div>
                            </div>

                            {/* Form Content */}
                            <form onSubmit={handleSubmit} className="flex-1 p-6 md:p-8">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Personal Info */}
                                    <div className="md:col-span-2">
                                        <h4 className="flex items-center gap-2 mb-4 text-sm font-semibold uppercase tracking-wider text-brand-olive-light">
                                            <User className="h-4 w-4" /> Personal Information
                                        </h4>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="md:col-span-2">
                                                <InputField label="Name" required error={errors.name} value={formData.name} onChange={(v: string) => handleInputChange('name', v)} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="md:col-span-2">
                                        <h4 className="flex items-center gap-2 mb-4 mt-2 text-sm font-semibold uppercase tracking-wider text-brand-olive-light">
                                            <Phone className="h-4 w-4" /> Contact Details
                                        </h4>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                                    Phone <span className="text-brand-red">*</span>
                                                </label>
                                                <div className="flex rounded-lg border border-brand-surface bg-brand-white transition-all focus-within:ring-2 focus-within:ring-brand-gold">
                                                    <select className="rounded-l-lg bg-brand-off-white px-3 text-sm text-brand-olive-dark focus:outline-none" value={formData.countryCode} onChange={e => handleInputChange('countryCode', e.target.value)}>
                                                        <option value="+91">+91 (IN)</option>
                                                        <option value="+1">+1 (US)</option>
                                                        <option value="+44">+44 (UK)</option>
                                                        <option value="+49">+49 (DE)</option>
                                                        <option value="+81">+81 (JP)</option>
                                                    </select>
                                                    <input type="tel" className="w-full flex-1 rounded-r-lg bg-transparent px-4 py-2.5 text-brand-black placeholder:text-brand-olive-light focus:outline-none" placeholder="9876543210" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                                                </div>
                                                {errors.phone && <span className="mt-1 text-xs text-brand-red">{errors.phone}</span>}
                                            </div>
                                            <InputField label="Email Address" type="email" icon={<Mail className="h-4 w-4" />} required error={errors.email} value={formData.email} onChange={(v: string) => handleInputChange('email', v)} />
                                        </div>
                                    </div>

                                    {/* Education & DOB */}
                                    <div className="md:col-span-2">
                                        <h4 className="flex items-center gap-2 mb-4 mt-2 text-sm font-semibold uppercase tracking-wider text-brand-olive-light">
                                            <GraduationCap className="h-4 w-4" /> Background
                                        </h4>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <InputField label="Date of Birth" type="date" required error={errors.dob} value={formData.dob} onChange={(v: string) => handleInputChange('dob', v)} />
                                            <div>
                                                <label className="mb-1.5 block text-sm font-semibold text-brand-black">
                                                    Highest Education <span className="text-brand-red">*</span>
                                                </label>
                                                <select
                                                    className={`w-full appearance-none rounded-lg border bg-brand-white px-4 py-2.5 text-brand-black transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold ${errors.education ? 'border-brand-red focus:ring-brand-red/20' : 'border-brand-surface'}`}
                                                    value={formData.education} onChange={e => handleInputChange('education', e.target.value)}
                                                >
                                                    <option value="">Select Level</option>
                                                    <option value="High School">High School</option>
                                                    <option value="Diploma">Diploma</option>
                                                    <option value="Bachelor">Bachelor Info</option>
                                                    <option value="Master">Master Degree</option>
                                                    <option value="PhD">PhD</option>
                                                    <option value="Other">Other</option>
                                                    {formData.education && !["High School", "Diploma", "Bachelor", "Master", "PhD", "Other", ""].includes(formData.education) && (
                                                        <option value={formData.education}>{formData.education}</option>
                                                    )}
                                                </select>
                                                {errors.education && <span className="mt-1 text-xs text-brand-red">{errors.education}</span>}
                                                {formData.education === 'Other' && (
                                                    <div className="mt-2">
                                                        <input type="text" placeholder="Please specify" className="w-full rounded-lg border border-brand-surface px-4 py-2 text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gold" value={formData.educationOther} onChange={e => handleInputChange('educationOther', e.target.value)} />
                                                        {errors.educationOther && <span className="mt-1 text-xs text-brand-red">{errors.educationOther}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Guardian Info */}
                                    <div className="md:col-span-2 rounded-xl bg-brand-gold/5 border border-brand-gold/20 p-4">
                                        <h4 className="flex items-center gap-2 mb-4 text-sm font-semibold text-brand-black">
                                            <ShieldIcon className="h-4 w-4" /> Guardian Information
                                        </h4>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <InputField label="Guardian Name" required error={errors.guardianName} value={formData.guardianName} onChange={(v: string) => handleInputChange('guardianName', v)} />
                                            <InputField label="Guardian Phone" type="tel" required error={errors.guardianPhone} value={formData.guardianPhone} onChange={(v: string) => handleInputChange('guardianPhone', v)} />
                                        </div>
                                    </div>

                                    {/* Payment Summary */}
                                    {paymentBreakdown && (
                                        <div className="md:col-span-2 rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-4">
                                            <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-black">
                                                <CreditCard className="h-4 w-4" /> Payment Summary
                                            </h4>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {selectedLevel && (
                                                    <div>
                                                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-brand-olive">Selected Level</p>
                                                        <p className="text-base font-bold text-brand-black">{selectedLevel}</p>
                                                    </div>
                                                )}
                                                <div className={selectedLevel ? '' : 'md:col-span-2'}>
                                                    <div className="space-y-3 rounded-xl border border-brand-surface bg-brand-white p-4">
                                                        <div className="flex items-center justify-between gap-4 text-sm">
                                                            <span className="text-brand-olive">Base Price</span>
                                                            <span className="font-semibold text-brand-black">{paymentBreakdown.formattedBaseAmount}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-4 text-sm">
                                                            <span className="text-brand-olive">GST @ {paymentBreakdown.gstRate}%</span>
                                                            <span className="font-semibold text-brand-black">{paymentBreakdown.formattedGstAmount}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-4 border-t border-brand-gold/20 pt-3">
                                                            <span className="text-sm font-semibold uppercase tracking-wide text-brand-olive">Total Payable</span>
                                                            <span className="text-xl font-bold text-brand-black">{paymentBreakdown.formattedTotalAmount}</span>
                                                        </div>
                                                    </div>
                                                    <p className="mt-2 text-xs text-brand-olive">
                                                        This total includes GST and will be shown again on the hosted payment page before confirmation.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Error Summary */}
                                {Object.keys(errors).length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-start gap-2 rounded-lg bg-brand-red/10 p-3 text-sm text-brand-red">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                        <p>There are errors in the form. Please check the fields marked in red.</p>
                                    </motion.div>
                                )}

                                {/* Actions */}
                                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button type="button" onClick={handleBack} className="rounded-lg border border-brand-surface px-6 py-3 font-semibold text-brand-olive-dark transition-colors hover:bg-brand-off-white focus:outline-none focus:ring-2 focus:ring-brand-surface">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-brand-red-hover hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                        {isSubmitting ? (
                                            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Processing...</>
                                        ) : (
                                            'Proceed to Payment'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// Reusable Input Component
const InputField = ({ label, type = 'text', required, error, value, onChange, icon }: any) => (
    <div>
        <label className="mb-1.5 block text-sm font-semibold text-brand-black">
            {label} {required && <span className="text-brand-red">*</span>}
        </label>
        <div className="relative">
            {icon && (<div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-olive-light">{icon}</div>)}
            <input
                type={type}
                className={`w-full rounded-lg border bg-brand-white px-4 py-2.5 text-brand-black transition-all placeholder:text-brand-olive-light focus:outline-none focus:ring-2
             ${icon ? 'pl-10' : ''}
             ${error ? 'border-brand-red focus:ring-brand-red/20' : 'border-brand-surface focus:ring-brand-gold'}`}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
        {error && <span className="mt-1 text-xs text-brand-red">{error}</span>}
    </div>
);

const ShieldIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

export default EnrollmentModal;
