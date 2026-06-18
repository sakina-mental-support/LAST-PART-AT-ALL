import React, { useState, useRef, useEffect } from 'react';
import Badge from './Badge';
import { useEmotionalOS } from '../context/EmotionalOSContext.jsx';
import axios from 'axios';

const SESSION_STAGES = [
    { id: 'checkin', label: 'Say Hello', icon: 'favorite', prompt: "Welcome. How are you feeling right now? On a scale from 1 to 10 — what is your mood? Use one word to describe it." },
    { id: 'explore', label: 'Tell Me More', icon: 'explore', prompt: "Thank you for sharing. Can you tell me more about what is bothering you? Take your time." },
    { id: 'analysis', label: 'Think About It', icon: 'psychology', prompt: "I hear you. Sometimes our thoughts can be loud. What is the first thought that comes to your mind when this happens?" },
    { id: 'reflection', label: 'A New View', icon: 'self_improvement', prompt: "That is brave of you to say. Let's think: Is there another way to look at this? If a friend had this problem, what would you tell them?" },
    { id: 'action', label: 'Next Step', icon: 'rocket_launch', prompt: "You did a great job today. Let's end with one small thing you can do. What is one tiny thing you can do in the next day to be kind to yourself?" },
];

const TherapySession = () => {
    const { state } = useEmotionalOS();
    const [stageIndex, setStageIndex] = useState(0);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const messagesEndRef = useRef(null);

    const currentStage = SESSION_STAGES[stageIndex];
    const profile = JSON.parse(localStorage.getItem('sakina_profile') || '{"name": "User"}');

    // Initialize first AI message
    useEffect(() => {
        setMessages([{ role: 'ai', content: SESSION_STAGES[0].prompt, stage: SESSION_STAGES[0].id }]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = { role: 'user', content: input };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput('');
        setLoading(true);

        const nextStageIndex = stageIndex + 1;
        const isLast = nextStageIndex >= SESSION_STAGES.length;

        try {
            const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await axios.post(`${API}/api/chat`, {
                message: input,
                context: {
                    userName: profile.name,
                    persona: 'Calm Therapist',
                    systemWorld: state.activeWorld,
                    intensity: state.stressLevel,
                    history: updated.slice(-6).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content })),
                    therapyStage: currentStage.id,
                    nextStage: isLast ? null : SESSION_STAGES[nextStageIndex].label
                }
            });
            const aiResponse = res.data?.response || (isLast ? "You have done something meaningful today. That matters. Take care of yourself." : SESSION_STAGES[nextStageIndex].prompt);

            setMessages(prev => [...prev, { role: 'ai', content: aiResponse, stage: isLast ? 'complete' : SESSION_STAGES[nextStageIndex].id }]);
            if (!isLast) setStageIndex(nextStageIndex);
            else setSessionComplete(true);
        } catch {
            const fallback = isLast ? "Thank you for sharing so openly. You've done something valuable today." : SESSION_STAGES[nextStageIndex].prompt;
            setMessages(prev => [...prev, { role: 'ai', content: fallback }]);
            if (!isLast) setStageIndex(nextStageIndex);
            else setSessionComplete(true);
        }
        setLoading(false);
    };

    return (
        <div className="py-6 font-['Inter'] animate-fade-in pb-32 space-y-16 pl-0 pr-6 sm:px-8 max-w-full overflow-x-hidden">
            {/* Header */}
            <header className="space-y-4 sm:space-y-8">
                <Badge variant="solid" color="teal" size="sm" className="tracking-[6px] sm:tracking-[8px] uppercase !bg-[#00adef]/10 !text-[#00adef]">AI Therapy Mode</Badge>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-10">
                    <h1 className="font-['Inter'] text-4xl sm:text-8xl font-bold text-[#091426] tracking-tighter uppercase leading-[0.85]">
                        Helpful <br />
                        <span className="text-[#00adef] italic">Talk.</span>
                    </h1>
                    <p className="text-[9px] sm:text-xs text-gray-300 font-bold uppercase tracking-[2px] sm:tracking-[4px] max-w-xs md:text-right leading-relaxed">
                        ⚠ This is not a medical diagnosis. Sakina provides emotional support only.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full">
                {/* Session Stages */}
                <aside className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 sm:pb-0 w-full min-w-0 px-1 py-1">
                    {SESSION_STAGES.map((stage, i) => (
                        <div key={stage.id} className={`flex items-center gap-3 sm:gap-6 px-4 sm:px-8 py-3 sm:py-6 rounded-[16px] sm:rounded-[32px] transition-all flex-shrink-0 lg:flex-shrink-1 ${i === stageIndex ? 'bg-[#091426] text-white shadow-lg' : i < stageIndex ? 'bg-[#00adef]/10 text-[#00adef]' : 'bg-white text-gray-300 border border-gray-50'}`}>
                            <span className="material-symbols-outlined text-xl sm:text-2xl">{stage.icon}</span>
                            <div className="min-w-max lg:min-w-0">
                                <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-[2px] sm:tracking-[3px] opacity-50">Stage {i + 1}</p>
                                <p className="text-[10px] sm:text-xs font-bold tracking-tight">{stage.label}</p>
                            </div>
                            {i < stageIndex && <span className="material-symbols-outlined text-base sm:text-xl ml-auto">check_circle</span>}
                        </div>
                    ))}
                </aside>

                {/* Conversation Area */}
                <div className="lg:col-span-9 bg-white/70 backdrop-blur-3xl rounded-[32px] sm:rounded-[64px] shadow-sakina border border-white/40 flex flex-col h-[480px] sm:h-[650px] lg:h-[750px] w-full box-border overflow-hidden relative">
                    
                    {/* Immersive Stage Atmosphere */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 transition-all duration-[3000ms]"
                        style={{ 
                            background: `radial-gradient(circle at top right, ${stageIndex < 2 ? '#00adef' : stageIndex < 4 ? '#6366f1' : '#f43f5e'} 0%, transparent 50%)`
                        }}
                    ></div>

                    {/* Stage Indicator Header */}
                    <div className="px-4 sm:px-16 pt-6 sm:pt-16 pb-6 sm:pb-10 border-b border-gray-50/50 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4 sm:gap-8">
                            <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[36px] bg-[#091426] flex items-center justify-center text-[#00adef] shadow-xl">
                                <span className="material-symbols-outlined text-2xl sm:text-4xl">{currentStage.icon}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[5px] text-gray-400">Mind Session</p>
                                <h3 className="text-xl sm:text-3xl font-bold text-[#091426] tracking-tighter uppercase">{currentStage.label}</h3>
                            </div>
                        </div>
                        {loading && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00adef] animate-ping"></div>
                                <span className="text-[10px] font-black uppercase tracking-[3px] text-[#00adef]">Sakina is thinking</span>
                            </div>
                        )}
                    </div>
 
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-16 py-6 sm:py-16 space-y-6 sm:space-y-12 relative z-10">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full animate-in fade-in slide-in-from-bottom-5 duration-700`}>
                                <div className={`relative max-w-[90%] sm:max-w-[80%] rounded-[20px] sm:rounded-[48px] px-4 sm:px-12 py-4 sm:py-10 shadow-sm border ${msg.role === 'ai' ? 'bg-white border-gray-100 text-[#091426]' : 'bg-[#091426] border-white/5 text-white shadow-sakina-lg'}`}>
                                    {msg.role === 'ai' && (
                                        <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#00adef]"></div>
                                            <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[5px] text-[#00adef]">The Voice of Sakina</p>
                                        </div>
                                    )}
                                    <p className="text-sm sm:text-xl font-medium leading-relaxed sm:leading-[1.6]">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/50 backdrop-blur-md px-10 py-8 rounded-[40px] flex gap-3 items-center border border-white">
                                    <div className="h-4 w-1 bg-[#00adef] rounded-full animate-[pulse_1s_infinite_0s]"></div>
                                    <div className="h-8 w-1 bg-[#00adef] rounded-full animate-[pulse_1s_infinite_0.1s]"></div>
                                    <div className="h-6 w-1 bg-[#00adef] rounded-full animate-[pulse_1s_infinite_0.2s]"></div>
                                    <div className="h-4 w-1 bg-[#00adef] rounded-full animate-[pulse_1s_infinite_0.3s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 sm:p-10 relative z-10">
                        {!sessionComplete ? (
                            <div className="bg-[#f7f9fb] rounded-[32px] sm:rounded-[56px] p-2 sm:p-4 flex gap-4 items-center shadow-inner border border-gray-50 focus-within:border-[#00adef] transition-colors">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    placeholder="Share your thoughts here..."
                                    className="flex-1 w-full min-w-0 bg-transparent border-none pl-3 pr-2 sm:px-10 py-4 sm:py-8 text-sm sm:text-xl font-medium text-[#091426] outline-none placeholder-gray-300"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="w-12 h-12 sm:w-24 sm:h-24 bg-[#091426] text-white rounded-[20px] sm:rounded-[40px] flex items-center justify-center hover:bg-[#00adef] transition-all shadow-xl group flex-shrink-0"
                                >
                                    <span className="material-symbols-outlined text-2xl sm:text-4xl group-hover:translate-x-2 transition-transform">arrow_forward</span>
                                </button>
                            </div>
                        ) : (
                            <div className="bg-[#00adef]/5 rounded-[32px] py-10 sm:py-16 text-center border-2 border-dashed border-[#00adef]/20">
                                <span className="material-symbols-outlined text-4xl sm:text-6xl text-[#00adef] mb-6">verified</span>
                                <p className="text-sm sm:text-xl font-black text-[#00adef] uppercase tracking-[6px] sm:tracking-[10px]">Session Successfully Completed</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TherapySession;
