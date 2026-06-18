import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Badge from './Badge';
import { useEmotionalOS } from '../context/EmotionalOSContext.jsx';
import { saveInterventionSession } from '../services/api';

const InterventionDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state, dispatch, emitEvent } = useEmotionalOS();
    const shift = location.state?.exercise || state.activeSession;
    
    const [phase, setPhase] = useState('briefing'); // 'briefing', 'transport', 'intervention', 'integrated'
    const [activeBlockIndex, setActiveBlockIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [breathState, setBreathState] = useState('Inhale');
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

    const currentBlock = shift?.blocks ? shift.blocks[activeBlockIndex] : null;

    useEffect(() => {
        if (!shift) { navigate('/exercises'); return; }
        const timer = setTimeout(() => setPhase('intervention'), 5000);
        return () => clearTimeout(timer);
    }, [shift, navigate]);

    useEffect(() => {
        if (phase === 'intervention' && currentBlock) {
            const blockDuration = 25;
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        if (activeBlockIndex < shift.blocks.length - 1) {
                            setActiveBlockIndex(prevIdx => prevIdx + 1);
                            return 0;
                        } else {
                            clearInterval(interval);
                            setPhase('integrated');
                            dispatch({ type: 'COMPLETE_SESSION', payload: shift });
                            // Persist to MongoDB
                            saveInterventionSession({
                                title: shift.title || shift.world,
                                world: shift.world,
                                color: shift.color,
                                moodBefore: shift.mood || 'Unknown',
                                blocks: shift.blocks || [],
                                stressLevel: state.stressLevel,
                            }).catch(() => {});
                            return 100;
                        }
                    }
                    return prev + (100 / (blockDuration * 10));
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [phase, currentBlock, activeBlockIndex, shift, dispatch]);

    useEffect(() => {
        if (phase === 'intervention') {
            const cycle = setInterval(() => {
                setBreathState(prev => prev === 'Inhale' ? 'Exhale' : 'Inhale');
            }, 5000);
            return () => clearInterval(cycle);
        }
    }, [phase]);

    const handleMouseMove = (e) => {
        setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };

    if (!shift) return null;

    return (
        <div 
            onMouseMove={handleMouseMove}
            className={`fixed inset-0 z-[100] flex flex-col font-['Inter'] overflow-hidden transition-all duration-[3000ms] bg-[#091426] text-white`}
        >
            
            {/* 🌊 CINEMATIC VIDEO ENGINE */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-[5000ms] ${phase === 'integrated' ? 'opacity-10 blur-2xl' : 'opacity-60 blur-sm scale-110'}`}
                    src={shift.video}
                ></video>
                {/* Deep Gradient Overlay to anchor the Sakina Navy */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#091426] via-transparent to-[#091426] opacity-80"></div>
                <div className="absolute inset-0 bg-[#091426]/40"></div>
                
                {/* Generative Ripples */}
                {phase === 'intervention' && !currentBlock.id.includes('cog') && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                            <div 
                                key={i}
                                className="absolute rounded-full border border-[#00adef]/30 animate-ripple shadow-[0_0_30px_rgba(0,162,146,0.2)]"
                                style={{ animationDelay: `${i * 2.5}s` }}
                            ></div>
                        ))}
                    </div>
                )}
            </div>

            {/* 🎬 PHASE 0: THE BRIEFING */}
            {phase === 'briefing' && (
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 sm:px-20 text-center animate-in fade-in zoom-in duration-[2000ms]">
                    <div className="max-w-5xl space-y-16 py-20 px-10 bg-[#091426]/30 backdrop-blur-3xl rounded-[64px] border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00adef]/20 rounded-full blur-[100px]"></div>
                        
                        <div className="space-y-6 relative z-10">
                            <Badge variant="solid" color="teal" size="sm" className="tracking-[12px] uppercase !bg-[#00adef]/20 !text-[#00adef]">Neural Briefing v8.0</Badge>
                            <h1 className="text-6xl sm:text-[140px] font-['Inter'] font-black tracking-[-0.08em] uppercase leading-none text-white drop-shadow-2xl">
                                {shift.title}
                            </h1>
                        </div>
                        
                        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#00adef] to-transparent mx-auto"></div>
                        
                        <p className="text-xl sm:text-4xl font-['Inter'] font-medium text-white/70 leading-relaxed italic max-w-4xl mx-auto px-4">
                            "{shift.story}"
                        </p>

                        <button 
                            onClick={() => setPhase('transport')}
                            className="group relative px-20 sm:px-48 py-10 sm:py-16 bg-[#00adef] text-white rounded-full font-black uppercase tracking-[15px] sm:tracking-[30px] text-[10px] sm:text-xs overflow-hidden transition-all hover:scale-105 hover:bg-[#00c9b6] shadow-[0_20px_50px_rgba(0,162,146,0.3)] active:scale-95"
                        >
                            <span className="relative z-10">Initiate Mission</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>
                    </div>
                </div>
            )}

            {/* 🎬 PHASE 1: TRANSPORT */}
            {phase === 'transport' && (
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center animate-in zoom-in fade-in duration-[4000ms]">
                    <div className="space-y-16 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 blur-[80px] bg-[#00adef]/30 scale-150 animate-pulse"></div>
                            <h1 className="relative text-8xl sm:text-[220px] font-['Inter'] font-black text-white tracking-[-0.1em] uppercase leading-[0.75]">
                                Deep <br />
                                <span className="text-[#00adef] italic">Breath.</span>
                            </h1>
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[25px] text-[#00adef]/40 animate-pulse">Neural Synchronization Active</p>
                    </div>
                </div>
            )}

            {/* 🎬 PHASE 2: THE PULSE */}
            {phase === 'intervention' && currentBlock && (
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 text-center">
                    <div className="w-full flex flex-col items-center">
                        <div className="relative flex flex-col items-center justify-center min-h-[60vh] w-full">
                            
                            {/* Inner Glowing Core */}
                            <div className={`absolute w-12 h-12 rounded-full bg-white transition-all duration-[5000ms] shadow-[0_0_120px_#00adef] ${breathState === 'Inhale' ? 'scale-[60] opacity-5' : 'scale-1 opacity-100'}`}></div>

                            {/* Main Breathing Text */}
                            <div className="relative z-30 space-y-12">
                                {currentBlock.id.includes('cog') ? (
                                    <div className="animate-in slide-in-from-bottom-20 duration-[2000ms] bg-[#091426]/40 backdrop-blur-2xl p-20 rounded-[64px] border border-white/10">
                                        <h3 className="text-5xl sm:text-[140px] font-['Inter'] font-black text-white uppercase tracking-tighter italic leading-none mb-10">Interrupt.</h3>
                                        <p className="text-2xl sm:text-5xl font-bold text-[#00adef] leading-tight max-w-5xl mx-auto italic">"{currentBlock.instruction}"</p>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className={`text-8xl sm:text-[260px] font-['Inter'] font-black text-white uppercase tracking-[-0.06em] leading-none transition-all duration-[5000ms] ${breathState === 'Inhale' ? 'opacity-100 scale-110 blur-0' : 'opacity-10 scale-90 blur-md'}`}>
                                            {breathState}
                                        </h3>
                                        <div className="h-[4px] w-64 sm:w-[600px] bg-white/10 mx-auto rounded-full overflow-hidden p-[1px]">
                                            <div className="h-full bg-[#00adef] shadow-[0_0_15px_#00adef] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Instruction Layer */}
                            {!currentBlock.id.includes('cog') && (
                                <div className="absolute bottom-[-150px] sm:bottom-[-200px] w-full px-10">
                                    <div className="inline-block px-12 py-6 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 animate-pulse">
                                        <p className="text-xl sm:text-4xl font-['Inter'] font-bold italic text-white/80 tracking-tight leading-relaxed">
                                            "{currentBlock.instruction}"
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 🎬 PHASE 3: INTEGRATED */}
            {phase === 'integrated' && (
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 text-center animate-in zoom-in fade-in duration-[2000ms]">
                    <div className="max-w-6xl space-y-24 flex flex-col items-center">
                        <div className="space-y-6">
                            <Badge variant="solid" color="teal" size="sm" className="tracking-[20px] mx-auto !bg-[#00adef]/20 !text-[#00adef]">Neural Harmony Achieved</Badge>
                            <h2 className="text-7xl sm:text-[200px] font-['Inter'] font-black text-white tracking-[-0.08em] uppercase leading-[0.75]">
                                Still <br /> <span className="text-[#00adef]">Now.</span>
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-10 sm:gap-48">
                            <div className="text-center">
                                <p className="text-[12px] font-black uppercase tracking-[8px] text-white/30 mb-6">State Shift</p>
                                <p className="text-6xl sm:text-[120px] font-black text-white tracking-tighter">+56%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[12px] font-black uppercase tracking-[8px] text-white/30 mb-6">Neural Noise</p>
                                <p className="text-6xl sm:text-[120px] font-black text-[#00adef] tracking-tighter">-72%</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/exercises')}
                            className="group relative px-24 sm:px-64 py-10 sm:py-16 bg-[#00adef] text-white rounded-full font-black uppercase tracking-[20px] sm:tracking-[40px] text-[12px] sm:text-sm shadow-[0_30px_60px_rgba(0,162,146,0.3)] hover:scale-105 hover:bg-[#00c9b6] transition-all"
                        >
                            <span className="relative z-10">Return to Sanctuary</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Cinematic HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#091426] to-transparent"></div>
                <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#091426] to-transparent"></div>
            </div>

            {/* Exit Control */}
            <div className="absolute bottom-10 sm:bottom-24 right-10 sm:right-24 z-[200]">
                <button 
                    onClick={() => navigate('/exercises')} 
                    className="group w-20 h-20 sm:w-32 sm:h-32 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
                >
                    <span className="material-symbols-outlined text-3xl sm:text-5xl transition-transform group-hover:rotate-90">close</span>
                </button>
            </div>
        </div>
    );
};

export default InterventionDetail;
