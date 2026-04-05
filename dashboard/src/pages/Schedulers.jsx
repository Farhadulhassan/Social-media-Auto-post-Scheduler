import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Facebook,
    Instagram,
    Linkedin,
    ToggleLeft,
    ToggleRight,
    Settings2,
    Database,
    Loader2,
    X,
    Save,
    Trash2,
    Edit3,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import toast from 'react-hot-toast';

const Schedulers = () => {
    const navigate = useNavigate();
    const [schedulers, setSchedulers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingScheduler, setEditingScheduler] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        platform: 'Facebook',
        platformId: '',
        accessToken: ''
    });

    useEffect(() => {
        fetchSchedulers();
    }, []);

    const fetchSchedulers = async () => {
        try {
            const { data } = await axios.get('http://localhost:3000/api/schedulers');
            setSchedulers(data);
        } catch (error) {
            toast.error('Failed to fetch schedulers');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id) => {
        try {
            const { data } = await axios.patch(`http://localhost:3000/api/schedulers/${id}/status`);
            setSchedulers(schedulers.map(s => s._id === id ? data : s));
            toast.success(`Scheduler is now ${data?.status}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }

    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingScheduler) {
                const { data } = await axios.put(`http://localhost:3000/api/schedulers/${editingScheduler._id}`, formData);
                setSchedulers(schedulers.map(s => s._id === editingScheduler._id ? data : s));
                toast.success('Scheduler updated!');
            } else {
                const { data } = await axios.post('http://localhost:3000/api/schedulers', formData);
                setSchedulers([...schedulers, data]);
                toast.success('Scheduler created!');
            }
            closeModal();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this scheduler?')) return;
        try {
            await axios.delete(`http://localhost:3000/api/schedulers/${id}`);
            setSchedulers(schedulers.filter(s => s._id !== id));
            toast.success('Scheduler deleted');
        } catch (error) {
            toast.error('Failed to delete scheduler');
        }
    };

    const openModal = (scheduler = null) => {
        if (scheduler) {
            setEditingScheduler(scheduler);
            setFormData({
                name: scheduler.name,
                platform: scheduler.platform,
                platformId: scheduler.platformId,
                accessToken: '' // Leave empty for security
            });
        } else {
            setEditingScheduler(null);
            setFormData({ name: '', platform: 'Facebook', platformId: '', accessToken: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingScheduler(null);
    };

    const platformIcons = {
        Facebook: <Facebook className="text-blue-600" size={24} />,
        Instagram: <Instagram className="text-pink-600" size={24} />,
        LinkedIn: <Linkedin className="text-blue-700" size={24} />,
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
                    <h2 className="text-3xl font-bold text-slate-900 font-outfit">Schedulers</h2>
                    <p className="text-slate-500">Manage your social media platform automation.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Create New</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {schedulers.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center">
                        <Database className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500 font-medium">No schedulers found. Create your first one!</p>
                    </div>
                ) : schedulers.map((scheduler, index) => (
                    <motion.div
                        key={scheduler._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative group hover:shadow-xl transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                                {platformIcons[scheduler.platform] || <Database size={24} />}
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => navigate(`/schedulers/${scheduler._id}/posts`)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Manage Posts"
                                >
                                    <ExternalLink size={18} />
                                </button>
                                <button
                                    onClick={() => openModal(scheduler)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                >
                                    <Edit3 size={18} />
                                </button>

                                <button
                                    onClick={() => handleDelete(scheduler._id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2">{scheduler.name}</h3>
                        <p className="text-sm text-slate-500 mb-6 flex items-center">
                            Owner: {scheduler.owner?.name || 'Unknown'}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${scheduler?.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                    {scheduler?.status}
                                </span>
                            </div>
                            <button
                                onClick={() => toggleStatus(scheduler?._id)}
                                className="text-slate-300 hover:text-blue-600 transition-all active:scale-95"
                            >
                                {scheduler?.status === 'ACTIVE' ? <ToggleRight size={32} className="text-blue-600" /> : <ToggleLeft size={32} />}
                            </button>
                        </div>

                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-900">{editingScheduler ? 'Edit Scheduler' : 'New Scheduler'}</h3>
                                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                                    <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="My Page" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                {!editingScheduler && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Platform</label>
                                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })} >
                                            <option>Facebook</option><option>Instagram</option><option>LinkedIn</option>
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Page ID</label>
                                    <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ID" value={formData.platformId} onChange={e => setFormData({ ...formData, platformId: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Access Token {editingScheduler && '(Optional)'}</label>
                                    <input type="password" required={!editingScheduler} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Token" value={formData.accessToken} onChange={e => setFormData({ ...formData, accessToken: e.target.value })} />
                                </div>
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2">
                                    <Save size={20} />
                                    <span>{editingScheduler ? 'Save Changes' : 'Create Scheduler'}</span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="bg-blue-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-2xl font-bold mb-4 font-outfit">SaaS Platform Rules</h3>
                    <p className="text-blue-100 mb-8 text-lg">As a Super Admin, you have full control over all schedulers and users. Assign schedulers to managers for delegated control.</p>
                </div>
                <div className="absolute right-[-50px] top-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default Schedulers;
