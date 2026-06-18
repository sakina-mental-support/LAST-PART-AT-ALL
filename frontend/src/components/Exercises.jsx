import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmotionalOS } from '../context/EmotionalOSContext.jsx';
import { composeModularSession } from '../utils/sessionComposer';
import Badge from './Badge';

const Exercises = () => {
    const navigate = useNavigate();
    const { state, emitEvent, dispatch } = useEmotionalOS();

    const pathways = [
        { id: 'nervous', label: 'Reset My Body', icon: 'bolt', mood: 'Stressed', energy: 40, color: 'bg-rose-500/10 text-rose-500' },
        { id: 'quiet', label: 'Quiet My Mind', icon: 'visibility_off', mood: 'Anxious', energy: 60, color: 'bg-indigo-500/10 text-indigo-500' },
        { id: 'safe', label: 'Feel Safe', icon: 'shield_moon', mood: 'Overwhelmed', energy: 20, color: 'bg-slate-500/10 text-slate-500' },
        { id: 'energy', label: 'Get My Energy Back', icon: 'battery_charging_full', mood: 'Tired', energy: 10, color: 'bg-amber-500/10 text-amber-500' },
        { id: 'focus', label: 'Find My Focus', icon: 'center_focus_strong', mood: 'Calm', energy: 90, color: 'bg-[#00adef]/10 text-[#00adef]' },
        { id: 'yoga', label: 'Yoga Stretch', icon: 'self_improvement', mood: 'Stiff', energy: 50, color: 'bg-emerald-500/10 text-emerald-500' }
    ];

    const startPathway = (path) => {
        emitEvent('pathway_selected', path);
        dispatch({ type: 'SET_MOOD', payload: path.mood });
        const session = composeModularSession({ 
            currentMood: path.mood, 
            stressLevel: 100 - path.energy,
            emotionalEnergy: path.energy 
        });
        dispatch({ type: 'START_SESSION', payload: session });
        navigate('/exercise-detail', { state: { exercise: session } });
    };

    return (
        <div className="py-6 font-['Inter'] animate-fade-in space-y-24 pb-32 relative z-10">
            
            {/* 1. PATHWAY COMMAND CENTER */}
            <header className="space-y-12">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                    <div className="flex-1">
                        <Badge variant="solid" color="teal" size="sm" className="mb-8 tracking-[8px] uppercase !bg-[#00adef]/10 !text-[#00adef]">The Sanctuary</Badge>
                        <h1 className="font-['Inter'] text-5xl sm:text-7xl lg:text-9xl font-bold text-[#091426] tracking-tighter uppercase leading-[0.8]">
                            Mind <br />
                            <span className="text-[#00adef] italic">Tools.</span>
                        </h1>
                    </div>
                    <div className="hidden lg:flex gap-4">
                        <div className="w-40 h-40 rounded-[48px] bg-white shadow-sakina flex items-center justify-center group hover:bg-[#091426] transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-4xl text-[#00adef] group-hover:text-white group-hover:rotate-12 transition-all">neurology</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. PREMIUM BENTO PATHWAYS */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative">
                {/* Decorative Blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00adef]/5 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] animate-blob delay-1000"></div>

                {pathways.map((path, i) => (
                    <div 
                        key={path.id}
                        onClick={() => startPathway(path)}
                        className={`relative h-[480px] rounded-[64px] p-12 bg-white/70 backdrop-blur-xl shadow-sakina border border-white/40 flex flex-col justify-between group overflow-hidden cursor-pointer hover:shadow-sakina-lg hover:-translate-y-4 transition-all duration-700`}
                    >
                        <div className={`absolute top-[-10%] right-[-10%] w-56 h-56 rounded-full blur-[80px] opacity-10 transition-all duration-700 group-hover:scale-150 group-hover:opacity-30 ${path.color.split(' ')[0]}`}></div>
                        
                        <div className="relative z-10">
                            <div className={`w-24 h-24 rounded-[40px] flex items-center justify-center mb-10 transition-all duration-700 group-hover:rotate-12 shadow-inner border border-white/50 ${path.color}`}>
                                <span className="material-symbols-outlined text-5xl">{path.icon}</span>
                            </div>
                            <h3 className="text-4xl font-bold text-[#091426] tracking-tighter uppercase leading-none mb-4 group-hover:text-[#00adef] transition-colors">{path.label}</h3>
                            <p className="text-[10px] text-gray-400 font-black tracking-[3px] uppercase opacity-60">Help with: {path.mood}</p>
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-[3px] text-gray-400">Boost Level</p>
                                    <p className="text-3xl font-['Inter'] font-bold text-[#091426]">+{path.energy}%</p>
                                </div>
                                <div className="w-16 h-16 rounded-full border-4 border-gray-50 flex items-center justify-center group-hover:border-[#00adef] transition-colors">
                                    <span className="material-symbols-outlined text-[#00adef] opacity-0 group-hover:opacity-100 transition-all">play_arrow</span>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden p-0.5">
                                <div className="h-full bg-gradient-to-r from-[#00adef] to-teal-300 rounded-full transition-all duration-[2000ms] group-hover:w-full" style={{ width: `${path.energy}%` }}></div>
                            </div>
                            <button className="w-full py-7 bg-[#091426] text-white rounded-[32px] font-black uppercase tracking-[15px] text-[10px] shadow-2xl scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all translate-y-8 group-hover:translate-y-0">Launch</button>
                        </div>
                    </div>
                ))}
                
                {/* Custom Generator Card (Large) */}
                <div 
                    onClick={() => startPathway({ label: 'Smart Reset', mood: state.currentMood, energy: 100 })}
                    className="col-span-1 md:col-span-2 lg:col-span-1 bg-[#091426] rounded-[64px] p-12 text-white relative overflow-hidden group cursor-pointer shadow-sakina-lg flex flex-col justify-between h-[480px]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00adef]/30 to-transparent opacity-60 group-hover:scale-125 transition-transform duration-[5s]"></div>
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#00adef]/20 rounded-full blur-[100px] animate-pulse"></div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <Badge variant="solid" color="teal" size="sm" className="!bg-[#00adef]/20 !text-[#00adef] tracking-[8px] uppercase">Smart Mind</Badge>
                        <div className="w-20 h-20 rounded-[32px] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-[#00adef] animate-pulse">psychology_alt</span>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-6xl font-bold tracking-tighter uppercase leading-[0.85] mb-8">
                            Smart <br /> <span className="text-[#00adef]">Mix.</span>
                        </h3>
                        <p className="text-gray-400 text-base font-medium leading-relaxed opacity-60 max-w-[200px]">Let the AI create a custom session just for you right now.</p>
                    </div>
                </div>
            </section>

            {/* 3. PATIENT HISTORY CONTEXT (The Concept Link) */}
            <section className="space-y-12">
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-['Inter'] font-bold text-[#091426] tracking-tighter uppercase">Recent <span className="text-[#00adef]">Timeline.</span></h2>
                    <Badge variant="subtle" color="teal" size="xs">{state.history.length} Sessions Logged</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {state.history.slice(0, 4).map((entry, i) => (
                        <div key={i} className="bg-white/50 backdrop-blur-md rounded-[48px] p-10 border border-white flex items-center gap-10 shadow-sm opacity-60 hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-[#091426]">
                                <span className="material-symbols-outlined">history</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-[#091426] tracking-tighter uppercase">{entry.title}</h4>
                                <p className="text-[10px] font-black text-[#00adef] uppercase tracking-[3px] mt-1">{new Date(entry.completedAt).toLocaleDateString()} Recovery</p>
                            </div>
                        </div>
                    ))}
                    {state.history.length === 0 && (
                        <div className="col-span-2 py-20 text-center border-2 border-dashed border-gray-100 rounded-[56px]">
                            <p className="text-gray-300 font-bold uppercase tracking-[5px] text-xs">No History Detected. Start your journey.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Exercises;