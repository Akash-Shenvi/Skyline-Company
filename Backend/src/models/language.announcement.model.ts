import mongoose, { Schema, Document } from 'mongoose';

export interface ILanguageAnnouncement extends Document {
    batchId: mongoose.Types.ObjectId;
    title: string;
    content: string;
    senderId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const LanguageAnnouncementSchema: Schema = new Schema(
    {
        batchId: { type: Schema.Types.ObjectId, ref: 'LanguageBatch', required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ILanguageAnnouncement>('LanguageAnnouncement', LanguageAnnouncementSchema);
