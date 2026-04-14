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
exports.deleteCareerProgram = exports.updateCareerProgram = exports.createCareerProgram = exports.getAdminCareerPrograms = exports.getCareerProgramBySlug = exports.getPublicCareerPrograms = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const careerProgram_model_1 = __importDefault(require("../models/careerProgram.model"));
const careerImageUploadDir = '/home/skyline/file_serve/careers';
const slugify = (value) => value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
const normalizeString = (value) => String(value !== null && value !== void 0 ? value : '').trim();
const normalizeStringList = (value) => Array.isArray(value)
    ? value.map((item) => normalizeString(item)).filter(Boolean)
    : [];
const isDefined = (value) => value !== null;
const parseNumber = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : null;
};
const parseBoolean = (value) => {
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'string')
        return value.trim().toLowerCase() !== 'false';
    return true;
};
const normalizeSalaryRange = (value) => {
    if (!value || typeof value !== 'object') {
        return null;
    }
    const normalizedValue = value;
    const min = parseNumber(normalizedValue.min);
    const max = parseNumber(normalizedValue.max);
    const currency = normalizeString(normalizedValue.currency || 'EUR').toUpperCase();
    const periodLabel = normalizeString(normalizedValue.periodLabel);
    if (min === null || max === null || !currency || !periodLabel) {
        return null;
    }
    return {
        min,
        max,
        currency,
        periodLabel,
        hasPlus: Boolean(normalizedValue.hasPlus),
    };
};
const normalizeProcessSteps = (value) => (Array.isArray(value) ? value : [])
    .map((step, index) => {
    var _a;
    if (!step || typeof step !== 'object') {
        return null;
    }
    const normalizedStep = step;
    const title = normalizeString(normalizedStep.title);
    const points = normalizeStringList(normalizedStep.points);
    const order = (_a = parseNumber(normalizedStep.order)) !== null && _a !== void 0 ? _a : index + 1;
    if (!title || points.length === 0) {
        return null;
    }
    return { title, points, order };
})
    .filter(isDefined);
const normalizeTimelinePhases = (value) => (Array.isArray(value) ? value : [])
    .map((phase) => {
    if (!phase || typeof phase !== 'object') {
        return null;
    }
    const normalizedPhase = phase;
    const label = normalizeString(normalizedPhase.label);
    const durationLabel = normalizeString(normalizedPhase.durationLabel);
    if (!label || !durationLabel) {
        return null;
    }
    return { label, durationLabel };
})
    .filter(isDefined);
const normalizeTimelines = (value) => (Array.isArray(value) ? value : [])
    .map((timeline, index) => {
    var _a;
    if (!timeline || typeof timeline !== 'object') {
        return null;
    }
    const normalizedTimeline = timeline;
    const title = normalizeString(normalizedTimeline.title);
    const intro = normalizeString(normalizedTimeline.intro);
    const phases = normalizeTimelinePhases(normalizedTimeline.phases);
    const totalDurationLabel = normalizeString(normalizedTimeline.totalDurationLabel);
    const note = normalizeString(normalizedTimeline.note);
    const order = (_a = parseNumber(normalizedTimeline.order)) !== null && _a !== void 0 ? _a : index + 1;
    if (!title || phases.length === 0 || !totalDurationLabel) {
        return null;
    }
    return {
        title,
        intro: intro || undefined,
        phases,
        totalDurationLabel,
        note: note || undefined,
        order,
    };
})
    .filter(isDefined);
