import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Plus,
    Edit3,
    Trash2,
    X,
    Save,
    Users,
    Loader2,
    CheckSquare,
    Square
} from 'lucide-react';
import toast from 'react-hot-toast';

const RolesPermissions = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        permissions: []
    });

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        try {
            const { data } = await axios.get('http://localhost:3000/api/roles');
            setRoles(data);
        } catch (error) {
            toast.error('Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const { data } = await axios.get('http://localhost:3000/api/roles/permissions');
            setPermissions(data);
        } catch (error) {
            toast.error('Failed to fetch permissions');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRole) {
                const { data } = await axios.put(`http://localhost:3000/api/roles/${editingRole._id}`, formData);
                setRoles(roles.map(r => r._id === editingRole._id ? data : r));
                toast.success('Role updated successfully!');
            } else {
                const { data } = await axios.post('http://localhost:3000/api/roles', formData);
                setRoles([...roles, data]);
                toast.success('Role created successfully!');
            }
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;
        try {
            await axios.delete(`http://localhost:3000/api/roles/${id}`);
            setRoles(roles.filter(r => r._id !== id));
            toast.success('Role deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete role');
        }
    };

    const openModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                permissions: role.permissions || []
            });
        } else {
            setEditingRole(null);
            setFormData({ name: '', permissions: [] });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
    };

    const togglePermission = (permissionId) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId]
        }));
    };

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 font-outfit">Roles & Permissions</h2>
                    <p className="text-slate-500">Manage roles and assign permissions to control access.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Create Role</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role, index) => (
                    <motion.div
                        key={role._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-2xl">
                                <Shield className="text-blue-600" size={24} />
                            </div>
                            {role.name !== 'Super Admin' && (
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => openModal(role)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(role._id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2">{role.name}</h3>

                        <div className="flex items-center text-sm text-slate-500 mb-4">
                            <Users size={16} className="mr-2" />
                            <span>{role.userCount || 0} user{role.userCount !== 1 ? 's' : ''}</span>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Permissions</p>
                            <div className="flex flex-wrap gap-1">
                                {(role.permissions || []).slice(0, 3).map(perm => (
                                    <span key={perm} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                        {perm}
                                    </span>
                                ))}
                                {role.permissions?.length > 3 && (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                        +{role.permissions.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-2xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {editingRole ? 'Edit Role' : 'Create New Role'}
                                </h3>
                                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                                    <X />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Role Name</label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g., Content Manager"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Permissions</label>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {permissions.map(perm => (
                                            <div
                                                key={perm.id}
                                                onClick={() => togglePermission(perm.id)}
                                                className="flex items-start p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-all border border-transparent hover:border-blue-200"
                                            >
                                                <div className="mt-0.5">
                                                    {formData.permissions.includes(perm.id) ? (
                                                        <CheckSquare className="text-blue-600" size={20} />
                                                    ) : (
                                                        <Square className="text-slate-400" size={20} />
                                                    )}
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <p className="font-semibold text-slate-900">{perm.name}</p>
                                                    <p className="text-xs text-slate-500">{perm.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
                                >
                                    <Save size={20} />
                                    <span>{editingRole ? 'Update Role' : 'Create Role'}</span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RolesPermissions;
