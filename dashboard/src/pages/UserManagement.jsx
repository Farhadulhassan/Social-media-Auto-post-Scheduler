import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserCheck,
    UserX,
    Shield,
    Mail,
    Search,
    Trash2,
    Loader2,
    Settings,
    X,
    CheckSquare,
    Square
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [schedulers, setSchedulers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [assigningUser, setAssigningUser] = useState(null);
    const [selectedSchedulers, setSelectedSchedulers] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchSchedulers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('http://localhost:3000/api/user-management/admin/list');
            // Ensure data is an array
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const { data } = await axios.get('http://localhost:3000/api/roles');
            setRoles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    const fetchSchedulers = async () => {
        try {
            const { data } = await axios.get('http://localhost:3000/api/schedulers');
            setSchedulers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch schedulers:', error);
        }
    };

    const assignRole = async (userId, roleId) => {
        try {
            const { data } = await axios.patch(`http://localhost:3000/api/user-management/admin/${userId}/status`, {
                roleId: roleId
            });

            if (data && data._id) {
                setUsers(prevUsers => {
                    if (!Array.isArray(prevUsers)) return [data];
                    return prevUsers.map(u => (u && u._id === userId) ? data : u);
                });
                toast.success('Role assigned successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign role');
        }
    };

    const openSchedulerModal = (user) => {
        setAssigningUser(user);
        setSelectedSchedulers(user.assignedSchedulers?.map(s => s._id || s) || []);
    };

    const toggleScheduler = (schedulerId) => {
        setSelectedSchedulers(prev =>
            prev.includes(schedulerId)
                ? prev.filter(id => id !== schedulerId)
                : [...prev, schedulerId]
        );
    };

    const saveSchedulerAssignment = async () => {
        try {
            const { data } = await axios.patch(`http://localhost:3000/api/user-management/admin/${assigningUser._id}/status`, {
                assignedSchedulers: selectedSchedulers
            });

            if (data && data._id) {
                setUsers(prevUsers => {
                    if (!Array.isArray(prevUsers)) return [data];
                    return prevUsers.map(u => (u && u._id === assigningUser._id) ? data : u);
                });
                toast.success('Schedulers assigned successfully!');
                setAssigningUser(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign schedulers');
        }
    };

    const toggleStatus = async (id) => {
        console.log('[Frontend] toggleStatus called with id:', id);
        try {
            console.log('[Frontend] Making PATCH request to:', `http://localhost:3000/api/user-management/admin/${id}/status`);
            const { data } = await axios.patch(`http://localhost:3000/api/user-management/admin/${id}/status`);
            console.log('[Frontend] Received response data:', JSON.stringify(data, null, 2));
            console.log('[Frontend] data._id:', data?._id);
            console.log('[Frontend] data.status:', data?.status);
            console.log('[Frontend] data.email:', data?.email);

            if (data && data._id) {
                console.log('[Frontend] Updating users state...');
                setUsers(prevUsers => {
                    console.log('[Frontend] prevUsers is array?', Array.isArray(prevUsers));
                    if (!Array.isArray(prevUsers)) return [data];
                    const updated = prevUsers.map(u => {
                        if (u && u._id === id) {
                            console.log('[Frontend] Replacing user:', u.email, 'with new data');
                            return data;
                        }
                        return u;
                    });
                    console.log('[Frontend] Updated users array');
                    return updated;
                });
                toast.success(`User access updated to ${data?.status || 'new status'}`);
            } else {
                console.error('[Frontend] Invalid response data:', data);
                toast.error('Invalid response from server');
            }
        } catch (error) {
            console.error('[Frontend] Error in toggleStatus:', error);
            console.error('[Frontend] Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to update user status');
        }

    };


    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
        try {
            await axios.delete(`http://localhost:3000/api/user-management/admin/${id}`);
            setUsers(prevUsers => {
                if (!Array.isArray(prevUsers)) return [];
                return prevUsers.filter(u => u && u._id !== id);
            });
            toast.success('User deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const filteredUsers = (users || []).filter(u => {
        if (!u || !u.name || !u.email) return false;
        const search = (searchTerm || '').toLowerCase();
        return u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
    });

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 font-outfit">User Management</h2>
                    <p className="text-slate-500">Manage account approvals and role assignments.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">User</th>
                            <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                            <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredUsers.map((u) => {
                            // Ultra-defensive checks
                            if (!u || !u._id || typeof u !== 'object') {
                                console.warn('[UserManagement] Skipping invalid user object:', u);
                                return null;
                            }

                            // Safe status extraction with fallback
                            const userStatus = u.status || 'UNKNOWN';
                            const userId = u._id;
                            const userName = u.name || 'Unknown';
                            const userEmail = u.email || 'No email';
                            const userRole = u.role?.name || (u.email === 'admin@admin.com' ? 'Super Admin' : 'User');

                            return (
                                <tr key={userId} className="hover:bg-slate-50/50 transition-all">
                                    <td className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 uppercase">
                                                {userName[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{userName}</p>
                                                <p className="text-xs text-slate-500 flex items-center">
                                                    <Mail size={12} className="mr-1" /> {userEmail}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center space-x-2">
                                            <Shield size={16} className="text-blue-500" />
                                            {u.email === 'admin@admin.com' ? (
                                                <span className="text-sm font-medium text-slate-700">Super Admin</span>
                                            ) : (
                                                <select
                                                    value={u.role?._id || ''}
                                                    onChange={(e) => assignRole(userId, e.target.value)}
                                                    className="text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                                                >
                                                    <option value="">No Role</option>
                                                    {roles.map(role => (
                                                        <option key={role._id} value={role._id}>
                                                            {role.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${userStatus === 'APPROVED'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : userStatus === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                : 'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                            {userStatus}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => toggleStatus(userId)}
                                                className={`p-2 rounded-lg transition-colors ${userStatus === 'PENDING'
                                                    ? 'text-green-600 bg-green-50 hover:bg-green-100'
                                                    : userStatus === 'BLOCKED'
                                                        ? 'text-green-600 bg-green-50 hover:bg-green-100'
                                                        : 'text-red-600 bg-red-50 hover:bg-red-100'
                                                    }`}
                                                title={userStatus === 'APPROVED' ? 'Block Access' : 'Approve Access'}
                                            >
                                                {userStatus === 'APPROVED' ? <UserX size={18} /> : <UserCheck size={18} />}
                                            </button>

                                            <button
                                                onClick={() => deleteUser(userId)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            <button
                                                onClick={() => openSchedulerModal(u)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Manage Schedulers"
                                            >
                                                <Settings size={18} />
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>

                </table>
            </div>
            <AnimatePresence>
                {assigningUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setAssigningUser(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-lg relative z-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">Assign Schedulers</h3>
                                    <p className="text-sm text-slate-500">for {assigningUser.name}</p>
                                </div>
                                <button
                                    onClick={() => setAssigningUser(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-3 mb-8 max-h-96 overflow-y-auto pr-2">
                                {schedulers.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <p>No schedulers available.</p>
                                    </div>
                                ) : (
                                    schedulers.map(scheduler => (
                                        <div
                                            key={scheduler._id}
                                            onClick={() => toggleScheduler(scheduler._id)}
                                            className={`flex items-center p-4 rounded-xl cursor-pointer border transition-all ${selectedSchedulers.includes(scheduler._id)
                                                    ? 'bg-blue-50 border-blue-200'
                                                    : 'bg-slate-50 border-transparent hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="mr-3 text-blue-600">
                                                {selectedSchedulers.includes(scheduler._id) ? (
                                                    <CheckSquare size={20} />
                                                ) : (
                                                    <Square size={20} className="text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{scheduler.name}</p>
                                                <p className="text-xs text-slate-500 capitalize">{scheduler.platform}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={saveSchedulerAssignment}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20"
                            >
                                Save Changes
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default UserManagement;
