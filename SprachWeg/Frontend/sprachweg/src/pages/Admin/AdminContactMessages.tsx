import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import { Mail, Trash2, Check, Search, Filter, Loader2, Calendar } from "lucide-react";
import { API_BASE_URL as API_URL } from "../../lib/api";

// Helper to format dates
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

const AdminContactMessages: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/api/contact/admin/messages`, config);
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (processingId) return;
        setProcessingId(id);
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.patch(`${API_URL}/api/contact/admin/messages/${id}/read`, {}, config);

            // Update local state
            setMessages(messages.map(msg =>
                msg._id === id ? { ...msg, isRead: true } : msg
            ));
        } catch (error) {
            alert("Failed to update message");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (processingId) return;
        if (!confirm("Are you sure you want to delete this message?")) return;

        setProcessingId(id);
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API_URL}/api/contact/admin/messages/${id}`, config);

            // Update local state by removing deleted message
            setMessages(messages.filter(msg => msg._id !== id));
        } catch (error) {
            alert("Failed to delete message");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredMessages = messages.filter(msg => {
        const matchesSearch =
            msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.subject.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'unread') return matchesSearch && !msg.isRead;
        if (filter === 'read') return matchesSearch && msg.isRead;
        return matchesSearch;
    });

    const unreadCount = messages.filter(m => !m.isRead).length;

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            Contact Messages
                            {unreadCount > 0 && (
                                <span className="bg-[#d6b161] text-[#0a192f] text-sm font-bold px-3 py-1 rounded-full">{unreadCount} New</span>
                            )}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage inquiries received from the contact form.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-[#112240] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0a192f] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#d6b161] outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                        <Filter className="text-gray-500 w-5 h-5 shrink-0" />
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-[#d6b161] text-[#0a192f]' : 'bg-gray-100 dark:bg-[#0a192f] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                        >
                            All Messages
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'unread' ? 'bg-[#d6b161] text-[#0a192f]' : 'bg-gray-100 dark:bg-[#0a192f] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                        >
                            Unread
                        </button>
                        <button
                            onClick={() => setFilter('read')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'read' ? 'bg-[#d6b161] text-[#0a192f]' : 'bg-gray-100 dark:bg-[#0a192f] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                        >
                            Read
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-[#d6b161] animate-spin" />
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#112240] rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="bg-gray-100 dark:bg-[#0a192f] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No messages found</h3>
                        <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredMessages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`bg-white dark:bg-[#112240] rounded-xl p-6 border transition-all hover:shadow-md ${msg.isRead ? 'border-gray-200 dark:border-gray-800 opacity-80' : 'border-[#d6b161] shadow-sm relative'}`}
                            >
                                {!msg.isRead && (
                                    <span className="absolute top-4 right-4 w-3 h-3 bg-[#d6b161] rounded-full animate-pulse"></span>
                                )}
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {msg.subject}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3.5 h-3.5" /> {msg.email}
                                                    </span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <span>{msg.name}</span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" /> {formatDate(msg.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-[#0a192f] p-4 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {msg.message}
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col gap-2 shrink-0">
                                        {!msg.isRead && (
                                            <button
                                                onClick={(e) => handleMarkAsRead(msg._id, e)}
                                                disabled={!!processingId}
                                                className="flex items-center gap-2 px-4 py-2 bg-[#d6b161]/10 text-[#d6b161] hover:bg-[#d6b161]/20 rounded-lg text-sm font-medium transition-colors border border-[#d6b161]/20"
                                            >
                                                <Check className="w-4 h-4" />
                                                Mark Read
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleDelete(msg._id, e)}
                                            disabled={!!processingId}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminContactMessages;
