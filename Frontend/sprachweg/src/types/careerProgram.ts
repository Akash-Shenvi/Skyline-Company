export interface CareerSalaryRange {
    min: number;
    max: number;
    currency: string;
    periodLabel: string;
    hasPlus?: boolean;
}

export interface CareerSalary {
    adaptation: CareerSalaryRange;
    fullRecognition: CareerSalaryRange;
    additionalBenefits: string[];
}

export interface CareerProcessStep {
    title: string;
    points: string[];
    order: number;
}

export interface CareerTimelinePhase {
    label: string;
    durationLabel: string;
}

export interface CareerTimeline {
    title: string;
    intro?: string;
    phases: CareerTimelinePhase[];
    totalDurationLabel: string;
    note?: string;
    order: number;
}

export interface CareerProgram {
    _id: string;
    title: string;
    slug: string;
    shortDescription: string;
    overview: string;
    country: string;
    eligibleProfiles: string[];
    whyChoose: string[];
    salary: CareerSalary;
    processSteps: CareerProcessStep[];
    timelines: CareerTimeline[];
    documentsRequired: string[];
    ctaDescription: string;
    tags: string[];
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CareerProgramPayload {
    title: string;
    slug: string;
    shortDescription: string;
    overview: string;
    country: string;
    eligibleProfiles: string[];
    whyChoose: string[];
    salary: CareerSalary;
    processSteps: CareerProcessStep[];
    timelines: CareerTimeline[];
    documentsRequired: string[];
    ctaDescription: string;
    tags: string[];
    isActive: boolean;
    sortOrder: number;
}

export const formatCareerSalaryRange = (range?: CareerSalaryRange) => {
    if (!range) {
        return 'Salary on request';
    }

    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: range.currency || 'EUR',
        maximumFractionDigits: 0,
    });

    const maxLabel = `${formatter.format(range.max)}${range.hasPlus ? '+' : ''}`;
    return `${formatter.format(range.min)} - ${maxLabel} ${range.periodLabel}`;
};

export const getOrderedCareerSteps = (steps?: CareerProcessStep[]) =>
    [...(steps || [])].sort((left, right) => left.order - right.order);

export const getOrderedCareerTimelines = (timelines?: CareerTimeline[]) =>
    [...(timelines || [])].sort((left, right) => left.order - right.order);

export const getPrimaryCareerTimeline = (program: CareerProgram) =>
    getOrderedCareerTimelines(program.timelines)[0] || null;
