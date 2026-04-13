import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import PushNotificationToggle from '../notifications/PushNotificationToggle';

interface LearnerQuickActionsProps {
    homeTo?: string;
    showFeedbackLink?: boolean;
    isGeneralPool?: boolean;
}

const LearnerQuickActions: React.FC<LearnerQuickActionsProps> = ({
    homeTo = '/',
    showFeedbackLink = false,
    isGeneralPool = false,
}) => {
    const navigate = useNavigate();

    const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isQuickSettingsOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsQuickSettingsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isQuickSettingsOpen]);

    return (
        <div ref={containerRef} className={`fixed right-4 ${isGeneralPool ? 'top-24' : 'top-4'} z-50 flex items-center gap-3`}>
            {!isGeneralPool && (
                <button
                    type="button"
                    onClick={() => navigate(homeTo)}
                    aria-label="Go to dashboard"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/90 text-brand-black shadow-lg backdrop-blur-md transition-colors hover:bg-white"
                >
                    <LayoutDashboard className="h-5 w-5" />
                </button>
            )}

            <NotificationBell />

            {!isGeneralPool && (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsQuickSettingsOpen((currentState) => !currentState)}
                        aria-label="Dashboard settings"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/90 text-brand-black shadow-lg backdrop-blur-md transition-colors hover:bg-white"
                    >
                        <Settings className="h-5 w-5" />
                    </button>

                    <AnimatePresence>
                        {isQuickSettingsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                transition={{ duration: 0.18 }}
                                className="absolute right-0 top-14 w-72 rounded-2xl border border-brand-surface bg-white/95 p-4 shadow-2xl backdrop-blur-md"
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-olive-light">Settings</p>

                                <PushNotificationToggle />

                                {showFeedbackLink && (
                                    <Link
                                        to="/feedback"
                                        onClick={() => setIsQuickSettingsOpen(false)}
                                        className="mt-3 flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-brand-olive-dark transition-colors hover:bg-brand-off-white hover:text-brand-gold"
                                    >
                                        Report an Issue / Feedback
                                    </Link>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default LearnerQuickActions;
