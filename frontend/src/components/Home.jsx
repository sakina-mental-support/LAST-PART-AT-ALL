import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmotionalOS } from '../context/EmotionalOSContext.jsx';
import { useEmotionalBrain } from '../store/useEmotionalBrain';
import { composeEmotionalShift } from '../utils/sessionComposer';
import Badge from './Badge';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const navigate = useNavigate();
    const { state, dispatch, emitEvent } = useEmotionalOS();
    const brain = useEmotionalBrain();
    const { user } = useAuth();
    const { metrics, ui } = brain;
    const [greeting, setGreeting] = useState("Good Morning");
    
    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin');
            return;
        }

        const hasOnboarded = localStorage.getItem('sakina_onboarding');
        if (!hasOnboarded) navigate('/onboarding');

        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 17) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, [navigate, user]);

    const handleQuickReset = () => {
        navigate('/back-to-safe');
    };

    const handleGenerateShift = () => {
        const shift = composeEmotionalShift(state);
        dispatch({ type: 'START_SESSION', payload: shift });
        navigate('/intervention-detail', { state: { exercise: shift } });
    };

    return (
        <div className="py-6 font-['Inter'] animate-fade-in space-y-16 pb-24 relative z-10">
            
            {/* 🚀 NEURAL PULSE HEADER */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-10 mb-8 sm:mb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Badge variant="solid" color="teal" size="sm" className="tracking-[5px] uppercase !bg-[#00adef]/10 !text-[#00adef] border border-[#00adef]/20">
                            {state.activeWorld} Mode Active
                        </Badge>
                        <div className="flex gap-1.5 items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00adef] shadow-[0_0_10px_rgba(0,162,146,0.5)] animate-pulse"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00adef]/30"></div>
                        </div>
                    </div>
                    <h1 className="font-['Inter'] text-5xl sm:text-7xl lg:text-9xl font-bold tracking-tighter uppercase leading-[0.8] text-gradient-sakina py-2">
                        {greeting}, <br />
                        <span className="italic opacity-80">Recovering?</span>
                    </h1>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handleQuickReset}
                        className="px-8 sm:px-14 py-6 sm:py-10 bg-rose-500 text-white rounded-[32px] sm:rounded-[48px] shadow-2xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 sm:gap-6 group animate-pulse-glow"
                    >
                        <span className="material-symbols-outlined text-xl sm:text-2xl group-hover:rotate-45 transition-transform">emergency</span>
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[3px] sm:tracking-[5px]">Panic Mode</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                
                {/* 🚀 ADAPTIVE NEURAL HERO */}
                <div className="lg:col-span-8 group h-full">
                    <div className="h-full flex flex-col justify-center bg-[#091426] rounded-[48px] sm:rounded-[80px] p-10 sm:p-20 md:p-28 text-white relative overflow-hidden shadow-sakina-lg transition-all duration-[2000ms] border border-white/5 animate-float">
                        {/* Dynamic Background Elements */}
                        <div className={`absolute top-[-20%] right-[-10%] w-[90%] h-[130%] bg-gradient-to-br from-[#00adef]/20 to-transparent rounded-full blur-[160px] transition-all duration-[3000ms] ${state.stressLevel > 70 ? 'animate-pulse scale-150 opacity-40' : 'animate-blob opacity-20'}`}></div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#091426] via-[#091426] to-[#00adef]/10 animate-gradient-shift"></div>
                        
                        <div className="relative z-10 space-y-10 sm:space-y-14">
                            <Badge variant="solid" color="teal" size="sm" className="tracking-[8px] !bg-white/5 border border-white/10 backdrop-blur-md">Smart Mind Layer</Badge>
                            
                            <div className="space-y-6 sm:space-y-8">
                                <h2 className="text-4xl sm:text-6xl lg:text-8xl font-['Inter'] font-bold tracking-tighter uppercase leading-[0.85]">
                                    Your <span className="text-[#00adef] drop-shadow-[0_0_20px_rgba(0,162,146,0.3)]">Body</span> <br />
                                    Needs a Moment.
                                </h2>
                                <p className="text-gray-400 text-lg sm:text-2xl lg:text-3xl font-medium leading-[1.4] max-w-2xl opacity-70">
                                    {metrics.stress > 70 
                                        ? "I see your stress levels are elevated. Let's take a moment to reset together."
                                        : metrics.stress > 40
                                        ? "You're doing okay, but let's prevent any burnout before it starts."
                                        : "You are in a state of flow. Perfect time to maintain this focus."}
                                </p>
                            </div>

                            
                        </div>
                    </div>
                </div>

                {/* 🚀 AI COMPANION (Replaced Metrics) */}
                <div className="lg:col-span-4 h-full">
                    <div className="group relative h-full flex flex-col cursor-pointer animate-float" style={{ animationDelay: '1s' }} onClick={() => navigate('/chat')}>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-[#00adef]/10 blur-[60px] rounded-[56px] scale-90 opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
                        
                        {/* Premium Card */}
                        <div className="bg-white rounded-[48px] sm:rounded-[80px] p-10 sm:p-14 flex flex-col justify-between h-full hover:bg-[#f7f9fb] transition-all duration-700 border border-transparent group-hover:border-[#00adef]/20 shadow-sakina group-hover:shadow-sakina-lg relative z-10 flex-1 overflow-hidden">
                            {/* Top Badge */}
                            <div className="flex justify-between items-center w-full mb-10">
                                <div className="w-3 h-3 rounded-full bg-[#00adef] animate-pulse shadow-[0_0_10px_rgba(0,173,239,0.5)]"></div>
                                <span className="text-[9px] font-black uppercase tracking-[4px] text-gray-300">Neural Sync</span>
                            </div>

                            {/* Core AI Visual */}
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 py-10">
                                <div className="relative">
                                    <div className="absolute inset-0 border-2 border-[#00adef]/20 rounded-[48px] animate-[spin_10s_linear_infinite] scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[40px] bg-[#f7f9fb] group-hover:bg-white text-[#00adef] flex items-center justify-center shadow-inner group-hover:shadow-sakina border border-white group-hover:scale-105 transition-all duration-700 relative z-10">
                                        <span className="material-symbols-outlined text-6xl sm:text-7xl group-hover:drop-shadow-[0_0_15px_rgba(0,173,239,0.4)]">psychology</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h4 className="text-3xl sm:text-4xl font-black text-[#091426] tracking-tighter">AI Companion</h4>
                                    <p className="text-[10px] font-black text-[#00adef] uppercase tracking-[6px] opacity-80 bg-[#00adef]/10 py-2 px-4 rounded-full inline-block">
                                        {state.aiContext.style || "Empathetic"} Mode
                                    </p>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between group-hover:border-[#00adef]/20 transition-colors duration-700">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[3px] group-hover:text-[#091426] transition-colors">Start Session</span>
                                <div className="w-12 h-12 rounded-full bg-[#091426] text-white flex items-center justify-center group-hover:bg-[#00adef] group-hover:scale-110 group-hover:rotate-45 transition-all duration-500 shadow-lg">
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
