import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Users,
    ShieldCheck,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout, hasPermission } = useAuth();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: 'scheduler.view' },
        { name: 'Schedulers', icon: Calendar, path: '/schedulers', permission: 'scheduler.view' },
        { name: 'User Management', icon: Users, path: '/admin/users', permission: 'admin.users' },
        { name: 'Roles & Permissions', icon: ShieldCheck, path: '/admin/roles', permission: 'admin.roles' },
        { name: 'Settings', icon: Settings, path: '/settings', permission: '*' },
    ];

    return (
        <div className="w-64 bg-slate-900 h-screen text-white flex flex-col fixed left-0 top-0">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    SocialSaaS
                </h1>
            </div>

            <nav className="flex-1 mt-6 px-4 space-y-2">
                {menuItems.map((item) => (
                    hasPermission(item.permission) && (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 group ${location.pathname === item.path
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={22} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    )
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <Link to="/settings" className="flex items-center space-x-3 mb-4 p-2 hover:bg-slate-800 rounded-xl transition-all group">
                    <div className="w-10 h-10 rounded-full bg-blue-500 group-hover:bg-blue-400 flex items-center justify-center font-bold text-lg transition-colors">
                        {user?.name?.[0]}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate group-hover:text-blue-400 transition-colors uppercase">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                    </div>
                </Link>
                <button

                    onClick={logout}
                    className="flex items-center space-x-3 w-full p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
