import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerSalaryRange {
    min: number;
    max: number;
    currency: string;
    periodLabel: string;
    hasPlus?: boolean;
}

export interface ICareerProcessStep {
    title: string;
    points: string[];
    order: number;
}

export interface ICareerTimelinePhase {
    label: string;
    durationLabel: string;
}

export interface ICareerTimeline {
    title: string;
    intro?: string;
    phases: ICareerTimelinePhase[];
    totalDurationLabel: string;
    note?: string;
    order: number;
}

export interface ICareerProgram extends Document {
    title: string;
    slug: string;
    shortDescription: string;
    overview: string;
    country: string;
    eligibleProfiles: string[];
    whyChoose: string[];
    salary: {
        adaptation: ICareerSalaryRange;
        fullRecognition: ICareerSalaryRange;
        additionalBenefits: string[];
    };
    processSteps: ICareerProcessStep[];
    timelines: ICareerTimeline[];
    documentsRequired: string[];
    ctaDescription: string;
    tags: string[];
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

const CareerSalaryRangeSchema = new Schema<ICareerSalaryRange>({
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true, uppercase: true },
    periodLabel: { type: String, required: true, trim: true },
    hasPlus: { type: Boolean, default: false },
}, {
    _id: false,
});

const CareerTimelinePhaseSchema = new Schema<ICareerTimelinePhase>({
    label: { type: String, required: true, trim: true },
    durationLabel: { type: String, required: true, trim: true },
}, {
    _id: false,
});

const CareerTimelineSchema = new Schema<ICareerTimeline>({
    title: { type: String, required: true, trim: true },
    intro: { type: String, trim: true },
    phases: { type: [CareerTimelinePhaseSchema], default: [] },
    totalDurationLabel: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    order: { type: Number, default: 0 },
}, {
    _id: false,
});

const CareerProcessStepSchema = new Schema<ICareerProcessStep>({
    title: { type: String, required: true, trim: true },
    points: { type: [String], default: [] },
    order: { type: Number, default: 0 },
}, {
    _id: false,
});

const CareerProgramSchema = new Schema<ICareerProgram>({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    shortDescription: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    eligibleProfiles: { type: [String], default: [] },
    whyChoose: { type: [String], default: [] },
    salary: {
        adaptation: { type: CareerSalaryRangeSchema, required: true },
        fullRecognition: { type: CareerSalaryRangeSchema, required: true },
        additionalBenefits: { type: [String], default: [] },
    },
    processSteps: { type: [CareerProcessStepSchema], default: [] },
    timelines: { type: [CareerTimelineSchema], default: [] },
    documentsRequired: { type: [String], default: [] },
    ctaDescription: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
}, {
    timestamps: true,
});

CareerProgramSchema.index({ isActive: 1, sortOrder: 1, createdAt: 1 });

export default mongoose.model<ICareerProgram>('CareerProgram', CareerProgramSchema);
