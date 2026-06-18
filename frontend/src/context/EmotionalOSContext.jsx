import React, { createContext, useContext } from 'react';

// 🧠 Legacy Context removed to prevent state bleeding. 
// Transitioning all components to useEmotionalBrain (Zustand).
const EmotionalOSContext = createContext();

export const EmotionalOSProvider = ({ children }) => {
    return (
        <EmotionalOSContext.Provider value={{}}>
            {children}
        </EmotionalOSContext.Provider>
    );
};

export const useEmotionalOS = () => ({
    state: {
        aiContext: { style: 'Your Sakina', memory: [] },
        currentMood: 'Balanced',
        activeWorld: 'Equilibrium',
        stressLevel: 0,
        emotionalEnergy: 100,
        isPanicMode: false,
        history: []
    },
    dispatch: () => {},
    emitEvent: () => {},
    EventBus: {
        subscribe: () => () => {},
        dispatch: () => {}
    }
});
