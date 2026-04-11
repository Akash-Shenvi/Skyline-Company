import React, { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, Menu, X, Users, Edit, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { path: '/admin-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/webinars', icon: BookOpen, label: 'Webinars' },
        { path: '/admin/webinar-registrations', icon: Users, label: 'Webinar Registrations' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/institutions', icon: Building2, label: 'Institution Requests' },
        { path: '/admin/language-enrollment-details', icon: BookOpen, label: 'Class Enrollments' },
        { path: '/admin/language-batches', icon: Users, label: 'Active Classes' },
        { path: '/admin/languages', icon: BookOpen, label: 'Language Courses' },
        // { path: '/admin/skills', icon: BookOpen, label: 'Skill Courses' },
        { path: '/admin/skills-details', icon: Edit, label: 'Skill Details' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-brand-off-white flex">
            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-brand-surface transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-brand-surface">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center">
                                <span className="font-serif font-bold text-xl text-brand-black">S</span>
                            </div>
                            <div>
                                <h1 className="font-serif font-bold text-lg text-brand-black">
                                    Admin Panel
                                </h1>
                                <p className="text-xs text-brand-olive">Skyline Academy</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-brand-gold/10 text-brand-gold'
                                        : 'text-brand-olive-dark hover:bg-brand-surface'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-brand-surface">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-brand-red hover:bg-brand-red/5 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="lg:hidden bg-white border-b border-brand-surface p-4 flex items-center justify-between">
                    <h1 className="font-serif font-bold text-lg text-brand-black">
                        Admin Panel
                    </h1>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-brand-surface rounded-lg"
                    >
                        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
