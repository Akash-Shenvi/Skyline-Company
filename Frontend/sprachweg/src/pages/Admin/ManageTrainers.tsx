import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
    Users,
    Search,
    UserMinus,
    Shield,
    Mail,
    Loader2,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Trainer {
    _id: string;
    name: string;
    email: string;
}

const ManageTrainers: React.FC = () => {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [promoteEmail, setPromoteEmail] = useState("");
    const [promoting, setPromoting] = useState(false);

    useEffect(() => {
        fetchTrainers();
    }, []);

    const fetchTrainers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/language-training/admin/trainers');
            setTrainers(data);
        } catch (error) {
            console.error("Failed to fetch trainers", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePromoteTrainer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!promoteEmail) return;

        try {
            setPromoting(true);
            const { data } = await api.post('/language-training/admin/promote-trainer', { email: promoteEmail });
            alert(data.message);
            setPromoteEmail("");
            fetchTrainers();
        } catch (error: any) {
            console.error("Failed to promote user", error);
            alert(error.response?.data?.message || 'Failed to promote user');
        } finally {
            setPromoting(false);
        }
    };

    const handleDemoteTrainer = async (id: string) => {
        if (!window.confirm("Are you sure you want to demote this trainer back to a student? They will lose access to course management.")) {
            return;
        }

        try {
            await api.delete(`/language-training/admin/trainers/${id}`);
            setTrainers(trainers.filter(t => t._id !== id));
            toast?.success("Trainer successfully demoted to student");
        } catch (error: any) {
            console.error("Failed to demote trainer", error);
            alert(error.response?.data?.message || 'Failed to demote trainer');
        }
    };

    const filteredTrainers = trainers.filter(trainer =>
        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-serif font-bold text-brand-black flex items-center gap-3">
                        <Users className="h-8 w-8 text-brand-gold" />
                        Manage Trainers
                    </h1>
                    <p className="text-brand-olive-dark mt-1 ml-11">
                        View, promote, and manage trainer access.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content - Trainer List */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-olive-light w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search trainers by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-surface bg-white text-brand-black focus:ring-2 focus:ring-brand-gold outline-none shadow-sm"
                            />
                        </div>

                        {/* List */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                                </div>
                            ) : filteredTrainers.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-xl border border-brand-surface">
                                    <p className="text-brand-olive">No trainers found matching your search.</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {filteredTrainers.map((trainer) => (
                                        <motion.div
                                            key={trainer._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-white p-4 rounded-xl border border-brand-surface shadow-sm flex items-center justify-between group hover:border-brand-gold/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold text-lg">
                                                    {trainer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-brand-black">{trainer.name}</h3>
                                                    <p className="text-sm text-brand-olive flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {trainer.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDemoteTrainer(trainer._id)}
                                                className="p-2 text-brand-olive-light hover:text-brand-gold hover:bg-brand-gold/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Demote to Student"
                                            >
                                                <UserMinus className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Promote Action */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-brand-surface shadow-sm sticky top-24">
                            <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-brand-gold" />
                                Promote New Trainer
                            </h2>
                            <p className="text-sm text-brand-olive-dark mb-6">
                                Grant trainer privileges to an existing user by entering their email address.
                            </p>

                            <form onSubmit={handlePromoteTrainer} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-brand-olive uppercase tracking-wider mb-1.5 block">
                                        User Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="user@example.com"
                                        value={promoteEmail}
                                        onChange={(e) => setPromoteEmail(e.target.value)}
                                        className="w-full rounded-lg border border-brand-surface bg-brand-off-white p-3 text-sm outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={promoting}
                                    className="w-full rounded-lg bg-brand-red py-3 text-sm font-bold text-white transition-colors hover:bg-brand-red-hover disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {promoting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Promoting...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Promote User
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="p-6 rounded-xl bg-linear-to-br from-brand-black to-brand-olive-dark text-white">
                            <h3 className="font-bold text-lg mb-2">Trainer Access</h3>
                            <ul className="text-sm space-y-2 text-brand-olive-light list-disc list-inside">
                                <li>Trainers can create and manage batches.</li>
                                <li>They can access student details.</li>
                                <li>They can upload course materials.</li>
                                <li>Ensure you trust the user before promoting.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageTrainers;
