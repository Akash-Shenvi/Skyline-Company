import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

// ─── State for email newsletter removed (entire section deleted) ──────────────

const Footer: React.FC = () => {
    return (
        <footer className="relative bg-brand-black border-t-[3px] border-brand-red text-white overflow-hidden">

            {/* Subtle background texture rings — purely decorative */}
            <span className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full border border-white/[0.03]" />
            <span className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full border border-white/[0.03]" />

            {/* ── Main content ─────────────────────────────────────────────────── */}
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">

                {/* ── Primary grid ──────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">

                    {/* Brand column — spans 2 on lg */}
                    <div className="space-y-5 sm:col-span-2 lg:col-span-2">
                        {/* Logo + division label */}
                        <div className="flex items-center gap-3">
                            <img
                                src="/skyline png.png"
                                alt="Skyline logo"
                                className="h-20 w-auto object-contain sm:h-24"
                            />
                            <span className="text-[11px] leading-5 tracking-wide text-white/50">
                                A Division of<br />SoVir Technologies LLP
                            </span>
                        </div>

                        {/* Tagline */}
                        <p className="text-sm leading-relaxed text-white/60 max-w-xs">
                            Your gateway to advanced industry skills and international career
                            opportunities. Join thousands of successful learners worldwide.
                        </p>

                        {/* Contact details */}
                        <ul className="space-y-2.5">
                            <li>
                                <a
                                    href="mailto:careers@skylinetraining.in"
                                    className="group flex items-center gap-3 text-white/60 transition-colors duration-200 hover:text-brand-gold"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/6 transition-colors duration-200 group-hover:bg-brand-gold/15">
                                        <Mail className="h-3.5 w-3.5" />
                                    </span>
                                    <span className="text-sm">careers@skylinetraining.in</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+918851771838 / 8105775015"
                                    className="group flex items-center gap-3 text-white/60 transition-colors duration-200 hover:text-brand-gold"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/6 transition-colors duration-200 group-hover:bg-brand-gold/15">
                                        <Phone className="h-3.5 w-3.5" />
                                    </span>
                                    <span className="text-sm">+91 8851771838 / 8105775015</span>
                                </a>
                            </li>
                            <li>
                                <div className="flex items-start gap-3 text-white/60">
                                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/6">
                                        <MapPin className="h-3.5 w-3.5" />
                                    </span>
                                    <span className="text-sm leading-5">
                                        JLB Complex Gopadi, NH 66, Koteshwara Proper,<br />
                                        Kundapura, Karnataka 576201
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Career Abroad */}
                    <div>
                        <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-brand-gold">
                            Career Abroad
                        </h3>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'Work in Canada', to: '#' },
                                { label: 'Career in Germany', to: '#' },
                                { label: 'Jobs in Australia', to: '#' },
                                { label: 'Visa Assistance', to: '#' },
                                { label: 'Job Placement', to: '#' },
                            ].map(({ label, to }) => (
                                <li key={label}>
                                    <Link
                                        to={to}
                                        className="block text-sm text-white/60 transition-colors duration-150 hover:text-brand-gold"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-brand-gold">
                            Company
                        </h3>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'About Us', to: '/about' },
                                { label: 'Our Team', to: '#' },
                                { label: 'Careers at Skyline', to: '/careers' },
                                { label: 'Press & Media', to: '#' },
                                { label: 'Contact', to: '/contact' },
                            ].map(({ label, to }) => (
                                <li key={label}>
                                    <Link
                                        to={to}
                                        className="block text-sm text-white/60 transition-colors duration-150 hover:text-brand-gold"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Policies */}
                    <div>
                        <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-brand-gold">
                            Policies
                        </h3>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'Privacy Policy', to: '/privacy-policy' },
                                { label: 'Terms & Condition', to: '/terms-and-conditions' },
                            ].map(({ label, to }) => (
                                <li key={label}>
                                    <Link
                                        to={to}
                                        className="block text-sm text-white/60 transition-colors duration-150 hover:text-brand-gold"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Portals */}
                    <div>
                        <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-brand-gold">
                            Portals
                        </h3>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'Student Portal', to: '/login' },
                                { label: 'Institution Portal', to: '/institution/login' },
                                { label: 'Trainer Portal', to: '/login' },
                            ].map(({ label, to }) => (
                                <li key={label}>
                                    <Link
                                        to={to}
                                        className="block text-sm text-white/60 transition-colors duration-150 hover:text-brand-gold"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ── Divider ───────────────────────────────────────────────────── */}
                <div className="my-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* ── Bottom bar: social icons left, copyright centred, spacer right ── */}
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">

                    {/* Social icons */}
                    <div className="flex items-center gap-2.5">
                        {[
                            {
                                href: 'https://www.facebook.com/share/19zn8KoUN6/',
                                label: 'Follow us on Facebook',
                                Icon: Facebook,
                            },
                            {
                                href: 'https://www.instagram.com/skyline_technologies',
                                label: 'Follow us on Instagram',
                                Icon: Instagram,
                            },
                            {
                                href: 'https://www.linkedin.com/company/skyline-technology/',
                                label: 'Follow us on LinkedIn',
                                Icon: Linkedin,
                            },
                            {
                                href: 'https://youtube.com/@skylinetechnologies',
                                label: 'Follow us on YouTube',
                                Icon: Youtube,
                            },
                        ].map(({ href, label, Icon }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/50 transition-all duration-200 hover:bg-brand-gold hover:text-brand-black hover:scale-105"
                            >
                                <Icon className="h-4 w-4" />
                            </a>
                        ))}
                    </div>

                    {/* Copyright — centred on mobile, centred within available space on desktop */}
                    <p className="text-center text-xs text-white/35 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                        &copy; 2026 Skyline Skilling &amp; Training Center. All rights reserved.
                    </p>

                    {/* Right spacer — keeps copyright visually centred on desktop */}
                    <div className="hidden w-[148px] sm:block" aria-hidden="true" />
                </div>

            </div>
        </footer>
    );
};

export default Footer;