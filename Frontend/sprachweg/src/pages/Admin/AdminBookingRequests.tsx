import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Mail,
    Trash2,
    Search,
    Filter,
    Loader2,
    Calendar,
    ArrowLeft
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';
import { Link } from 'react-router-dom';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TrialRequest {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    countryCode: string;
    interest: string;
    language?: string;
    course?: string;
    prepLevel?: string;
    skillCourses?: string[];
    comments?: string;
    createdAt: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdminBookingRequests: React.FC = () => {
    const [requests, setRequests] = useState<TrialRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<'all' | 'language' | 'skill'>('all');
    const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/trials');
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch booking requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;

        setProcessingId(id);
        try {
            await api.delete(`/trials/${id}`);
            setRequests(prev => prev.filter(req => req._id !== id));
        } catch (error: any) {
            console.error("Failed to delete trial request", error);
            alert(error.response?.data?.message || 'Failed to delete request');
        } finally {
            setProcessingId(null);
        }
    };

    const toggleRequestDetails = (id: string) => {
        setExpandedRequests(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch =
            req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'language') return matchesSearch && req.interest === 'Language';
        if (filter === 'skill') return matchesSearch && req.interest === 'Skill';
        return matchesSearch;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link to="/admin-dashboard" className="inline-flex items-center text-sm text-brand-olive hover:text-brand-gold mb-2 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-serif font-bold text-brand-black flex items-center gap-3">
                            Booking Requests
                            {requests.length > 0 && (
                                <span className="bg-brand-gold text-brand-black text-sm font-bold px-3 py-1 rounded-full">{requests.length} Total</span>
                            )}
                        </h1>
                        <p className="text-brand-olive-dark mt-1">
                            Manage new booking requests for language and skill training.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-brand-surface shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-olive-light w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-brand-surface bg-brand-off-white text-brand-black focus:ring-2 focus:ring-brand-gold outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                        <Filter className="text-brand-olive w-5 h-5 shrink-0" />
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-brand-gold text-brand-black' : 'bg-brand-surface text-brand-olive-dark hover:bg-brand-surface'}`}
                        >
                            All Requests
                        </button>
                        <button
                            onClick={() => setFilter('language')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'language' ? 'bg-brand-gold text-brand-black' : 'bg-brand-surface text-brand-olive-dark hover:bg-brand-surface'}`}
                        >
                            Language
                        </button>
                        <button
                            onClick={() => setFilter('skill')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'skill' ? 'bg-brand-gold text-brand-black' : 'bg-brand-surface text-brand-olive-dark hover:bg-brand-surface'}`}
                        >
                            Skill Training
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-brand-surface">
                        <div className="bg-brand-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-brand-olive-light" />
                        </div>
                        <h3 className="text-lg font-bold text-brand-black mb-2">No booking requests found</h3>
                        <p className="text-brand-olive">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.map((req) => {
                            const isExpanded = expandedRequests.has(req._id);
                            return (
                                <div key={req._id} className="bg-white rounded-xl p-6 border border-brand-surface shadow-sm hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-lg font-bold text-brand-black">
                                                    {req.fullName}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded text-xs border font-medium ${req.interest === 'Language' ? 'bg-brand-gold/10 text-brand-olive-dark border-brand-surface' : req.interest === 'Skill' ? 'bg-brand-olive/10 text-brand-olive-dark border-brand-surface' : 'bg-brand-gold/10 text-brand-gold border-brand-gold/20'}`}>
                                                    {req.interest}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-sm text-brand-olive">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3.5 h-3.5" /> {req.email}
                                                </span>
                                                <span className="w-1 h-1 bg-brand-olive-light rounded-full"></span>
                                                <span>{req.countryCode} {req.phone}</span>
                                                <span className="w-1 h-1 bg-brand-olive-light rounded-full"></span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" /> {formatDate(req.createdAt)}
                                                </span>
                                            </div>

                                            {/* Expanded Details */}
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-4 pt-4 border-t border-brand-surface space-y-3"
                                                >
                                                    {/* Language Training Details */}
                                                    {(req.interest === 'Language' || req.interest === 'Both') && req.language && (
                                                        <div className="p-4 rounded-lg bg-brand-gold/5 border border-brand-surface">
                                                            <h4 className="text-sm font-bold text-brand-black mb-2">Language Training Choice</h4>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                                                <div>
                                                                    <span className="font-semibold text-brand-olive-dark block text-xs uppercase mb-1">Language</span>
                                                                    <span className="text-brand-black capitalize">{req.language}</span>
                                                                </div>
                                                                {req.course && (
                                                                    <div>
                                                                        <span className="font-semibold text-brand-olive-dark block text-xs uppercase mb-1">Course</span>
                                                                        <span className="text-brand-black">{req.course}</span>
                                                                    </div>
                                                                )}
                                                                {req.prepLevel && (
                                                                    <div>
                                                                        <span className="font-semibold text-brand-olive-dark block text-xs uppercase mb-1">Level</span>
                                                                        <span className="text-brand-black">{req.prepLevel}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Skill Training Details */}
                                                    {(req.interest === 'Skill' || req.interest === 'Both') && req.skillCourses && req.skillCourses.length > 0 && (
                                                        <div className="p-4 rounded-lg bg-brand-off-white border border-brand-olive/10">
                                                            <h4 className="text-sm font-bold text-brand-olive-dark mb-2">Selected Skill Courses</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {req.skillCourses.map((course, idx) => (
                                                                    <span key={idx} className="px-3 py-1 text-sm bg-brand-olive/10 text-brand-olive-dark rounded-full border border-brand-surface">
                                                                        {course}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Comments */}
                                                    {req.comments && (
                                                        <div className="p-4 rounded-lg bg-brand-off-white border border-brand-surface">
                                                            <h4 className="text-xs font-semibold text-brand-olive uppercase mb-2">Additional Comments</h4>
                                                            <p className="text-sm text-brand-olive-dark italic">"{req.comments}"</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className="flex md:flex-col gap-2 shrink-0">
                                            <button
                                                onClick={() => toggleRequestDetails(req._id)}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 rounded-lg text-sm font-medium transition-colors border border-brand-gold/20"
                                            >
                                                {isExpanded ? 'Hide Details' : 'View Details'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(req._id)}
                                                disabled={!!processingId}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-red/5 text-brand-red hover:bg-brand-red/10 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-brand-red/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminBookingRequests;
