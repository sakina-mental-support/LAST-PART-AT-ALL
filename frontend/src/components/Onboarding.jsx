import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from './Badge';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        stress: 50,
        sleep: '6-7 hours',
        goals: [],
        style: 'Compassionate',
        moodPattern: 'Fluctuating'
    });

    const goalsList = [
        { id: 'anxiety', label: 'Anxiety Relief', icon: 'psychology' },
        { id: 'sleep', label: 'Better Sleep', icon: 'bedtime' },
        { id: 'focus', label: 'Improve Focus', icon: 'target' },
        { id: 'calm', label: 'Inner Peace', icon: 'spa' },
        { id: 'burnout', label: 'Burnout Recovery', icon: 'bolt' },
        { id: 'growth', label: 'Personal Growth', icon: 'trending_up' }
    ];

    const styles = [
        { id: 'Compassionate', desc: 'Gentle, warm, and highly supportive.' },
        { id: 'Stoic', desc: 'Objective, logical, and resilient.' },
        { id: 'Direct', desc: 'Clear, actionable, and solution-focused.' },
        { id: 'Meditative', desc: 'Quiet, slow, and focus-driven.' }
    ];

    const nextStep = () => setStep(step + 1);
    const complete = () => {
        const existingProfile = JSON.parse(localStorage.getItem('sakina_profile') || '{}');
        localStorage.setItem('sakina_profile', JSON.stringify({ ...existingProfile, ...data }));
        localStorage.setItem('sakina_onboarding', 'true');
        navigate('/');
    };

    const toggleGoal = (id) => {
        setData(prev => ({
            ...prev,
            goals: prev.goals.includes(id) 
                ? prev.goals.filter(g => g !== id) 
                : [...prev.goals, id]
        }));
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-['Inter'] relative overflow-hidden animate-fade-in">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00adef]/5 rounded-full blur-[120px] animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6366f1]/5 rounded-full blur-[120px] animate-blob [animation-delay:2s]"></div>

            {/* Navigation Header */}
            <header className="px-12 py-10 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#00adef] flex items-center justify-center text-white shadow-xl">
                        <span className="material-symbols-outlined">spa</span>
                    </div>
                    <span className="text-2xl font-['Inter'] font-bold tracking-tighter uppercase">Sakina</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-1 w-24 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00adef] transition-all duration-700" style={{ width: `${(step/5) * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[4px]">Phase 0{step}</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-12 pb-24 relative z-10">
                <div className="max-w-2xl w-full">
                    {step === 1 && (
                        <section className="animate-in slide-in-from-bottom-12 duration-700">
                            <Badge variant="subtle" color="teal" size="sm" className="mb-6 tracking-[5px]">Neural Foundation</Badge>
                            <h2 className="text-6xl font-['Inter'] font-bold text-[#091426] mb-8 tracking-tighter uppercase leading-[0.85]">Define Your <br /><span className="text-[#00adef] italic">Stress Baseline.</span></h2>
                            <p className="text-xl text-[#505f76] font-medium mb-16 opacity-70">Where is your current energy level on the scale of peace to high-alert?</p>
                            
                            <div className="space-y-12">
                                <div className="relative pt-10">
                                    <input 
                                        type="range" min="0" max="100" 
                                        value={data.stress} 
                                        onChange={(e) => setData({...data, stress: e.target.value})}
                                        className="w-full h-3 bg-gray-100 rounded-full appearance-none accent-[#00adef] cursor-pointer"
                                    />
                                    <div className="flex justify-between mt-8 text-[10px] font-black text-gray-300 uppercase tracking-[4px]">
                                        <span>Absolute Calm</span>
                                        <span className="text-[#00adef] text-xl font-bold">{data.stress}%</span>
                                        <span>Extreme Alert</span>
                                    </div>
                                </div>
                                <button onClick={nextStep} className="w-full py-8 bg-[#091426] text-white font-black rounded-[40px] shadow-2xl hover:bg-[#00adef] transition-all uppercase tracking-[10px] text-xs">Continue</button>
                            </div>
                        </section>
                    )}

                    {step === 2 && (
                        <section className="animate-in slide-in-from-bottom-12 duration-700">
                            <Badge variant="subtle" color="indigo" size="sm" className="mb-6 tracking-[5px]">Recovery Patterns</Badge>
                            <h2 className="text-6xl font-['Inter'] font-bold text-[#091426] mb-8 tracking-tighter uppercase leading-[0.85]">Restorative <br /><span className="text-[#6366f1] italic">Quality.</span></h2>
                            <p className="text-xl text-[#505f76] font-medium mb-16 opacity-70">How much time do you typically spend in deep restorative sleep?</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
                                {['Less than 5h', '5-6 hours', '6-7 hours', '8+ hours'].map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => { setData({...data, sleep: opt}); nextStep(); }}
                                        className={`p-10 rounded-[48px] border text-lg font-bold transition-all text-left group ${data.sleep === opt ? 'bg-[#091426] text-white border-[#091426] shadow-2xl' : 'bg-[#f7f9fb] border-transparent hover:border-gray-200 hover:bg-white text-[#505f76]'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${data.sleep === opt ? 'bg-white/10' : 'bg-white'}`}>
                                            <span className="material-symbols-outlined">bedtime</span>
                                        </div>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setStep(1)} className="text-[10px] font-black text-gray-300 uppercase tracking-[4px] hover:text-[#00adef] transition-colors">Previous Step</button>
                        </section>
                    )}

                    {step === 3 && (
                        <section className="animate-in slide-in-from-bottom-12 duration-700">
                            <Badge variant="subtle" color="amber" size="sm" className="mb-6 tracking-[5px]">Intentions</Badge>
                            <h2 className="text-6xl font-['Inter'] font-bold text-[#091426] mb-8 tracking-tighter uppercase leading-[0.85]">Core <br /><span className="text-[#f59e0b] italic">Aspirations.</span></h2>
                            <p className="text-xl text-[#505f76] font-medium mb-16 opacity-70">Select the primary areas where you want to focus your mental energy.</p>
                            
                            <div className="grid grid-cols-2 gap-6 mb-16">
                                {goalsList.map(goal => (
                                    <button 
                                        key={goal.id}
                                        onClick={() => toggleGoal(goal.id)}
                                        className={`p-10 rounded-[48px] border transition-all text-center flex flex-col items-center ${data.goals.includes(goal.id) ? 'bg-[#f59e0b] text-white border-[#f59e0b] shadow-2xl scale-105' : 'bg-[#f7f9fb] border-transparent hover:border-gray-200 hover:bg-white text-[#505f76]'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${data.goals.includes(goal.id) ? 'bg-white/10' : 'bg-white'}`}>
                                            <span className="material-symbols-outlined text-[28px]">{goal.icon}</span>
                                        </div>
                                        <span className="font-bold text-lg">{goal.label}</span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={nextStep} className="w-full py-8 bg-[#091426] text-white font-black rounded-[40px] shadow-2xl hover:bg-[#00adef] transition-all uppercase tracking-[10px] text-xs">Confirm Focus</button>
                        </section>
                    )}

                    {step === 4 && (
                        <section className="animate-in slide-in-from-bottom-12 duration-700">
                            <Badge variant="subtle" color="indigo" size="sm" className="mb-6 tracking-[5px]">AI Personality</Badge>
                            <h2 className="text-6xl font-['Inter'] font-bold text-[#091426] mb-8 tracking-tighter uppercase leading-[0.85]">Support <br /><span className="text-[#6366f1] italic">Architecture.</span></h2>
                            <p className="text-xl text-[#505f76] font-medium mb-16 opacity-70">How should your AI companion interact with you during difficult moments?</p>
                            
                            <div className="space-y-6 mb-16">
                                {styles.map(s => (
                                    <button 
                                        key={s.id}
                                        onClick={() => { setData({...data, style: s.id}); nextStep(); }}
                                        className={`w-full p-10 rounded-[40px] border flex items-center justify-between text-left transition-all ${data.style === s.id ? 'bg-[#091426] text-white border-[#091426] shadow-xl' : 'bg-[#f7f9fb] border-transparent hover:border-gray-200 hover:bg-white text-[#091426]'}`}
                                    >
                                        <div>
                                            <p className="text-2xl font-bold uppercase tracking-tighter">{s.id}</p>
                                            <p className={`text-sm font-medium ${data.style === s.id ? 'text-gray-400' : 'text-gray-400'}`}>{s.desc}</p>
                                        </div>
                                        <span className="material-symbols-outlined">{data.style === s.id ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {step === 5 && (
                        <section className="animate-in zoom-in duration-700 text-center">
                            <div className="w-40 h-40 rounded-[56px] bg-[#00adef] text-white flex items-center justify-center text-6xl mb-16 mx-auto shadow-2xl shadow-[#00adef]/30">✨</div>
                            <Badge variant="subtle" color="teal" size="sm" className="mb-8 tracking-[5px]">Synthesis Complete</Badge>
                            <h2 className="text-6xl font-['Inter'] font-bold text-[#091426] mb-8 tracking-tighter uppercase leading-[0.85]">Profile <br /><span className="text-[#00adef] italic">Activated.</span></h2>
                            <p className="text-xl text-[#505f76] font-medium mb-20 opacity-70 max-w-md mx-auto">Your sanctuary is now personalized. We've synchronized our algorithms with your unique rhythm.</p>
                            
                            <button onClick={complete} className="w-full py-10 bg-[#091426] text-white font-black rounded-[48px] shadow-2xl hover:bg-[#00adef] transition-all uppercase tracking-[15px] text-xs">Enter Sanctuary</button>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Onboarding;
