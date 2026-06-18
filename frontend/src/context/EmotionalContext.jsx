import React, { createContext, useContext, useState, useEffect } from 'react';

const EmotionalContext = createContext();

export const EmotionalProvider = ({ children }) => {
    const [mood, setMood] = useState(localStorage.getItem('sakina_mood') || 'Balanced');
    const [intensity, setIntensity] = useState(50);
    const [aiStyle, setAiStyle] = useState(localStorage.getItem('sakina_ai_style') || 'Your Sakina');
    
    // Atmospheric Mapping
    const atmospheres = {
        'Stressed': {
            primary: '#00adef',
            accent: '#ef4444',
            bg: 'bg-white',
            motion: 'fast',
            density: 'high',
            glow: 'rgba(239, 68, 68, 0.1)'
        },
        'Anxious': {
            primary: '#6366f1',
            accent: '#00adef',
            bg: 'bg-[#f7f9fb]',
            motion: 'pulse',
            density: 'moderate',
            glow: 'rgba(99, 102, 241, 0.1)'
        },
        'Overwhelmed': {
            primary: '#00adef',
            accent: '#6366f1',
            bg: 'bg-white',
            motion: 'slow',
            density: 'minimal',
            glow: 'rgba(0, 173, 239, 0.05)'
        },
        'Tired': {
            primary: '#00adef',
            accent: '#8b5cf6',
            bg: 'bg-[#091426]',
            motion: 'still',
            density: 'low',
            glow: 'rgba(139, 92, 246, 0.2)'
        },
        'Calm': {
            primary: '#00adef',
            accent: '#00adef',
            bg: 'bg-white',
            motion: 'gentle',
            density: 'normal',
            glow: 'rgba(0, 173, 239, 0.05)'
        },
        'Balanced': {
            primary: '#00adef',
            accent: '#00adef',
            bg: 'bg-[#f7f9fb]',
            motion: 'normal',
            density: 'normal',
            glow: 'transparent'
        }
    };

    const currentAtmosphere = atmospheres[mood] || atmospheres['Balanced'];

    const updateMood = (newMood) => {
        setMood(newMood);
        localStorage.setItem('sakina_mood', newMood);
    };

    return (
        <EmotionalContext.Provider value={{ 
            mood, 
            updateMood, 
            intensity, 
            setIntensity, 
            aiStyle, 
            setAiStyle, 
            atmosphere: currentAtmosphere 
        }}>
            <div className={`emotional-engine transition-all duration-[2000ms] ${currentAtmosphere.bg}`}>
                {children}
            </div>
        </EmotionalContext.Provider>
    );
};

export const useEmotionalState = () => useContext(EmotionalContext);
