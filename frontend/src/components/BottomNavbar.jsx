import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user?.role === 'admin'
    ? [
        {
          id: "admin",
          label: "ADMIN",
          path: "/admin",
          icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
        },
        {
          id: "chat",
          label: "CHAT",
          path: "/chat",
          icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          ),
        },
        {
          id: "exercises",
          label: "EXERCISES",
          path: "/exercises",
          icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
        },
        {
          id: "profile",
          label: "PROFILE",
          path: "/profile",
          icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
      ]
    : [
        {
          id: "chat",
          label: "CHAT",
          path: "/chat",
          icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          ),
        },
        {
          id: "exercises",
          label: "EXERCISES",
          path: "/exercises",
          icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
        },
        {
          id: "mood",
          label: "MOOD",
          path: "/mood",
          icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          id: "profile",
          label: "PROFILE",
          path: "/profile",
          icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
        {
          id: "menu",
          label: "MENU",
          path: "#",
          icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          ),
        },
      ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const moreItems = [
    { label: "Therapy Session", path: "/therapy", icon: "self_improvement" },
    { label: "Music Therapy", path: "/music", icon: "headphones" },
    { label: "My Journal", path: "/journal", icon: "edit_note" },
    { label: "Risk Assessment", path: "/risk-assessment", icon: "shield" },
    ...(user?.role === 'admin' ? [{ label: "Admin Control", path: "/admin", icon: "admin_panel_settings" }] : [])
  ];

  return (
    <>
      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[#091426]/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>
            <div className="absolute bottom-24 left-4 right-4 bg-white rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[4px]">Systems Menu</h3>
                    <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {moreItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#f7f9fb] flex items-center justify-center text-gray-400 group-hover:text-[#00adef] group-hover:bg-[#00adef]/10 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            </div>
                            <span className="text-sm font-bold text-[#091426] tracking-tight">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      <div className="flex items-center justify-around w-full max-w-sm mx-auto px-1 py-3 bg-white/80 backdrop-blur-xl rounded-t-[2rem] shadow-xl border-t border-gray-100 relative z-[101]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === "/exercises" && location.pathname === "/");
          return (
            <button
              key={item.id}
              onClick={() => {
                  if (item.id === 'menu') {
                      setIsMenuOpen(!isMenuOpen);
                  } else {
                      navigate(item.path);
                      setIsMenuOpen(false);
                  }
              }}
              className="relative flex flex-col items-center gap-1 px-2 py-2 flex-1 transition-all duration-300 hover:scale-110 active:scale-95 group"
            >
              <div className={`absolute inset-0 bg-[#00adef]/10 rounded-2xl transition-all duration-300 scale-0 group-hover:scale-100 ${(isActive && item.id !== 'menu') ? 'scale-100 opacity-100' : 'opacity-0'}`}></div>
              
              <span className={`relative z-10 transition-colors duration-300 ${isActive && item.id !== 'menu' ? "text-[#00adef]" : "text-gray-400 group-hover:text-[#00adef]/70"}`}>
                {item.icon}
              </span>
              <span
                className={`relative z-10 text-[8px] font-bold tracking-wider transition-colors duration-300 leading-tight text-center ${
                  isActive && item.id !== 'menu' ? "text-[#00adef]" : "text-gray-400 group-hover:text-[#00adef]/70"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default BottomNavbar;