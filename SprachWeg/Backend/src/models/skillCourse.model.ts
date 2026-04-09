import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillCourse extends Document {
    title: string;
    subtitle: string;
    level: string;
    description: string;
    features: string[];
    image: string; // URL path to the image
    category: string;
    price: string;
    originalPrice: string;
    rating: string;
    students: string;
    duration: string;
    startDate: string;
    mode: string;
    popular: boolean;
    levels: {
        name: string;
        duration: string;
        price: string;
        features: string[];
        outcome: string;
        examPrep?: {
            title: string;
            details: string;
            price: string;
        };
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const SkillCourseSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        subtitle: { type: String, required: false },
        level: { type: String, required: false },
        description: { type: String, required: true },
        features: { type: [String], default: [] },
        image: { type: String, required: false },
        category: { type: String, required: true, default: 'General' },
        price: { type: String, required: false },
        originalPrice: { type: String, required: false },
        rating: { type: String, default: '0.0' },
        students: { type: String, default: '0' },
        duration: { type: String, required: false },
        startDate: { type: String, required: false },
        mode: { type: String, required: false, default: 'Live' },
        popular: { type: Boolean, default: false },
        levels: [{
            name: { type: String },
            duration: { type: String },
            price: { type: String },
            features: [String],
            outcome: { type: String },
            examPrep: {
                title: String,
                details: String,
                price: String
            }
        }],
    },
    { timestamps: true }
);

export default mongoose.model<ISkillCourse>('SkillCourse', SkillCourseSchema);
