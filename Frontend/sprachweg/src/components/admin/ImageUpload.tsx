import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface ImageUploadProps {
    value?: File | string;
    onChange: (file: File | null) => void;
    preview?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, preview }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        typeof value === 'string' ? value : preview || null
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        onChange(null);
        setPreviewUrl(null);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-brand-olive-dark mb-2">
                Course Image
            </label>

            {previewUrl ? (
                <div className="relative group">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-brand-surface"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-brand-red/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload"
                    />
                    <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-brand-surface rounded-lg cursor-pointer hover:border-brand-gold transition-colors bg-brand-off-white"
                    >
                        <Upload className="w-10 h-10 text-brand-olive-light mb-2" />
                        <span className="text-sm text-brand-olive-dark">
                            Click to upload image
                        </span>
                        <span className="text-xs text-brand-olive mt-1">
                            PNG, JPG up to 5MB
                        </span>
                    </label>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
