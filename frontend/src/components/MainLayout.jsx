import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import BottomNavbar from "./BottomNavbar";
import { useEmotionalOS } from "../context/EmotionalOSContext.jsx";
import { useLocation } from "react-router-dom";
import Badge from "./Badge";

const MainLayout = ({ children }) => {
  const { state, dispatch, EventBus, emitEvent } = useEmotionalOS();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [localAtmosphere, setLocalAtmosphere] = useState({
      color: '#00adef',
      blur: 'blur-[100px]',
      opacity: 0.05,
      animation: 'animate-blob'
  });

  // Responsive breakpoint detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [hideSidebar, setHideSidebar] = useState(false);

  // 7. EVENT-DRIVEN FLOW (Subscriber Logic)
  useEffect(() => {
      const unsubMood = EventBus.subscribe('mood_selected', (mood) => {
          console.log(`[Layout Brain] Adapting to Mood: ${mood}`);
          if (mood === 'Stressed') setLocalAtmosphere({ color: '#ef4444', blur: 'blur-[150px]', opacity: 0.1, animation: 'animate-pulse' });
          if (mood === 'Calm') setLocalAtmosphere({ color: '#00adef', blur: 'blur-[100px]', opacity: 0.05, animation: 'animate-blob' });
      });

      const unsubPanic = EventBus.subscribe('panic_detected', () => {
          console.log(`[Layout Brain] EMERGENCY OVERRIDE ACTIVE`);
          setLocalAtmosphere({ color: '#ffffff', blur: 'blur-[200px]', opacity: 0.2, animation: 'animate-pulse' });
          setHideSidebar(true);
      });

      const unsubWorldEnter = EventBus.subscribe('NEURAL_WORLD_ENTERED', () => setHideSidebar(true));
      const unsubWorldExit = EventBus.subscribe('NEURAL_WORLD_COMPLETED', () => setHideSidebar(false));

      return () => {
          unsubMood();
          unsubPanic();
          unsubWorldEnter();
          unsubWorldExit();
      };
  }, [EventBus]);

  return (
    <div className={`flex min-h-screen transition-all duration-[3000ms] ${state.isPanicMode ? 'bg-white' : (state.activeWorld === 'Night Sky' ? 'bg-[#091426]' : 'bg-[#f7f9fb]')}`}>
      
      {/* 🌌 EMOTIONAL WORLD SYSTEM (Living Shell) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className={`absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full transition-all duration-[4000ms] ${localAtmosphere.blur} ${localAtmosphere.animation}`}
          style={{ backgroundColor: localAtmosphere.color, opacity: localAtmosphere.opacity }}
        ></div>
        
        {state.activeWorld === 'Fog World' && (
            <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[40px] animate-in fade-in duration-[3000ms]"></div>
        )}
      </div>

      {/* ⚡ EMERGENCY CALM MODE (UI Override) */}
      {state.isPanicMode ? (
          <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-8 sm:p-20 animate-in fade-in duration-1000">
              <Badge variant="solid" color="rose" size="sm" className="mb-6 sm:mb-10 tracking-[6px] sm:tracking-[10px] animate-pulse">PANIC MODE ACTIVE</Badge>
              <h1 className="text-5xl sm:text-8xl font-['Inter'] font-black text-[#091426] tracking-tighter uppercase mb-8 sm:mb-12 text-center">Just <br /> <span className="text-[#00adef] italic text-6xl sm:text-9xl">Breathe.</span></h1>
              <div className="w-40 h-40 sm:w-64 sm:h-64 border-8 border-dashed border-[#00adef]/20 rounded-full animate-spin-slow mb-10 sm:mb-16 flex items-center justify-center">
                  <div className="w-28 h-28 sm:w-48 sm:h-48 bg-[#00adef]/10 rounded-full animate-pulse"></div>
              </div>
              <button 
                onClick={() => dispatch({ type: 'TOGGLE_PANIC', payload: false })}
                className="px-10 sm:px-20 py-6 sm:py-8 border-2 border-gray-100 text-gray-400 font-bold rounded-full hover:text-rose-500 hover:border-rose-100 transition-all uppercase tracking-[3px] sm:tracking-[5px] text-[9px] sm:text-[10px]"
              >
                I'm Feeling Safer Now
              </button>
          </div>
      ) : (
          <>
            {/* Desktop Navbar - hidden on mobile OR in immersive mode */}
            {!isMobile && !hideSidebar && <Sidebar />}
            
            <main className={`flex-1 transition-all duration-1000 ${state.activeWorld === 'Fog World' ? 'opacity-40 scale-[0.98]' : 'opacity-100'} relative z-10 ${isMobile ? 'p-4 pb-24' : (hideSidebar ? 'p-0' : 'p-10 pt-28 ml-0')}`}>
                <div key={location.pathname} className={`page-transition ${hideSidebar ? 'max-w-full' : 'max-w-[1600px] mx-auto'}`}>
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navbar — hidden in immersive mode */}
            {isMobile && !hideSidebar && (
              <div className="fixed bottom-0 left-0 right-0 z-50">
                <BottomNavbar />
              </div>
            )}
          </>
      )}
    </div>
  );
};

export default MainLayout;
