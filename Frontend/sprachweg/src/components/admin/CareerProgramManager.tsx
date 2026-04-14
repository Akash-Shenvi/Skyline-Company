import React, { useEffect, useState } from 'react';
import { BriefcaseBusiness, CirclePlus, Loader2, Pencil, RefreshCcw, Save, Trash2, X } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { careerProgramsAPI, getAssetUrl } from '../../lib/api';
import { formatCareerSalaryRange, type CareerProgram, type CareerProgramPayload } from '../../types/careerProgram';

interface SalaryRangeFormState {
    min: string;
    max: string;
    currency: string;
    periodLabel: string;
    hasPlus: boolean;
}

interface ProcessStepFormState {
    title: string;
    points: string;
    order: string;
}

interface TimelineFormState {
    title: string;
    intro: string;
    phases: string;
    totalDurationLabel: string;
    note: string;
    order: string;
}

interface CareerProgramFormState {
    title: string;
    slug: string;
    heroImage: string;
    heroImageFile: File | null;
    cardImage: string;
    cardImageFile: File | null;
    shortDescription: string;
    overview: string;
    country: string;
    eligibleProfiles: string[];
    whyChoose: string[];
    salary: {
        adaptation: SalaryRangeFormState;
        fullRecognition: SalaryRangeFormState;
        additionalBenefits: string[];
    };
    processSteps: ProcessStepFormState[];
    timelines: TimelineFormState[];
    documentsRequired: string[];
    ctaDescription: string;
    tags: string[];
    isActive: boolean;
    sortOrder: string;
}

const cardClassName = 'rounded-2xl border border-brand-surface bg-white p-6 shadow-sm';
const inputClassName = 'w-full rounded-xl border border-brand-surface bg-brand-off-white px-4 py-3 text-sm text-brand-black outline-none transition-colors focus:border-brand-red focus:ring-2 focus:ring-brand-gold/20';
const secondaryButtonClassName = 'inline-flex items-center justify-center gap-2 rounded-xl border border-brand-surface bg-white px-4 py-2.5 text-sm font-semibold text-brand-olive-dark transition-colors hover:border-brand-gold hover:text-brand-gold-hover';

const createSalaryRange = (periodLabel: string): SalaryRangeFormState => ({ min: '', max: '', currency: 'EUR', periodLabel, hasPlus: false });
const createProcessStep = (order: number): ProcessStepFormState => ({ title: '', points: '', order: String(order) });
const createTimeline = (order: number): TimelineFormState => ({ title: '', intro: '', phases: '', totalDurationLabel: '', note: '', order: String(order) });

const defaultForm = (): CareerProgramFormState => ({
    title: '',
    slug: '',
    heroImage: '',
    heroImageFile: null,
    cardImage: '',
    cardImageFile: null,
    shortDescription: '',
    overview: '',
    country: 'Germany',
    eligibleProfiles: [''],
    whyChoose: [''],
    salary: {
        adaptation: createSalaryRange('per month during adaptation period'),
        fullRecognition: createSalaryRange('per month after full recognition'),
        additionalBenefits: [''],
    },
    processSteps: [createProcessStep(1)],
    timelines: [createTimeline(1)],
    documentsRequired: [''],
    ctaDescription: '',
    tags: [''],
    isActive: true,
    sortOrder: '1',
});

const normalizeStringList = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);
const parseOrder = (value: string, fallback: number) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : fallback;
};

const parsePhaseLines = (value: string) =>
    value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [label, durationLabel] = line.split('|').map((part) => part.trim());
            return { label, durationLabel };
        })
        .filter((phase) => phase.label && phase.durationLabel);

const serializePhaseLines = (program: CareerProgram) =>
    program.timelines.map((timeline) => timeline.phases.map((phase) => `${phase.label} | ${phase.durationLabel}`).join('\n'));