const parseCareerProgramRequestBody = (req) => {
    var _a;
    const rawPayload = (_a = req.body) === null || _a === void 0 ? void 0 : _a.payload;
    if (typeof rawPayload === 'string') {
        try {
            const parsedPayload = JSON.parse(rawPayload);
            if (parsedPayload && typeof parsedPayload === 'object') {
                return parsedPayload;
            }
        }
        catch (error) {
            console.warn('Failed to parse career program payload JSON:', error);
        }
    }
    return req.body && typeof req.body === 'object'
        ? req.body
        : {};
};
const buildCareerProgramPayload = (body) => {
    const salary = body.salary && typeof body.salary === 'object'
        ? body.salary
        : {};
    return {
        title: normalizeString(body.title),
        slug: normalizeString(body.slug),
        heroImage: normalizeString(body.heroImage),
        cardImage: normalizeString(body.cardImage),
        shortDescription: normalizeString(body.shortDescription),
        overview: normalizeString(body.overview),
        country: normalizeString(body.country),
        eligibleProfiles: normalizeStringList(body.eligibleProfiles),
        whyChoose: normalizeStringList(body.whyChoose),
        salary: {
            adaptation: normalizeSalaryRange(salary.adaptation),
            fullRecognition: normalizeSalaryRange(salary.fullRecognition),
            additionalBenefits: normalizeStringList(salary.additionalBenefits),
        },
        processSteps: normalizeProcessSteps(body.processSteps),
        timelines: normalizeTimelines(body.timelines),
        documentsRequired: normalizeStringList(body.documentsRequired),
        ctaDescription: normalizeString(body.ctaDescription),
        tags: normalizeStringList(body.tags),
        isActive: parseBoolean(body.isActive),
        sortOrder: parseNumber(body.sortOrder),
    };
};
const validateCareerProgramPayload = (payload) => {
    const requiredFields = [
        ['title', payload.title],
        ['shortDescription', payload.shortDescription],
        ['overview', payload.overview],
        ['country', payload.country],
        ['ctaDescription', payload.ctaDescription],
    ];
    const missingField = requiredFields.find(([, value]) => !value);
    if (missingField) {
        return `${missingField[0]} is required.`;
    }
    if (payload.eligibleProfiles.length === 0) {
        return 'Please add at least one eligible profile.';
    }
    if (payload.whyChoose.length === 0) {
        return 'Please add at least one reason in whyChoose.';
    }
    if (!payload.salary.adaptation || !payload.salary.fullRecognition) {
        return 'Please configure both salary ranges.';
    }
    if (payload.processSteps.length === 0) {
        return 'Please add at least one process step.';
    }
    if (payload.timelines.length === 0) {
        return 'Please add at least one timeline.';
    }
    if (payload.documentsRequired.length === 0) {
        return 'Please add at least one required document.';
    }
    return null;
};
const getCareerProgramUploadFiles = (req) => req.files || {};
const toStoredCareerImageUrl = (file) => `/uploads/careers/${file.filename}`;
const resolveCareerImage = (storedValue, uploadedFile) => uploadedFile ? toStoredCareerImageUrl(uploadedFile) : storedValue || undefined;
const deleteStoredCareerImage = (imagePath) => __awaiter(void 0, void 0, void 0, function* () {
    if (!imagePath || !imagePath.startsWith('/uploads/careers/')) {
        return;
    }
    const filePath = path_1.default.join(careerImageUploadDir, path_1.default.basename(imagePath));
    try {
        yield fs_1.default.promises.unlink(filePath);
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) !== 'ENOENT') {
            console.error('Failed to delete stored career image:', error);
        }
    }
});
const cleanupUploadedCareerFiles = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadedFiles = [
        ...(files.heroImage || []),
        ...(files.cardImage || []),
    ];
    yield Promise.all(uploadedFiles.map((file) => fs_1.default.promises.unlink(file.path).catch(() => undefined)));
});
const generateUniqueSlug = (value, excludeId) => __awaiter(void 0, void 0, void 0, function* () {
    const baseSlug = slugify(value) || 'career-program';
    let slug = baseSlug;
    let counter = 1;
    while (yield careerProgram_model_1.default.exists(Object.assign({ slug }, (excludeId ? { _id: { $ne: excludeId } } : {})))) {
        slug = `${baseSlug}-${counter}`;
        counter += 1;
    }
    return slug;
});
const getNextSortOrder = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const lastProgram = yield careerProgram_model_1.default.findOne().sort({ sortOrder: -1, createdAt: -1 }).select('sortOrder');
    return ((_a = lastProgram === null || lastProgram === void 0 ? void 0 : lastProgram.sortOrder) !== null && _a !== void 0 ? _a : 0) + 1;
});
const getPublicCareerPrograms = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const programs = yield careerProgram_model_1.default.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
        return res.status(200).json({ programs });
    }
    catch (error) {
        console.error('Fetching public career programs failed:', error);
        return res.status(500).json({ message: 'Failed to fetch career programs.' });
    }
});
exports.getPublicCareerPrograms = getPublicCareerPrograms;
const getCareerProgramBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const program = yield careerProgram_model_1.default.findOne({
            slug: normalizeString(req.params.slug).toLowerCase(),
            isActive: true,
        });
        if (!program) {
            return res.status(404).json({ message: 'Career program not found.' });
        }
        return res.status(200).json({ program });
    }
    catch (error) {
        console.error('Fetching career program by slug failed:', error);
        return res.status(500).json({ message: 'Failed to fetch career program.' });
    }
});
exports.getCareerProgramBySlug = getCareerProgramBySlug;
const getAdminCareerPrograms = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const programs = yield careerProgram_model_1.default.find().sort({ sortOrder: 1, createdAt: 1 });
        return res.status(200).json({ programs });
    }
    catch (error) {
        console.error('Fetching admin career programs failed:', error);
        return res.status(500).json({ message: 'Failed to fetch career programs.' });
    }
});
exports.getAdminCareerPrograms = getAdminCareerPrograms;
const createCareerProgram = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const uploadedFiles = getCareerProgramUploadFiles(req);
    try {
        const payload = buildCareerProgramPayload(parseCareerProgramRequestBody(req));
        const validationError = validateCareerProgramPayload(payload);
        if (validationError) {
            yield cleanupUploadedCareerFiles(uploadedFiles);
            return res.status(400).json({ message: validationError });
        }
        const program = yield careerProgram_model_1.default.create(Object.assign(Object.assign({}, payload), { heroImage: resolveCareerImage(payload.heroImage, (_a = uploadedFiles.heroImage) === null || _a === void 0 ? void 0 : _a[0]), cardImage: resolveCareerImage(payload.cardImage, (_b = uploadedFiles.cardImage) === null || _b === void 0 ? void 0 : _b[0]), salary: {
                adaptation: payload.salary.adaptation,
                fullRecognition: payload.salary.fullRecognition,
                additionalBenefits: payload.salary.additionalBenefits,
            }, slug: yield generateUniqueSlug(payload.slug || payload.title), sortOrder: (_c = payload.sortOrder) !== null && _c !== void 0 ? _c : yield getNextSortOrder() }));
        return res.status(201).json({
            message: 'Career program created successfully.',
            program,
        });
    }
    catch (error) {
        yield cleanupUploadedCareerFiles(uploadedFiles);
        console.error('Creating career program failed:', error);
        return res.status(500).json({ message: 'Failed to create career program.' });
    }
});
exports.createCareerProgram = createCareerProgram;
const updateCareerProgram = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const uploadedFiles = getCareerProgramUploadFiles(req);
    try {
        const program = yield careerProgram_model_1.default.findById(req.params.id);
        if (!program) {
            yield cleanupUploadedCareerFiles(uploadedFiles);
            return res.status(404).json({ message: 'Career program not found.' });
        }
        const payload = buildCareerProgramPayload(parseCareerProgramRequestBody(req));
        const validationError = validateCareerProgramPayload(payload);
        if (validationError) {
            yield cleanupUploadedCareerFiles(uploadedFiles);
            return res.status(400).json({ message: validationError });
        }
        const nextHeroImage = resolveCareerImage(payload.heroImage, (_a = uploadedFiles.heroImage) === null || _a === void 0 ? void 0 : _a[0]);
        const nextCardImage = resolveCareerImage(payload.cardImage, (_b = uploadedFiles.cardImage) === null || _b === void 0 ? void 0 : _b[0]);
        const previousHeroImage = program.heroImage;
        const previousCardImage = program.cardImage;
        program.set(Object.assign(Object.assign({}, payload), { heroImage: nextHeroImage, cardImage: nextCardImage, salary: {
                adaptation: payload.salary.adaptation,
                fullRecognition: payload.salary.fullRecognition,
                additionalBenefits: payload.salary.additionalBenefits,
            }, slug: yield generateUniqueSlug(payload.slug || payload.title, String(program._id)), sortOrder: (_c = payload.sortOrder) !== null && _c !== void 0 ? _c : program.sortOrder }));
        yield program.save();
        yield Promise.all([
            previousHeroImage !== nextHeroImage ? deleteStoredCareerImage(previousHeroImage) : Promise.resolve(),
            previousCardImage !== nextCardImage ? deleteStoredCareerImage(previousCardImage) : Promise.resolve(),
        ]);
        return res.status(200).json({
            message: 'Career program updated successfully.',
            program,
        });
    }
    catch (error) {
        yield cleanupUploadedCareerFiles(uploadedFiles);
        console.error('Updating career program failed:', error);
        return res.status(500).json({ message: 'Failed to update career program.' });
    }
});
exports.updateCareerProgram = updateCareerProgram;
const deleteCareerProgram = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const program = yield careerProgram_model_1.default.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ message: 'Career program not found.' });
        }
        yield program.deleteOne();
        yield Promise.all([
            deleteStoredCareerImage(program.heroImage),
            deleteStoredCareerImage(program.cardImage),
        ]);
        return res.status(200).json({ message: 'Career program deleted successfully.' });
    }
    catch (error) {
        console.error('Deleting career program failed:', error);
        return res.status(500).json({ message: 'Failed to delete career program.' });
    }
});
exports.deleteCareerProgram = deleteCareerProgram;
