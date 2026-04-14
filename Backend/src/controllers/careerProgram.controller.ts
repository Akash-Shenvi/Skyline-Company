import { Request, Response } from 'express';
import CareerProgram from '../models/careerProgram.model';

const slugify = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');

const normalizeString = (value: unknown) => String(value ?? '').trim();

const normalizeStringList = (value: unknown) =>
    Array.isArray(value)
        ? value.map((item) => normalizeString(item)).filter(Boolean)
        : [];

const isDefined = <T>(value: T | null): value is T => value !== null;

const parseNumber = (value: unknown) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : null;
};

const parseBoolean = (value: unknown) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.trim().toLowerCase() !== 'false';
    return true;
};

const normalizeSalaryRange = (value: unknown) => {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const normalizedValue = value as Record<string, unknown>;
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

const normalizeProcessSteps = (value: unknown): Array<{ title: string; points: string[]; order: number }> =>
    (Array.isArray(value) ? value : [])
        .map((step, index) => {
            if (!step || typeof step !== 'object') {
                return null;
            }

            const normalizedStep = step as Record<string, unknown>;
            const title = normalizeString(normalizedStep.title);
            const points = normalizeStringList(normalizedStep.points);
            const order = parseNumber(normalizedStep.order) ?? index + 1;

            if (!title || points.length === 0) {
                return null;
            }

            return { title, points, order };
        })
        .filter(isDefined);

const normalizeTimelinePhases = (value: unknown): Array<{ label: string; durationLabel: string }> =>
    (Array.isArray(value) ? value : [])
        .map((phase) => {
            if (!phase || typeof phase !== 'object') {
                return null;
            }

            const normalizedPhase = phase as Record<string, unknown>;
            const label = normalizeString(normalizedPhase.label);
            const durationLabel = normalizeString(normalizedPhase.durationLabel);

            if (!label || !durationLabel) {
                return null;
            }

            return { label, durationLabel };
        })
        .filter(isDefined);

const normalizeTimelines = (value: unknown): Array<{
    title: string;
    intro?: string;
    phases: Array<{ label: string; durationLabel: string }>;
    totalDurationLabel: string;
    note?: string;
    order: number;
}> =>
    (Array.isArray(value) ? value : [])
        .map((timeline, index) => {
            if (!timeline || typeof timeline !== 'object') {
                return null;
            }

            const normalizedTimeline = timeline as Record<string, unknown>;
            const title = normalizeString(normalizedTimeline.title);
            const intro = normalizeString(normalizedTimeline.intro);
            const phases = normalizeTimelinePhases(normalizedTimeline.phases);
            const totalDurationLabel = normalizeString(normalizedTimeline.totalDurationLabel);
            const note = normalizeString(normalizedTimeline.note);
            const order = parseNumber(normalizedTimeline.order) ?? index + 1;

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

const buildCareerProgramPayload = (body: Request['body']) => ({
    title: normalizeString(body.title),
    slug: normalizeString(body.slug),
    shortDescription: normalizeString(body.shortDescription),
    overview: normalizeString(body.overview),
    country: normalizeString(body.country),
    eligibleProfiles: normalizeStringList(body.eligibleProfiles),
    whyChoose: normalizeStringList(body.whyChoose),
    salary: {
        adaptation: normalizeSalaryRange(body.salary?.adaptation),
        fullRecognition: normalizeSalaryRange(body.salary?.fullRecognition),
        additionalBenefits: normalizeStringList(body.salary?.additionalBenefits),
    },
    processSteps: normalizeProcessSteps(body.processSteps),
    timelines: normalizeTimelines(body.timelines),
    documentsRequired: normalizeStringList(body.documentsRequired),
    ctaDescription: normalizeString(body.ctaDescription),
    tags: normalizeStringList(body.tags),
    isActive: parseBoolean(body.isActive),
    sortOrder: parseNumber(body.sortOrder),
});

const validateCareerProgramPayload = (payload: ReturnType<typeof buildCareerProgramPayload>) => {
    const requiredFields = [
        ['title', payload.title],
        ['shortDescription', payload.shortDescription],
        ['overview', payload.overview],
        ['country', payload.country],
        ['ctaDescription', payload.ctaDescription],
    ] as const;

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

const generateUniqueSlug = async (value: string, excludeId?: string) => {
    const baseSlug = slugify(value) || 'career-program';
    let slug = baseSlug;
    let counter = 1;

    while (await CareerProgram.exists({
        slug,
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })) {
        slug = `${baseSlug}-${counter}`;
        counter += 1;
    }

    return slug;
};

const getNextSortOrder = async () => {
    const lastProgram = await CareerProgram.findOne().sort({ sortOrder: -1, createdAt: -1 }).select('sortOrder');
    return (lastProgram?.sortOrder ?? 0) + 1;
};

export const getPublicCareerPrograms = async (_req: Request, res: Response) => {
    try {
        const programs = await CareerProgram.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
        return res.status(200).json({ programs });
    } catch (error) {
        console.error('Fetching public career programs failed:', error);
        return res.status(500).json({ message: 'Failed to fetch career programs.' });
    }
};

export const getCareerProgramBySlug = async (req: Request, res: Response) => {
    try {
        const program = await CareerProgram.findOne({
            slug: normalizeString(req.params.slug).toLowerCase(),
            isActive: true,
        });

        if (!program) {
            return res.status(404).json({ message: 'Career program not found.' });
        }

        return res.status(200).json({ program });
    } catch (error) {
        console.error('Fetching career program by slug failed:', error);
        return res.status(500).json({ message: 'Failed to fetch career program.' });
    }
};

export const getAdminCareerPrograms = async (_req: Request, res: Response) => {
    try {
        const programs = await CareerProgram.find().sort({ sortOrder: 1, createdAt: 1 });
        return res.status(200).json({ programs });
    } catch (error) {
        console.error('Fetching admin career programs failed:', error);
        return res.status(500).json({ message: 'Failed to fetch career programs.' });
    }
};

export const createCareerProgram = async (req: Request, res: Response) => {
    try {
        const payload = buildCareerProgramPayload(req.body);
        const validationError = validateCareerProgramPayload(payload);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const program = await CareerProgram.create({
            ...payload,
            salary: {
                adaptation: payload.salary.adaptation!,
                fullRecognition: payload.salary.fullRecognition!,
                additionalBenefits: payload.salary.additionalBenefits,
            },
            slug: await generateUniqueSlug(payload.slug || payload.title),
            sortOrder: payload.sortOrder ?? await getNextSortOrder(),
        });

        return res.status(201).json({
            message: 'Career program created successfully.',
            program,
        });
    } catch (error) {
        console.error('Creating career program failed:', error);
        return res.status(500).json({ message: 'Failed to create career program.' });
    }
};

export const updateCareerProgram = async (req: Request, res: Response) => {
    try {
        const program = await CareerProgram.findById(req.params.id);

        if (!program) {
            return res.status(404).json({ message: 'Career program not found.' });
        }

        const payload = buildCareerProgramPayload(req.body);
        const validationError = validateCareerProgramPayload(payload);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        program.set({
            ...payload,
            salary: {
                adaptation: payload.salary.adaptation!,
                fullRecognition: payload.salary.fullRecognition!,
                additionalBenefits: payload.salary.additionalBenefits,
            },
            slug: await generateUniqueSlug(payload.slug || payload.title, String(program._id)),
            sortOrder: payload.sortOrder ?? program.sortOrder,
        });

        await program.save();

        return res.status(200).json({
            message: 'Career program updated successfully.',
            program,
        });
    } catch (error) {
        console.error('Updating career program failed:', error);
        return res.status(500).json({ message: 'Failed to update career program.' });
    }
};

export const deleteCareerProgram = async (req: Request, res: Response) => {
    try {
        const program = await CareerProgram.findById(req.params.id);

        if (!program) {
            return res.status(404).json({ message: 'Career program not found.' });
        }

        await program.deleteOne();

        return res.status(200).json({ message: 'Career program deleted successfully.' });
    } catch (error) {
        console.error('Deleting career program failed:', error);
        return res.status(500).json({ message: 'Failed to delete career program.' });
    }
};
