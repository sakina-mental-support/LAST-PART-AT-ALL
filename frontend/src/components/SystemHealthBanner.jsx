import React, { useEffect, useState } from 'react';

const SystemHealthBanner = () => {
    const [healthState, setHealthState] = useState({ loaded: false, data: null, error: null });

    useEffect(() => {
        const checkHealth = async () => {
            try {
                // We use native fetch to hit our new Node.js health route
                const BASE_URL = import.meta.env.VITE_API_URL || "/api";
                const response = await fetch(`${BASE_URL}/health`);
                const data = await response.json();
                setHealthState({ loaded: true, data, error: !response.ok });
            } catch (err) {
                setHealthState({ loaded: true, data: null, error: true });
            }
        };

        checkHealth();
        // Set up polling every 5 minutes
        const interval = setInterval(checkHealth, 300000);
        return () => clearInterval(interval);
    }, []);

    if (!healthState.loaded || (!healthState.error && healthState.data?.status === "healthy")) {
        return null; // Don't show anything if healthy or still loading
    }

    return (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 w-full shadow-sm relative z-50">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-bold text-orange-800">System Degraded</h3>
                    <p className="text-sm text-orange-700 mt-1">
                        {!healthState.data ? 
                            "Cannot reach the Sakina server. Some features may be unavailable." : 
                            `Audio services are currently degraded (AI: ${healthState.data.services.python_ai}, TTS: ${healthState.data.services.tts_engine}).`}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SystemHealthBanner;
