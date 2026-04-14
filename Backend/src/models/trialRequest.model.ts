import mongoose, { Document, Schema } from 'mongoose';

export interface ITrialRequest extends Document {
    fullName: string;
    email: string;
    phone: string;
    countryCode: string;
    interest: 'Language';
    language: string;
    course: string;
    prepLevel?: string;
    skillCourses?: string[];
    comments?: string;
    createdAt: Date;
}

const TrialRequestSchema: Schema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    countryCode: { type: String, required: true, default: '+91' },
    interest: { type: String, enum: ['Language'], required: true, default: 'Language' },
    language: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    prepLevel: { type: String },
    skillCourses: { type: [String], default: [] },
    comments: { type: String },
}, { timestamps: true });

export default mongoose.model<ITrialRequest>('TrialRequest', TrialRequestSchema);
