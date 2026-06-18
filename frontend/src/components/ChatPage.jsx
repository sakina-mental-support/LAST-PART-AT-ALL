import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEmotionalOS } from '../context/EmotionalOSContext.jsx';
import { useEmotionalBrain } from '../store/useEmotionalBrain';
import { sendChatMessage, getChatHistory, getConversations, transcribeVoice, generateTTSAudio } from '../services/api';
import Badge from './Badge';

const QUICK_PROMPTS = [
    { label: "I feel anxious", icon: "sentiment_worried" },
    { label: "Help me calm down", icon: "self_improvement" },
    { label: "I can't stop overthinking", icon: "sync_problem" },
    { label: "I feel overwhelmed", icon: "warning" },
    { label: "I need a breathing exercise", icon: "air" },
];

const DISTRESS_KEYWORDS = ['panic', 'can\'t breathe', 'help me', 'breaking down', 'suicidal', 'can\'t cope', 'emergency', 'falling apart'];

const personaRules = {
    'Your Sakina':         { tone: 'Kind and helpful.', icon: 'favorite',    avatar: '/sakina_logo.jpg' },
    'Calm Therapist':      { tone: 'Steady and thoughtful.', icon: 'psychology',  avatar: '🧠' },
    'Motivational Coach':  { tone: 'Helpful and active.', icon: 'bolt',        avatar: '⚡' },
    'Scientific Guide':    { tone: 'Uses facts and logic.',icon: 'biotech',     avatar: '🧬' },
    'Minimal Companion':   { tone: 'Short and quiet.',  icon: 'potted_plant',avatar: '🍃' },
};

const renderAvatar = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('/') || avatar.includes('.')) {
        const isSakinaLogo = avatar.includes('sakina_logo');
        return (
            <img 
                src={avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
                style={isSakinaLogo ? { transform: 'scale(1.4)', transformOrigin: '50% 48%' } : {}} 
            />
        );
    }
    return avatar;
};

