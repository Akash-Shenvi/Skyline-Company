import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
    studentId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    batchId?: mongoose.Types.ObjectId;
    enrollmentDate: Date;
    status: 'pending' | 'active' | 'completed' | 'dropped';
    progress: number; // 0-100
    completedLessons: string[]; // IDs of completed lessons/modules
    createdAt: Date;
    updatedAt: Date;
}

const EnrollmentSchema: Schema = new Schema(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'SkillCourse', required: true },
        batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
        enrollmentDate: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ['pending', 'active', 'completed', 'dropped'],
            default: 'pending',
        },
        progress: { type: Number, default: 0 },
        completedLessons: [{ type: String }],
    },
    { timestamps: true }
);

// Prevent duplicate enrollments for same course
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
