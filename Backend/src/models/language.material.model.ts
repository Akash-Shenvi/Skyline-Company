import mongoose, { Schema, Document } from 'mongoose';

export interface ILanguageMaterial extends Document {
    batchId: mongoose.Types.ObjectId;
    subtitle: string;
    fileUrl?: string; // Optional now
    uploadedBy: mongoose.Types.ObjectId;
    createdAt: Date;
}

const LanguageMaterialSchema: Schema = new Schema(
    {
        batchId: { type: Schema.Types.ObjectId, ref: 'LanguageBatch', required: true },
        title: { type: String, required: true },
        subtitle: { type: String }, // New field
        description: { type: String },
        fileUrl: { type: String }, // Optional
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ILanguageMaterial>('LanguageMaterial', LanguageMaterialSchema);
