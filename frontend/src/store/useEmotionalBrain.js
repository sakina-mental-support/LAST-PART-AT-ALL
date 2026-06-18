import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

/**
 * 🧠 Sakina Emotional Brain (The Living OS Engine)
 * Centralized store for all emotional metrics, memories, and adaptive UI states.
 */
export const useEmotionalBrain = create(
    persist(
        (set, get) => ({
            // 📊 Core Emotional Metrics (0-100)
            metrics: {
                mood: 70,
                stress: 20,
                anxiety: 10,
                energy: 80,
                focus: 50,
                recoveryScore: 90,
                sleepEnergy: 85,
            },

            // 🎨 Adaptive UI State
            ui: {
                theme: 'serene', // 'serene', 'focus', 'panic', 'recovery'
                animationSpeed: 1, // Multiplier
                complexity: 'high', // 'high', 'low' (for stress)
            },

            // 🧠 AI Memory & History
            memory: {
                triggers: [],
                preferredCalming: ['Breathing', 'Ambient Rain'],
                panicHistory: [],
                recentJournals: [],
                recoveryTrends: [],
            },

            // 🚀 Session Tracking
            activeJourney: null, // Current recovery journey
            journeyProgress: 0,

            // 🔄 ACTIONS (The Brain's Neurons)
            
            /** Update specific emotional metrics and trigger side effects */
            updateMetrics: (newMetrics) => {
                set((state) => {
                    const updatedMetrics = { ...state.metrics, ...newMetrics };
                    
                    // Logic: Auto-adjust UI based on stress
                    let newUI = { ...state.ui };
                    if (updatedMetrics.stress > 80) {
                        newUI = { theme: 'recovery', animationSpeed: 0.5, complexity: 'low' };
                    } else if (updatedMetrics.focus > 80) {
                        newUI = { theme: 'focus', animationSpeed: 1.2, complexity: 'high' };
                    } else {
                        newUI = { theme: 'serene', animationSpeed: 1, complexity: 'high' };
                    }

                    return { 
                        metrics: updatedMetrics,
                        ui: newUI
                    };
                });
            },

            /** Trigger Panic Mode */
            activatePanicMode: () => {
                set({
                    ui: { theme: 'panic', animationSpeed: 0.8, complexity: 'low' },
                    metrics: { ...get().metrics, stress: 100, anxiety: 100 }
                });
            },

            /** Log a trigger detected by AI or Journal */
            logTrigger: (trigger) => {
                set((state) => ({
                    memory: {
                        ...state.memory,
                        triggers: [...state.memory.triggers, { text: trigger, timestamp: new Date() }]
                    }
                }));
            },

            /** Progress in a Recovery Journey */
            setJourney: (journey) => set({ activeJourney: journey, journeyProgress: 0 }),
            updateJourneyProgress: (step) => set((state) => ({ journeyProgress: step })),

            /** 📡 EMIT REAL EVENT: Logs to Backend */
            emitEvent: async (type, metadata = {}) => {
                const state = get();
                try {
                    const token = localStorage.getItem('sakina_token');
                    await axios.post(`${API_BASE}/events`, {
                        type,
                        metrics: state.metrics,
                        metadata
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log(`📡 Event Logged: ${type}`);
                } catch (err) {
                    console.error('❌ Failed to log event:', err);
                }
            }
        }),
        {
            name: 'sakina-emotional-brain', // Storage key
        }
    )
);
