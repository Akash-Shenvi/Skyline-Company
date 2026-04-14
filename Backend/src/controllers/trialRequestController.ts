import { Request, Response } from 'express';
import TrialRequest from '../models/trialRequest.model';
import LanguageCourse from '../models/languageCourse.model';
import { EmailService } from '../utils/email.service';

const emailService = new EmailService();

const normalizeText = (value: unknown) =>
    String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');

const getLanguageDisplayName = (title: string) => {
    const trimmedTitle = String(title || '').trim();
    const displayName = trimmedTitle.replace(/\s+language\s+training$/i, '').trim();
    return displayName || trimmedTitle;
};

// Create a new trial request
export const createTrialRequest = async (req: Request, res: Response) => {
    try {
        const {
            fullName,
            email,
            phone,
            countryCode,
            languageCourseId,
            language,
            course,
            comments,
        } = req.body;

        const normalizedFullName = String(fullName ?? '').trim();
        const normalizedEmail = String(email ?? '').trim();
        const normalizedPhone = String(phone ?? '').trim();
        const normalizedCountryCode = String(countryCode ?? '+91').trim() || '+91';
        const normalizedLanguage = String(language ?? '').trim();
        const normalizedCourse = String(course ?? '').trim();
        const normalizedComments = String(comments ?? '').trim();

        if (!normalizedFullName || !normalizedEmail || !normalizedPhone) {
            return res.status(400).json({ message: 'Full name, email, and phone are required.' });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ message: 'Please provide a valid email address.' });
        }

        if (!normalizedLanguage || !normalizedCourse) {
            return res.status(400).json({ message: 'Please select a language and level.' });
        }

        let selectedLanguageCourse = null;

        if (typeof languageCourseId === 'string' && /^[a-f\d]{24}$/i.test(languageCourseId.trim())) {
            selectedLanguageCourse = await LanguageCourse.findById(languageCourseId.trim()).select('title levels');
        }

        if (!selectedLanguageCourse) {
            const allLanguageCourses = await LanguageCourse.find().select('title levels');
            const normalizedRequestedLanguage = normalizeText(normalizedLanguage);

            selectedLanguageCourse = allLanguageCourses.find((courseItem) => {
                const title = String(courseItem.title ?? '');
                const displayName = getLanguageDisplayName(title);

                return normalizeText(title) === normalizedRequestedLanguage
                    || normalizeText(displayName) === normalizedRequestedLanguage;
            }) || null;
        }

        if (!selectedLanguageCourse) {
            return res.status(400).json({ message: 'The selected language is no longer available.' });
        }

        const selectedLevel = selectedLanguageCourse.levels?.find(
            (level) => normalizeText(level.name) === normalizeText(normalizedCourse)
        );

        if (!selectedLevel) {
            return res.status(400).json({ message: 'The selected language level is no longer available.' });
        }

        const newRequest = new TrialRequest({
            fullName: normalizedFullName,
            email: normalizedEmail,
            phone: normalizedPhone,
            countryCode: normalizedCountryCode,
            interest: 'Language',
            language: getLanguageDisplayName(selectedLanguageCourse.title),
            course: selectedLevel.name,
            comments: normalizedComments || undefined,
        });

        await newRequest.save();

        const emailSent = await emailService.sendTrialBookingConfirmation({
            to: normalizedEmail,
            fullName: normalizedFullName,
            language: getLanguageDisplayName(selectedLanguageCourse.title),
            level: selectedLevel.name,
            phone: `${normalizedCountryCode} ${normalizedPhone}`,
        });

        res.status(201).json({
            message: emailSent
                ? 'Trial request submitted successfully'
                : 'Trial request submitted successfully, but the confirmation email could not be sent right now.',
            emailSent,
            data: newRequest,
        });
    } catch (error: any) {
        console.error('Error creating trial request:', error);
        res.status(500).json({ message: 'Failed to submit trial request', error: error.message });
    }
};

// Get all trial requests (Admin)
export const getTrialRequests = async (req: Request, res: Response) => {
    try {
        const requests = await TrialRequest.find().sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error: any) {
        console.error('Error fetching trial requests:', error);
        res.status(500).json({ message: 'Failed to fetch trial requests', error: error.message });
    }
};

// Delete a trial request (Admin)
export const deleteTrialRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await TrialRequest.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Trial request not found' });
        }

        res.status(200).json({ message: 'Trial request deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting trial request:', error);
        res.status(500).json({ message: 'Failed to delete trial request', error: error.message });
    }
};
