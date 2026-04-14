import React from 'react';
import { ArrowLeft, BriefcaseBusiness } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import CareerProgramManager from '../../components/admin/CareerProgramManager';

const AdminCareerPrograms: React.FC = () => {
    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link
                            to="/admin-dashboard"
                            className="inline-flex items-center text-sm text-brand-olive hover:text-brand-gold mb-2 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-serif font-bold text-brand-black flex items-center gap-3">
                            Career Programs
                        </h1>
                        <p className="text-brand-olive-dark mt-1">
                            Create, edit, and manage the career programs shown on the public careers pages.
                        </p>
                    </div>

                    <Link
                        to="/careers"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-surface bg-white px-4 py-3 text-sm font-semibold text-brand-olive-dark transition-colors hover:border-brand-gold hover:text-brand-gold-hover"
                    >
                        <BriefcaseBusiness className="h-4 w-4" />
                        View Public Careers
                    </Link>
                </div>

                <CareerProgramManager />
            </div>
        </AdminLayout>
    );
};

export default AdminCareerPrograms;
