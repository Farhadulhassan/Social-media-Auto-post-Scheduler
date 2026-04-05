import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Send,
    AlertCircle,
    Clock,
    TrendingUp,
    BarChart3
} from 'lucide-react';

const Dashboard = () => {
    const stats = [
        { name: 'Total Posts', value: '124', icon: Send, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Active Schedulers', value: '3', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
        { name: 'Failed Posts', value: '2', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
        { name: 'Total Users', value: '1', icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-slate-900">Dashboard Overview</h2>
                <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4"
                    >
                        <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{stat.name}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                        <div className="text-blue-600 text-sm font-semibold hover:underline cursor-pointer flex items-center">
                            View all <TrendingUp size={14} className="ml-1" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center space-x-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Send size={20} className="text-slate-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">New post published to Instagram</p>
                                    <p className="text-xs text-slate-500">Scheduler: IG Business • 2 hours ago</p>
                                </div>
                                <div className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                    Success
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                    <BarChart3 className="absolute right-[-20px] bottom-[-20px] text-white/10" size={200} />
                    <h3 className="text-xl font-bold mb-2">Platform Performance</h3>
                    <p className="text-slate-400 text-sm mb-8">Reach and engagement over the last 30 days.</p>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Facebook</span>
                                <span className="font-bold">88%</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: '88%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Instagram</span>
                                <span className="font-bold">64%</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full">
                                <div className="bg-purple-500 h-full rounded-full" style={{ width: '64%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>LinkedIn</span>
                                <span className="font-bold">92%</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full">
                                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
