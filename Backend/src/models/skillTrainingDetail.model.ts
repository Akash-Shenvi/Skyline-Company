import mongoose, { Document, Schema } from 'mongoose';

export interface ISkillTrainingDetail extends Document {
    skillCourseId: mongoose.Types.ObjectId;
    deliveryMode: string;
    classTimings: string;
    fees: string;
    origin: string;
    createdAt: Date;
    updatedAt: Date;
}

const SkillTrainingDetailSchema = new Schema<ISkillTrainingDetail>({
    skillCourseId: { type: Schema.Types.ObjectId, ref: 'SkillCourse', required: true, unique: true },
    deliveryMode: { type: String, default: 'On-site / Online / Hybrid' },
    classTimings: { type: String, default: 'Customized Schedule' },
    fees: { type: String, default: 'Rs 28,000' },
    origin: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<ISkillTrainingDetail>('SkillTrainingDetail', SkillTrainingDetailSchema);
