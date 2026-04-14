"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTrialRequest = exports.getTrialRequests = exports.createTrialRequest = void 0;
const trialRequest_model_1 = __importDefault(require("../models/trialRequest.model"));
const languageCourse_model_1 = __importDefault(require("../models/languageCourse.model"));
const email_service_1 = require("../utils/email.service");
const emailService = new email_service_1.EmailService();
const normalizeText = (value) => String(value !== null && value !== void 0 ? value : '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
const getLanguageDisplayName = (title) => {
    const trimmedTitle = String(title || '').trim();
    const displayName = trimmedTitle.replace(/\s+language\s+training$/i, '').trim();
    return displayName || trimmedTitle;
};
// Create a new trial request
const createTrialRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { fullName, email, phone, countryCode, languageCourseId, language, course, comments, } = req.body;
        const normalizedFullName = String(fullName !== null && fullName !== void 0 ? fullName : '').trim();
        const normalizedEmail = String(email !== null && email !== void 0 ? email : '').trim();
        const normalizedPhone = String(phone !== null && phone !== void 0 ? phone : '').trim();
        const normalizedCountryCode = String(countryCode !== null && countryCode !== void 0 ? countryCode : '+91').trim() || '+91';
        const normalizedLanguage = String(language !== null && language !== void 0 ? language : '').trim();
        const normalizedCourse = String(course !== null && course !== void 0 ? course : '').trim();
        const normalizedComments = String(comments !== null && comments !== void 0 ? comments : '').trim();
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
            selectedLanguageCourse = yield languageCourse_model_1.default.findById(languageCourseId.trim()).select('title levels');
        }
        if (!selectedLanguageCourse) {
            const allLanguageCourses = yield languageCourse_model_1.default.find().select('title levels');
            const normalizedRequestedLanguage = normalizeText(normalizedLanguage);
            selectedLanguageCourse = allLanguageCourses.find((courseItem) => {
                var _a;
                const title = String((_a = courseItem.title) !== null && _a !== void 0 ? _a : '');
                const displayName = getLanguageDisplayName(title);
                return normalizeText(title) === normalizedRequestedLanguage
                    || normalizeText(displayName) === normalizedRequestedLanguage;
            }) || null;
        }
        if (!selectedLanguageCourse) {
            return res.status(400).json({ message: 'The selected language is no longer available.' });
        }
        const selectedLevel = (_a = selectedLanguageCourse.levels) === null || _a === void 0 ? void 0 : _a.find((level) => normalizeText(level.name) === normalizeText(normalizedCourse));
        if (!selectedLevel) {
            return res.status(400).json({ message: 'The selected language level is no longer available.' });
        }
        const newRequest = new trialRequest_model_1.default({
            fullName: normalizedFullName,
            email: normalizedEmail,
            phone: normalizedPhone,
            countryCode: normalizedCountryCode,
            interest: 'Language',
            language: getLanguageDisplayName(selectedLanguageCourse.title),
            course: selectedLevel.name,
            comments: normalizedComments || undefined,
        });
        yield newRequest.save();
        const emailSent = yield emailService.sendTrialBookingConfirmation({
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
    }
    catch (error) {
        console.error('Error creating trial request:', error);
        res.status(500).json({ message: 'Failed to submit trial request', error: error.message });
    }
});
exports.createTrialRequest = createTrialRequest;
// Get all trial requests (Admin)
const getTrialRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield trialRequest_model_1.default.find().sort({ createdAt: -1 });
        res.status(200).json(requests);
    }
    catch (error) {
        console.error('Error fetching trial requests:', error);
        res.status(500).json({ message: 'Failed to fetch trial requests', error: error.message });
    }
});
exports.getTrialRequests = getTrialRequests;
// Delete a trial request (Admin)
const deleteTrialRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield trialRequest_model_1.default.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Trial request not found' });
        }
        res.status(200).json({ message: 'Trial request deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting trial request:', error);
        res.status(500).json({ message: 'Failed to delete trial request', error: error.message });
    }
});
exports.deleteTrialRequest = deleteTrialRequest;
