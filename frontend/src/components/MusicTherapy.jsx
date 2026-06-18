import React, { useState, useEffect, useRef } from 'react';
import Badge from './Badge';
import { useEmotionalBrain } from '../store/useEmotionalBrain';
import { motion, AnimatePresence } from 'framer-motion';
import { LucidePlay, LucidePause, LucideSquare, LucideVolume2, LucideWaves, LucideZap, LucideCloudRain, LucideFlame, LucideMusic, LucideMic2 } from 'lucide-react';

const playlists = {
    Anxious: {
        label: 'Calm Ambient', icon: 'water', accentColor: '#6366f1',
        tracks: [
            { title: 'Ocean Waves', artist: 'Nature Healing', duration: '∞', src: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3' },
            { title: 'Soft Rain', artist: 'Ambient Earth', duration: '∞', src: 'https://www.soundjay.com/nature/sounds/rain-01.mp3' },
            { title: 'Light Wind', artist: 'Nature Sounds', duration: '∞', src: 'https://www.soundjay.com/nature/sounds/wind-in-trees-1.mp3' },
        ]
    },
    Stressed: {
        label: 'Forest Immersion', icon: 'forest', accentColor: '#00adef',
        tracks: [
            { title: 'Forest Birds', artist: 'Earth Collective', duration: '∞', src: 'https://www.youtube.com/watch?v=Qm846KdZN_c' },
            { title: 'Flowing Stream', artist: 'Nature Sounds', duration: '∞', src: 'https://www.youtube.com/watch?v=IvjMgVS6kng' },
            { title: 'Rain on Leaves', artist: 'Ambient Forest', duration: '∞', src: 'https://www.youtube.com/watch?v=ca02mjqRDDI' },
        ]
    },
    Calm: {
        label: 'Focus Flow', icon: 'headphones', accentColor: '#fbbf24',
        tracks: [
            { title: 'Morning Birds', artist: 'Dawn Collection', duration: '∞', src: 'https://www.soundjay.com/nature/sounds/birds-in-the-trees-2.mp3' },
            { title: 'Light Brook', artist: 'Forest Sound', duration: '∞', src: 'https://www.soundjay.com/nature/sounds/river-2.mp3' },
            { title: 'Breeze', artist: 'Ambient Wind', duration: '∞', src: 'https://www.soundjay.com/nature/sounds/wind-in-trees-2.mp3' },
        ]
    },
    Balanced: {
        label: 'Neural Balance', icon: 'spa', accentColor: '#00adef',
        tracks: [
            { title: 'Ocean Breath', artist: 'Nature Healing', duration: '∞', src: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3' },
            { title: 'Forest Morning', artist: 'Earth Collective', duration: '∞', src: 'https://www.soundjay.com/nature/sounds/birds-in-the-trees-1.mp3' },
            { title: 'Rain Flow', artist: 'Ambient Earth', duration: '∞', src: 'https://www.soundjay.com/nature/sounds/rain-01.mp3' },
        ]
    }
};

const AMBIENT_TONES = [
    { id: 'delta', label: 'Delta Waves', icon: <LucideWaves />, desc: 'Deep sleep & restoration', hz: 2, color: '#6366f1' },
    { id: 'theta', label: 'Theta Calm', icon: <LucideWaves />, desc: 'Meditation & creativity', hz: 6, color: '#00adef' },
    { id: 'alpha', label: 'Alpha Focus', icon: <LucideZap />, desc: 'Relaxed alertness', hz: 10, color: '#fbbf24' },
    { id: 'rain', label: 'Rain', icon: <LucideCloudRain />, desc: 'White noise + calm', hz: 0, color: '#0ea5e9' },
    { id: 'fire', label: 'Campfire', icon: <LucideFlame />, desc: 'Warm & grounded', hz: 0, color: '#f97316' },
    { id: 'space', label: 'Deep Space', icon: <LucideMusic />, desc: 'Vast & peaceful', hz: 0.5, color: '#a855f7' },
];

const MusicTherapy = () => {
    const brain = useEmotionalBrain();
    const mood = brain.metrics.mood > 80 ? 'Balanced' : brain.metrics.stress > 60 ? 'Stressed' : 'Calm';
    const playlist = playlists[mood] || playlists['Balanced'];

    const [activeTrackIdx, setActiveTrackIdx] = useState(null);
    const [activeTone, setActiveTone] = useState(null);
    const [volume, setVolume] = useState(0.5);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    const audioRef = useRef(null);
    const audioCtxRef = useRef(null);
    const oscillatorRef = useRef(null);
    const gainNodeRef = useRef(null);
    const ytPlayerRef = useRef(null);

    const getYTVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const initYTPlayer = () => {
        if (window.YT && window.YT.Player) {
            try {
                // Ensure target container exists
                let container = document.getElementById('sakina-yt-player');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'sakina-yt-player';
                    container.className = 'hidden absolute opacity-0 w-0 h-0';
                    document.body.appendChild(container);
                }
                ytPlayerRef.current = new window.YT.Player('sakina-yt-player', {
                    height: '0',
                    width: '0',
                    videoId: '',
                    playerVars: {
                        autoplay: 0,
                        controls: 0,
                        disablekb: 1,
                        fs: 0,
                        rel: 0,
                        showinfo: 0,
                        iv_load_policy: 3
                    },
                    events: {
                        onStateChange: (event) => {
                            if (event.data === window.YT.PlayerState.ENDED) {
                                event.target.playVideo();
                            }
                        }
                    }
                });
            } catch (e) {
                console.error("YT Player init error", e);
            }
        }
    };

    useEffect(() => {
        const audio = new Audio();
        audio.loop = true;
        audio.volume = volume;
        audioRef.current = audio;

        // Load YouTube API if not present
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            window.onYouTubeIframeAPIReady = initYTPlayer;
        } else {
            initYTPlayer();
        }

        const tick = setInterval(() => {
            setIsPlaying(playing => {
                if (playing) setCurrentTime(t => t + 1);
                return playing;
            });
        }, 1000);

        return () => {
            audio.pause();
            clearInterval(tick);
            if (ytPlayerRef.current) {
                try {
                    ytPlayerRef.current.destroy();
                } catch(e){}
            }
        };
    }, []);

    const playTrack = (idx) => {
        stopTone();
        const track = playlist.tracks[idx];
        const isYT = track.src.includes('youtube.com') || track.src.includes('youtu.be');

        if (activeTrackIdx === idx) {
            if (isPlaying) {
                if (isYT) {
                    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
                        try { ytPlayerRef.current.pauseVideo(); } catch(e){}
                    }
                } else {
                    audioRef.current.pause();
                }
                setIsPlaying(false);
            } else {
                if (isYT) {
                    if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
                        try { 
                            ytPlayerRef.current.setVolume(volume * 100);
                            ytPlayerRef.current.playVideo(); 
                        } catch(e){}
                    }
                } else {
                    audioRef.current.play().catch(() => {});
                }
                setIsPlaying(true);
            }
            return;
        }

        // If another track was active, stop it first
        stopTrack();

        if (isYT) {
            const videoId = getYTVideoId(track.src);
            if (videoId) {
                const triggerPlay = () => {
                    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
                        try {
                            ytPlayerRef.current.loadVideoById({ videoId });
                            ytPlayerRef.current.setVolume(volume * 100);
                            ytPlayerRef.current.playVideo();
                            setActiveTrackIdx(idx);
                            setIsPlaying(true);
                            setCurrentTime(0);
                        } catch (e) {
                            console.error("Failed to play video in player", e);
                            setIsPlaying(false);
                        }
                    } else {
                        // If YT API is still loading, try again soon
                        setTimeout(triggerPlay, 500);
                    }
                };
                triggerPlay();
            }
        } else {
            audioRef.current.src = track.src;
            audioRef.current.volume = volume;
            audioRef.current.play().then(() => {
                setActiveTrackIdx(idx);
                setIsPlaying(true);
                setCurrentTime(0);
            }).catch(() => setIsPlaying(false));
        }
    };

    const playTone = (tone) => {
        stopTrack();
        const wasActive = activeTone === tone.id;
        stopTone();
        if (wasActive) return;
        
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            audioCtxRef.current = ctx;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
            gain.connect(ctx.destination);
            gainNodeRef.current = gain;
            
            if (tone.hz > 0) {
                const oscL = ctx.createOscillator(); oscL.type = 'sine'; oscL.frequency.value = 200;
                const oscR = ctx.createOscillator(); oscR.type = 'sine'; oscR.frequency.value = 200 + tone.hz;
                const merger = ctx.createChannelMerger(2);
                oscL.connect(merger, 0, 0); oscR.connect(merger, 0, 1);
                merger.connect(gain);
                oscL.start(); oscR.start();
                oscillatorRef.current = [oscL, oscR];
            } else {
                const bufferSize = ctx.sampleRate * 2;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                const source = ctx.createBufferSource();
                source.buffer = buffer; source.loop = true;
                const filter = ctx.createBiquadFilter();
                filter.type = tone.id === 'rain' ? 'bandpass' : 'lowpass';
                filter.frequency.value = tone.id === 'fire' ? 400 : tone.id === 'rain' ? 1200 : 200;
                source.connect(filter); filter.connect(gain);
                source.start(); oscillatorRef.current = [source];
            }
            setActiveTone(tone.id);
            setIsPlaying(true);
        } catch (e) {
            console.error("AudioContext failed", e);
        }
    };

    const stopAll = () => {
        stopTrack();
        stopTone();
    };

    const stopTone = () => {
        if (oscillatorRef.current) {
            oscillatorRef.current.forEach(o => { 
                try { 
                    o.disconnect();
                    o.stop(); 
                } catch (e) {} 
            });
            oscillatorRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
        }
        setActiveTone(null);
        setIsPlaying(false);
    };

    const stopTrack = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = ""; // Force stop download and playback
            audioRef.current.load();
        }
        if (ytPlayerRef.current && typeof ytPlayerRef.current.stopVideo === 'function') {
            try {
                ytPlayerRef.current.stopVideo();
            } catch (e) {}
        }
        setActiveTrackIdx(null);
        setIsPlaying(false);
    };

    const handleVolumeChange = (e) => {
        const v = parseFloat(e.target.value);
        setVolume(v);
        if (audioRef.current) {
            audioRef.current.volume = v;
        }
        if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
            try {
                ytPlayerRef.current.setVolume(v * 100);
            } catch (e) {}
        }
        if (gainNodeRef.current) {
            try {
                const ctx = audioCtxRef.current;
                const time = ctx ? ctx.currentTime : 0;
                gainNodeRef.current.gain.setValueAtTime(v * 0.3, time);
            } catch (err) {
                try {
                    gainNodeRef.current.gain.value = v * 0.3;
                } catch (e2) {}
            }
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    return (
        <div className="py-12 font-['Inter'] animate-fade-in space-y-20 pb-32">
            
            {/* 🚀 EASY ENGLISH HEADER */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                <div className="space-y-6">
                    <Badge variant="solid" color="teal" size="sm" className="tracking-[10px] uppercase">Sakina Sound v4.0</Badge>
                    <h1 className="text-6xl sm:text-9xl font-black text-[#091426] tracking-tighter uppercase leading-[0.8]">
                        Calm <br />
                        <span className="text-[#00adef] italic">Music.</span>
                    </h1>
                </div>
            </header>

            {/* 🎵 NOW PLAYING - ENHANCED BARS */}
            <AnimatePresence>
                {(activeTrackIdx !== null || activeTone) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-[#091426] rounded-[48px] p-10 flex flex-col md:flex-row items-center gap-10 shadow-sakina-lg relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#00adef]/10 to-transparent"></div>
                        
                        <div className="relative z-10 flex items-center gap-8 flex-1">
                            <div className="w-20 h-20 bg-[#00adef] rounded-[24px] flex items-center justify-center text-white shadow-lg">
                                {isPlaying ? <Visualizer active={true} /> : <LucidePlay />}
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-[#00adef] uppercase tracking-[6px]">Sound is Active</p>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                                    {activeTone ? AMBIENT_TONES.find(t => t.id === activeTone)?.label : playlist.tracks[activeTrackIdx]?.title}
                                </h3>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-8">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[4px]">Time</p>
                                <p className="text-2xl font-black text-[#00adef]">{formatTime(currentTime)}</p>
                            </div>
                            <button onClick={stopAll} className="w-16 h-16 bg-white/10 rounded-[28px] flex items-center justify-center text-white hover:bg-rose-500 transition-all">
                                <LucideSquare size={24} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🎹 NEURAL TRACKS - UNIFIED DESIGN */}
            <section className="space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-4">
                        <Badge variant="subtle" color="teal" size="sm" className="tracking-[6px] !bg-[#00adef]/10 !text-[#00adef]">Nature Healing</Badge>
                        <h2 className="text-4xl sm:text-6xl font-black text-[#091426] tracking-tighter uppercase">
                            Calm <span className="text-[#00adef]">Music.</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-4 rounded-[24px] border border-white/20">
                        <div className="w-2 h-2 rounded-full bg-[#00adef] animate-ping"></div>
                        <span className="text-[10px] font-black uppercase tracking-[3px] text-[#091426]/60">Helping you feel: {mood}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {playlist.tracks.map((track, i) => (
                        <TrackCard 
                            key={i} 
                            track={track} 
                            active={activeTrackIdx === i && isPlaying} 
                            onClick={() => playTrack(i)} 
                            color={playlist.accentColor} 
                        />
                    ))}
                </div>
            </section>

            {/* 🌌 BINAURAL ENGINE - FUTURISTIC REDESIGN */}
            <section className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00adef]/10 via-transparent to-[#6366f1]/10 rounded-[80px] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-[3000ms]"></div>
                <div className="relative z-10 bg-[#091426] rounded-[60px] sm:rounded-[80px] p-12 sm:p-24 border border-white/5 shadow-2xl overflow-hidden">
                    
                    {/* Background Visual Elements */}
                    <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-[#00adef]/5 to-transparent"></div>
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#6366f1]/10 rounded-full blur-[100px] animate-blob"></div>

                    <div className="max-w-2xl relative z-10 mb-20">
                        <Badge variant="solid" color="teal" size="sm" className="mb-8 tracking-[8px] !bg-white/5 border border-white/10 backdrop-blur-xl">Neural Signal Laboratory</Badge>
                        <h2 className="text-5xl sm:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-6">
                            Binaural <br />
                            <span className="text-[#00adef] drop-shadow-[0_0_15px_rgba(0,173,239,0.4)]">Frequencies.</span>
                        </h2>
                        <p className="text-white/40 text-sm sm:text-xl font-medium leading-relaxed max-w-lg">
                            Injecting high-precision neural signals into your auditory cortex to induce deep emotional states.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 relative z-10">
                        {AMBIENT_TONES.map((tone) => {
                            const active = activeTone === tone.id;
                            return (
                                <button
                                    key={tone.id}
                                    onClick={() => playTone(tone)}
                                    className={`relative group/tone p-8 sm:p-12 rounded-[40px] sm:rounded-[56px] flex flex-col items-center gap-8 transition-all duration-700 border-2 ${
                                        active 
                                        ? 'bg-white text-[#091426] border-white scale-105 shadow-[0_20px_50px_rgba(255,255,255,0.1)]' 
                                        : 'bg-white/5 border-white/5 hover:border-white/20 text-white'
                                    }`}
                                >
                                    {/* Active Glow */}
                                    {active && (
                                        <div className="absolute inset-0 bg-[#00adef]/20 blur-3xl animate-pulse rounded-full scale-110 -z-10"></div>
                                    )}

                                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[28px] sm:rounded-[36px] flex items-center justify-center transition-all duration-500 ${
                                        active ? 'bg-[#091426] text-white shadow-xl rotate-12' : 'bg-white/10 text-white/40 group-hover/tone:scale-110 group-hover/tone:text-[#00adef]'
                                    }`}>
                                        <div className={active ? 'animate-pulse' : ''}>
                                            {tone.icon}
                                        </div>
                                    </div>

                                    <div className="text-center space-y-2">
                                        <p className={`text-[10px] sm:text-[12px] font-black uppercase tracking-[3px] sm:tracking-[5px] transition-colors ${active ? 'text-[#091426]' : 'text-white/40 group-hover/tone:text-white'}`}>
                                            {tone.label}
                                        </p>
                                        {tone.hz > 0 && (
                                            <Badge 
                                                variant="solid" 
                                                color="teal" 
                                                size="xs" 
                                                className={`!px-3 !py-1 !text-[9px] tracking-[2px] ${active ? '!bg-[#091426] !text-white' : '!bg-[#00adef]/20 !text-[#00adef]'}`}
                                            >
                                                {tone.hz}Hz
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <p className={`text-[9px] sm:text-[10px] font-bold text-center leading-tight opacity-40 max-w-[120px] transition-opacity ${active ? 'opacity-100' : 'group-hover/tone:opacity-60'}`}>
                                        {tone.desc}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

        </div>
    );
};

const Visualizer = ({ active }) => (
    <div className="flex items-end gap-[3px] h-8">
        {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
                key={i}
                animate={active ? { height: [8, 24, 12, 32, 16] } : { height: 8 }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                className="w-1 bg-white rounded-full"
            />
        ))}
    </div>
);

const TrackCard = ({ track, active, onClick, color }) => (
    <motion.div 
        whileHover={{ y: -12, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`group relative bg-white/40 backdrop-blur-2xl rounded-[48px] p-10 border-2 cursor-pointer transition-all duration-700 ${active ? 'border-[#00adef] shadow-sakina-lg bg-white' : 'border-white/20 shadow-sakina hover:border-[#00adef]/30'}`}
    >
        <div className="flex items-start justify-between mb-10">
            <div className="w-20 h-20 rounded-[28px] flex items-center justify-center transition-all duration-500 group-hover:rotate-12" style={{ backgroundColor: `${color}15` }}>
                {active ? <LucidePause size={32} style={{ color }} /> : <LucidePlay size={32} style={{ color }} />}
            </div>
            {active && (
                <div className="flex gap-1.5 pt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00adef] animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00adef]/40"></div>
                </div>
            )}
        </div>
        
        <div className="space-y-2 mb-10">
            <h3 className="text-2xl font-black text-[#091426] tracking-tight group-hover:text-[#00adef] transition-colors">{track.title}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[4px]">{track.artist}</p>
        </div>

        <div className="relative h-1.5 w-full bg-[#091426]/5 rounded-full overflow-hidden">
            <motion.div 
                animate={active ? { x: ["-100%", "100%"] } : { x: "-100%" }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-1/2 rounded-full shadow-[0_0_10px_rgba(0,173,239,0.5)]" 
                style={{ backgroundColor: color }}
            />
        </div>
    </motion.div>
);

const ToneCard = ({ tone, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`p-10 rounded-[40px] flex flex-col items-center gap-6 border-2 transition-all ${active ? 'bg-white border-white shadow-xl scale-110' : 'bg-transparent border-gray-100 hover:border-gray-200'}`}
    >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-[#091426] text-white shadow-lg' : 'bg-white text-gray-400'}`}>
            {tone.icon}
        </div>
        <div className="text-center">
            <p className={`text-[10px] font-black uppercase tracking-[3px] ${active ? 'text-[#091426]' : 'text-gray-400'}`}>{tone.label}</p>
            {tone.hz > 0 && <p className="text-[10px] font-bold text-[#00adef] mt-1">{tone.hz}Hz</p>}
        </div>
    </button>
);

export default MusicTherapy;
