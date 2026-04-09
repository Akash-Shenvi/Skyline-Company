import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
    assignmentId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    submissionDate: Date;
    content?: string;
    attachments?: string[]; // URLs
    grade?: number;
    feedback?: string;
    status: 'submitted' | 'graded';
    createdAt: Date;
    updatedAt: Date;
}

const SubmissionSchema: Schema = new Schema(
    {
        assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        submissionDate: { type: Date, default: Date.now },
        content: { type: String },
        attachments: [{ type: String }],
        grade: { type: Number },
        feedback: { type: String },
        status: {
            type: String,
            enum: ['submitted', 'graded'],
            default: 'submitted',
        },
    },
    { timestamps: true }
);

// Ensure one submission per assignment per student
SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);
