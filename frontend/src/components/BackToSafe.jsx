import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionalBrain } from '../store/useEmotionalBrain';
import Badge from './Badge';
import { 
    LucideShieldCheck, LucideHeart, LucideWind, LucideHand, 
    LucideEye, LucideCheckCircle, LucideHome, LucideClock, LucideX
} from 'lucide-react';

const BackToSafe = () => {
    const navigate = useNavigate();
    const brain = useEmotionalBrain();
    const [step, setStep] = useState(0);
    const [reactivity, setReactivity] = useState(0);
    const lastTap = useRef(Date.now());
    
    // Reality Anchor Data
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        brain.emitEvent('NEURAL_WORLD_ENTERED', { world: 'panic' });
        return () => {
            clearInterval(timer);
            brain.emitEvent('NEURAL_WORLD_COMPLETED', { world: 'panic' });
        };
    }, []);

    const handleInteraction = () => {
        const time = Date.now();
        const diff = time - lastTap.current;
        lastTap.current = time;
        if (diff < 400) setReactivity(prev => Math.min(prev + 0.1, 1));
        else setReactivity(prev => Math.max(prev - 0.05, 0));
    };

    const nextStep = () => setStep(prev => prev + 1);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleInteraction}
            className="fixed inset-0 z-[500] bg-[#091426] text-white flex flex-col items-center justify-center p-8 overflow-hidden font-['Inter']"
        >
            {/* 🕯️ WARM SHELTER ATMOSPHERE */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.05)_0%,_transparent_70%)] animate-pulse"></div>
                <div className="absolute inset-0 bg-[#091426]/90"></div>
                
                {/* Floating Calming Particles */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ 
                                y: [0, -100, 0],
                                x: [0, Math.random() * 50 - 25, 0],
                                opacity: [0, 0.5, 0]
                            }}
                            transition={{ duration: 10 + Math.random() * 10, repeat: Infinity }}
                            className="absolute w-1 h-1 bg-amber-200 rounded-full"
                            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                        />
                    ))}
                </div>
            </div>

            {/* 🕰️ REALITY ANCHOR (Always visible but subtle) */}
            <div className="absolute top-10 left-10 text-left z-10 opacity-30">
                <div className="flex items-center gap-3 mb-1">
                    <LucideClock size={14} className="text-amber-200" />
                    <p className="text-[10px] font-black uppercase tracking-[4px]">Reality Anchor</p>
                </div>
                <p className="text-lg font-bold">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <p className="text-3xl font-black text-amber-200">{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-[10px] font-medium mt-1">You are safe in this moment.</p>
            </div>

            <div className="relative z-10 max-w-2xl w-full text-center">
                <AnimatePresence mode="wait">
                    {step === 0 && <StepArrival onNext={nextStep} />}
                    {step === 1 && <StepBreathing onNext={nextStep} reactivity={reactivity} />}
                    {step === 2 && <StepGrounding onNext={nextStep} />}
                    {step === 3 && <StepNaming onNext={nextStep} />}
                    {step === 4 && <StepHeart onNext={nextStep} />}
                    {step === 5 && <StepReset onNext={nextStep} />}
                    {step === 6 && <StepPostSession onComplete={(choice) => {
                        // Save feedback to localStorage
                        const log = JSON.parse(localStorage.getItem('sakina_panic_log') || '[]');
                        log.push({ what_helped: choice, date: new Date().toISOString() });
                        localStorage.setItem('sakina_panic_log', JSON.stringify(log.slice(-20)));
                        navigate('/');
                    }} />}
                </AnimatePresence>
            </div>

            {/* ❌ EXIT BUTTON */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                onClick={() => navigate('/')}
                className="absolute top-8 right-8 z-20 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white/70 transition-all duration-300"
                title="Exit to home"
            >
                <LucideX size={18} />
            </motion.button>

            {/* PROGRESS DOTS */}
            <div className="absolute bottom-10 flex gap-4 opacity-20">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-1000 ${i <= step ? 'w-8 bg-amber-200' : 'w-2 bg-white'}`}></div>
                ))}
            </div>

            {reactivity > 0.6 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-1/2 -translate-y-1/2 right-10 flex flex-col items-center gap-2">
                    <div className="w-1 h-20 bg-white/5 rounded-full overflow-hidden">
                        <motion.div animate={{ height: '100%' }} transition={{ duration: 2 }} className="w-full bg-rose-500" />
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-[3px] rotate-90 text-rose-500">Pacing Alert</p>
                </motion.div>
            )}
        </motion.div>
    );
};

const StepArrival = ({ onNext }) => (
    <motion.div key="arrival" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
        <div className="space-y-6">
            <h2 className="text-8xl font-black tracking-tighter uppercase leading-none text-white">Hey.</h2>
            <p className="text-3xl font-medium text-white/60 italic leading-relaxed">"Stay with me for a moment. <br /> You are not alone right now."</p>
        </div>
        <button onClick={onNext} className="px-16 py-8 bg-white text-[#091426] rounded-full font-black uppercase tracking-[15px] text-xs hover:scale-105 transition-all active:scale-95 shadow-2xl">
            I'm Here
        </button>
    </motion.div>
);

const StepBreathing = ({ onNext, reactivity }) => (
    <motion.div key="breathing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-16">
        <div className="space-y-4">
            <h2 className="text-5xl font-black uppercase tracking-tighter">Slow Breath.</h2>
            <p className="text-xl text-white/40 italic">"Breathe in slowly. Now breathe out slowly."</p>
        </div>
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            <motion.div 
                animate={{ scale: [1, 2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 6 + reactivity * 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-amber-200 rounded-full blur-3xl"
            />
            <motion.div 
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 6 + reactivity * 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-40 h-40 rounded-full border-2 border-amber-200/30 flex items-center justify-center"
            >
                <LucideWind size={48} className="text-amber-200" />
            </motion.div>
        </div>
        <button onClick={onNext} className="text-amber-200 font-black uppercase tracking-[8px] text-[10px] animate-pulse">
            Continue when ready
        </button>
    </motion.div>
);

const StepGrounding = ({ onNext }) => (
    <motion.div key="grounding" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
        <div className="space-y-8">
            <h2 className="text-6xl font-black uppercase tracking-tighter leading-tight text-white">Touch <br /> Something.</h2>
            <p className="text-2xl font-medium text-white/50 italic leading-relaxed">"Touch a wall. A chair. Your desk. <br /> Feel that it is real. You are here."</p>
        </div>
        <button onClick={onNext} className="group relative px-16 py-8 bg-amber-200 text-[#091426] rounded-full font-black uppercase tracking-[15px] text-xs shadow-xl">
            I Feel It
            <LucideHand size={14} className="absolute -top-2 -right-2 text-white" />
        </button>
    </motion.div>
);

const StepNaming = ({ onNext }) => {
    const [count, setCount] = useState(0);
    return (
        <motion.div key="naming" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
            <div className="space-y-8">
                <h2 className="text-6xl font-black uppercase tracking-tighter leading-tight text-white">Look <br /> Around.</h2>
                <p className="text-2xl font-medium text-white/50 italic leading-relaxed">"Name 3 things you can see right now."</p>
            </div>
            <div className="flex justify-center gap-6">
                {[1, 2, 3].map(i => (
                    <button 
                        key={i} 
                        onClick={() => setCount(prev => Math.min(prev + 1, 3))}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${count >= i ? 'bg-amber-200 text-[#091426] scale-110' : 'bg-white/5 border border-white/10'}`}
                    >
                        {count >= i ? <LucideCheckCircle size={24} /> : <span className="text-xs font-black">{i}</span>}
                    </button>
                ))}
            </div>
            {count === 3 && (
                <button onClick={onNext} className="animate-in fade-in slide-in-from-bottom-4 duration-1000 px-16 py-6 bg-white text-[#091426] rounded-full font-black uppercase tracking-[10px] text-[10px]">
                    Your mind is slowing down
                </button>
            )}
        </motion.div>
    );
};