const fromProgram = (program: CareerProgram): CareerProgramFormState => ({
    title: program.title,
    slug: program.slug,
    heroImage: program.heroImage || '',
    heroImageFile: null,
    cardImage: program.cardImage || '',
    cardImageFile: null,
    shortDescription: program.shortDescription,
    overview: program.overview,
    country: program.country,
    eligibleProfiles: program.eligibleProfiles.length > 0 ? program.eligibleProfiles : [''],
    whyChoose: program.whyChoose.length > 0 ? program.whyChoose : [''],
    salary: {
        adaptation: {
            min: String(program.salary.adaptation.min),
            max: String(program.salary.adaptation.max),
            currency: program.salary.adaptation.currency,
            periodLabel: program.salary.adaptation.periodLabel,
            hasPlus: Boolean(program.salary.adaptation.hasPlus),
        },
        fullRecognition: {
            min: String(program.salary.fullRecognition.min),
            max: String(program.salary.fullRecognition.max),
            currency: program.salary.fullRecognition.currency,
            periodLabel: program.salary.fullRecognition.periodLabel,
            hasPlus: Boolean(program.salary.fullRecognition.hasPlus),
        },
        additionalBenefits: program.salary.additionalBenefits.length > 0 ? program.salary.additionalBenefits : [''],
    },
    processSteps: program.processSteps.length > 0
        ? program.processSteps.map((step) => ({
            title: step.title,
            points: step.points.join('\n'),
            order: String(step.order),
        }))
        : [createProcessStep(1)],
    timelines: program.timelines.length > 0
        ? program.timelines.map((timeline, index) => ({
            title: timeline.title,
            intro: timeline.intro || '',
            phases: serializePhaseLines(program)[index] || '',
            totalDurationLabel: timeline.totalDurationLabel,
            note: timeline.note || '',
            order: String(timeline.order),
        }))
        : [createTimeline(1)],
    documentsRequired: program.documentsRequired.length > 0 ? program.documentsRequired : [''],
    ctaDescription: program.ctaDescription,
    tags: program.tags.length > 0 ? program.tags : [''],
    isActive: program.isActive,
    sortOrder: String(program.sortOrder ?? 0),
});

