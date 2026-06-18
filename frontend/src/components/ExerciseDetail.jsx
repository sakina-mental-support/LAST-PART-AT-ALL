import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Badge from './Badge';
import { useEmotionalOS } from '../context/EmotionalOSContext.jsx';

const ExerciseDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state, dispatch, emitEvent } = useEmotionalOS();
    
    // 🛡️ Robust State Recovery
    const exercise = location.state?.exercise || state.activeSession || null;
    
    const [phase, setPhase] = useState('narrative');
    const [activeBlockIndex, setActiveBlockIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [breathState, setBreathState] = useState('Inhale'); 
    const [instruction, setInstruction] = useState("Initializing neural environment...");

    // Safe access to current block
    const currentBlock = exercise?.blocks ? exercise.blocks[activeBlockIndex] : null;

    useEffect(() => {
        if (!exercise || !exercise.blocks) {
            console.error("Critical: No exercise or blocks found. Redirecting to safety.");
            navigate('/exercises');
            return;
        }

        const timer = setTimeout(() => {
            setPhase('interaction');
            emitEvent('session_interaction_started', { sessionId: exercise.id });
        }, 5000);
        return () => clearTimeout(timer);
    }, [exercise, navigate, emitEvent]);

    useEffect(() => {
        if (phase === 'interaction' && currentBlock) {
            setInstruction(currentBlock.instruction || "Focus on the pulse.");
            
            const cycle = setInterval(() => {
                setBreathState(prev => {
                    if (prev === 'Inhale') return 'Hold';
                    if (prev === 'Hold') return 'Exhale';
                    return 'Inhale';
                });
            }, 4000);
            return () => clearInterval(cycle);
        }
    }, [phase, currentBlock]);

    useEffect(() => {
        if (phase === 'interaction' && exercise?.blocks) {
            const blockDuration = 25; 
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        if (activeBlockIndex < exercise.blocks.length - 1) {
                            setActiveBlockIndex(prevIdx => prevIdx + 1);
                            return 0;
                        } else {
                            clearInterval(interval);
                            setPhase('post');
                            dispatch({ type: 'COMPLETE_SESSION', payload: exercise });
                            return 100;
                        }
                    }
                    return prev + (100 / (blockDuration * 10));
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [phase, activeBlockIndex, exercise, dispatch]);

    // 🛡️ Final Render Safety
    if (!exercise) {
        return (
            <div className="fixed inset-0 bg-[#f7f9fb] flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-[#00adef] animate-pulse">
                        <span className="material-symbols-outlined text-4xl">sync</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[5px] text-gray-400">Syncing Neural Data...</p>
                </div>
            </div>
        );
    }

    const theme = {
        'Ocean World': { color: '#00adef', bg: 'bg-[#f0f9f8]' },
        'Fog World': { color: '#6366f1', bg: 'bg-[#f5f5ff]' },
        'Night Sky': { color: '#fbbf24', bg: 'bg-[#091426]' },
        'Forest World': { color: '#10b981', bg: 'bg-[#f0fff4]' }
    };
    const activeTheme = theme[exercise.world] || theme['Ocean World'];

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col font-['Inter'] overflow-hidden transition-all duration-[2000ms] ${activeTheme.bg}`}>
            
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent z-10"></div>
                <img src={exercise.imageUrl} className="w-full h-full object-cover opacity-10 blur-sm scale-110" alt="Atmosphere" />
            </div>

            {/* Neural HUD */}
            <div className="absolute top-6 sm:top-12 left-6 sm:left-12 right-6 sm:right-12 z-20 flex justify-between items-center">
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#00adef] border border-gray-100">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">{currentBlock?.icon || 'neurology'}</span>
                    </div>
                    <div>
                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[3px] sm:tracking-[5px] text-gray-300">Phase {activeBlockIndex + 1} of {exercise.blocks?.length}</p>
                        <h4 className="text-xs sm:text-sm font-bold text-[#091426] tracking-tight truncate max-w-[150px] sm:max-w-none">{currentBlock?.title}</h4>
                    </div>
                </div>
            </div>

            {/* Experience Center */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 text-center">
                
                {phase === 'narrative' && (
                    <div className="max-w-5xl space-y-10 sm:space-y-16 animate-in fade-in zoom-in duration-[2500ms]">
                        <Badge variant="solid" color="teal" size="sm" className="mb-6 sm:mb-12 tracking-[6px] sm:tracking-[10px] uppercase !bg-[#00adef]/10 !text-[#00adef]">Initialization</Badge>
                        <h1 className="text-4xl sm:text-7xl font-['Inter'] font-bold text-[#091426] tracking-tighter uppercase leading-[0.95]">
                            Preparing your <br />
                            <span className="text-[#00adef] italic">{exercise.world}</span> protocol.
                        </h1>
                        <div className="w-32 sm:w-64 h-1 bg-gray-100 mx-auto rounded-full overflow-hidden">
                            <div className="h-full bg-[#00adef] animate-shimmer w-full"></div>
                        </div>
                    </div>
                )}

                {phase === 'interaction' && currentBlock && (
                    <div className="w-full max-w-6xl flex flex-col items-center animate-in fade-in duration-2000">
                        <div className="relative w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] flex items-center justify-center mb-10 sm:mb-16">
                            <div className={`absolute inset-0 bg-[#00adef]/5 rounded-full transition-all duration-[4000ms] ${breathState === 'Inhale' ? 'scale-100 opacity-30' : 'scale-50 opacity-0'}`}></div>
                            
                            <div className={`w-[160px] h-[160px] sm:w-[280px] sm:h-[280px] rounded-[50px] sm:rounded-[90px] bg-white border border-gray-100 flex flex-col items-center justify-center shadow-xl transition-all duration-[4000ms] ${breathState === 'Inhale' ? 'scale-110' : 'scale-90'}`}>
                                <h3 className="text-2xl sm:text-5xl font-['Inter'] font-bold text-[#091426] uppercase tracking-tighter mb-2 sm:mb-4">{breathState}</h3>
                                <div className="flex gap-1">
                                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${breathState === 'Inhale' ? 'bg-[#00adef]' : 'bg-gray-100'}`}></div>
                                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${breathState === 'Hold' ? 'bg-[#00adef]' : 'bg-gray-100'}`}></div>
                                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${breathState === 'Exhale' ? 'bg-[#00adef]' : 'bg-gray-100'}`}></div>
                                </div>
                            </div>

                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="50%" cy="50%" r="45%" className="stroke-gray-100/50 fill-none" strokeWidth="2" />
                                <circle 
                                    cx="50%" cy="50%" r="45%" 
                                    className="stroke-[#00adef] fill-none transition-all duration-300" 
                                    strokeWidth="4"
                                    style={{
                                        strokeDasharray: '283%',
                                        strokeDashoffset: `${283 - (283 * progress) / 100}%`
                                    }}
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        <div className="max-w-2xl space-y-6 sm:space-y-8">
                            <h2 className="text-3xl sm:text-5xl font-['Inter'] font-bold text-[#091426] tracking-tighter uppercase leading-tight px-4">{exercise.title}</h2>
                            <div className="bg-white/40 backdrop-blur-md px-6 sm:px-10 py-5 sm:py-8 rounded-[24px] sm:rounded-[40px] border border-white shadow-sm mx-4">
                                <p className="text-sm sm:text-lg font-medium text-[#091426] leading-relaxed italic opacity-80">
                                    "{instruction}"
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {phase === 'post' && (
                    <div className="max-w-4xl space-y-10 sm:space-y-16 animate-in zoom-in duration-[1500ms] px-6">
                        <div className="w-24 h-24 sm:w-40 sm:h-40 bg-[#091426] rounded-[32px] sm:rounded-[48px] flex items-center justify-center mx-auto shadow-2xl text-white">
                            <span className="material-symbols-outlined text-4xl sm:text-6xl">check_circle</span>
                        </div>
                        <h2 className="text-4xl sm:text-7xl font-['Inter'] font-bold text-[#091426] tracking-tighter uppercase leading-[0.8] mb-6 sm:mb-8">
                            Protocol <br /> <span className="text-[#00adef]">Completed.</span>
                        </h2>
                        <button 
                            onClick={() => navigate('/exercises')}
                            className="w-full sm:w-auto px-12 sm:px-24 py-6 sm:py-10 bg-[#091426] text-white rounded-full font-black uppercase tracking-[8px] sm:tracking-[15px] text-[10px] sm:text-xs shadow-2xl hover:bg-[#00adef] transition-all"
                        >
                            Return Home
                        </button>
                    </div>
                )}
            </div>

            <div className="absolute bottom-6 sm:bottom-12 left-6 sm:right-12 sm:left-auto z-[200]">
                <button 
                    onClick={() => navigate('/exercises')} 
                    className="flex items-center gap-3 sm:gap-4 bg-white/50 backdrop-blur-3xl px-6 sm:px-8 py-4 sm:py-5 rounded-[24px] sm:rounded-[32px] border border-white shadow-xl hover:bg-rose-500 hover:text-white transition-all group"
                >
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[3px] sm:tracking-[4px]">Abort</span>
                    <span className="material-symbols-outlined text-lg sm:text-xl">close</span>
                </button>
            </div>
        </div>
    );
};

export default ExerciseDetail;