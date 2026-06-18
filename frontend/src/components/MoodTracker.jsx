import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createMood, getMoods } from "../services/api";
import { useEmotionalOS } from "../context/EmotionalOSContext.jsx";
import { useEmotionalBrain } from "../store/useEmotionalBrain";
import Badge from "./Badge";

const MOODS = [
  { id: "happy",       label: "Serene",      emoji: "✨", score: 5, color: "#00adef",  desc: "Peak Harmony" },
  { id: "calm",        label: "Content",     emoji: "🙂", score: 4, color: "#6366f1",  desc: "Stable State" },
  { id: "balanced",    label: "Balanced",    emoji: "😐", score: 3, color: "#94a3b8",  desc: "Neutral Axis" },
  { id: "anxious",     label: "Anxious",     emoji: "😟", score: 2, color: "#f59e0b",  desc: "System Noise" },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😫", score: 1, color: "#f43f5e",  desc: "Critical Load" },
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const BAR_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Get a local YYYY-MM-DD key from any date value */
const localDateKey = (dateVal) => {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Map numeric moodLevel (1-5) back to a mood string ID */
const levelToMoodId = (level) => {
  const numLevel = Number(level);
  if (numLevel >= 5) return "happy";
  if (numLevel === 4) return "calm";
  if (numLevel === 3) return "balanced";
  if (numLevel === 2) return "anxious";
  return "overwhelmed";
};

const MoodTracker = () => {
  const navigate = useNavigate();
  const { dispatch, emitEvent } = useEmotionalOS();
  const [selectedMood, setSelectedMood] = useState(() => {
    return localStorage.getItem("sakina_draft_mood") || "balanced";
  });
  const [note, setNote] = useState(() => {
    return localStorage.getItem("sakina_draft_note") || "";
  });
  const [loading, setLoading] = useState(false);

  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId);
    localStorage.setItem("sakina_draft_mood", moodId);
  };

  const handleNoteChange = (text) => {
    setNote(text);
    localStorage.setItem("sakina_draft_note", text);
  };
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [weeklyLog, setWeeklyLog] = useState([]);  // always loaded from backend, never from localStorage

  // ── Fetch mood history from backend on mount ──────────────────────────────
  const loadMoodsFromBackend = useCallback(async () => {
    try {
      setFetchingHistory(true);
      const data = await getMoods(1, 90); // last 90 entries
      // Backend returns: { success, data: [...moods], pagination }
      const rawMoods = data.data || data.moods || [];
      const entries = rawMoods.map((m) => ({
        mood: levelToMoodId(m.moodLevel),
        note: m.note || "",
        date: m.createdAt,
        fromBackend: true,
      }));

      // Sort ascending by date and set — backend is the only source of truth
      entries.sort((a, b) => new Date(a.date) - new Date(b.date));
      setWeeklyLog(entries);

      // If already logged today, override the selected state & note with the logged ones
      const todayEntry = entries.find(e => localDateKey(e.date) === todayKey());
      if (todayEntry) {
        setSelectedMood(todayEntry.mood);
        setNote(todayEntry.note || "");
      }
    } catch (err) {
      console.warn("Could not fetch mood history from backend:", err.message);
      // Fall back to localStorage already loaded in initial state
    } finally {
      setFetchingHistory(false);
    }
  }, []);

  useEffect(() => { loadMoodsFromBackend(); }, [loadMoodsFromBackend]);

  // Already logged today guard — use local date key
  const alreadyLoggedToday = weeklyLog.some(e => localDateKey(e.date) === todayKey());
  const todaysEntry = weeklyLog.find(e => localDateKey(e.date) === todayKey());

  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

  // Build a map of day → mood for calendar coloring — use local date
  const dayMoodMap = {};
  weeklyLog.forEach(e => {
    if (e.date) {
      const d = new Date(e.date);
      if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
        dayMoodMap[d.getDate()] = e.mood;
      }
    }
  });

  // Find entry for selected day
  const selectedDayEntry = weeklyLog.find(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d.getDate() === selectedDay &&
      d.getMonth() === currentDate.getMonth() &&
      d.getFullYear() === currentDate.getFullYear();
  });

  const calendarDays = [];
  let week = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) {
    week.push(i);
    if (week.length === 7) { calendarDays.push(week); week = []; }
  }
  if (week.length > 0) { while (week.length < 7) week.push(null); calendarDays.push(week); }

  // Compute 7-day bar chart — one bar per LOCAL calendar day
  const chartData = (() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i)); // day[0]=6 days ago … day[6]=today
      const key = localDateKey(d); // LOCAL date key, not UTC
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const entry = weeklyLog.find(e => localDateKey(e.date) === key);
      const score = entry ? (MOODS.find(m => m.id === entry.mood)?.score ?? null) : null;
      return { label, score, key };
    });
  })();

  const getMoodColor = (moodId) => {
    const mood = MOODS.find(m => m.id === moodId);
    return mood?.color || '#94a3b8';
  };

  const getMoodEmoji = (moodId) => {
    const mood = MOODS.find(m => m.id === moodId);
    return mood?.emoji || '😐';
  };

  const handleSubmit = async () => {
    if (loading || alreadyLoggedToday) return;
    setLoading(true);
    try {
      const moodObj = MOODS.find(m => m.id === selectedMood);
      await createMood(moodObj.score, note);

      // Optimistically update local state immediately
      const entry = { mood: selectedMood, note, date: new Date().toISOString() };
      setWeeklyLog(prev => [...prev, entry]);

      // Sync to Emotional OS
      emitEvent("mood_selected", selectedMood);
      dispatch({ type: "SET_MOOD", payload: selectedMood });

      setFeedback({ type: "success", message: "Emotional state synchronized. Your neural pattern has been updated." });
      setNote("");
      localStorage.removeItem("sakina_draft_mood");
      localStorage.removeItem("sakina_draft_note");
      setTimeout(() => setFeedback({ type: "", message: "" }), 5000);

      // Refresh from backend (authoritative source)
      loadMoodsFromBackend();
    } catch {
      setFeedback({ type: "error", message: "Sync failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const activeMood = MOODS.find(m => m.id === selectedMood);
  const avgScore = weeklyLog.length > 0 ? (weeklyLog.slice(-7).reduce((a, e) => a + (MOODS.find(m => m.id === e.mood)?.score ?? 3), 0) / Math.min(weeklyLog.length, 7)).toFixed(1) : "—";
  const trend = weeklyLog.length > 1 ? (MOODS.find(m => m.id === weeklyLog.at(-1).mood)?.score > MOODS.find(m => m.id === weeklyLog.at(-2)?.mood)?.score ? "↑ Improving" : "→ Stable") : "Tracking";

  return (
    <div className="py-6 animate-fade-in font-['Inter'] space-y-16 pb-24">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 sm:gap-12">
        <div className="text-left">
          <Badge variant="subtle" color="teal" size="sm" className="mb-4 sm:mb-6 tracking-[3px] sm:tracking-[5px]">Emotional Tracking v2</Badge>
          <h1 className="font-['Inter'] text-4xl sm:text-6xl lg:text-8xl font-bold text-[#091426] tracking-tighter mb-4 sm:mb-6 uppercase leading-[0.85]">Daily <br /><span className="text-[#00adef] italic">Reflection.</span></h1>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sakina border border-gray-50 text-center flex-shrink-0 min-w-[120px] sm:min-w-[160px]">
            <p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-[3px] sm:tracking-[4px] mb-1 sm:mb-2">Weekly Avg</p>
            <p className="text-3xl sm:text-5xl font-bold text-[#091426]">{avgScore}<span className="text-sm sm:text-lg text-gray-200">/5</span></p>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sakina border border-gray-50 text-center flex-shrink-0 min-w-[120px] sm:min-w-[160px]">
            <p className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-[3px] sm:tracking-[4px] mb-1 sm:mb-2">Trend</p>
            <p className="text-lg sm:text-2xl font-bold text-[#00adef]">{trend}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* LEFT: Calendar + Chart */}
        <div className="lg:col-span-4 space-y-10">

          {/* Mini Bar Chart (Weekly Mood) */}
          <div className="bg-white rounded-[32px] sm:rounded-[56px] p-8 sm:p-12 shadow-sakina border border-gray-50">
            <div className="flex items-center justify-between mb-6 sm:mb-10">
              <h3 className="text-[9px] sm:text-[11px] font-black uppercase tracking-[4px] sm:tracking-[6px] text-gray-300">7-Day Neural Wave</h3>
              {fetchingHistory && (
                <div className="w-3 h-3 border-2 border-[#00adef]/30 border-t-[#00adef] rounded-full animate-spin" />
              )}
            </div>
            {fetchingHistory ? (
              /* Skeleton */
              <div className="flex gap-2 sm:gap-3" style={{ height: 120 }}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
                    <div className="w-full rounded-t-xl animate-pulse bg-gray-100" style={{ height: `${30 + (i * 11) % 60}px` }} />
                    <span className="block w-4 h-2 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : chartData.every(d => d.score === null) ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="animate-empty-float mb-5">
                  <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-[#00adef]/10 to-[#6366f1]/10 flex items-center justify-center shadow-inner border border-white">
                    <span className="material-symbols-outlined text-4xl text-[#00adef]/40">bar_chart</span>
                  </div>
                </div>
                <p className="text-sm font-black text-[#091426] tracking-tighter mb-1">No data yet</p>
                <p className="text-xs text-gray-300 font-medium">Log your first mood to start tracking</p>
              </div>
            ) : (
              /* Chart bars — uses absolute px heights so % works correctly in flexbox */
              <div className="flex gap-2 sm:gap-3" style={{ height: 120 }}>
                {chartData.map((d, i) => {
                  const barH = d.score ? Math.round((d.score / 5) * 100) : 6;
                  const barColor = d.score
                    ? (d.score >= 4 ? '#00adef' : d.score === 3 ? '#94a3b8' : '#f43f5e')
                    : '#f0f4f8';
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
                      <div
                        className="relative group w-full rounded-t-xl sm:rounded-t-2xl transition-all duration-700"
                        style={{ height: `${barH}px`, background: barColor, opacity: d.score ? 1 : 0.3 }}
                      >
                        {d.score && (
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-black text-[#091426]">
                            {d.score}
                          </div>
                        )}
                      </div>
                      <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-[1px] sm:tracking-[2px] text-gray-300">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-[32px] sm:rounded-[56px] p-8 sm:p-12 shadow-sakina border border-gray-50">
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <h3 className="font-['Inter'] text-xl sm:text-2xl font-bold text-[#091426] uppercase">{currentMonthName}</h3>
            </div>
            <div className="grid grid-cols-7 mb-4 sm:mb-6">
              {DAYS.map((d, i) => (<div key={i} className="text-center text-[8px] sm:text-[10px] font-black text-gray-200 uppercase tracking-[2px]">{d}</div>))}
            </div>
            <div className="space-y-2 sm:space-y-3">
              {calendarDays.map((wk, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {wk.map((day, di) => {
                    const moodForDay = dayMoodMap[day];
                    const isToday = day === currentDate.getDate();
                    const isSelected = selectedDay === day;
                    return (
                      <div key={di} className="aspect-square flex items-center justify-center">
                        {day ? (
                          <button
                            onClick={() => setSelectedDay(day)}
                            className={`w-full h-full rounded-[10px] sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all relative ${
                              isSelected
                                ? 'bg-[#00adef] text-white shadow-lg scale-110'
                                : isToday
                                ? 'border-2 border-[#00adef] text-[#00adef]'
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                            title={moodForDay ? `${getMoodEmoji(moodForDay)} ${moodForDay}` : ''}
                          >
                            {day}
                            {/* Mood dot indicator */}
                            {moodForDay && !isSelected && (
                              <span
                                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                style={{ background: getMoodColor(moodForDay) }}
                              />
                            )}
                          </button>
                        ) : <div />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Selected Day Entry Preview */}
            {selectedDayEntry ? (
              <div className="mt-6 pt-6 border-t border-gray-50 animate-fade-in">
                <p className="text-[8px] font-black uppercase tracking-[3px] text-gray-300 mb-3">
                  {selectedDay === currentDate.getDate() ? "Today" : `${currentMonthName} ${selectedDay}`}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getMoodEmoji(selectedDayEntry.mood)}</span>
                  <div>
                    <p className="text-sm font-black text-[#091426] capitalize">{selectedDayEntry.mood}</p>
                    {selectedDayEntry.note && (
                      <p className="text-xs text-gray-400 leading-relaxed mt-1 line-clamp-2">"{selectedDayEntry.note}"</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-gray-50">
                <p className="text-[8px] font-black uppercase tracking-[3px] text-gray-300">
                  {selectedDay === currentDate.getDate() ? "No entry yet today" : `No entry for ${currentMonthName} ${selectedDay}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: State Selection */}
        <div className="lg:col-span-8 bg-white rounded-[32px] sm:rounded-[56px] p-8 sm:p-16 shadow-sakina border border-gray-50">

          {/* Already logged today banner */}
          {alreadyLoggedToday && todaysEntry && (
            <div className="mb-8 p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-[#00adef]/5 border border-[#00adef]/20 flex items-center gap-4 sm:gap-6">
              <span className="text-3xl">{getMoodEmoji(todaysEntry.mood)}</span>
              <div className="flex-1">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[3px] text-[#00adef] mb-1">Already logged today</p>
                <p className="text-sm sm:text-base font-bold text-[#091426] capitalize">{todaysEntry.mood} — {todaysEntry.note ? `"${todaysEntry.note.slice(0, 60)}${todaysEntry.note.length > 60 ? '...' : ''}"` : 'No note added'}</p>
              </div>
              <button
                onClick={() => {
                  // Allow override by removing today's entry locally so state allows submission
                  const filtered = weeklyLog.filter(e => localDateKey(e.date) !== todayKey());
                  setWeeklyLog(filtered);
                }}
                className="text-[9px] font-black uppercase tracking-[3px] text-gray-400 hover:text-rose-500 transition-colors whitespace-nowrap"
              >
                Update
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mb-10 sm:mb-12">
            <div>
              <h2 className="font-['Inter'] text-2xl sm:text-4xl font-bold text-[#091426] tracking-tighter uppercase mb-2">Select State</h2>
              <p className="text-xs sm:text-base text-[#505f76] font-medium">Current: <span className="text-[#00adef] font-bold">{activeMood.desc}</span></p>
            </div>
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[28px] bg-[#f7f9fb] flex items-center justify-center text-2xl sm:text-4xl shadow-inner">{activeMood.emoji}</div>
          </div>

          {/* Mood Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-10 sm:mb-12">
            {MOODS.map((mood) => {
              const isSelected = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood.id)}
                  disabled={alreadyLoggedToday}
                  className={`flex flex-col items-center gap-3 sm:gap-5 p-4 sm:p-8 rounded-[24px] sm:rounded-[40px] border transition-all duration-500 ${alreadyLoggedToday ? 'opacity-40 cursor-not-allowed' : ''} ${isSelected ? 'border-[#00adef]/30 bg-[#f0f9f8] shadow-xl scale-105' : 'border-transparent bg-[#f7f9fb] hover:bg-white sm:hover:-translate-y-2 hover:shadow-sakina'}`}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-3xl bg-white flex items-center justify-center text-2xl sm:text-4xl shadow-inner">{mood.emoji}</div>
                  <div className="text-center">
                    <span className={`block text-[8px] sm:text-[10px] font-black uppercase tracking-[2px] sm:tracking-[3px] mb-1 ${isSelected ? 'text-[#00adef]' : 'text-gray-400'}`}>{mood.label}</span>
                    <div className="w-full h-0.5 sm:h-1 rounded-full" style={{ background: isSelected ? mood.color : '#e5e7eb' }}></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Note */}
          <div className="mb-10 sm:mb-12">
            <p className="text-[9px] sm:text-[10px] font-black text-gray-300 uppercase tracking-[4px] sm:tracking-[6px] mb-4 sm:mb-6 px-2">Reflect on this moment (Optional)</p>
            <textarea
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
              maxLength={300}
              disabled={alreadyLoggedToday}
              placeholder="How are you feeling, truly?"
              className="w-full bg-[#f7f9fb] border border-gray-100 rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 text-[#091426] text-sm sm:text-lg font-medium outline-none focus:bg-white focus:border-[#00adef]/30 transition-all min-h-[140px] sm:min-h-[180px] resize-none placeholder:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {feedback.message && (
            <div className={`mb-8 p-8 rounded-[32px] text-sm font-bold flex items-center gap-6 animate-in slide-in-from-top-4 ${feedback.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              <span className="material-symbols-outlined">{feedback.type === "success" ? "check_circle" : "error"}</span>
              {feedback.message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || alreadyLoggedToday}
            className={`w-full py-6 sm:py-8 bg-[#091426] text-white font-black rounded-[24px] sm:rounded-[40px] transition-all flex items-center justify-center gap-4 sm:gap-6 shadow-2xl uppercase text-[10px] sm:text-xs tracking-[6px] sm:tracking-[12px] ${loading || alreadyLoggedToday ? "opacity-40 cursor-not-allowed" : "hover:bg-[#00adef] hover:scale-[1.01] active:scale-95"}`}
          >
            {loading ? (
              <><div className="w-5 h-5 sm:w-6 sm:h-6 border-3 sm:border-4 border-white/30 border-t-white rounded-full animate-spin"></div><span className="tracking-[4px] sm:tracking-[12px]">Syncing...</span></>
            ) : alreadyLoggedToday ? (
              <><span className="material-symbols-outlined text-xl sm:text-2xl">check_circle</span><span>Already logged today</span></>
            ) : (
              <><span>Log State</span><span className="material-symbols-outlined text-xl sm:text-2xl">arrow_forward</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;