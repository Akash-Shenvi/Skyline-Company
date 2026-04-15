import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ImageUpload from '../../components/admin/ImageUpload';
import Button from '../../components/ui/Button';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { languageAPI, getAssetUrl } from '../../lib/api';
import { formatTrainingPrice, getCourseStartingPrice } from '../../lib/trainingPricing';
// Define type locally or import if you put in types file
interface LanguageCourse {
    _id?: string;
    title: string;
    subtitle: string;
    description: string;
    image?: string;
    popular: boolean;
    startingPrice?: number;
    levels: {
        name: string;
        duration: string;
        price: string;
        features: string[];
        outcome: string;
        examPrep?: {
            title: string;
            details: string;
            price: string;
        };
    }[];
    createdAt?: string;
}

const LanguageDashboard: React.FC = () => {
    const [courses, setCourses] = useState<LanguageCourse[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        popular: false,
        startingPrice: '',
        image: null as File | null,
        levels: [] as {
            name: string;
            duration: string;
            price: string;
            features: string[];
            outcome: string;
            examPrep?: {
                title: string;
                details: string;
                price: string;
            };
        }[],
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await languageAPI.getAll();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching language courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('subtitle', formData.subtitle);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('popular', String(formData.popular));
            formDataToSend.append('startingPrice', formData.startingPrice);
            formDataToSend.append('levels', JSON.stringify(formData.levels));

            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            if (editingId) {
                await languageAPI.update(editingId, formDataToSend);
            } else {
                await languageAPI.create(formDataToSend);
            }

            await fetchCourses();
            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error('Error saving language course:', error);
            alert('Failed to save language course');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (course: LanguageCourse) => {
        setFormData({
            title: course.title,
            subtitle: course.subtitle || '',
            description: course.description,
            popular: course.popular || false,
            startingPrice: typeof course.startingPrice === 'number' ? String(course.startingPrice) : '',
            image: null,
            levels: course.levels || [],
        });
        setEditingId(course._id || null);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this language course?')) return;

        try {
            setLoading(true);
            await languageAPI.delete(id);
            await fetchCourses();
        } catch (error) {
            console.error('Error deleting language course:', error);
            alert('Failed to delete language course');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            subtitle: '',
            description: '',
            popular: false,
            startingPrice: '',
            image: null,
            levels: [],
        });
        setEditingId(null);
    };

    // Level Management Methods
    const addLevel = () => {
        setFormData(prev => ({
            ...prev,
            levels: [...prev.levels, {
                name: '', duration: '', price: '', features: [], outcome: '',
                examPrep: { title: '', details: '', price: '' }
            }]
        }));
    };

    const removeLevel = (index: number) => {
        setFormData(prev => ({
            ...prev,
            levels: prev.levels.filter((_, i) => i !== index)
        }));
    };

    const updateLevel = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            levels: prev.levels.map((lvl, i) => i === index ? { ...lvl, [field]: value } : lvl)
        }));
    };

    const updateLevelFeature = (levelIndex: number, featureIndex: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            levels: prev.levels.map((lvl, i) => {
                if (i !== levelIndex) return lvl;
                const newFeatures = [...lvl.features];
                newFeatures[featureIndex] = value;
                return { ...lvl, features: newFeatures };
            })
        }));
    };

    const addLevelFeature = (levelIndex: number) => {
        setFormData(prev => ({
            ...prev,
            levels: prev.levels.map((lvl, i) => i === levelIndex ? { ...lvl, features: [...lvl.features, ''] } : lvl)
        }));
    };

    const removeLevelFeature = (levelIndex: number, featureIndex: number) => {
        setFormData(prev => ({
            ...prev,
            levels: prev.levels.map((lvl, i) => i === levelIndex ? { ...lvl, features: lvl.features.filter((_, fi) => fi !== featureIndex) } : lvl)
        }));
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-brand-black">
                            Language Courses
                        </h1>
                        <p className="text-brand-olive-dark mt-1">
                            Manage your language training courses (German, Japanese, etc.)
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="bg-brand-red hover:bg-brand-red-hover text-white flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Language
                    </Button>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-brand-surface flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-2xl font-serif font-bold text-brand-black">
                                    {editingId ? 'Edit Language' : 'Add New Language'}
                                </h2>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="p-2 hover:bg-brand-surface rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-brand-olive-dark mb-2">Language Title *</label>
                                            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-brand-surface bg-white text-brand-black focus:ring-2 focus:ring-brand-gold focus:border-transparent" placeholder="e.g. German Language Training" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-brand-olive-dark mb-2">Subtitle</label>
                                            <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-brand-surface bg-white text-brand-black focus:ring-2 focus:ring-brand-gold focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-brand-olive-dark mb-2">Description *</label>
                                            <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-2 rounded-lg border border-brand-surface bg-white text-brand-black focus:ring-2 focus:ring-brand-gold focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-brand-olive-dark mb-2">Starting Price (INR)</label>
                                            <input type="number" min="0" value={formData.startingPrice} onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-brand-surface bg-white text-brand-black focus:ring-2 focus:ring-brand-gold focus:border-transparent" placeholder="e.g. 15999" />
                                        </div>
                                        <div className="flex items-center gap-4 py-2">
                                            <label className="flex items-center gap-2 text-sm font-medium text-brand-olive-dark">
                                                <input type="checkbox" checked={formData.popular} onChange={(e) => setFormData({ ...formData, popular: e.target.checked })} className="rounded border-brand-surface text-brand-gold focus:ring-brand-gold" />
                                                Mark as Popular
                                            </label>
                                        </div>
                                        <ImageUpload value={formData.image || undefined} onChange={(file) => setFormData({ ...formData, image: file })} />
                                    </div>

                                    {/* Right Column: Level List Preview or Hint */}
                                    <div className="space-y-6">
                                        <div className="bg-brand-off-white p-4 rounded-xl">
                                            <p className="text-sm text-brand-olive mb-2">Levels Configured:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.levels.map((l, i) => (
                                                    <span key={i} className="px-2 py-1 bg-brand-gold/20 text-brand-gold rounded text-xs font-bold">{l.name}</span>
                                                ))}
                                                {formData.levels.length === 0 && <span className="text-xs text-brand-olive-light">No levels added yet</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Levels Editor */}
                                <div className="border-t border-brand-surface pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="block text-lg font-medium text-brand-black">Language Levels (e.g. A1, A2, N5)</label>
                                        <button type="button" onClick={addLevel} className="text-sm bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-lg hover:bg-brand-gold/20">+ Add Level</button>
                                    </div>
                                    <div className="space-y-6">
                                        {formData.levels.map((level, lIndex) => (
                                            <div key={lIndex} className="p-4 rounded-xl border border-brand-surface bg-brand-off-white">
                                                <div className="flex justify-between mb-4">
                                                    <h4 className="font-bold">Level Configuration {lIndex + 1}</h4>
                                                    <button type="button" onClick={() => removeLevel(lIndex)} className="text-brand-red hover:text-brand-red"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <input type="text" placeholder="Name (e.g. A1)" value={level.name} onChange={(e) => updateLevel(lIndex, 'name', e.target.value)} className="px-3 py-2 rounded-lg border border-brand-surface" />
                                                    <input type="text" placeholder="Duration (e.g. 45 Hours)" value={level.duration} onChange={(e) => updateLevel(lIndex, 'duration', e.target.value)} className="px-3 py-2 rounded-lg border border-brand-surface" />
                                                    <input type="text" placeholder="Price (e.g. ₹15,999)" value={level.price} onChange={(e) => updateLevel(lIndex, 'price', e.target.value)} className="px-3 py-2 rounded-lg border border-brand-surface" />
                                                    <input type="text" placeholder="Outcome" value={level.outcome} onChange={(e) => updateLevel(lIndex, 'outcome', e.target.value)} className="px-3 py-2 rounded-lg border border-brand-surface" />
                                                </div>

                                                {/* Level Features */}
                                                <div className="mb-4">
                                                    <label className="text-xs font-semibold text-brand-olive uppercase">Features</label>
                                                    <div className="space-y-2 mt-2">
                                                        {level.features.map((feat, fIndex) => (
                                                            <div key={fIndex} className="flex gap-2">
                                                                <input type="text" value={feat} onChange={(e) => updateLevelFeature(lIndex, fIndex, e.target.value)} className="flex-1 px-3 py-1 rounded bg-white border border-brand-surface text-sm" />
                                                                <button type="button" onClick={() => removeLevelFeature(lIndex, fIndex)} className="text-brand-red"><X className="w-4 h-4" /></button>
                                                            </div>
                                                        ))}
                                                        <button type="button" onClick={() => addLevelFeature(lIndex)} className="text-xs text-brand-gold font-semibold">+ Add Feature</button>
                                                    </div>
                                                </div>

                                                {/* Exam Prep Optional */}
                                                <div className="border-t border-brand-surface pt-4">
                                                    <label className="text-xs font-semibold text-brand-olive uppercase mb-2 block">Exam Prep Add-on (Optional)</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input type="text" placeholder="Title" value={level.examPrep?.title || ''} onChange={(e) => updateLevel(lIndex, 'examPrep', { ...level.examPrep, title: e.target.value })} className="px-3 py-1 rounded bg-white border border-brand-surface text-sm" />
                                                        <input type="text" placeholder="Details" value={level.examPrep?.details || ''} onChange={(e) => updateLevel(lIndex, 'examPrep', { ...level.examPrep, details: e.target.value })} className="px-3 py-1 rounded bg-white border border-brand-surface text-sm" />
                                                        <input type="text" placeholder="Price" value={level.examPrep?.price || ''} onChange={(e) => updateLevel(lIndex, 'examPrep', { ...level.examPrep, price: e.target.value })} className="px-3 py-1 rounded bg-white border border-brand-surface text-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-brand-surface">
                                    <Button type="submit" disabled={loading} className="flex-1 bg-brand-red hover:bg-brand-red-hover text-white flex items-center justify-center gap-2"><Save className="w-5 h-5" />{loading ? 'Saving...' : editingId ? 'Update Language' : 'Create Language'}</Button>
                                    <Button type="button" onClick={() => setShowForm(false)} variant="outline" className="flex-1">Cancel</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Courses Grid */}
                {loading && !showForm ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course._id} className="bg-white rounded-xl border border-brand-surface overflow-hidden group hover:shadow-lg transition-shadow">
                                {course.image && (
                                    <div className="relative h-48">
                                        <img src={getAssetUrl(`uploads/${course.image}`)} alt={course.title} className="w-full h-full object-cover" />
                                        {course.popular && <div className="absolute top-4 left-4 bg-brand-red/50 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Popular</div>}
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-xl font-serif font-bold text-brand-black mb-1">{course.title}</h3>
                                    {course.subtitle && <p className="text-sm text-brand-olive mb-3">{course.subtitle}</p>}

                                    <div className="mb-4 rounded-lg bg-brand-gold/10 px-3 py-2 text-sm font-semibold text-[#8b6f2c]">
                                        Starting at {formatTrainingPrice(getCourseStartingPrice(course))}
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                        {course.levels.map((l, i) => (
                                            <span key={i} className="px-2 py-1 bg-brand-surface rounded text-brand-olive-dark">{l.name}</span>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-brand-surface">
                                        <div className="flex gap-2 w-full justify-end">
                                            <button onClick={() => handleEdit(course)} className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg hover:bg-brand-gold/20"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(course._id!)} className="p-2 bg-brand-red/5 text-brand-red rounded-lg hover:bg-brand-red/10"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && courses.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-brand-olive-dark">
                            No language courses yet. Click "Add Language" to create your first course.
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default LanguageDashboard;
