import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft,
    Upload,
    Plus,
    Trash2,
    Calendar as CalendarIcon,
    Clock,
    Type,
    Hash,
    Image as ImageIcon,
    Video,
    Loader2,
    CheckCircle,
    AlertCircle,
    X,
    Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PostManager = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Manual Post Form State
    const [newPost, setNewPost] = useState({
        date: '',
        time: '',
        topic: '',
        title: '',
        caption: '',
        hashtags: '',
        mediaPath: '',
        mediaType: 'image'
    });

    useEffect(() => {
        fetchPosts();
    }, [id]);

    const fetchPosts = async () => {
        try {
            console.log(`[PostManager] API Call: GET http://localhost:3000/api/posts/${id}`);
            const { data } = await axios.get(`http://localhost:3000/api/posts/${id}`);
            setPosts(data);
        } catch (error) {
            console.error('[PostManager] Fetch Failed:', error);
            const msg = error.response?.data?.message || error.message || 'Network Error';
            toast.error(`Fetch Failed: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const getMediaUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;

        // Map local paths to static backend routes
        let cleanPath = path.replace(/\\/g, '/');

        if (cleanPath.includes('E:/Linkdin post')) {
            return `http://localhost:3000/static/images/${cleanPath.split('/').pop()}`;
        }
        if (cleanPath.includes('E:/Facbook post')) {
            return `http://localhost:3000/static/fb_images/${cleanPath.split('/').pop()}`;
        }
        if (cleanPath.includes('E:/Instagram post')) {
            return `http://localhost:3000/static/ig_images/${cleanPath.split('/').pop()}`;
        }

        return null;
    };

    const handleFileUpload = async (e) => {

        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('csvFile', file);

        setIsUploading(true);
        try {
            console.log(`[PostManager] API Call: POST http://localhost:3000/api/posts/${id}/upload`);
            await axios.post(`http://localhost:3000/api/posts/${id}/upload`, formData);
            toast.success('CSV uploaded successfully!');
            fetchPosts();
        } catch (error) {
            console.error('[PostManager] CSV Upload Failed:', error);
            const msg = error.response?.data?.message || error.message || 'Upload failed';
            toast.error(`Upload Failed: ${msg}`);
        } finally {
            setIsUploading(false);
        }
    };


    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('[PostManager] API Call: POST manual post', newPost);
            const { data } = await axios.post(`http://localhost:3000/api/posts/${id}`, newPost);
            setPosts([...posts, data]);
            setIsModalOpen(false);
            setNewPost({
                date: '',
                time: '',
                topic: '',
                title: '',
                caption: '',
                hashtags: '',
                mediaPath: '',
                mediaType: 'image'
            });
            toast.success('Post scheduled!');
        } catch (error) {
            console.error('[PostManager] Manual Add Failed:', error);
            const msg = error.response?.data?.message || error.message || 'Operation failed';
            toast.error(`Schedule Failed: ${msg}`);
        }
    };



    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await axios.delete(`http://localhost:3000/api/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
            toast.success('Post deleted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete post');
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('WARNING: This will delete ALL posts for this scheduler. This action cannot be undone. Area you sure?')) return;

        try {
            const { data } = await axios.delete(`http://localhost:3000/api/posts/${id}/all`);
            setPosts([]);
            toast.success(data.message || 'All posts cleared');
        } catch (error) {
            console.error('[PostManager] Clear All Failed:', error);
            const msg = error.response?.data?.message || error.message || 'Operation failed';
            toast.error(`Clear Failed: ${msg}`);
        }
    };



    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/schedulers')}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-outfit">Manage Posts</h2>
                        <p className="text-slate-500 text-sm">Schedule and manage content for your platform.</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-2xl transition-all flex items-center space-x-2">
                        <Upload size={20} />
                        <span>{isUploading ? 'Uploading...' : 'Bulk CSV'}</span>
                        <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                    <button
                        onClick={handleClearAll}
                        disabled={posts.length === 0}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-6 py-3 rounded-2xl transition-all border border-red-100 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 size={20} />
                        <span>Clear All</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>Manual Add</span>
                    </button>

                </div>
            </header>

            {/* Posts Content */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Schedule</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Content Preview</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Media</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-400">
                                        <CalendarIcon className="mx-auto mb-4 opacity-20" size={48} />
                                        <p className="text-lg">No posts scheduled yet.</p>
                                        <p className="text-sm">Upload a CSV or add manually to get started.</p>
                                    </td>
                                </tr>
                            ) : posts.map((post) => (
                                <tr key={post._id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                                    <td className="p-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm font-bold text-slate-900">
                                                <CalendarIcon size={14} className="mr-2 text-blue-600" />
                                                {post.date}
                                            </div>
                                            <div className="flex items-center text-xs text-slate-500 font-medium">
                                                <Clock size={14} className="mr-2" />
                                                {post.time}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 max-w-md">
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-900 truncate">{post.title || post.topic}</p>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{post.caption}</p>
                                            <div className="flex gap-1 flex-wrap mt-2">
                                                {post.hashtags?.split(' ').map((tag, i) => (
                                                    <span key={i} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                                                        {tag.startsWith('#') ? tag : `#${tag}`}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden border border-slate-100">
                                                {post.mediaType === 'video' ? (
                                                    <Video size={20} />
                                                ) : getMediaUrl(post.mediaPath) ? (
                                                    <img
                                                        src={getMediaUrl(post.mediaPath)}
                                                        alt="preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/150?text=Error';
                                                        }}
                                                    />
                                                ) : (
                                                    <ImageIcon size={20} />
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                    {post.mediaType}
                                                </div>
                                                <div className="text-[10px] font-medium text-slate-500 max-w-[120px] truncate" title={post.mediaPath}>
                                                    {post.mediaPath ? post.mediaPath.split(/[/\\]/).pop() : 'No Media'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-6">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${post?.status === 'Posted'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : post?.status === 'Failed'
                                                ? 'bg-red-100 text-red-700 border-red-200'
                                                : 'bg-blue-100 text-blue-700 border-blue-200'
                                            }`}>
                                            {post?.status === 'Posted' ? <CheckCircle size={10} className="mr-1" /> : (post?.status === 'Failed' ? <AlertCircle size={10} className="mr-1" /> : <Clock size={10} className="mr-1" />)}
                                            {post?.status}
                                        </div>
                                    </td>

                                    <td className="p-6">
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manual Add Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-2xl relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 px-4 py-2 bg-slate-50 rounded-2xl">Manual Add Post</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                            </div>

                            <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><CalendarIcon size={14} className="mr-2" /> Date</label>
                                        <input required type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newPost.date} onChange={e => setNewPost({ ...newPost, date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><Clock size={14} className="mr-2" /> Time</label>
                                        <input required type="time" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newPost.time} onChange={e => setNewPost({ ...newPost, time: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><Type size={14} className="mr-2" /> Title / Topic</label>
                                        <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Catchy title" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><Hash size={14} className="mr-2" /> Hashtags</label>
                                        <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="#mern #saas #post" value={newPost.hashtags} onChange={e => setNewPost({ ...newPost, hashtags: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><ImageIcon size={14} className="mr-2" /> Media Type</label>
                                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newPost.mediaType} onChange={e => setNewPost({ ...newPost, mediaType: e.target.value })}>
                                            <option value="image">Image</option>
                                            <option value="video">Video</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><ImageIcon size={14} className="mr-2" /> Media Content Path / URL</label>
                                        <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="C:/images/post1.jpg" value={newPost.mediaPath} onChange={e => setNewPost({ ...newPost, mediaPath: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><Type size={14} className="mr-2" /> Caption</label>
                                        <textarea rows="4" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Write your post caption..." value={newPost.caption} onChange={e => setNewPost({ ...newPost, caption: e.target.value })}></textarea>
                                    </div>
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2">
                                        <Save size={20} />
                                        <span>Schedule Post</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PostManager;
