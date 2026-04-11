import React, { useEffect, useState } from 'react';
import { BriefcaseBusiness, Loader2, Pencil, Plus, RefreshCcw, Sparkles, Trash2 } from 'lucide-react';
import { internshipCatalogAPI } from '../../lib/api';
import { formatInternshipPrice, type InternshipListing, type InternshipPayload } from '../../types/internship';

interface InternshipFormState {
    title: string;
    shortDescription: string;
    description: string;
    responsibilities: string;
    benefits: string;
    duration: string;
    location: string;
    price: string;
    tags: string;
    isActive: boolean;
}

const defaultForm: InternshipFormState = {
    title: '',
    shortDescription: '',
    description: '',
    responsibilities: '',
    benefits: '',
    duration: '3-6 Months',
    location: 'Remote / Hybrid / Onsite',
    price: '',
    tags: '',
    isActive: true,
};

const cardClassName = 'rounded-2xl border border-brand-surface bg-white p-6 shadow-sm';
const inputClassName = 'w-full rounded-xl border border-brand-surface bg-brand-off-white px-4 py-3 text-sm text-brand-black outline-none transition-colors focus:border-brand-red focus:ring-2 focus:ring-brand-gold/20';

const parseListInput = (value: string) =>
    value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);

const toPayload = (form: InternshipFormState): InternshipPayload => ({
    title: form.title.trim(),
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    responsibilities: parseListInput(form.responsibilities),
    benefits: parseListInput(form.benefits),
    duration: form.duration.trim(),
    location: form.location.trim(),
    price: Number(form.price),
    tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    isActive: form.isActive,
});

