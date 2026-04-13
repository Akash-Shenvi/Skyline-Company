// Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Settings } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import type { InternshipListing } from '../../types/internship';
import { getDashboardPathForRole } from '../../lib/authRouting';
import NotificationBell from '../notifications/NotificationBell';
import PushNotificationToggle from '../notifications/PushNotificationToggle';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [internships, setInternships] = useState<InternshipListing[]>([]);

    const { user } = useAuth();
    const location = useLocation();
    const showTrainerNotifications = String(user?.role || '').trim().toLowerCase() === 'trainer';


    const navRef = useRef<HTMLElement>(null);

    const toggleDropdown = (dropdown: string) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
                setIsSettingsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside as unknown as EventListener);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside as unknown as EventListener);
        };
    }, []);

    useEffect(() => {
        const fetchInternships = async () => {
            try {
                // API call purposefully disabled per user request to hide internships
                setInternships([]);
            } catch (error) {
                console.error('Failed to load header internships:', error);
            }
        };
        fetchInternships();
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
        setOpenDropdown(null);
        setIsSettingsOpen(false);
    }, [location.pathname, location.search]);

    return (
        <nav ref={navRef} className="fixed w-full z-50 bg-brand-black border-b border-brand-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-1 flex-shrink-0">
                        <img
                            src="/skyline-logo.jpeg"
                            alt="Skyline logo"
                            className="h-12 md:h-14 lg:h-16 w-auto object-contain transition-all duration-300"
                        />
                        <span className="font-serif font-bold text-base lg:text-lg text-brand-white"></span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        <Link
                            to="/"
                            className="text-brand-white hover:text-brand-gold font-medium transition-colors text-sm px-3 py-2"
                        >
                            Home
                        </Link>

                        {/* Language Training Dropdown */}
                        <div className="relative group">
                            <div className="flex items-center gap-1">
                                <Link
                                    to="/language-training"
                                    className="text-brand-white hover:text-brand-gold font-medium transition-colors text-sm px-2 py-2"
                                >
                                    Language Training
                                </Link>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleDropdown('language-desktop');
                                    }}
                                    className="p-1 rounded-full hover:bg-brand-olive-dark transition-colors focus:outline-none"
                                >
                                    <ChevronDown className={`w-5 h-5 text-brand-gold transition-transform duration-200 ${openDropdown === 'language-desktop' ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                            <div className={`absolute left-0 top-full mt-2 w-[340px] bg-brand-black border border-brand-olive-dark rounded-lg shadow-2xl transition-all duration-200 z-50 ${openDropdown === 'language-desktop' ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
                                <div className="p-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-4">Languages</h3>
                                    <div className="space-y-3">
                                        <Link to="/training/german" className="flex items-start gap-3 p-2 rounded-lg hover:bg-brand-olive-dark transition-colors group/item">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                                                <span className="text-lg">🇩🇪</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-brand-white group-hover/item:text-brand-gold">German</p>
                                                <p className="text-xs text-white/60">A1 to C1 proficiency levels</p>
                                            </div>
                                        </Link>
                                        <Link to="/training/english" className="flex items-start gap-3 p-2 rounded-lg hover:bg-brand-olive-dark transition-colors group/item">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                                                <span className="text-lg">🇬🇧</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-brand-white group-hover/item:text-brand-gold">English</p>
                                                <p className="text-xs text-white/60">Business & academic English</p>
                                            </div>
                                        </Link>
                                        <Link to="/training/japanese" className="flex items-start gap-3 p-2 rounded-lg hover:bg-brand-olive-dark transition-colors group/item">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                                                <span className="text-lg">🇯🇵</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-brand-white group-hover/item:text-brand-gold">Japanese</p>
                                                <p className="text-xs text-white/60">JLPT preparation & fluency</p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Career Mega Menu */}
                        <div className="relative group">
                            <div className="flex items-center gap-1">
                                <Link
                                    to="/careers"
                                    className="text-brand-white hover:text-brand-gold font-medium transition-colors text-sm px-2 py-2"
                                >
                                    Career
                                </Link>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleDropdown('career-desktop');
                                    }}
                                    className="p-1 rounded-full hover:bg-brand-olive-dark transition-colors focus:outline-none"
                                >
                                    <ChevronDown className={`w-5 h-5 text-brand-gold transition-transform duration-200 ${openDropdown === 'career-desktop' ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                            <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[300px] max-w-[90vw] bg-brand-black border border-brand-olive-dark rounded-lg shadow-2xl transition-all duration-200 z-50 ${openDropdown === 'career-desktop' ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
                                <div className="p-6">

                                    {/* INTERNSHIP Column */}
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-4">Internship</h3>
                                        <div className="space-y-1">
                                            {internships.map((internship) => (
                                                <Link key={internship._id} to="/careers" className="block text-sm text-white/75 hover:text-brand-gold py-1 transition-colors">
                                                    {internship.title}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CAREER ABROAD Column — commented out for future use
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-4">Career Abroad</h3>
                                        <div className="space-y-3">
                                            Work in Canada — /404
                                            Career in Germany — #
                                            Jobs in Australia — /404
                                            UK Employment — /404
                                        </div>
                                    </div>
                                    */}

                                    {/* SERVICES Column — commented out for future use
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-4">Services</h3>
                                        <div className="space-y-3">
                                            Visa Assistance — /404
                                            Job Placement — /404
                                            Interview Prep — /404
                                        </div>
                                    </div>
                                    */}

                                    {/* FULL TIME Column — commented out for future use
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-4">Full Time</h3>
                                        <div className="space-y-1">
                                            PLC Automation Engineer
                                            Controls & Automation Engineer
                                            PLC Programmer (Automation)
                                            Industrial Automation Engineer
                                        </div>
                                    </div>
                                    */}

                                </div>
                            </div>
                        </div>


                        <Link
                            to="/404"
                            className="text-brand-white hover:text-brand-gold font-medium transition-colors text-sm px-3 py-2"
                        >
                            About
                        </Link>
                        <Link
                            to="/contact"
                            className="text-brand-white hover:text-brand-gold font-medium transition-colors text-sm px-3 py-2"
                        >
                            Contact
                        </Link>
                    </div>

                    {/* Right Area */}
                    <div className="hidden lg:flex items-center gap-4">
                        {showTrainerNotifications && <NotificationBell />}

                        {/* Settings Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className="p-2 rounded-full hover:bg-brand-olive-dark text-brand-olive-light transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            {isSettingsOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-brand-black border border-brand-olive-dark rounded-lg shadow-lg z-50">
                                    <div className="p-4">
                                        {/* Settings Header */}
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-3">Settings</h3>

                                        {showTrainerNotifications && <PushNotificationToggle />}

                                        {/* Feedback Link */}
                                        <Link
                                            to="/feedback"
                                            onClick={() => setIsSettingsOpen(false)}
                                            className="flex items-center gap-2 py-2 text-sm font-medium text-white/75 hover:text-brand-gold transition-colors"
                                        >
                                            <span className="text-lg">🐞</span>
                                            Report an Issue / Feedback
                                        </Link>

                                        {/* Add more settings here in the future */}
                                    </div>
                                </div>
                            )}
                        </div>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link to={getDashboardPathForRole(user.role)} className="text-brand-white font-medium hover:text-brand-gold transition-colors text-sm">
                                    <Button className="bg-brand-red hover:bg-brand-red-hover text-white font-semibold px-6 py-2 rounded text-sm">
                                        Dashboard
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="text-brand-white font-medium hover:text-brand-gold transition-colors text-sm">
                                    Sign In
                                </Link>
                                <Link to="/register">
                                    <Button className="bg-brand-red hover:bg-brand-red-hover text-white font-semibold px-6 py-2 rounded text-sm">
                                        Enroll Now
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center gap-3">
                        {showTrainerNotifications && <NotificationBell />}

                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className="p-2 rounded-full hover:bg-brand-olive-dark text-brand-olive-light"
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        {isSettingsOpen && (
                            <div className="absolute right-4 top-20 w-64 bg-brand-black border border-brand-olive-dark rounded-lg shadow-lg z-50">
                                <div className="p-4">
                                    {/* Settings Header */}
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-3">Settings</h3>

                                    {showTrainerNotifications && <PushNotificationToggle />}

                                    {/* Feedback Link */}
                                    <Link
                                        to="/feedback"
                                        onClick={() => setIsSettingsOpen(false)}
                                        className="flex items-center gap-2 py-2 text-sm font-medium text-white/75 hover:text-brand-gold transition-colors"
                                    >
                                        <span className="text-lg">🐞</span>
                                        Report an Issue / Feedback
                                    </Link>

                                    {/* Add more settings here in the future */}
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-brand-gold p-2"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-brand-black border-t border-brand-olive-dark max-h-[calc(100vh-5rem)] overflow-y-auto"
                    >
                        <div className="px-4 py-4 space-y-2">
                            <Link to="/" className="block text-brand-white font-medium py-2 text-sm" onClick={() => setIsMenuOpen(false)}>Home</Link>

                            {/* Language Training mobile dropdown */}
                            <div className="flex items-center justify-between w-full">
                                <Link
                                    to="/language-training"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-brand-white font-medium py-2 text-sm flex-1"
                                >
                                    Language Training
                                </Link>
                                <button
                                    onClick={() => toggleDropdown('language')}
                                    className="p-2 rounded-full hover:bg-brand-olive-dark"
                                >
                                    <ChevronDown className={`w-5 h-5 text-brand-gold transition-transform ${openDropdown === 'language' ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                            {openDropdown === 'language' && (
                                <div className="bg-brand-olive-dark/30 rounded pl-4 pr-2 py-2 space-y-1">
                                    <h4 className="text-xs font-bold uppercase text-brand-gold mb-2">Languages</h4>
                                    <Link to="/training/german" className="block text-white/75 py-1 text-xs" onClick={() => setIsMenuOpen(false)}>🇩🇪 German</Link>
                                    <Link to="/training/english" className="block text-white/75 py-1 text-xs" onClick={() => setIsMenuOpen(false)}>🇬🇧 English</Link>
                                    <Link to="/training/japanese" className="block text-white/75 py-1 text-xs" onClick={() => setIsMenuOpen(false)}>🇯🇵 Japanese</Link>
                                </div>
                            )}

                            <div className="flex items-center justify-between w-full">
                                <Link
                                    to="/careers"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-brand-white font-medium py-2 text-sm flex-1"
                                >
                                    Career
                                </Link>
                                <button
                                    onClick={() => toggleDropdown('career')}
                                    className="p-2 rounded-full hover:bg-brand-olive-dark"
                                >
                                    <ChevronDown className={`w-5 h-5 text-brand-gold transition-transform ${openDropdown === 'career' ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                            {openDropdown === 'career' && (
                                <div className="bg-brand-olive-dark/30 rounded pl-4 pr-2 py-2 space-y-3">
                                    {/* INTERNSHIP Section */}
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold uppercase text-brand-gold mb-2">Internship</h4>
                                        {internships.map((internship) => (
                                            <Link key={internship._id} to="/careers" className="block text-white/75 py-1 text-xs" onClick={() => setIsMenuOpen(false)}>
                                                {internship.title}
                                            </Link>
                                        ))}
                                    </div>

                                    {/* CAREER ABROAD Section — commented out for future use
                                    <div className="space-y-1 border-t border-brand-olive-dark pt-2">
                                        <h4>Career Abroad</h4>
                                        Work in Canada, Career in Germany, Jobs in Australia, UK Employment
                                    </div>
                                    */}

                                    {/* SERVICES Section — commented out for future use
                                    <div className="space-y-1 border-t border-brand-olive-dark pt-2">
                                        <h4>Services</h4>
                                        Visa Assistance, Job Placement, Interview Prep
                                    </div>
                                    */}

                                    {/* FULL TIME Section — commented out for future use
                                    <div className="space-y-1 border-t border-brand-olive-dark pt-2">
                                        <h4>Full Time</h4>
                                        PLC Automation Engineer
                                        Controls & Automation Engineer
                                        PLC Programmer (Automation)
                                        Industrial Automation Engineer
                                    </div>
                                    */}
                                </div>
                            )}

                            <Link to="/404" className="block text-brand-white font-medium py-2 text-sm" onClick={() => setIsMenuOpen(false)}>About</Link>
                            <Link to="/contact" className="block text-brand-white font-medium py-2 text-sm" onClick={() => setIsMenuOpen(false)}>Contact</Link>

                            <div className="pt-4 border-t border-brand-olive-dark flex flex-col gap-3">
                                {user ? (
                                    <Link
                                        to={getDashboardPathForRole(user.role)}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Button className="w-full bg-brand-red hover:bg-brand-red-hover text-white font-semibold rounded text-sm py-2">
                                            Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/login" className="text-center text-brand-white font-medium py-2 text-sm" onClick={() => setIsMenuOpen(false)}>
                                            Sign In
                                        </Link>
                                        <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                            <Button className="w-full bg-brand-red hover:bg-brand-red-hover text-white font-semibold rounded text-sm py-2">
                                                Enroll Now
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav >
    );
};

export default Header;
