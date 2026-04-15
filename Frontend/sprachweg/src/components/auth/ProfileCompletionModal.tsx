import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { getAssetUrl } from '../../lib/api';

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

interface ProfileCompletionModalProps {
    isOpen: boolean;
    onClose?: () => void;
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        guardianName: '',
        guardianPhone: '',
        dateOfBirth: '',
        qualification: 'High School',
    });
    const [avatar, setAvatar] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Profile image states
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Drag constraint ref for draggable modal
    const constraintRef = useRef<HTMLDivElement>(null);

    // Responsive breakpoint detection
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkBreakpoint = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkBreakpoint();
        window.addEventListener('resize', checkBreakpoint);
        return () => window.removeEventListener('resize', checkBreakpoint);
    }, []);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                phoneNumber: user.phoneNumber || '',
                guardianName: user.guardianName || '',
                guardianPhone: user.guardianPhone || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                qualification: user.qualification || 'High School',
            }));
        }
    }, [user, isOpen]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
            if (successTimerRef.current) clearTimeout(successTimerRef.current);
        };
    }, []);

    const simulateUpload = useCallback(() => {
        setIsUploading(true);
        setUploadProgress(0);
        setUploadSuccess(false);

        // Clear any existing timers
        if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
        if (successTimerRef.current) clearTimeout(successTimerRef.current);

        let progress = 0;
        uploadTimerRef.current = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
                setUploadProgress(100);
                setIsUploading(false);
                setUploadSuccess(true);

                successTimerRef.current = setTimeout(() => {
                    setUploadSuccess(false);
                }, 3000);
            } else {
                setUploadProgress(Math.round(progress));
            }
        }, 200);
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageError(null);
        setUploadSuccess(false);
        setUploadProgress(0);

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            setImageError(`Image size must be less than ${MAX_IMAGE_SIZE_MB} MB. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setAvatar(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
            simulateUpload();
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setAvatar(null);
        setImagePreview(null);
        setImageError(null);
        setUploadProgress(0);
        setIsUploading(false);
        setUploadSuccess(false);
        if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
        if (successTimerRef.current) clearTimeout(successTimerRef.current);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!avatar && !user?.avatar) {
            setError('Profile picture is required.');
            setLoading(false);
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('phoneNumber', formData.phoneNumber);
            submitData.append('guardianName', formData.guardianName);
            submitData.append('guardianPhone', formData.guardianPhone);
            submitData.append('dateOfBirth', formData.dateOfBirth);
            submitData.append('qualification', formData.qualification);
            if (avatar) {
                submitData.append('avatar', avatar);
            }

            await updateProfile(submitData);
            if (onClose) {
                onClose();
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsDismissed(true);
        if (onClose) onClose();
    };

    if (!isOpen || isDismissed) return null;

    // Input field classes (shared)
    const inputClasses = "mt-1 block w-full rounded-lg border border-brand-surface bg-white px-3 py-2.5 shadow-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm text-brand-black placeholder-brand-olive-light transition-colors";

    return (
        <AnimatePresence>
            {/* Full-screen backdrop + drag constraint container */}
            <div
                ref={constraintRef}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    drag={!isMobile}
                    dragConstraints={constraintRef}
                    dragElastic={0.05}
                    dragMomentum={false}
                    className={`
                        flex flex-col bg-white shadow-2xl
                        ${isMobile
                            ? 'w-full h-full rounded-none'
                            : 'w-[85vw] md:w-[480px] max-h-[90vh] rounded-2xl'
                        }
                    `}
                >
                    {/* ═══════════ STICKY HEADER — never scrolls ═══════════ */}
                    <div className={`flex-shrink-0 px-5 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4 border-b border-brand-surface ${!isMobile ? 'cursor-grab active:cursor-grabbing' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex items-center gap-1.5 text-sm font-medium text-brand-olive hover:text-brand-olive-dark transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </button>

                            {onClose && (
                                <button
                                    onClick={handleClose}
                                    className="p-1 rounded-lg text-brand-olive-light hover:text-brand-olive-dark hover:bg-brand-surface transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold text-brand-black">Complete Your Profile</h2>
                        <p className="mt-1 text-sm text-brand-olive">
                            Please provide the following details to continue.
                        </p>
                    </div>

                    {/* ═══════════ SCROLLABLE BODY — all form fields ═══════════ */}
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 py-4 sm:px-6 sm:py-5">
                        {error && (
                            <div className="mb-4 rounded-lg bg-brand-red/5 p-3 text-sm text-brand-red border border-brand-red/20">
                                {error}
                            </div>
                        )}

                        {/* Profile Image Upload Section */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative group">
                                <div
                                    className="w-22 h-22 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-dashed border-brand-surface flex items-center justify-center bg-brand-off-white cursor-pointer hover:border-brand-gold transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Profile preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : user?.avatar ? (
                                        <img
                                            src={getAssetUrl(user.avatar)}
                                            alt="Current Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-brand-olive-light" />
                                    )}
                                </div>
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-1 -right-1 p-1 bg-brand-red/50 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                                id="profile-image-upload"
                            />
                            <p className="mt-2 text-xs text-brand-olive">
                                Upload profile photo (max {MAX_IMAGE_SIZE_MB} MB)
                            </p>

                            {/* Image validation error */}
                            {imageError && (
                                <p className="mt-1 text-xs text-brand-red text-center">
                                    {imageError}
                                </p>
                            )}

                            {/* Upload progress bar */}
                            {(isUploading || uploadProgress > 0) && !imageError && imagePreview && (
                                <div className="w-full max-w-[200px] mt-2">
                                    <div className="w-full bg-brand-surface rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-brand-gold"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress}%` }}
                                            transition={{ duration: 0.2, ease: 'easeOut' }}
                                        />
                                    </div>
                                    <p className="text-xs text-brand-olive text-center mt-1">
                                        {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Upload complete'}
                                    </p>
                                </div>
                            )}

                            {/* Upload success notification */}
                            <AnimatePresence>
                                {uploadSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="mt-2 flex items-center gap-1.5 rounded-lg bg-brand-olive/5 px-3 py-1.5 text-xs text-brand-olive-dark"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>Profile image uploaded successfully.</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Form Fields */}
                        <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-brand-olive-dark">Name <span className="text-brand-red">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-olive-dark">Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="mt-1 block w-full rounded-lg border border-brand-surface bg-brand-off-white px-3 py-2.5 text-sm text-brand-olive shadow-sm cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-brand-olive-dark">Phone Number <span className="text-brand-red">*</span></label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    id="phoneNumber"
                                    required
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label htmlFor="guardianName" className="block text-sm font-medium text-brand-olive-dark">Guardian Name <span className="text-brand-red">*</span></label>
                                <input
                                    type="text"
                                    name="guardianName"
                                    id="guardianName"
                                    required
                                    value={formData.guardianName}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label htmlFor="guardianPhone" className="block text-sm font-medium text-brand-olive-dark">Guardian Phone Number <span className="text-brand-red">*</span></label>
                                <input
                                    type="tel"
                                    name="guardianPhone"
                                    id="guardianPhone"
                                    required
                                    value={formData.guardianPhone}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-brand-olive-dark">Date of Birth <span className="text-brand-red">*</span></label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    id="dateOfBirth"
                                    required
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label htmlFor="qualification" className="block text-sm font-medium text-brand-olive-dark">Highest Educational Qualification <span className="text-brand-red">*</span></label>
                                <select
                                    name="qualification"
                                    id="qualification"
                                    required
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    className={inputClasses}
                                >
                                    <option value="High School">High School</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="Undergraduate">Undergraduate</option>
                                    <option value="Postgraduate">Postgraduate</option>
                                    <option value="PhD">PhD</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </form>
                    </div>

                    {/* ═══════════ STICKY FOOTER — always visible ═══════════ */}
                    <div className="flex-shrink-0 px-5 py-4 sm:px-6 border-t border-brand-surface bg-brand-off-white rounded-b-2xl">
                        <div className="flex gap-3">
                            {onClose && (
                                <Button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 justify-center rounded-lg border border-brand-surface bg-white px-4 py-2.5 text-sm font-medium text-brand-olive-dark shadow-sm hover:bg-brand-off-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 transition-colors min-h-[48px]"
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="submit"
                                form="profile-form"
                                disabled={loading}
                                className="flex-1 justify-center rounded-lg bg-brand-red px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-red-hover focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 disabled:opacity-50 transition-colors min-h-[48px]"
                            >
                                {loading ? 'Saving...' : 'Save & Continue'}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProfileCompletionModal;