const InternshipCatalogManager: React.FC = () => {
    const [internships, setInternships] = useState<InternshipListing[]>([]);
    const [form, setForm] = useState<InternshipFormState>(defaultForm);
    const [editingInternshipId, setEditingInternshipId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingInternshipId, setDeletingInternshipId] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const fetchInternships = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await internshipCatalogAPI.getAllAdmin();
            setInternships(response.internships || []);
        } catch (err: any) {
            console.error('Failed to fetch internship catalog:', err);
            setError(err.response?.data?.message || 'Failed to load internship listings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInternships();
    }, []);

    const resetForm = () => {
        setForm(defaultForm);
        setEditingInternshipId(null);
        setFormError(null);
    };

    const handleChange = <K extends keyof InternshipFormState>(field: K, value: InternshipFormState[K]) => {
        setForm((currentForm) => ({ ...currentForm, [field]: value }));
        setFormError(null);
    };

    const handleEdit = (internship: InternshipListing) => {
        setEditingInternshipId(internship._id);
        setForm({
            title: internship.title,
            shortDescription: internship.shortDescription,
            description: internship.description,
            responsibilities: (internship.responsibilities || []).join('\n'),
            benefits: (internship.benefits || []).join('\n'),
            duration: internship.duration,
            location: internship.location,
            price: String(internship.price),
            tags: internship.tags.join(', '),
            isActive: internship.isActive,
        });
        setFormError(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.title.trim() || !form.shortDescription.trim() || !form.description.trim() || !form.duration.trim() || !form.location.trim()) {
            setFormError('Please complete all internship details before saving.');
            return;
        }

        if (parseListInput(form.responsibilities).length === 0 || parseListInput(form.benefits).length === 0) {
            setFormError('Please add at least one point for Key Responsibilities and one point for What You\'ll Gain.');
            return;
        }

        if (!form.price.trim() || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
            setFormError('Please provide a valid internship price.');
            return;
        }

        try {
            setSaving(true);
            setFormError(null);

            const payload = toPayload(form);
            const response = editingInternshipId
                ? await internshipCatalogAPI.update(editingInternshipId, payload)
                : await internshipCatalogAPI.create(payload);

            const savedInternship = response.internship as InternshipListing;

            setInternships((currentInternships) => {
                if (editingInternshipId) {
                    return currentInternships.map((internship) =>
                        internship._id === savedInternship._id ? savedInternship : internship
                    );
                }

                return [...currentInternships, savedInternship].sort((left, right) => {
                    const orderDifference = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
                    if (orderDifference !== 0) return orderDifference;
                    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
                });
            });

            resetForm();
        } catch (err: any) {
            console.error('Failed to save internship:', err);
            setFormError(err.response?.data?.message || 'Failed to save internship.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (internship: InternshipListing) => {
        if (!window.confirm(`Delete "${internship.title}" from the live internship catalog?`)) {
            return;
        }

        try {
            setDeletingInternshipId(internship._id);
            await internshipCatalogAPI.delete(internship._id);
            setInternships((currentInternships) =>
                currentInternships.filter((currentInternship) => currentInternship._id !== internship._id)
            );

            if (editingInternshipId === internship._id) {
                resetForm();
            }
        } catch (err: any) {
            console.error('Failed to delete internship:', err);
            window.alert(err.response?.data?.message || 'Failed to delete internship.');
        } finally {
            setDeletingInternshipId(null);
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="flex items-center gap-3 text-2xl font-bold text-brand-black">
                        <BriefcaseBusiness className="h-6 w-6 text-brand-gold" />
                        Manage Live Internships
                    </h2>
                    <p className="mt-1 text-sm text-brand-olive-dark">
                        Add new internship listings, update prices, and remove openings that should no longer appear on the careers page.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchInternships}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-surface bg-white px-4 py-2.5 text-sm font-semibold text-brand-olive-dark transition-colors hover:border-brand-gold hover:text-brand-gold-hover disabled:opacity-60"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                    Refresh Catalog
                </button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
                <div className={cardClassName}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-brand-gold-hover">
                                {editingInternshipId ? 'Edit listing' : 'Create listing'}
                            </p>
                            <h3 className="mt-1 text-xl font-bold text-brand-black">
                                {editingInternshipId ? 'Update internship details' : 'Add a new internship'}
                            </h3>
                        </div>
                        <div className="rounded-2xl bg-brand-gold/10 p-3 text-brand-gold-hover">
                            {editingInternshipId ? <Sparkles className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                        </div>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-brand-olive-dark">Title</label>
                                <input
                                    value={form.title}
                                    onChange={(event) => handleChange('title', event.target.value)}
                                    className={inputClassName}
                                    placeholder="Full Stack Development Intern"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-brand-olive-dark">Short Description</label>
                                <textarea
                                    rows={2}
                                    value={form.shortDescription}
                                    onChange={(event) => handleChange('shortDescription', event.target.value)}
                                    className={`${inputClassName} resize-y`}
                                    placeholder="A crisp summary that appears on the card."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-brand-olive-dark">Description</label>
                                <textarea
                                    rows={4}
                                    value={form.description}
                                    onChange={(event) => handleChange('description', event.target.value)}
                                    className={`${inputClassName} resize-y`}
                                    placeholder="Detailed explanation shown on the internship detail and application flow."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-brand-olive-dark">Key Responsibilities</label>
                                <textarea
                                    rows={4}
                                    value={form.responsibilities}
                                    onChange={(event) => handleChange('responsibilities', event.target.value)}
                                    className={`${inputClassName} resize-y`}
                                    placeholder={'Write one point per line\nWork on live project tasks\nCollaborate with mentors during reviews'}
                                />
                                <p className="mt-2 text-xs text-brand-olive">
                                    Add one point per line. Commas also work.
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-brand-olive-dark">What You&apos;ll Gain</label>
                                <textarea
                                    rows={4}
                                    value={form.benefits}
                                    onChange={(event) => handleChange('benefits', event.target.value)}
                                    className={`${inputClassName} resize-y`}
                                    placeholder={'Write one point per line\nHands-on project exposure\nMentorship and portfolio-ready experience'}
                                />
                                <p className="mt-2 text-xs text-brand-olive">
                                    Add one point per line. Commas also work.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-brand-olive-dark">Duration</label>
                                <input
                                    value={form.duration}
                                    onChange={(event) => handleChange('duration', event.target.value)}
                                    className={inputClassName}
                                    placeholder="3-6 Months"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-brand-olive-dark">Price (INR)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.price}
                                    onChange={(event) => handleChange('price', event.target.value)}
                                    className={inputClassName}
                                    placeholder="9999"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-brand-olive-dark">Location / Format</label>
                                <input
                                    value={form.location}
                                    onChange={(event) => handleChange('location', event.target.value)}
                                    className={inputClassName}
                                    placeholder="Remote / Hybrid / Onsite"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-brand-olive-dark">Tags</label>
                                <input
                                    value={form.tags}
                                    onChange={(event) => handleChange('tags', event.target.value)}
                                    className={inputClassName}
                                    placeholder="React, Node.js, APIs"
                                />
                                <p className="mt-2 text-xs text-brand-olive">
                                    Separate tags with commas.
                                </p>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 rounded-xl border border-brand-surface bg-brand-off-white px-4 py-3 text-sm font-medium text-brand-olive-dark">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(event) => handleChange('isActive', event.target.checked)}
                                className="h-4 w-4 rounded border-brand-surface text-brand-gold focus:ring-brand-gold"
                            />
                            Show this internship on the public careers page
                        </label>

                        {formError && (
                            <div className="rounded-xl border border-brand-red/20 bg-brand-red/5 px-4 py-3 text-sm text-brand-red">
                                {formError}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-olive-dark disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingInternshipId ? <Sparkles className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                {editingInternshipId ? 'Update Internship' : 'Create Internship'}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-surface bg-white px-5 py-3 text-sm font-semibold text-brand-olive-dark transition-colors hover:border-brand-gold hover:text-brand-gold-hover disabled:opacity-60"
                            >
                                Reset Form
                            </button>
                        </div>
                    </form>
                </div>

                <div className={cardClassName}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-brand-gold-hover">Published catalog</p>
                            <h3 className="mt-1 text-xl font-bold text-brand-black">
                                {internships.length} internship{internships.length === 1 ? '' : 's'} in database
                            </h3>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
                            </div>
                        ) : error ? (
                            <div className="rounded-xl border border-brand-red/20 bg-brand-red/5 px-4 py-3 text-sm text-brand-red">
                                {error}
                            </div>
                        ) : internships.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-brand-surface px-4 py-10 text-center text-sm text-brand-olive">
                                No internship listings yet.
                            </div>
                        ) : (
                            internships.map((internship) => (
                                <article
                                    key={internship._id}
                                    className="rounded-2xl border border-brand-surface bg-brand-off-white p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-lg font-bold text-brand-black">{internship.title}</h4>
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        internship.isActive
                                                            ? 'bg-brand-olive/10 text-brand-olive-dark'
                                                            : 'bg-brand-surface text-brand-olive-dark'
                                                    }`}
                                                >
                                                    {internship.isActive ? 'Live' : 'Hidden'}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-brand-olive-dark">
                                                {internship.shortDescription}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-4 py-2 text-right">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b6f2c]">Price</p>
                                            <p className="mt-1 text-lg font-bold text-brand-black">
                                                {formatInternshipPrice(internship.price, internship.currency)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-brand-olive">
                                        <span className="rounded-full border border-brand-surface px-3 py-1">{internship.duration}</span>
                                        <span className="rounded-full border border-brand-surface px-3 py-1">{internship.location}</span>
                                        {internship.tags.map((tag) => (
                                            <span key={tag} className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-3 py-1 text-[#8b6f2c]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {((internship.responsibilities || []).length > 0 || (internship.benefits || []).length > 0) && (
                                        <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                            {(internship.responsibilities || []).length > 0 && (
                                                <div className="rounded-2xl border border-brand-surface bg-white px-4 py-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b6f2c]">
                                                        Key Responsibilities
                                                    </p>
                                                    <ul className="mt-3 space-y-2 text-sm text-brand-olive-dark">
                                                        {(internship.responsibilities || []).slice(0, 2).map((item) => (
                                                            <li key={item} className="flex gap-2">
                                                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-gold" />
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {(internship.benefits || []).length > 0 && (
                                                <div className="rounded-2xl border border-brand-surface bg-white px-4 py-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b6f2c]">
                                                        What You&apos;ll Gain
                                                    </p>
                                                    <ul className="mt-3 space-y-2 text-sm text-brand-olive-dark">
                                                        {(internship.benefits || []).slice(0, 2).map((item) => (
                                                            <li key={item} className="flex gap-2">
                                                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-gold" />
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(internship)}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-surface bg-white px-4 py-2.5 text-sm font-semibold text-brand-olive-dark transition-colors hover:border-brand-gold hover:text-brand-gold-hover"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(internship)}
                                            disabled={deletingInternshipId === internship._id}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-red/20 bg-brand-red/5 px-4 py-2.5 text-sm font-semibold text-brand-red transition-colors hover:bg-brand-red/10 disabled:opacity-60"
                                        >
                                            {deletingInternshipId === internship._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InternshipCatalogManager;