const StepHeart = ({ onNext }) => (
    <motion.div key="heart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
        <div className="space-y-8">
            <h2 className="text-6xl font-black uppercase tracking-tighter leading-tight text-white">Hand On <br /> Heart.</h2>
            <p className="text-2xl font-medium text-white/50 italic leading-relaxed">"Feel your breathing. Your body is trying to protect you. You are safe."</p>
        </div>
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-rose-500 rounded-full blur-2xl"
            />
            <LucideHeart size={64} className="text-white relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
        </div>
        <button onClick={onNext} className="px-16 py-8 border-2 border-white/20 rounded-full font-black uppercase tracking-[15px] text-xs hover:bg-white hover:text-black transition-all">
            I Understand
        </button>
    </motion.div>
);

const StepReset = ({ onNext }) => (
    <motion.div key="reset" initial={{ opacity: 0, filter: 'blur(20px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} className="space-y-12">
        <div className="space-y-8">
            <LucideShieldCheck size={80} className="text-amber-200 mx-auto animate-bounce" />
            <h2 className="text-7xl font-black uppercase tracking-tighter leading-tight text-white">You Made <br /> It.</h2>
            <p className="text-2xl font-medium text-white/50 italic leading-relaxed">"The moment has passed. You are stronger than the panic."</p>
        </div>
        <button onClick={onNext} className="px-20 py-10 bg-amber-200 text-[#091426] rounded-full font-black uppercase tracking-[20px] text-xs hover:shadow-[0_0_50px_rgba(251,191,36,0.4)] transition-all">
            I Feel Calmer
        </button>
    </motion.div>
);

const StepPostSession = ({ onComplete }) => {
    const [selected, setSelected] = useState(null);
    return (
        <motion.div key="post" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-xl mx-auto">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-white">What helped <br /> you most?</h2>
            <div className="grid grid-cols-1 gap-4">
                {['Breathing', 'Sounds', 'Touching Objects', 'Slowing Down', 'Visuals'].map(opt => (
                    <button
                        key={opt}
                        onClick={() => setSelected(opt)}
                        className={`w-full py-6 border rounded-3xl font-black uppercase tracking-[4px] text-[10px] transition-all text-left px-10 ${
                            selected === opt
                                ? 'bg-amber-200 text-[#091426] border-amber-200'
                                : 'bg-white/5 hover:bg-amber-200 hover:text-[#091426] border-white/10 text-white'
                        }`}
                    >
                        {opt}
                        {selected === opt && <span className="float-right">✓</span>}
                    </button>
                ))}
            </div>
            {selected && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => onComplete(selected)}
                    className="w-full py-6 bg-white text-[#091426] rounded-3xl font-black uppercase tracking-[6px] text-[10px] hover:bg-amber-200 transition-all"
                >
                    Complete Session
                </motion.button>
            )}
        </motion.div>
    );
};

export default BackToSafe;
