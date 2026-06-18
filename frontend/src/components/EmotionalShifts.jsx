import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmotionalOS } from '../context/EmotionalOSContext.jsx';
import { composeEmotionalShift } from '../utils/sessionComposer';
import Badge from './Badge';

const EmotionalShifts = () => {
    const navigate = useNavigate();
    const { state, emitEvent, dispatch } = useEmotionalOS();

    const pathways = [
        { id: 'ns_reset', label: 'Reset My Body', icon: 'bolt', mood: 'Stressed', system: 'Fast Reset', color: 'text-rose-500 bg-rose-500/10' },
        { id: 'yoga_sync', label: 'Yoga Stretch', icon: 'self_improvement', mood: 'Stiff', system: 'Body Flow', color: 'text-emerald-500 bg-emerald-500/10' },
        { id: 'cog_break', label: 'Quiet My Mind', icon: 'published_with_changes', mood: 'Anxious', system: 'Mind Break', color: 'text-indigo-500 bg-indigo-500/10' },
        { id: 'env_escape', label: 'Peaceful Escape', icon: 'explore', mood: 'Overwhelmed', system: 'World Shift', color: 'text-slate-500 bg-slate-500/10' },
        { id: 'sensory_sync', label: 'Sensory Balance', icon: 'graphic_eq', mood: 'Balanced', system: 'Neural Sync', color: 'text-[#00adef] bg-[#00adef]/10' }
    ];

    const initiateShift = (path) => {
        emitEvent('intervention_triggered', path);
        const shift = composeEmotionalShift({ ...state, currentMood: path.mood });
        dispatch({ type: 'START_SESSION', payload: shift });
        navigate('/intervention-detail', { state: { exercise: shift } });
    };

    return (
        <div className="py-6 font-['Inter'] animate-fade-in space-y-24 pb-32 relative z-10">
            
            {/* 🚀 Intervention Command Center */}
            <header className="space-y-6 sm:space-y-8">
                <Badge variant="solid" color="teal" size="sm" className="mb-4 sm:mb-6 tracking-[6px] sm:tracking-[8px] uppercase !bg-[#00adef]/10 !text-[#00adef]">Intervention Engine v6.0</Badge>
                <h1 className="font-['Inter'] text-4xl sm:text-7xl lg:text-9xl font-bold text-[#091426] tracking-tighter uppercase leading-[0.8]">
                    Emotional <br />
                    <span className="text-[#00adef] italic">Shifts.</span>
                </h1>
                <p className="text-gray-400 text-base sm:text-2xl font-medium max-w-2xl leading-relaxed opacity-60">
                    Don't just "do exercises." Transform your state instantly using the Sakina neural intervention systems.
                </p>
            </header>

            {/* 🚀 THE INTERVENTION GRID */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                {pathways.map((path) => (
                    <div 
                        key={path.id}
                        onClick={() => initiateShift(path)}
                        className="group bg-white rounded-[32px] sm:rounded-[64px] p-8 sm:p-16 shadow-sakina border border-gray-50 flex flex-col justify-between h-[350px] sm:h-[500px] cursor-pointer sm:hover:-translate-y-4 transition-all duration-700 relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 p-8 sm:p-16 opacity-5 sm:opacity-10 group-hover:opacity-20 transition-opacity`}>
                            <span className="material-symbols-outlined text-[100px] sm:text-[180px]">{path.icon}</span>
                        </div>
 
                        <div className="relative z-10">
                            <Badge variant="glass" color="teal" size="sm" className="mb-6 sm:mb-10 tracking-[3px] sm:tracking-[4px]">{path.system}</Badge>
                            <h3 className="text-3xl sm:text-6xl font-bold text-[#091426] tracking-tighter uppercase leading-none mb-4 sm:mb-6">
                                {path.label}
                            </h3>
                            <p className="text-[9px] sm:text-[10px] font-black text-gray-300 uppercase tracking-[3px] sm:tracking-[4px]">Targets: {path.mood} state</p>
                        </div>
 
                        <div className="relative z-10 flex items-end justify-between">
                            <div className="flex gap-2">
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#00adef] animate-pulse"></div>
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[3px] text-[#00adef]">Live Protocol Active</span>
                            </div>
                            <button className="px-6 sm:px-12 py-3 sm:py-6 bg-[#091426] text-white rounded-[20px] sm:rounded-[32px] font-black uppercase tracking-[4px] sm:tracking-[8px] text-[9px] sm:text-[10px] shadow-2xl group-hover:bg-[#00adef] transition-colors">Initiate</button>
                        </div>
                    </div>
                ))}
            </section>

            {/* 🚀 AI TRANSPORTER HUD */}
            <section className="bg-[#091426] rounded-[32px] sm:rounded-[64px] p-8 sm:p-16 md:p-24 text-white relative overflow-hidden group shadow-sakina-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00adef]/20 to-transparent opacity-40"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 sm:gap-16 text-center lg:text-left">
                    <div className="flex-1 space-y-6 sm:space-y-10">
                        <Badge variant="solid" color="teal" size="xs" className="!bg-[#00adef]/20 !text-[#00adef] tracking-[3px] sm:tracking-[5px] mx-auto lg:mx-0">Neural AI Transporter</Badge>
                        <h2 className="text-3xl sm:text-5xl lg:text-7xl font-['Inter'] font-bold tracking-tighter uppercase leading-[0.9]">
                            Let me shift <br />
                            <span className="text-[#00adef]">your reality.</span>
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                            "I am detecting high cognitive load. I can slow your mind down by 40% in the next 90 seconds. Would you like to enter a quieter world?"
                        </p>
                        <button onClick={() => initiateShift(pathways[0])} className="w-full sm:w-auto px-8 sm:px-16 py-4 sm:py-8 bg-white text-[#091426] rounded-full font-black uppercase tracking-[6px] sm:tracking-[12px] text-[10px] sm:text-xs shadow-2xl hover:bg-[#00adef] hover:text-white transition-all">Start Neural Transport</button>
                    </div>
                    <div className="w-32 h-32 sm:w-64 sm:h-64 bg-white/5 rounded-[32px] sm:rounded-[56px] border border-white/10 flex items-center justify-center animate-spin-slow">
                        <span className="material-symbols-outlined text-[60px] sm:text-[100px] text-[#00adef]">rocket_launch</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default EmotionalShifts;
