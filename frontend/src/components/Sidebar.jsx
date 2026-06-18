import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Badge from "./Badge";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user?.role === 'admin'
    ? [
        { id: "admin", label: "Admin Control", path: "/admin", icon: "admin_panel_settings" },
        { id: "chat", label: "AI Chat", path: "/chat", icon: "forum", badge: "LIVE" },
        { id: "exercises", label: "Emotional Shifts", path: "/exercises", icon: "bolt" },
      ]
    : [
        { id: "home", label: "Dashboard", path: "/", icon: "dashboard" },
        { id: "chat", label: "AI Chat", path: "/chat", icon: "forum", badge: "LIVE" },
        { id: "mood", label: "Daily Reflection", path: "/mood", icon: "mood", badge: "NEW" },
        { id: "exercises", label: "Emotional Shifts", path: "/exercises", icon: "bolt" },
        { id: "therapy", label: "Therapy", path: "/therapy", icon: "self_improvement", badge: "NEW" },
        { id: "music", label: "Music Therapy", path: "/music", icon: "headphones", badge: "NEW" },
        { id: "journal", label: "Journal", path: "/journal", icon: "edit_note" },
        { id: "risk", label: "Risk Assessment", path: "/risk-assessment", icon: "shield", badge: "NEW" },
      ];

  return (
    <header className="w-full h-20 fixed left-0 top-0 z-50 flex items-center justify-between px-10 shadow-[0_4px_30px_-10px_rgba(30,41,59,0.05)] bg-[#f7f9fb]/90 backdrop-blur-md font-['Inter'] border-b border-gray-100/50">
      
      {/* Logo */}
      <div className="flex items-center gap-3.5 group cursor-pointer flex-shrink-0" onClick={() => navigate(user?.role === 'admin' ? "/admin" : "/")}>
        <div className="w-11 h-11 rounded-xl overflow-hidden shadow-md shadow-[#00adef]/15 group-hover:scale-105 transition-transform bg-white border border-gray-100/50 flex items-center justify-center">
          <img 
            src="/sakina_logo.jpg" 
            alt="Sakina Logo" 
            className="w-full h-full object-cover" 
            style={{ transform: 'scale(1.4)', transformOrigin: '50% 48%' }}
          />
        </div>
        <div className="flex flex-col">
          <h1 className="font-['Inter'] text-lg font-extrabold text-[#091426] tracking-tighter uppercase leading-none">Sakina</h1>
          <p className="text-[8px] text-[#00adef] font-black uppercase tracking-[2px] opacity-75 mt-0.5 leading-none">Emotional OS v6.0</p>
        </div>
      </div>

      {/* Nav Items (Horizontal) */}
      <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-1 justify-center px-4 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex items-center px-2 py-1.5 xl:px-3 xl:py-2 gap-1.5 rounded-xl transition-all duration-300 group relative flex-shrink-0 ${
                isActive 
                  ? "text-[#00adef] bg-[#00adef]/8 font-bold" 
                  : "text-[#505f76] hover:text-[#091426] hover:bg-[#eceef0]/50"
              }`}
            >
              <span className={`material-symbols-outlined text-[17px] xl:text-[18px] transition-transform group-hover:scale-110 ${isActive ? 'text-[#00adef]' : 'text-gray-400 group-hover:text-[#00adef]'}`}>{item.icon}</span>
              <span className="text-[11px] xl:text-[12.5px] font-semibold whitespace-nowrap">{item.label}</span>
              {item.badge && (
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00adef] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00adef]"></span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Side: Emergency Calm & User Profile */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Emergency Calm */}
        {user?.role !== 'admin' && (
          <button
            onClick={() => navigate('/back-to-safe')}
            className="py-2.5 px-4 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-[2px] text-[10px] shadow-sm hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[16px] animate-pulse">emergency</span>
            <span className="whitespace-nowrap">Calm</span>
          </button>
        )}

        {/* Divider */}
        <div className="h-6 w-[1px] bg-gray-200"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/profile")}>
          <div className="w-9 h-9 rounded-xl bg-[#d0e1fb] overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=00adef&color=fff&bold=true`} 
              alt="User" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="hidden xl:flex flex-col">
            <p className="text-xs font-bold text-[#091426] group-hover:text-[#00adef] transition-colors leading-none">
              {user?.name || 'User'}
            </p>
            <span className="text-[8px] text-teal-600 font-extrabold uppercase tracking-wider mt-1 opacity-70 leading-none">OS Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Sidebar;
