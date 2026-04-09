import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
    classSessionId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    status: 'present' | 'absent' | 'late';
    durationMinutes?: number; // How long they stayed
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
    {
        classSessionId: { type: Schema.Types.ObjectId, ref: 'ClassSession', required: true },
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: ['present', 'absent', 'late'],
            required: true,
        },
        durationMinutes: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// One record per student per class
AttendanceSchema.index({ classSessionId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
