import React, { useState, useEffect } from 'react';
import { Link, Copy, Trash2, Upload, File as FileIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

interface FileLink {
    _id: string;
    title: string;
    fileUrl: string;
    originalName: string;
    createdAt: string;
}

const AdminFileLinks: React.FC = () => {
    const [files, setFiles] = useState<FileLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    // Form state
    const [title, setTitle] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchFiles();
    }, [currentPage]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/files?page=${currentPage}&limit=${limit}`);
            setFiles(response.data.files);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching files:', error);
            showToast('Failed to load files', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFiles.length === 0) {
            showToast('Please select at least one file', 'error');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        if (title.trim()) {
            formData.append('title', title.trim());
        }
        selectedFiles.forEach((file) => {
            formData.append('files', file);
        });

        try {
            const response = await api.post('/admin/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const uploadedCount = response.data.uploadedCount || selectedFiles.length;
            showToast(
                uploadedCount === 1 ? 'File uploaded successfully' : `${uploadedCount} files uploaded successfully`,
                'success'
            );
            setTitle('');
            setSelectedFiles([]);
            // Reset file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            
            // Refresh list
            if (currentPage === 1) {
                fetchFiles();
            } else {
                setCurrentPage(1); // Go back to first page to see new file
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            showToast('Upload failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this file? The link will no longer work.')) return;

        try {
            await api.delete(`/admin/files/${id}`);
            showToast('File deleted successfully', 'success');
            fetchFiles();
        } catch (error) {
            console.error('Error deleting file:', error);
            showToast('Failed to delete file', 'error');
        }
    };

    const copyToClipboard = (fileUrl: string) => {
        const fullUrl = `${API_BASE_URL.replace('/api', '')}${fileUrl}`;
        navigator.clipboard.writeText(fullUrl).then(() => {
            showToast('Link copied to clipboard', 'success');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            showToast('Failed to copy link', 'error');
        });
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
                
                {toast && (
                    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg text-white ${toast.type === 'success' ? 'bg-brand-olive/50' : 'bg-brand-red/50'}`}>
                        {toast.message}
                    </div>
                )}

                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-brand-surface shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-gold to-brand-gold bg-clip-text text-transparent">File Links Management</h1>
                        <p className="text-brand-olive-dark mt-1">Upload files and generate shareable links</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Form */}
                    <div className="lg:col-span-1 border border-brand-surface bg-white rounded-2xl p-6 shadow-sm self-start">
                        <h2 className="text-xl font-semibold text-brand-black mb-6 flex items-center">
                            <Upload className="w-5 h-5 mr-2 text-brand-gold" />
                            Upload Files
                        </h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-olive-dark mb-1">
                                    File Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-brand-surface rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                                    placeholder="Optional title or title prefix"
                                />
                                <p className="mt-2 text-xs text-brand-olive">
                                    Leave blank to use each file name automatically. If you upload multiple files, this title will be used as a prefix.
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-brand-olive-dark mb-1">
                                    Files
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    onChange={(e) => setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])}
                                    className="w-full px-4 py-2 border border-brand-surface rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold/5 file:text-brand-gold hover:file:bg-brand-gold/10"
                                    required
                                />
                                <p className="mt-2 text-xs text-brand-olive">
                                    You can select and upload multiple files in one go.
                                </p>
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className="rounded-xl border border-brand-gold/20 bg-brand-gold/5/70 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-brand-gold">
                                            {selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'} selected
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFiles([]);
                                                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                                                if (fileInput) fileInput.value = '';
                                            }}
                                            className="text-xs font-medium text-brand-gold hover:text-brand-black"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        {selectedFiles.slice(0, 5).map((file) => (
                                            <div
                                                key={`${file.name}-${file.size}-${file.lastModified}`}
                                                className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-brand-black">{file.name}</p>
                                                    <p className="text-xs text-brand-olive">
                                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedFiles.length > 5 && (
                                            <p className="text-xs text-brand-olive">
                                                +{selectedFiles.length - 5} more file{selectedFiles.length - 5 === 1 ? '' : 's'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-brand-gold/50 hover:bg-brand-gold text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                            >
                                {uploading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </span>
                                ) : (
                                    selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Files` : 'Upload File'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Files List */}
                    <div className="lg:col-span-2 border border-brand-surface bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-brand-surface">
                            <h2 className="text-xl font-semibold text-brand-black flex items-center">
                                <Link className="w-5 h-5 mr-2 text-brand-gold" />
                                Managed File Links
                            </h2>
                        </div>
                        
                        <div className="flex-grow overflow-auto p-0">
                            {loading ? (
                                <div className="flex justify-center items-center h-48 text-brand-olive">Loading files...</div>
                            ) : files.length === 0 ? (
                                <div className="flex justify-center items-center h-48 text-brand-olive flex-col">
                                    <FileIcon className="h-12 w-12 text-brand-olive-light mb-2" />
                                    <p>No files uploaded yet.</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-brand-surface">
                                    <thead className="bg-brand-off-white">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-olive uppercase tracking-wider">File Details</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-olive uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-brand-surface">
                                        {files.map((file) => (
                                            <tr key={file._id} className="hover:bg-brand-off-white transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <FileIcon className="h-6 w-6 text-brand-olive-light mr-3 flex-shrink-0" />
                                                        <div>
                                                            <div className="text-sm font-medium text-brand-black">{file.title}</div>
                                                            <div className="text-sm text-brand-olive truncate max-w-[200px] sm:max-w-xs">{file.originalName}</div>
                                                            <div className="text-xs text-brand-olive-light mt-1">{new Date(file.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-3">
                                                        <button 
                                                            onClick={() => copyToClipboard(file.fileUrl)}
                                                            className="text-brand-olive hover:text-brand-gold transition-colors flex items-center bg-brand-surface px-3 py-1.5 rounded-md"
                                                        >
                                                            <Copy className="h-4 w-4 mr-1.5" />
                                                            Copy Link
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(file._id)}
                                                            className="text-brand-red hover:text-brand-red transition-colors p-1.5 rounded-md hover:bg-brand-red/5"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination */}
                        {!loading && files.length > 0 && (
                            <div className="p-4 border-t border-brand-surface flex items-center justify-between bg-brand-off-white">
                                <span className="text-sm text-brand-olive">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-md ${currentPage === 1 ? 'text-brand-olive-light cursor-not-allowed' : 'text-brand-olive-dark hover:bg-brand-surface'}`}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-md ${currentPage === totalPages ? 'text-brand-olive-light cursor-not-allowed' : 'text-brand-olive-dark hover:bg-brand-surface'}`}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminFileLinks;