const ChatPage = () => {
    const { user } = useAuth();
    const { state, dispatch, emitEvent } = useEmotionalOS();
    const brain = useEmotionalBrain();
    const { currentMood, aiContext } = state;
    const { style: aiStyle } = aiContext;
    const profile = JSON.parse(localStorage.getItem('sakina_profile') || '{}');
    const userName = profile.name || user?.name || 'there';

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('sakina_chat_messages');
        return saved ? JSON.parse(saved) : [];
    });
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState(() => {
        return localStorage.getItem('sakina_active_conversation_id') || null;
    });
    const [showConversations, setShowConversations] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const messagesEndRef = useRef(null);

    const [ttsEnabled, setTtsEnabled] = useState(() => {
        return localStorage.getItem('sakina_tts_enabled') === 'true';
    });
    const [playingMessageId, setPlayingMessageId] = useState(null);
    const audioRef = useRef(null);

    const stopSpeech = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setPlayingMessageId(null);
    };

    const speakMessage = async (messageId, text) => {
        if (playingMessageId === messageId) {
            stopSpeech();
            return;
        }

        stopSpeech();

        try {
            setPlayingMessageId(messageId);
            const cleanText = text.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove markdown bold asterisks
            const token = localStorage.getItem('sakina_token');
            const encodedText = encodeURIComponent(cleanText);
            const audioUrl = `/api/chat/tts?text=${encodedText}&token=${token}`;

            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.onended = () => {
                setPlayingMessageId(null);
            };
            audio.onerror = (e) => {
                console.error("Audio playback error:", e);
                setPlayingMessageId(null);
            };
            await audio.play();
        } catch (err) {
            console.error("TTS playback failed:", err);
            setPlayingMessageId(null);
        }
    };

    useEffect(() => {
        localStorage.setItem('sakina_tts_enabled', ttsEnabled);
        if (!ttsEnabled) {
            stopSpeech();
        }
    }, [ttsEnabled]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    const initialGreeting = {
        id: 1,
        text: `Hi ${userName}. I see you are feeling **${currentMood}** — I am here for you. What would you like to talk about today?`,
        isSent: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    useEffect(() => {
        const hasNoUserMessages = messages.length === 0 || (messages.length === 1 && messages[0].id === 1);
        if (hasNoUserMessages) {
            setMessages([initialGreeting]);
        }
    }, [userName, currentMood]);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('sakina_chat_messages', JSON.stringify(messages));
        } else {
            localStorage.removeItem('sakina_chat_messages');
        }
    }, [messages]);

    useEffect(() => {
        if (activeConversationId) {
            localStorage.setItem('sakina_active_conversation_id', activeConversationId);
        } else {
            localStorage.removeItem('sakina_active_conversation_id');
        }
    }, [activeConversationId]);

    const loadPreviousChats = async () => {
        try {
            const res = await getConversations();
            if (res && res.success && res.data) {
                setConversations(res.data);
                setShowConversations(true);
            }
        } catch (err) {
            console.error("Failed to load conversations:", err);
        }
    };

    const selectConversation = async (convId) => {
        try {
            const res = await getChatHistory(convId);
            if (res && res.success && res.data && res.data.length > 0) {
                const formatted = res.data.map(m => ({
                    id: m._id,
                    text: m.content,
                    isSent: m.sender === 'user',
                    timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setMessages(formatted);
                setActiveConversationId(convId);
                setShowConversations(false);
            }
        } catch (err) {
            console.error("Failed to load chat history:", err);
        }
    };

    const startNewChat = () => {
        setActiveConversationId(null);
        setMessages([initialGreeting]);
        setShowConversations(false);
        localStorage.removeItem('sakina_chat_messages');
        localStorage.removeItem('sakina_active_conversation_id');
    };

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const checkForDistress = (text) => DISTRESS_KEYWORDS.some(kw => text.toLowerCase().includes(kw));

    const handleRecord = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());
                setIsLoading(true);
                try {
                    const res = await transcribeVoice(audioBlob);
                    if (res && res.text) {
                        setInputValue(prev => prev ? prev + " " + res.text : res.text);
                    }
                } catch (error) {
                    console.error("Transcription error:", error);
                    alert("Voice transcription failed: " + error.message);
                } finally {
                    setIsLoading(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Please allow microphone access to record voice.");
        }
    };

    const handleSend = async (textOverride = null) => {
        const text = (textOverride ?? inputValue).trim();
        if (!text || isLoading) return;

        // 🚨 Emergency Detection
        if (checkForDistress(text)) {
            setEmergencyMode(true);
            brain.activatePanicMode();
            brain.emitEvent('PANIC_MODE_ACTIVATED', { source: 'chat', triggers: text });
        }

        const userMsg = { id: Date.now(), text, isSent: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);
        emitEvent('ai_message_sent', { text });

        try {
            setMessages(prev => [...prev, { id: 'thinking', isLoading: true, isSent: false }]);

            const context = {
                mood: currentMood,
                intensity: state.stressLevel,
                energy: state.emotionalEnergy,
                persona: aiStyle,
                userName,
                systemWorld: state.activeWorld,
                history: messages.slice(-6).map(m => ({ role: m.isSent ? 'user' : 'assistant', content: m.text })),
                emergencyMode,
            };

            const res = await sendChatMessage(text, context, activeConversationId);
            if (res?.conversationId) {
                setActiveConversationId(res.conversationId);
            }
            setMessages(prev => prev.filter(m => m.id !== 'thinking'));

            const reply = res?.data?.response || getFallback(currentMood, userName, emergencyMode);
            const replyId = Date.now() + 1;
            setMessages(prev => [...prev, { id: replyId, text: reply, isSent: false, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            if (ttsEnabled) {
                speakMessage(replyId, reply);
            }
        } catch {
            const fallbackReply = getFallback(currentMood, userName, emergencyMode);
            const replyId = Date.now() + 1;
            setMessages(prev => prev.filter(m => m.id !== 'thinking').concat({ id: replyId, text: fallbackReply, isSent: false, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
            if (ttsEnabled) {
                speakMessage(replyId, fallbackReply);
            }
        } finally { setIsLoading(false); }
    };

    const getFallback = (mood, name, emergency) => {
        if (emergency) return `${name}, I'm right here with you. Let's breathe together. Inhale slowly for 4 counts... hold for 4... exhale for 4. You are safe. Do you want to try a quick grounding exercise?`;
        const map = { sad: `I hear you, ${name}. You don't have to be okay right now.`, anxious: `Let's slow things down, ${name}. What's the loudest thought right now?`, stressed: `I feel your pressure, ${name}. Let's simplify one thing at a time.` };
        return map[mood] || `I'm here for you, ${name}. Tell me more.`;
    };

    return (
        <div className="fixed inset-0 lg:relative lg:inset-auto flex flex-col h-screen lg:h-[calc(100vh-120px)] bg-[#f7f9fb] lg:bg-transparent z-[45] lg:z-10 pb-[80px] lg:pb-0 animate-fade-in font-['Inter'] overflow-hidden">

            {/* Conversations Overlay */}
            {showConversations && (
                <div className="absolute inset-0 z-50 bg-[#f7f9fb] flex flex-col animate-fade-in">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
                        <h2 className="text-sm font-bold text-[#091426] uppercase tracking-wider">Previous Chats</h2>
                        <button onClick={() => setShowConversations(false)} className="text-gray-400 hover:text-[#091426]">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                        {conversations.length === 0 ? (
                            <p className="text-center text-gray-400 text-xs mt-10">No previous chats found.</p>
                        ) : (
                            conversations.map(conv => (
                                <button key={conv._id} onClick={() => selectConversation(conv._id)} className="w-full p-4 bg-white rounded-xl border border-gray-100 hover:border-[#00adef] hover:shadow-md transition-all text-left flex flex-col gap-2">
                                    <h3 className="text-xs font-bold text-[#091426] truncate">{conv.title || 'New Chat'}</h3>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                        {new Date(conv.updatedAt).toLocaleDateString()} {new Date(conv.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* 🚨 EMERGENCY CALM BANNER */}
            {emergencyMode && (
                <div className="mx-4 sm:mx-6 mb-4 sm:mb-6 p-3 sm:p-8 bg-rose-50 rounded-[20px] sm:rounded-[32px] border border-rose-200 flex items-center gap-3 sm:gap-8 animate-in slide-in-from-top-4">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 bg-rose-500 rounded-[12px] sm:rounded-[20px] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-xl sm:text-3xl animate-pulse">emergency</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[8px] sm:text-sm font-black text-rose-600 uppercase tracking-[1px] sm:tracking-[4px] mb-0.5">Help Needed Now</p>
                        <p className="text-[9px] sm:text-xs text-rose-400 font-medium leading-tight truncate sm:whitespace-normal">I see you are upset. I am here for you.</p>
                    </div>
                    <button onClick={() => setEmergencyMode(false)} className="text-rose-300 hover:text-rose-500 flex-shrink-0">
                        <span className="material-symbols-outlined text-base sm:text-2xl">close</span>
                    </button>
                </div>
            )}

            {/* Persona HUD - Edge-to-Edge Mobile */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-[14px] bg-white shadow-sakina flex items-center justify-center text-xl border border-gray-50 overflow-hidden">
                            {renderAvatar(personaRules[aiStyle]?.avatar)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00adef] rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h2 className="text-sm font-['Inter'] font-bold text-[#091426] uppercase tracking-tight">{aiStyle}</h2>
                        <div className="flex items-center gap-1.5">
                            <Badge variant="subtle" color="teal" size="xs" className="scale-90 origin-left">Active Now</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <button 
                        onClick={() => setTtsEnabled(!ttsEnabled)}
                        className={`px-3 py-1.5 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center gap-1.5 ${ttsEnabled ? 'bg-[#00adef] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        title="Toggle auto-read aloud"
                    >
                        <span className="material-symbols-outlined text-xs leading-none">
                            {ttsEnabled ? 'volume_up' : 'volume_off'}
                        </span>
                        <span>Auto-Read</span>
                    </button>
                    <button onClick={loadPreviousChats} className="px-3 py-1.5 bg-gray-100 text-[#091426] text-[9px] font-bold rounded-lg uppercase tracking-wider hover:bg-gray-200 transition-colors">Previous</button>
                    <button onClick={startNewChat} className="px-3 py-1.5 bg-[#091426] text-white text-[9px] font-bold rounded-lg uppercase tracking-wider hover:bg-[#00adef] transition-colors">New Chat</button>
                </div>
            </div>

            {/* Quick Prompts - Horizontal Scroll */}
            {messages.length < 3 && (
                <div className="flex-shrink-0 px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-white/50 border-b border-gray-50">
                    {QUICK_PROMPTS.map((q, i) => (
                        <button key={i} onClick={() => handleSend(q.label)}
                            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 text-xs font-bold text-[#091426] shadow-sm active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-sm">{q.icon}</span>
                            <span className="whitespace-nowrap">{q.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Chat Surface - Flex Grow with Native Scroll */}
            <div className="flex-1 overflow-y-auto px-5 space-y-5 py-6 scroll-smooth">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                        {!msg.isSent && (
                            <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg shrink-0 border border-gray-50 mb-1 overflow-hidden">
                                {renderAvatar(personaRules[aiStyle]?.avatar)}
                            </div>
                        )}
                        <div className="max-w-[82%]">
                            <div className="flex items-center gap-2">
                                <div className={`px-4 py-3 rounded-[20px] text-[15px] font-medium leading-[1.4] shadow-sm ${msg.isSent ? 'bg-[#091426] text-white rounded-br-none' : 'bg-white text-[#091426] rounded-bl-none border border-gray-50'}`}>
                                    {msg.isLoading ? (
                                        <div className="flex gap-1.5 items-center h-5">
                                            <div className="w-1.5 h-1.5 bg-[#00adef] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-[#00adef] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-[#00adef] rounded-full animate-bounce"></div>
                                        </div>
                                    ) : msg.text}
                                </div>
                                {!msg.isSent && !msg.isLoading && (
                                    <button
                                        onClick={() => speakMessage(msg.id, msg.text)}
                                        className={`p-1.5 rounded-full flex items-center justify-center transition-all border ${playingMessageId === msg.id ? 'bg-[#00adef]/10 border-[#00adef] text-[#00adef] animate-pulse' : 'bg-white border-gray-100 text-gray-400 hover:text-[#00adef] hover:bg-gray-50'} shadow-sm hover:scale-105 active:scale-95 shrink-0`}
                                        title={playingMessageId === msg.id ? "Stop reading" : "Read aloud"}
                                    >
                                        <span className="material-symbols-outlined text-base leading-none">
                                            {playingMessageId === msg.id ? 'volume_up' : 'volume_mute'}
                                        </span>
                                    </button>
                                )}
                            </div>
                            {msg.timestamp && <p className={`text-[9px] font-bold text-gray-300 mt-1.5 uppercase tracking-wider ${msg.isSent ? 'text-right' : 'text-left'} px-2 opacity-60`}>{msg.timestamp}</p>}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Field - Fixed Above Navbar */}
            <div className="flex-shrink-0 px-4 py-4 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder={`Message...`}
                        className="w-full bg-[#f7f9fb] border-none rounded-2xl py-4 pl-5 pr-[100px] text-[15px] font-medium text-[#091426] outline-none focus:ring-1 focus:ring-[#00adef]/20 transition-all placeholder:text-gray-400"
                    />
                    <div className="absolute right-1.5 flex gap-1">
                        <button
                            onClick={handleRecord}
                            disabled={isLoading}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse shadow-md' : 'bg-transparent text-gray-400 hover:bg-gray-100 hover:text-[#091426]'}`}
                            title="Record voice to text"
                        >
                            <span className="material-symbols-outlined text-xl">{isRecording ? 'stop' : 'mic'}</span>
                        </button>
                        <button
                            onClick={() => handleSend()}
                            disabled={!inputValue.trim() || isLoading || isRecording}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${inputValue.trim() && !isLoading && !isRecording ? 'bg-[#091426] text-white shadow-lg' : 'bg-transparent text-gray-300'}`}
                        >
                            <span className="material-symbols-outlined text-xl">north</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;