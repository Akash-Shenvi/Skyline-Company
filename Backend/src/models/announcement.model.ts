import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
    batchId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    title: string;
    content: string;
    isPinned: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AnnouncementSchema: Schema = new Schema(
    {
        batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        isPinned: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
