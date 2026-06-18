import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRiskAssessment } from '../services/api';
import Badge from './Badge';

const RiskGauge = ({ score, label, color }) => {
    const radius = 60, stroke = 8;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const colors = { rose: '#f43f5e', amber: '#f59e0b', emerald: '#00adef', teal: '#00adef' };
    const c = colors[color] || colors.teal;
    return (
        <div className="relative flex items-center justify-center w-full max-w-[140px] sm:max-w-[180px] aspect-square mx-auto">
            <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
                <circle cx="70" cy="70" r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
                <circle cx="70" cy="70" r={radius} fill="none" stroke={c} strokeWidth={stroke}
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" className="transition-all duration-[2000ms] ease-out" />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl sm:text-5xl font-['Inter'] font-bold text-white">{score}</span>
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[4px] text-white/60 mt-1">{label}</span>
            </div>
        </div>
    );
};

const FactorBar = ({ label, score, icon, max = 100 }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
                <span className="material-symbols-outlined text-base sm:text-lg text-gray-400">{icon}</span>
                <span className="text-[9px] sm:text-xs font-bold text-[#091426] uppercase tracking-[1px] sm:tracking-[2px]">{label}</span>
            </div>
            <span className="text-[10px] sm:text-sm font-bold text-[#00adef]">{score}/{max}</span>
        </div>
        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-[1500ms] ${score >= 70 ? 'bg-rose-500' : score >= 40 ? 'bg-amber-400' : 'bg-[#00adef]'}`}
                style={{ width: `${Math.min(100, score)}%` }} />
        </div>
    </div>
);

const RiskAssessment = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const profile = JSON.parse(localStorage.getItem('sakina_profile') || '{}');
    const surveyStress = parseInt(profile.stress) || 0;
    const sleepQualityScore = profile.sleep === '8+ hours' ? 0 : profile.sleep === '6-7 hours' ? 30 : profile.sleep === '5-6 hours' ? 60 : 90;

    const fetchAssessment = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getRiskAssessment();
            setData(res.data);
        } catch (err) {
            setError(err.message || 'Failed to load assessment');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAssessment(); }, []);

    if (loading) return (
        <div className="py-6 font-['Inter'] animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-[#00adef]/20 border-t-[#00adef] rounded-full animate-spin mb-8" />
            <p className="text-sm font-bold text-gray-300 uppercase tracking-[6px]">Analyzing Risk Profile...</p>
        </div>
    );

    if (error) return (
        <div className="py-6 font-['Inter'] animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <span className="material-symbols-outlined text-6xl text-gray-200 mb-6">error_outline</span>
            <p className="text-lg font-bold text-[#091426] mb-2">Unable to Load Assessment</p>
            <p className="text-sm text-gray-400 mb-8 max-w-md">{error}</p>
            <button onClick={fetchAssessment} className="px-10 py-4 bg-[#091426] text-white font-black rounded-[28px] uppercase tracking-[4px] text-[10px] hover:bg-[#00adef] transition-all">Retry</button>
        </div>
    );

    if (!data) return null;
    const { overallRisk, riskLevel, riskColor, breakdown, recommendations, assessedAt } = data;
    const m = breakdown.mood, s = breakdown.survey, j = breakdown.journal;

    return (
        <div className="py-4 sm:py-6 font-['Inter'] animate-fade-in space-y-8 sm:space-y-16 pb-24 sm:pb-32 w-full max-w-[100vw] overflow-x-hidden flex flex-col items-center box-border pl-0 pr-6 sm:px-8">
            {/* Header */}
            <header className="space-y-6 sm:space-y-8 w-full box-border">
                <Badge variant="solid" color="teal" size="sm" className="tracking-[2px] sm:tracking-[8px] uppercase !bg-[#00adef]/10 !text-[#00adef] text-center whitespace-normal break-words max-w-full">Risk Intelligence v2.0</Badge>
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-10 w-full box-border">
                    <h1 className="font-['Inter'] text-3xl sm:text-6xl lg:text-8xl font-bold text-[#091426] tracking-tighter uppercase leading-[0.85] break-words text-left">
                        Risk <br /><span className="text-[#00adef] italic">Assessment.</span>
                    </h1>
                    <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-3 sm:gap-4">
                        <button onClick={() => navigate('/onboarding')} className="w-full sm:w-auto px-4 sm:px-10 py-3 sm:py-6 bg-white text-[#091426] border border-gray-100 rounded-[20px] sm:rounded-[32px] font-black uppercase tracking-[3px] sm:tracking-[4px] text-[9px] hover:border-[#00adef] hover:text-[#00adef] transition-all flex items-center justify-center gap-3 shadow-sm">
                            <span className="material-symbols-outlined text-lg">edit_document</span>Retake Survey
                        </button>
                       
                    </div>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-300 font-bold uppercase tracking-[2px] sm:tracking-[4px] leading-relaxed opacity-60 text-left break-words max-w-full">
                    ⚠ This is not a medical diagnosis. Sakina provides emotional support only.
                </p>
            </header>

            {/* Risk Score Hero */}
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 sm:gap-10 w-full">
                <div className="lg:col-span-5 bg-[#091426] rounded-[24px] sm:rounded-[64px] p-5 sm:p-16 text-white relative overflow-hidden flex flex-col items-center justify-center shadow-sakina-lg w-full box-border">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00adef]/10 to-transparent opacity-50" />
                    <div className="relative z-10 flex flex-col items-center w-full box-border">
                        <Badge variant="solid" color="teal" size="xs" className="mb-6 sm:mb-10 !bg-white/10 tracking-[2px] sm:tracking-[5px] text-center whitespace-normal break-words max-w-full">Overall Risk Score</Badge>
                        <RiskGauge score={overallRisk} label={riskLevel} color={riskColor} />
                        <p className="text-[8px] sm:text-[10px] text-gray-400 mt-6 sm:mt-8 uppercase tracking-[1px] sm:tracking-[3px] text-center break-words max-w-full">Assessed {new Date(assessedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                </div>
                {/* Breakdown Cards */}
                <div className="lg:col-span-7 flex flex-col justify-center w-full box-border">
                    <div className="bg-white p-6 sm:p-12 rounded-[24px] sm:rounded-[48px] shadow-sakina border border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-8 group sm:hover:-translate-y-2 transition-all duration-500 overflow-hidden w-full box-border h-full max-h-full">
                        <div className="flex items-center gap-6 sm:gap-10 w-full sm:w-auto">
                            <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-[20px] sm:rounded-[36px] flex items-center justify-center shadow-inner ${m.score >= 70 ? 'bg-rose-50 text-rose-500' : m.score >= 40 ? 'bg-amber-50 text-amber-500' : 'bg-[#00adef]/10 text-[#00adef]'} group-hover:rotate-12 transition-all flex-shrink-0`}>
                                <span className="material-symbols-outlined text-4xl sm:text-6xl">mood</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] sm:text-[11px] font-black text-gray-400 uppercase tracking-[3px] sm:tracking-[5px] mb-2">Primary Metric</p>
                                <h3 className="text-3xl sm:text-5xl font-black text-[#091426] tracking-tighter uppercase mb-2">Mood Score</h3>
                                <p className="text-[10px] sm:text-sm text-gray-400 font-bold">{m.weeklyAverage ? `Weekly Average: ${m.weeklyAverage}/10` : 'No weekly data'}</p>
                            </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto mt-4 sm:mt-0 pt-6 sm:pt-0 border-t sm:border-t-0 border-gray-100 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                            <Badge variant="subtle" color="teal" size="sm" className="tracking-widest mb-0 sm:mb-6">{m.weight}</Badge>
                            <div className="flex items-baseline gap-1">
                                <p className="text-5xl sm:text-8xl font-['Inter'] font-black text-[#091426] tracking-tighter leading-none">{m.score}</p>
                                <span className="text-xl sm:text-3xl text-gray-300 font-bold">/100</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown Section */}
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 sm:gap-10 w-full box-border">
                {/* Factors */}
                <div className="lg:col-span-7 bg-white rounded-[24px] sm:rounded-[56px] p-5 sm:p-16 shadow-sakina border border-gray-50 w-full box-border">
                    <h3 className="text-[9px] sm:text-[11px] font-black text-gray-300 uppercase tracking-[3px] sm:tracking-[6px] mb-8 sm:mb-14">Risk Factor Breakdown</h3>
                    <div className="space-y-6 sm:space-y-10 w-full">
                        <FactorBar label="Mood Risk" score={m.score} icon="mood" />
                        <FactorBar label="Sleep Quality" score={sleepQualityScore} icon="bedtime" />
                        <FactorBar label="Stress Baseline" score={surveyStress} icon="timeline" />
                        {m.volatility > 0 && <FactorBar label="Volatility" score={Math.min(100, Math.round(m.volatility * 20))} icon="show_chart" />}
                    </div>

                    {/* Mood Trend */}
                    {m.trend && m.trend !== 'insufficient_data' && (
                        <div className="mt-10 sm:mt-14 pt-10 sm:pt-14 border-t border-gray-100 flex flex-wrap items-center gap-3 sm:gap-4">
                            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${m.trend === 'improving' ? 'bg-[#00adef]/10 text-[#00adef]' : m.trend === 'declining' ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-500'}`}>
                                <span className="material-symbols-outlined text-base">{m.trend === 'improving' ? 'trending_up' : m.trend === 'declining' ? 'trending_down' : 'trending_flat'}</span>
                                <span className="text-[9px] font-black uppercase tracking-[2px]">{m.trend}</span>
                            </div>
                            {m.consecutiveLowDays > 0 && (
                                <div className="px-4 py-2 rounded-full bg-amber-50 text-amber-600 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">warning</span>
                                    <span className="text-[9px] font-black uppercase tracking-[2px]">{m.consecutiveLowDays} Low Days</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Recommendations */}
                <div className="lg:col-span-5 bg-[#091426] rounded-[24px] sm:rounded-[56px] p-5 sm:p-16 text-white relative overflow-hidden shadow-sakina-lg w-full box-border">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00adef]/10 to-transparent opacity-50" />
                    <div className="relative z-10 w-full">
                        <Badge variant="solid" color="teal" size="xs" className="mb-6 sm:mb-10 !bg-[#00adef]/20 !text-[#00adef] tracking-[3px] sm:tracking-[5px]">AI Recommendations</Badge>
                        <h2 className="text-xl sm:text-4xl font-['Inter'] font-bold mb-8 sm:mb-14 tracking-tighter uppercase leading-[0.9]">Your <span className="text-[#00adef]">Action Plan.</span></h2>
                        <div className="space-y-5 sm:space-y-6 w-full">
                            {recommendations && recommendations.length > 0 ? recommendations.map((rec, i) => (
                                <div key={i} className="flex gap-4 sm:gap-5 items-start group w-full">
                                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[16px] sm:rounded-[20px] flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 ${rec.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' : rec.priority === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-[#00adef]/20 text-[#00adef]'}`}>
                                        <span className="material-symbols-outlined text-xl">{rec.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white mb-1 break-words">{rec.title}</p>
                                        <p className="text-xs text-gray-400 leading-relaxed break-words">{rec.description}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-40">
                                    <span className="material-symbols-outlined text-5xl mb-4">check_circle</span>
                                    <p className="text-xs font-bold uppercase tracking-[4px]">No urgent actions</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Survey Risk Factors & Journal Flags */}
            {(s.factors?.length > 0 || j.flaggedTerms?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full box-border">
                    {s.factors?.length > 0 && (
                        <div className="bg-white rounded-[32px] sm:rounded-[48px] p-6 sm:p-12 shadow-sakina border border-gray-50 w-full box-border">
                            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[5px] mb-6 sm:mb-8">Survey Risk Factors</h3>
                            <div className="space-y-3 sm:space-y-4">
                                {s.factors.map((f, i) => (
                                    <div key={i} className={`flex items-center gap-4 px-5 sm:px-6 py-4 rounded-[20px] ${f.severity === 'high' ? 'bg-rose-50' : 'bg-amber-50'}`}>
                                        <div className={`w-2.5 h-2.5 rounded-full ${f.severity === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                        <span className="text-sm font-bold text-[#091426] flex-1">{f.name}</span>
                                        <span className={`text-xs font-black uppercase tracking-[2px] ${f.severity === 'high' ? 'text-rose-500' : 'text-amber-500'}`}>{f.severity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {j.flaggedTerms?.length > 0 && (
                        <div className="bg-white rounded-[32px] sm:rounded-[48px] p-6 sm:p-12 shadow-sakina border border-gray-50 w-full box-border">
                            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[5px] mb-6 sm:mb-8">Journal Distress Signals</h3>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {j.flaggedTerms.map((term, i) => (
                                    <span key={i} className="px-4 py-2 bg-rose-50 text-rose-500 rounded-[14px] text-xs font-bold">{term}</span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-300 mt-6 leading-relaxed">These terms were detected in recent journal entries.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Recent Mood Timeline */}
            {m.recentMoods?.length > 0 && (
                <div className="bg-white rounded-[24px] sm:rounded-[56px] p-5 sm:p-16 shadow-sakina border border-gray-50 w-full box-border">
                    <h3 className="text-[9px] sm:text-[11px] font-black text-gray-300 uppercase tracking-[4px] sm:tracking-[6px] mb-8 sm:mb-12">Recent Mood Timeline</h3>
                    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                        {m.recentMoods.map((mood, i) => (
                            <div key={i} className="flex-shrink-0 w-[100px] sm:w-[120px] bg-gray-50 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 flex flex-col items-center gap-3 hover:bg-[#00adef]/5 transition-all">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[16px] sm:rounded-[20px] flex items-center justify-center text-xl sm:text-2xl font-bold ${mood.level <= 3 ? 'bg-rose-100 text-rose-500' : mood.level <= 6 ? 'bg-amber-100 text-amber-500' : 'bg-[#00adef]/20 text-[#00adef]'}`}>
                                    {mood.level}
                                </div>
                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[2px]">
                                    {new Date(mood.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskAssessment;
