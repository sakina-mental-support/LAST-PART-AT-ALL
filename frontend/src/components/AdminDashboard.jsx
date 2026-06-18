import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Cell, PieChart, Pie 
} from 'recharts';
import { 
    LucideActivity, LucideShieldAlert, LucideBrain, 
    LucideTrendingUp, LucideAlertCircle, LucideLayers, LucideDatabase,
    LucideUsers, LucideLock, LucideTrash2, LucidePlusCircle
} from 'lucide-react';
import Badge from './Badge';
import { 
    getUsersAdmin, 
    deleteUserAdmin, 
    changeUserPasswordAdmin, 
    createExerciseAdmin,
    getExercises,
    updateExerciseAdmin,
    deleteExerciseAdmin
} from '../services/api';

const API_BASE = 'http://localhost:5000/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Users Tab State
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [userMessage, setUserMessage] = useState({ type: '', text: '' });

    // Exercises/Shifts Tab State
    const [exercises, setExercises] = useState([]);
    const [editingExerciseId, setEditingExerciseId] = useState(null);
    const [exerciseForm, setExerciseForm] = useState({
        title: '',
        description: '',
        duration: '10',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format,compress&q=90&w=1920',
        category: 'Mindfulness',
        content: ''
    });
    const [exerciseMessage, setExerciseMessage] = useState({ type: '', text: '' });

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('sakina_token');
            const res = await axios.get(`${API_BASE}/events/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await getUsersAdmin();
            if (res && res.success) {
                setUsers(res.data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchExercises = async () => {
        try {
            const res = await getExercises();
            if (res && res.success && res.data) {
                setExercises(res.data.recommendations || []);
            }
        } catch (err) {
            console.error("Error fetching exercises:", err);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        fetchUsers();
        fetchExercises();
    }, []);

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you absolutely sure you want to delete this user? This action is irreversible.')) return;
        try {
            await deleteUserAdmin(userId);
            setUserMessage({ type: 'success', text: 'User deleted successfully.' });
            fetchUsers();
            if (selectedUser && selectedUser._id === userId) setSelectedUser(null);
        } catch (err) {
            setUserMessage({ type: 'error', text: err.message || 'Failed to delete user.' });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!newPassword.trim()) return;
        try {
            await changeUserPasswordAdmin(selectedUser._id, newPassword);
            setUserMessage({ type: 'success', text: `Password updated successfully for ${selectedUser.name}.` });
            setNewPassword('');
            setSelectedUser(null);
        } catch (err) {
            setUserMessage({ type: 'error', text: err.message || 'Failed to change password.' });
        }
    };

    const renderPasswordForm = () => {
        if (!selectedUser) return null;
        return (
            <div className="bg-white/5 border border-white/10 rounded-[28px] sm:rounded-[48px] p-6 sm:p-8 backdrop-blur-3xl space-y-6 sm:space-y-8">
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[2px] text-amber-400 mb-1">Reset Password</h4>
                    <h3 className="text-xl sm:text-2xl font-bold text-white capitalize">{selectedUser.name}</h3>
                    <p className="text-xs text-white/50 truncate">{selectedUser.email}</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[2px] text-white/40">New Password</label>
                        <input 
                            type="password" 
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-5 py-3.5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#00adef]/40 text-sm font-semibold"
                            required
                        />
                    </div>
                    <div className="flex gap-3">
                        <button 
                            type="submit"
                            className="flex-1 py-3.5 bg-amber-400 text-[#091426] font-bold rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] uppercase tracking-[2px] sm:tracking-[3px] hover:bg-amber-300 transition-all"
                        >
                            Update
                        </button>
                        <button 
                            type="button"
                            onClick={() => setSelectedUser(null)}
                            className="px-4 sm:px-6 py-3.5 bg-white/5 text-white/60 hover:text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] uppercase tracking-[1px] sm:tracking-[2px] hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const handleDeleteExercise = async (id) => {
        if (!window.confirm("Are you sure you want to delete this exercise shift? This cannot be undone.")) return;
        try {
            await deleteExerciseAdmin(id);
            setExerciseMessage({ type: 'success', text: 'Exercise deleted successfully!' });
            fetchExercises();
            if (editingExerciseId === id) {
                handleCancelEdit();
            }
        } catch (err) {
            setExerciseMessage({ type: 'error', text: err.message || 'Failed to delete exercise.' });
        }
    };

    const handleEditSelect = (ex) => {
        setEditingExerciseId(ex._id);
        setExerciseForm({
            title: ex.title,
            description: ex.description,
            duration: ex.duration,
            imageUrl: ex.imageUrl,
            category: ex.category || 'Mindfulness',
            content: ex.content || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingExerciseId(null);
        setExerciseForm({
            title: '',
            description: '',
            duration: '10',
            imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format,compress&q=90&w=1920',
            category: 'Mindfulness',
            content: ''
        });
    };

    const handleSaveExercise = async (e) => {
        e.preventDefault();
        try {
            if (editingExerciseId) {
                await updateExerciseAdmin(editingExerciseId, exerciseForm);
                setExerciseMessage({ type: 'success', text: 'Exercise updated successfully!' });
            } else {
                await createExerciseAdmin(exerciseForm);
                setExerciseMessage({ type: 'success', text: 'New exercise created successfully!' });
            }
            handleCancelEdit();
            fetchExercises();
        } catch (err) {
            setExerciseMessage({ type: 'error', text: err.message || 'Failed to save exercise.' });
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#091426] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#00adef] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#091426] text-white p-4 sm:p-8 md:p-16 font-['Inter'] overflow-x-hidden pt-24 sm:pt-28 pb-24">
            
            {/* 🚀 MISSION CONTROL HEADER */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-10 mb-10 sm:mb-20">
                <div className="space-y-3 sm:space-y-4">
                    <Badge variant="solid" color="teal" size="sm" className="tracking-[6px] sm:tracking-[10px] uppercase !bg-[#00adef]/10 !text-[#00adef]">Emotional Intelligence v8.5</Badge>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">
                        Mission <br />
                        <span className="text-[#00adef] italic">Control.</span>
                    </h1>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-[24px] sm:rounded-[32px] border border-white/10 w-full lg:w-auto">
                    <button 
                        onClick={() => setActiveTab('analytics')}
                        className={`flex-1 lg:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-[18px] sm:rounded-[24px] text-[9px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[3px] transition-all ${activeTab === 'analytics' ? 'bg-[#00adef] text-[#091426]' : 'text-white hover:bg-white/5'}`}
                    >
                        Analytics
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 lg:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-[18px] sm:rounded-[24px] text-[9px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[3px] transition-all ${activeTab === 'users' ? 'bg-[#00adef] text-[#091426]' : 'text-white hover:bg-white/5'}`}
                    >
                        Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('shifts')}
                        className={`flex-1 lg:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-[18px] sm:rounded-[24px] text-[9px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[3px] transition-all ${activeTab === 'shifts' ? 'bg-[#00adef] text-[#091426]' : 'text-white hover:bg-white/5'}`}
                    >
                        Shifts CMS
                    </button>
                </div>
            </header>

            {/* TAB CONTENT: ANALYTICS */}
            {activeTab === 'analytics' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 sm:space-y-16">
                    {/* 📊 CORE STATS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                        <StatCard icon={<LucideActivity />} title="Total Emotional Events" value={data?.summary?.totalEvents || 0} color="#00adef" />
                        <StatCard icon={<LucideShieldAlert />} title="Panic Responses" value={data?.summary?.panicEvents || 0} color="#f43f5e" />
                        <StatCard icon={<LucideAlertCircle />} title="High Risk Flags" value={data?.summary?.highRiskFlags || 0} color="#fbbf24" />
                        <StatCard icon={<LucideBrain />} title="AI Neural Sync" value="98.4%" color="#6366f1" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                        {/* 📉 STRESS TRENDS (Line Chart) */}
                        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[28px] sm:rounded-[48px] p-6 sm:p-10 md:p-14 backdrop-blur-3xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-5 sm:opacity-10 group-hover:opacity-20 transition-opacity">
                                <LucideTrendingUp size={120} className="w-16 h-16 sm:w-28 sm:h-28" />
                            </div>
                            <div className="relative z-10 space-y-6 sm:space-y-10">
                                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Global Stress Distribution</h3>
                                <div className="h-[250px] sm:h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data?.stressTrends}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis dataKey="_id" stroke="#ffffff40" fontSize={9} axisLine={false} tickLine={false} />
                                            <YAxis stroke="#ffffff40" fontSize={9} axisLine={false} tickLine={false} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#091426', border: '1px solid #ffffff10', borderRadius: '16px' }}
                                                itemStyle={{ color: '#00adef', fontSize: '11px' }}
                                            />
                                            <Line type="monotone" dataKey="avgStress" stroke="#00adef" strokeWidth={3} dot={{ r: 4, fill: '#00adef' }} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* 🍰 EVENT DISTRIBUTION (Pie Chart) */}
                        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[28px] sm:rounded-[48px] p-6 sm:p-10 md:p-14 backdrop-blur-3xl flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter mb-6 sm:mb-10">Neural Event Type</h3>
                                <div className="h-[200px] sm:h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data?.distribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={6}
                                                dataKey="count"
                                                nameKey="_id"
                                            >
                                                {data?.distribution?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                 contentStyle={{ backgroundColor: '#091426', border: '1px solid #ffffff10', borderRadius: '16px' }}
                                                 itemStyle={{ fontSize: '11px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="mt-6 sm:mt-10 space-y-3 sm:space-y-4 max-h-[180px] overflow-y-auto pr-1">
                                {data?.distribution?.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-[10px] sm:text-xs">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                            <span className="text-white/60 uppercase font-black">{item._id.replace(/_/g, ' ')}</span>
                                        </div>
                                        <span className="font-black">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick CMS and Explorer section */}
                    <footer className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        <div onClick={() => setActiveTab('shifts')} className="bg-[#00adef]/10 border border-[#00adef]/20 rounded-[28px] sm:rounded-[40px] p-6 sm:p-10 flex items-center justify-between group cursor-pointer hover:bg-[#00adef]/20 transition-all">
                            <div className="space-y-1 sm:space-y-2 pr-4">
                                <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight">Recovery Journey CMS</h4>
                                <p className="text-xs sm:text-sm text-[#00adef]/70 font-medium">Create, edit, and deploy new emotional paths instantly.</p>
                            </div>
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#00adef] rounded-xl sm:rounded-2xl flex items-center justify-center text-[#091426] shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                                <LucideLayers size={20} className="sm:w-6 sm:h-6" />
                            </div>
                        </div>
                        <div onClick={() => setActiveTab('users')} className="bg-white/5 border border-white/10 rounded-[28px] sm:rounded-[40px] p-6 sm:p-10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                            <div className="space-y-1 sm:space-y-2 pr-4">
                                <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight">AI User Audit</h4>
                                <p className="text-xs sm:text-sm text-white/40 font-medium">Audit registered system users and credentials.</p>
                            </div>
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform flex-shrink-0">
                                <LucideDatabase size={20} className="sm:w-6 sm:h-6" />
                            </div>
                        </div>
                    </footer>
                </motion.div>
            )}

            {/* TAB CONTENT: USERS DIRECTORY */}
            {activeTab === 'users' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">User Directory</h2>
                        <span className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-[1px] sm:tracking-[2px]">{users.length} Total Users</span>
                    </div>

                    {userMessage.text && (
                        <div className={`p-4 sm:p-6 rounded-[16px] sm:rounded-[24px] text-[10px] sm:text-xs font-bold uppercase tracking-[1px] ${userMessage.type === 'success' ? 'bg-[#00adef]/10 text-[#00adef] border border-[#00adef]/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {userMessage.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                        {/* Mobile Top Password Panel: shown only on mobile when selectedUser exists */}
                        {selectedUser && (
                            <div className="block lg:hidden lg:col-span-12 w-full">
                                {renderPasswordForm()}
                            </div>
                        )}

                        {/* Users Table */}
                        <div className={`${selectedUser ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white/5 border border-white/10 rounded-[28px] sm:rounded-[48px] p-4 sm:p-8 backdrop-blur-3xl overflow-hidden transition-all duration-300`}>
                            
                            {/* Desktop Table View: visible md and up */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-[9px] uppercase tracking-[3px] text-white/40">
                                            <th className="pb-6">User</th>
                                            <th className="pb-6">Email</th>
                                            <th className="pb-6">Role</th>
                                            <th className="pb-6">Status</th>
                                            <th className="pb-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map(u => (
                                            <tr key={u._id} className="text-sm group hover:bg-white/[0.02] transition-all">
                                                <td className="py-6 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-[#00adef]/15 border border-[#00adef]/30 flex items-center justify-center font-bold text-[#00adef] capitalize flex-shrink-0">
                                                        {u.name ? u.name[0] : '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white capitalize">{u.name}</p>
                                                        <p className="text-[10px] text-white/40">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </td>
                                                <td className="py-6 text-white/70 font-medium">{u.email}</td>
                                                <td className="py-6 font-semibold uppercase text-xs tracking-wider">
                                                    <span className={`px-3 py-1 rounded-full ${u.role === 'admin' ? 'bg-[#00adef]/10 text-[#00adef]' : 'bg-white/5 text-white/60'}`}>
                                                        {u.role || 'user'}
                                                    </span>
                                                </td>
                                                <td className="py-6">
                                                    {u.isHighRisk ? (
                                                        <Badge variant="subtle" color="rose" size="xs">High Risk</Badge>
                                                    ) : (
                                                        <Badge variant="subtle" color="teal" size="xs">Normal</Badge>
                                                    )}
                                                </td>
                                                <td className="py-6 text-right">
                                                    <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => setSelectedUser(u)}
                                                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                                                            title="Change Password"
                                                        >
                                                            <LucideLock size={16} className="text-amber-400" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all"
                                                            title="Delete User"
                                                        >
                                                            <LucideTrash2 size={16} className="text-rose-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card List: visible on screens smaller than md */}
                            <div className="block md:hidden space-y-4">
                                {users.map(u => (
                                    <div key={u._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#00adef]/15 border border-[#00adef]/30 flex items-center justify-center font-bold text-[#00adef] capitalize flex-shrink-0">
                                                    {u.name ? u.name[0] : '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white capitalize text-sm">{u.name}</p>
                                                    <p className="text-[9px] text-white/40">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-[#00adef]/10 text-[#00adef]' : 'bg-white/5 text-white/60'}`}>
                                                {u.role || 'user'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
                                            <span className="text-white/60 truncate pr-2 max-w-[170px]">{u.email}</span>
                                            {u.isHighRisk ? (
                                                <Badge variant="subtle" color="rose" size="xs">High Risk</Badge>
                                            ) : (
                                                <Badge variant="subtle" color="teal" size="xs">Normal</Badge>
                                            )}
                                        </div>

                                        <div className="flex gap-2 border-t border-white/5 pt-3 justify-end">
                                            <button 
                                                onClick={() => setSelectedUser(u)}
                                                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5"
                                            >
                                                <LucideLock size={12} /> Password
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center justify-center gap-1.5"
                                            >
                                                <LucideTrash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {users.length === 0 && (
                                    <div className="text-center py-10 text-white/30 text-xs">
                                        No users registered.
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Side Panel: Change Password */}
                        {selectedUser && (
                            <div className="hidden lg:block lg:col-span-4 space-y-6">
                                {renderPasswordForm()}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* TAB CONTENT: CREATE & MANAGE SHIFTS (EXERCISE CMS) */}
            {activeTab === 'shifts' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <LucidePlusCircle size={28} className="text-[#00adef] sm:w-9 sm:h-9" />
                            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">Shifts CMS</h2>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-[1px] sm:tracking-[2px]">{exercises.length} Total Shifts</span>
                    </div>

                    {exerciseMessage.text && (
                        <div className={`p-4 sm:p-6 rounded-[16px] sm:rounded-[24px] text-[10px] sm:text-xs font-bold uppercase tracking-[1px] ${exerciseMessage.type === 'success' ? 'bg-[#00adef]/10 text-[#00adef] border border-[#00adef]/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {exerciseMessage.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                        {/* Left Side: Exercise List */}
                        <div className="lg:col-span-6 bg-white/5 border border-white/10 rounded-[28px] sm:rounded-[48px] p-5 sm:p-8 overflow-hidden backdrop-blur-3xl space-y-4 sm:space-y-6">
                            <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white/60">Active Shifts</h3>
                            
                            <div className="space-y-3 sm:space-y-4 max-h-[400px] lg:max-h-[600px] overflow-y-auto pr-1">
                                {exercises.map(ex => (
                                    <div key={ex._id} className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex justify-between items-center group hover:bg-white/10 transition-all gap-4">
                                        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden bg-white/10 flex-shrink-0">
                                                <img src={ex.imageUrl} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <h4 className="font-bold text-white text-sm sm:text-base leading-tight truncate">{ex.title}</h4>
                                                <p className="text-[8px] sm:text-[10px] text-white/40 uppercase tracking-wider mt-1 truncate">{ex.category} • {ex.duration} mins</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button 
                                                onClick={() => handleEditSelect(ex)}
                                                className="p-2 sm:p-3 bg-white/5 hover:bg-[#00adef]/20 rounded-lg sm:rounded-xl transition-all"
                                                title="Edit Exercise"
                                            >
                                                <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-[#00adef]">edit</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteExercise(ex._id)}
                                                className="p-2 sm:p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg sm:rounded-xl transition-all"
                                                title="Delete Exercise"
                                            >
                                                <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-rose-400">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {exercises.length === 0 && (
                                    <div className="text-center py-10 text-white/30 text-xs">
                                        No exercise shifts found in the database. Use the builder on the right to create one.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Exercise Builder/Editor Form */}
                        <div className="lg:col-span-6">
                            <form onSubmit={handleSaveExercise} className="bg-white/5 border border-white/10 rounded-[28px] sm:rounded-[48px] p-5 sm:p-8 backdrop-blur-3xl space-y-4 sm:space-y-6">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                                        {editingExerciseId ? 'Edit Shift Exercise' : 'Create Recovery Shift'}
                                    </h3>
                                    {editingExerciseId && (
                                        <button 
                                            type="button" 
                                            onClick={handleCancelEdit}
                                            className="text-[10px] text-rose-400 hover:underline uppercase tracking-wider font-bold"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[2px] text-white/40">Exercise Title</label>
                                        <input 
                                            type="text" 
                                            value={exerciseForm.title}
                                            onChange={e => setExerciseForm(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="e.g. Somatic Stress Release"
                                            className="w-full px-5 py-3.5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#00adef]/40 text-xs sm:text-sm font-semibold"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[2px] text-white/40">Mins</label>
                                            <input 
                                                type="number" 
                                                value={exerciseForm.duration}
                                                onChange={e => setExerciseForm(prev => ({ ...prev, duration: e.target.value }))}
                                                placeholder="10"
                                                className="w-full px-4 py-3.5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#00adef]/40 text-xs sm:text-sm font-semibold"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[2px] text-white/40">Category</label>
                                            <select
                                                value={exerciseForm.category}
                                                onChange={e => setExerciseForm(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full px-3 py-3.5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 text-white outline-none focus:border-[#00adef]/40 text-[10px] sm:text-xs font-semibold select-dark"
                                            >
                                                <option value="Mindfulness" className="bg-[#091426]">Mindfulness</option>
                                                <option value="Nervous System" className="bg-[#091426]">Nervous System</option>
                                                <option value="Emotional Release" className="bg-[#091426]">Emotional Release</option>
                                                <option value="Cognitive" className="bg-[#091426]">Cognitive</option>
                                                <option value="Dopamine Recovery" className="bg-[#091426]">Dopamine Recovery</option>
                                                <option value="Emergency" className="bg-[#091426]">Emergency</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[2px] text-white/40">Exercise Image URL</label>
                                    <input 
                                        type="text" 
                                        value={exerciseForm.imageUrl}
                                        onChange={e => setExerciseForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                        placeholder="Unsplash/Direct image URL"
                                        className="w-full px-5 py-3.5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#00adef]/40 text-xs sm:text-sm font-semibold"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[2px] text-white/40">Short Description</label>
                                    <input 
                                        type="text" 
                                        value={exerciseForm.description}
                                        onChange={e => setExerciseForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe the therapeutic intent..."
                                        className="w-full px-5 py-3.5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#00adef]/40 text-xs sm:text-sm font-semibold"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[2px] text-white/40">Exercise Steps (One step per line)</label>
                                    <textarea 
                                        value={exerciseForm.content}
                                        onChange={e => setExerciseForm(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Step 1: Sit comfortably&#10;Step 2: Breathe deep..."
                                        className="w-full h-32 px-5 py-3.5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#00adef]/40 text-xs sm:text-sm font-semibold resize-none"
                                        required
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full py-4 bg-[#00adef] text-[#091426] font-black uppercase tracking-[2px] sm:tracking-[4px] text-[10px] rounded-2xl sm:rounded-3xl hover:bg-white hover:text-[#091426] transition-all"
                                >
                                    {editingExerciseId ? 'Update Shift Exercise' : 'Publish Shift Exercise'}
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            )}

        </div>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white/5 border border-white/10 rounded-[20px] sm:rounded-[32px] p-6 sm:p-10 backdrop-blur-2xl relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-5 group-hover:opacity-10 transition-opacity" style={{ color }}>
            {icon}
        </div>
        <div className="relative z-10 space-y-2 sm:space-y-4">
            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[4px] text-white/40">{title}</p>
            <h4 className="text-3xl sm:text-5xl font-black tracking-tighter" style={{ color }}>{value}</h4>
        </div>
    </motion.div>
);

const COLORS = ['#00adef', '#6366f1', '#f43f5e', '#fbbf24', '#0ea5e9', '#ec4899'];

export default AdminDashboard;
