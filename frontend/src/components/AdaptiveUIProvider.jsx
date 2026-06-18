import React, { useEffect } from 'react';
import { useEmotionalBrain } from '../store/useEmotionalBrain';

/**
 * 🎨 Adaptive UI Provider
 * Reacts to the Emotional Brain and injects CSS variables and themes globally.
 */
const AdaptiveUIProvider = ({ children }) => {
    const ui = useEmotionalBrain((state) => state.ui);
    const metrics = useEmotionalBrain((state) => state.metrics);

    useEffect(() => {
        const root = document.documentElement;
        
        // Inject Theme Colors & Variables
        root.setAttribute('data-sakina-theme', ui.theme);
        
        // Dynamic Animation Speed (Framer Motion and CSS)
        root.style.setProperty('--sakina-anim-speed', `${ui.animationSpeed}`);
        
        // Stress-based Softness (Subtle blur for non-text elements)
        const blurIntensity = metrics.stress > 80 ? '4px' : '0px';
        root.style.setProperty('--sakina-stress-blur', blurIntensity);

    }, [ui, metrics]);

    return (
        <div className={`sakina-os-root theme-${ui.theme} complexity-${ui.complexity} transition-all duration-[2000ms]`}>
            {children}
        </div>
    );
};

export default AdaptiveUIProvider;
