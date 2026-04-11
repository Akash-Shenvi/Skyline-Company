import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
    batchId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    dueDate: Date;
    attachments?: string[]; // URLs
    maxScore: number;
    createdAt: Date;
    updatedAt: Date;
}

const AssignmentSchema: Schema = new Schema(
    {
        batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: Date, required: true },
        attachments: [{ type: String }],
        maxScore: { type: Number, default: 100 },
    },
    { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