const StringListEditor: React.FC<{
    label: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder: string;
}> = ({ label, items, onChange, placeholder }) => {
    const safeItems = items.length > 0 ? items : [''];

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-brand-olive-dark">{label}</label>
            {safeItems.map((item, index) => (
                <div key={`${label}-${index}`} className="flex gap-3">
                    <input
                        value={item}
                        onChange={(event) => {
                            const nextItems = [...safeItems];
                            nextItems[index] = event.target.value;
                            onChange(nextItems);
                        }}
                        className={inputClassName}
                        placeholder={placeholder}
                    />
                    <button
                        type="button"
                        onClick={() => onChange(safeItems.filter((_, currentIndex) => currentIndex !== index))}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-red/20 bg-brand-red/5 text-brand-red transition-colors hover:bg-brand-red/10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
            <button type="button" onClick={() => onChange([...safeItems, ''])} className={secondaryButtonClassName}>
                <CirclePlus className="h-4 w-4" />
                Add Item
            </button>
        </div>
    );
};

const toPayload = (form: CareerProgramFormState): CareerProgramPayload => ({
    title: form.title.trim(),
    slug: form.slug.trim(),
    heroImage: form.heroImage.trim() || undefined,
    cardImage: form.cardImage.trim() || undefined,
    shortDescription: form.shortDescription.trim(),
    overview: form.overview.trim(),
    country: form.country.trim(),
    eligibleProfiles: normalizeStringList(form.eligibleProfiles),
    whyChoose: normalizeStringList(form.whyChoose),
    salary: {
        adaptation: {
            min: Number(form.salary.adaptation.min),
            max: Number(form.salary.adaptation.max),
            currency: form.salary.adaptation.currency.trim().toUpperCase(),
            periodLabel: form.salary.adaptation.periodLabel.trim(),
            hasPlus: form.salary.adaptation.hasPlus,
        },
        fullRecognition: {
            min: Number(form.salary.fullRecognition.min),
            max: Number(form.salary.fullRecognition.max),
            currency: form.salary.fullRecognition.currency.trim().toUpperCase(),
            periodLabel: form.salary.fullRecognition.periodLabel.trim(),
            hasPlus: form.salary.fullRecognition.hasPlus,
        },
        additionalBenefits: normalizeStringList(form.salary.additionalBenefits),
    },
    processSteps: form.processSteps
        .map((step, index) => ({
            title: step.title.trim(),
            points: step.points.split(/\r?\n/).map((point) => point.trim()).filter(Boolean),
            order: parseOrder(step.order, index + 1),
        }))
        .filter((step) => step.title && step.points.length > 0),
    timelines: form.timelines
        .map((timeline, index) => ({
            title: timeline.title.trim(),
            intro: timeline.intro.trim() || undefined,
            phases: parsePhaseLines(timeline.phases),
            totalDurationLabel: timeline.totalDurationLabel.trim(),
            note: timeline.note.trim() || undefined,
            order: parseOrder(timeline.order, index + 1),
        }))
        .filter((timeline) => timeline.title && timeline.phases.length > 0 && timeline.totalDurationLabel),
    documentsRequired: normalizeStringList(form.documentsRequired),
    ctaDescription: form.ctaDescription.trim(),
    tags: normalizeStringList(form.tags),
    isActive: form.isActive,
    sortOrder: parseOrder(form.sortOrder, 0),
});

const buildCareerProgramFormData = (payload: CareerProgramPayload, form: CareerProgramFormState) => {
    const submissionData = new FormData();
    submissionData.append('payload', JSON.stringify(payload));

    if (form.heroImageFile) {
        submissionData.append('heroImage', form.heroImageFile);
    }

    if (form.cardImageFile) {
        submissionData.append('cardImage', form.cardImageFile);
    }

    return submissionData;
};

const CareerProgramManager: React.FC = () => {
    const [programs, setPrograms] = useState<CareerProgram[]>([]);
    const [form, setForm] = useState<CareerProgramFormState>(defaultForm);
    const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await careerProgramsAPI.getAllAdmin();
            setPrograms(response.programs || []);
        } catch (err: any) {
            console.error('Failed to fetch career programs:', err);
            setError(err.response?.data?.message || 'Failed to load career programs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    const validateForm = () => {
        const payload = toPayload(form);

        if (!payload.title || !payload.shortDescription || !payload.overview || !payload.country || !payload.ctaDescription) {
            return 'Please complete the required overview fields.';
        }

        if (payload.eligibleProfiles.length === 0 || payload.whyChoose.length === 0 || payload.documentsRequired.length === 0) {
            return 'Please add eligibility, why choose points, and required documents.';
        }

        if (
            Number.isNaN(payload.salary.adaptation.min)
            || Number.isNaN(payload.salary.adaptation.max)
            || Number.isNaN(payload.salary.fullRecognition.min)
            || Number.isNaN(payload.salary.fullRecognition.max)
        ) {
            return 'Please enter valid salary ranges.';
        }

        if (payload.salary.additionalBenefits.length === 0 || payload.processSteps.length === 0 || payload.timelines.length === 0) {
            return 'Please complete benefits, process steps, and timelines.';
        }

        return null;
    };

    const resetForm = () => {
        setForm(defaultForm());
        setEditingProgramId(null);
        setFormError(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            setSaving(true);
            const payload = toPayload(form);
            const submissionData = buildCareerProgramFormData(payload, form);
            const response = editingProgramId
                ? await careerProgramsAPI.update(editingProgramId, submissionData)
                : await careerProgramsAPI.create(submissionData);

            const savedProgram = response.program as CareerProgram;
            setPrograms((currentPrograms) => {
                const nextPrograms = editingProgramId
                    ? currentPrograms.map((program) => program._id === savedProgram._id ? savedProgram : program)
                    : [...currentPrograms, savedProgram];
                return nextPrograms.sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
            });
            resetForm();
            setIsFormVisible(false);
        } catch (err: any) {
            console.error('Failed to save career program:', err);
            setFormError(err.response?.data?.message || 'Failed to save career program.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (program: CareerProgram) => {
        if (!window.confirm(`Delete "${program.title}" from the career catalog?`)) {
            return;
        }

        try {
            setDeletingProgramId(program._id);
            await careerProgramsAPI.delete(program._id);
            setPrograms((currentPrograms) => currentPrograms.filter((currentProgram) => currentProgram._id !== program._id));
            if (editingProgramId === program._id) {
                resetForm();
            }
        } catch (err: any) {
            console.error('Failed to delete career program:', err);
            window.alert(err.response?.data?.message || 'Failed to delete career program.');
        } finally {
            setDeletingProgramId(null);
        }
    };

    const updateSalary = (key: 'adaptation' | 'fullRecognition', field: keyof SalaryRangeFormState, value: string | boolean) => {
        setForm((currentForm) => ({
            ...currentForm,
            salary: {
                ...currentForm.salary,
                [key]: {
                    ...currentForm.salary[key],
                    [field]: value,
                },
            },
        }));
        setFormError(null);
    };

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="flex items-center gap-3 text-2xl font-bold text-brand-black">
                        <BriefcaseBusiness className="h-6 w-6 text-brand-gold" />
                        Manage Career Programs
                    </h2>
                    <p className="mt-1 text-sm text-brand-olive-dark">
                        Publish career pathways and control what appears on the public careers pages.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={fetchPrograms} className={secondaryButtonClassName}>
                        <RefreshCcw className="h-4 w-4" />
                        Refresh List
                    </button>
                    {!isFormVisible && (
                        <button type="button" onClick={() => { resetForm(); setIsFormVisible(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-olive-dark">
                            <CirclePlus className="h-4 w-4" />
                            Create Program
                        </button>
                    )}
                </div>
            </div>

            {isFormVisible ? (
                <div className={cardClassName}>
                    <div className="mb-6 flex items-center justify-between border-b border-brand-surface pb-6">
                        <h3 className="text-xl font-bold text-brand-black">{editingProgramId ? 'Edit Career Program' : 'Create New Career Program'}</h3>
                        <button type="button" onClick={() => { resetForm(); setIsFormVisible(false); }} className={secondaryButtonClassName}>
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <input value={form.title} onChange={(event) => setForm((currentForm) => ({ ...currentForm, title: event.target.value }))} className={inputClassName} placeholder="Program title" />
                            <input value={form.slug} onChange={(event) => setForm((currentForm) => ({ ...currentForm, slug: event.target.value }))} className={inputClassName} placeholder="program-slug" />
                            <input value={form.country} onChange={(event) => setForm((currentForm) => ({ ...currentForm, country: event.target.value }))} className={inputClassName} placeholder="Country" />
                            <input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm((currentForm) => ({ ...currentForm, sortOrder: event.target.value }))} className={inputClassName} placeholder="Sort order" />
                            <textarea rows={3} value={form.shortDescription} onChange={(event) => setForm((currentForm) => ({ ...currentForm, shortDescription: event.target.value }))} className={`${inputClassName} md:col-span-2 resize-y`} placeholder="Short description" />
                            <textarea rows={5} value={form.overview} onChange={(event) => setForm((currentForm) => ({ ...currentForm, overview: event.target.value }))} className={`${inputClassName} md:col-span-2 resize-y`} placeholder="Overview" />
                            <textarea rows={3} value={form.ctaDescription} onChange={(event) => setForm((currentForm) => ({ ...currentForm, ctaDescription: event.target.value }))} className={`${inputClassName} md:col-span-2 resize-y`} placeholder="Disabled apply helper text" />
                            <div className="md:col-span-2 rounded-2xl border border-brand-surface bg-brand-off-white/70 p-5">
                                <div className="mb-5">
                                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-gold-hover">Program Images</p>
                                    <p className="mt-1 text-sm text-brand-olive-dark">
                                        Upload the images used on the career listing cards and the detail page hero banner.
                                    </p>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <ImageUpload
                                        label="Hero Image"
                                        inputId="career-hero-image"
                                        helperText="Upload the large detail page background image"
                                        value={form.heroImageFile || (form.heroImage ? getAssetUrl(form.heroImage) : undefined)}
                                        onChange={(file) => setForm((currentForm) => ({
                                            ...currentForm,
                                            heroImageFile: file,
                                            heroImage: file ? currentForm.heroImage : '',
                                        }))}
                                    />
                                    <ImageUpload
                                        label="Card Image"
                                        inputId="career-card-image"
                                        helperText="Upload the listing card banner image"
                                        value={form.cardImageFile || (form.cardImage ? getAssetUrl(form.cardImage) : undefined)}
                                        onChange={(file) => setForm((currentForm) => ({
                                            ...currentForm,
                                            cardImageFile: file,
                                            cardImage: file ? currentForm.cardImage : '',
                                        }))}
                                    />
                                </div>
                            </div>
                            <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-brand-surface bg-brand-off-white px-4 py-3 text-sm font-medium text-brand-olive-dark">
                                <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((currentForm) => ({ ...currentForm, isActive: event.target.checked }))} className="h-4 w-4 rounded border-brand-surface text-brand-gold focus:ring-brand-gold" />
                                Show this program on the public careers page
                            </label>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <StringListEditor label="Eligible Profiles" items={form.eligibleProfiles} onChange={(eligibleProfiles) => setForm((currentForm) => ({ ...currentForm, eligibleProfiles }))} placeholder="B.Sc Nurses" />
                            <StringListEditor label="Why Choose This Program" items={form.whyChoose} onChange={(whyChoose) => setForm((currentForm) => ({ ...currentForm, whyChoose }))} placeholder="Direct pathway to work as a Registered Nurse in Germany." />
                            <StringListEditor label="Documents Required" items={form.documentsRequired} onChange={(documentsRequired) => setForm((currentForm) => ({ ...currentForm, documentsRequired }))} placeholder="Valid Passport" />
                            <StringListEditor label="Tags" items={form.tags} onChange={(tags) => setForm((currentForm) => ({ ...currentForm, tags }))} placeholder="Germany" />
                            <StringListEditor label="Additional Benefits" items={form.salary.additionalBenefits} onChange={(additionalBenefits) => setForm((currentForm) => ({ ...currentForm, salary: { ...currentForm.salary, additionalBenefits } }))} placeholder="Health insurance coverage" />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            {(['adaptation', 'fullRecognition'] as const).map((salaryKey) => (
                                <div key={salaryKey} className="rounded-2xl border border-brand-surface bg-brand-off-white/60 p-4 space-y-3">
                                    <p className="text-sm font-semibold text-brand-black">{salaryKey === 'adaptation' ? 'Adaptation Salary' : 'Full Recognition Salary'}</p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <input type="number" min="0" value={form.salary[salaryKey].min} onChange={(event) => updateSalary(salaryKey, 'min', event.target.value)} className={inputClassName} placeholder="Minimum" />
                                        <input type="number" min="0" value={form.salary[salaryKey].max} onChange={(event) => updateSalary(salaryKey, 'max', event.target.value)} className={inputClassName} placeholder="Maximum" />
                                        <input value={form.salary[salaryKey].currency} onChange={(event) => updateSalary(salaryKey, 'currency', event.target.value)} className={inputClassName} placeholder="Currency" />
                                        <input value={form.salary[salaryKey].periodLabel} onChange={(event) => updateSalary(salaryKey, 'periodLabel', event.target.value)} className={inputClassName} placeholder="Period label" />
                                    </div>
                                    <label className="flex items-center gap-3 text-sm text-brand-olive-dark">
                                        <input type="checkbox" checked={form.salary[salaryKey].hasPlus} onChange={(event) => updateSalary(salaryKey, 'hasPlus', event.target.checked)} className="h-4 w-4 rounded border-brand-surface text-brand-gold focus:ring-brand-gold" />
                                        Show plus sign after max salary
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-gold-hover">Process Steps</h4>
                                    <button type="button" onClick={() => setForm((currentForm) => ({ ...currentForm, processSteps: [...currentForm.processSteps, createProcessStep(currentForm.processSteps.length + 1)] }))} className={secondaryButtonClassName}>
                                        <CirclePlus className="h-4 w-4" />
                                        Add Step
                                    </button>
                                </div>
                                {form.processSteps.map((step, index) => (
                                    <div key={`step-${index}`} className="rounded-2xl border border-brand-surface bg-brand-off-white/60 p-4 space-y-3">
                                        <div className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
                                            <input value={step.title} onChange={(event) => setForm((currentForm) => ({ ...currentForm, processSteps: currentForm.processSteps.map((currentStep, currentIndex) => currentIndex === index ? { ...currentStep, title: event.target.value } : currentStep) }))} className={inputClassName} placeholder="Step title" />
                                            <input type="number" min="1" value={step.order} onChange={(event) => setForm((currentForm) => ({ ...currentForm, processSteps: currentForm.processSteps.map((currentStep, currentIndex) => currentIndex === index ? { ...currentStep, order: event.target.value } : currentStep) }))} className={inputClassName} placeholder="Order" />
                                            <button type="button" onClick={() => setForm((currentForm) => ({ ...currentForm, processSteps: currentForm.processSteps.filter((_, currentIndex) => currentIndex !== index) }))} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-red/20 bg-brand-red/5 text-brand-red transition-colors hover:bg-brand-red/10"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                        <textarea rows={4} value={step.points} onChange={(event) => setForm((currentForm) => ({ ...currentForm, processSteps: currentForm.processSteps.map((currentStep, currentIndex) => currentIndex === index ? { ...currentStep, points: event.target.value } : currentStep) }))} className={`${inputClassName} resize-y`} placeholder={'One point per line\nProfile evaluation for B.Sc and GNM nurses.'} />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-gold-hover">Timelines</h4>
                                    <button type="button" onClick={() => setForm((currentForm) => ({ ...currentForm, timelines: [...currentForm.timelines, createTimeline(currentForm.timelines.length + 1)] }))} className={secondaryButtonClassName}>
                                        <CirclePlus className="h-4 w-4" />
                                        Add Timeline
                                    </button>
                                </div>
                                {form.timelines.map((timeline, index) => (
                                    <div key={`timeline-${index}`} className="rounded-2xl border border-brand-surface bg-brand-off-white/60 p-4 space-y-3">
                                        <div className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
                                            <input value={timeline.title} onChange={(event) => setForm((currentForm) => ({ ...currentForm, timelines: currentForm.timelines.map((currentTimeline, currentIndex) => currentIndex === index ? { ...currentTimeline, title: event.target.value } : currentTimeline) }))} className={inputClassName} placeholder="Timeline title" />
                                            <input type="number" min="1" value={timeline.order} onChange={(event) => setForm((currentForm) => ({ ...currentForm, timelines: currentForm.timelines.map((currentTimeline, currentIndex) => currentIndex === index ? { ...currentTimeline, order: event.target.value } : currentTimeline) }))} className={inputClassName} placeholder="Order" />
                                            <button type="button" onClick={() => setForm((currentForm) => ({ ...currentForm, timelines: currentForm.timelines.filter((_, currentIndex) => currentIndex !== index) }))} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-red/20 bg-brand-red/5 text-brand-red transition-colors hover:bg-brand-red/10"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                        <textarea rows={2} value={timeline.intro} onChange={(event) => setForm((currentForm) => ({ ...currentForm, timelines: currentForm.timelines.map((currentTimeline, currentIndex) => currentIndex === index ? { ...currentTimeline, intro: event.target.value } : currentTimeline) }))} className={`${inputClassName} resize-y`} placeholder="Intro" />
                                        <textarea rows={4} value={timeline.phases} onChange={(event) => setForm((currentForm) => ({ ...currentForm, timelines: currentForm.timelines.map((currentTimeline, currentIndex) => currentIndex === index ? { ...currentTimeline, phases: event.target.value } : currentTimeline) }))} className={`${inputClassName} resize-y`} placeholder={'One phase per line\nLanguage Training (A1 - B2) | 6 - 8 months'} />
                                        <input value={timeline.totalDurationLabel} onChange={(event) => setForm((currentForm) => ({ ...currentForm, timelines: currentForm.timelines.map((currentTimeline, currentIndex) => currentIndex === index ? { ...currentTimeline, totalDurationLabel: event.target.value } : currentTimeline) }))} className={inputClassName} placeholder="Total duration" />
                                        <textarea rows={2} value={timeline.note} onChange={(event) => setForm((currentForm) => ({ ...currentForm, timelines: currentForm.timelines.map((currentTimeline, currentIndex) => currentIndex === index ? { ...currentTimeline, note: event.target.value } : currentTimeline) }))} className={`${inputClassName} resize-y`} placeholder="Note" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {formError && <div className="rounded-xl border border-brand-red/20 bg-brand-red/5 px-4 py-3 text-sm text-brand-red">{formError}</div>}

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button type="submit" disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-olive-dark disabled:opacity-60">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingProgramId ? <Save className="h-4 w-4" /> : <CirclePlus className="h-4 w-4" />}
                                {editingProgramId ? 'Update Career Program' : 'Create Career Program'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {loading ? (
                            <div className="flex justify-center py-16 md:col-span-2 xl:col-span-3"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>
                        ) : error ? (
                            <div className="rounded-xl border border-brand-red/20 bg-brand-red/5 px-4 py-3 text-sm text-brand-red md:col-span-2 xl:col-span-3">{error}</div>
                        ) : programs.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-brand-surface px-4 py-10 text-center text-sm text-brand-olive md:col-span-2 xl:col-span-3">No career programs yet.</div>
                        ) : (
                            programs.map((program) => (
                                <article key={program._id} className="rounded-2xl border border-brand-surface bg-brand-off-white p-5">
                                    {(program.cardImage || program.heroImage) && (
                                        <img
                                            src={getAssetUrl(program.cardImage || program.heroImage || '')}
                                            alt={program.title}
                                            className="mb-4 h-40 w-full rounded-2xl object-cover"
                                        />
                                    )}
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-brand-black">{program.title}</h4>
                                            <p className="mt-2 text-sm leading-6 text-brand-olive-dark">{program.shortDescription}</p>
                                        </div>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${program.isActive ? 'bg-brand-olive/10 text-brand-olive-dark' : 'bg-brand-surface text-brand-olive-dark'}`}>{program.isActive ? 'Live' : 'Hidden'}</span>
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-brand-black">{formatCareerSalaryRange(program.salary.fullRecognition)}</p>
                                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-brand-olive">
                                        <span className="rounded-full border border-brand-surface px-3 py-1">{program.country}</span>
                                        {program.tags.map((tag) => <span key={tag} className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-3 py-1 text-[#8b6f2c]">{tag}</span>)}
                                    </div>
                                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                        <button type="button" onClick={() => { setEditingProgramId(program._id); setForm(fromProgram(program)); setFormError(null); setIsFormVisible(true); }} className={secondaryButtonClassName}><Pencil className="h-4 w-4" />Edit</button>
                                        <button type="button" onClick={() => handleDelete(program)} disabled={deletingProgramId === program._id} className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-red/20 bg-brand-red/5 px-4 py-2.5 text-sm font-semibold text-brand-red transition-colors hover:bg-brand-red/10 disabled:opacity-60">{deletingProgramId === program._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Delete</button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default CareerProgramManager;
