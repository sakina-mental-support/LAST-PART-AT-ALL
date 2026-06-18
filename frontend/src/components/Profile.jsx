import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile, deleteProfile } from "../services/api";
import { useEmotionalBrain } from "../store/useEmotionalBrain";
import Badge from "./Badge";
import { 
    LucideUser, LucideFingerprint, LucideShieldCheck, LucideEdit2, LucideX,
    LucidePhone, LucideMail
} from 'lucide-react';

const Profile = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const brain = useEmotionalBrain();
  const { metrics } = brain;
  const [isUploading, setIsUploading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  
  const [emailNotif, setEmailNotif] = useState(true);
  const [dataPrivacy, setDataPrivacy] = useState(false);
  const [theme, setTheme] = useState('Light Mode');
  
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");

  // Profile Edit States
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editPassword, setEditPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditEmail(user.email || "");
      if(user.emergencyContact) {
          setEmergencyPhone(user.emergencyContact.phone || "");
          setEmergencyEmail(user.emergencyContact.email || "");
      }
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to completely delete your account? This action cannot be undone and will delete all your data.")) {
      try {
        await deleteProfile();
        localStorage.removeItem('sakina_token');
        localStorage.removeItem('sakina_profile');
        localStorage.removeItem('sakina_onboarding');
        navigate('/login');
      } catch (err) {
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setUpdateMessage("");
    setUpdateStatus("");

    try {
      const payload = {
        name: editName,
        email: editEmail,
      };
      if (editPassword.trim()) {
        payload.password = editPassword;
      }
      
      const res = await updateProfile(payload);
      if (res && res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('sakina_profile', JSON.stringify(res.data));
        setUpdateStatus("success");
        setUpdateMessage("Profile updated successfully! ✅");
        setEditPassword("");
      } else {
        throw new Error(res.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      setUpdateStatus("error");
      setUpdateMessage(err.message || "Update failed. Please try again. ❌");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Removed DNA fetch

  const profileImage = user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=00adef&color=fff&bold=true`;

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00adef] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const res = await updateProfile({ avatar: reader.result });
                setUser(res.data);
            } catch (err) {
                console.error("Failed to upload avatar:", err);
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="py-12 animate-fade-in font-['Inter'] pb-32">
      
      {/* 🚀 IDENTITY HEADER */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-12 lg:mb-20">
        <div className="space-y-6">
            <Badge variant="solid" color="teal" size="sm" className="tracking-[10px] uppercase">Account Settings</Badge>
            <h1 className="text-6xl sm:text-8xl font-black text-[#091426] tracking-tighter uppercase leading-[0.85]">
                Your <br />
                <span className="text-[#00adef] italic">Profile.</span>
            </h1>
        </div>
        <div className="hidden lg:flex flex-col sm:flex-row gap-4 items-center">
            <button onClick={handleDeleteAccount} className="px-8 py-5 bg-rose-50 text-rose-500 border border-rose-100 font-black rounded-[32px] hover:bg-rose-500 hover:text-white transition-all flex items-center gap-3 uppercase text-[10px] tracking-[4px]">
                Delete Account
            </button>
            <button onClick={handleLogout} className="px-10 py-6 bg-[#091426] text-white font-black rounded-[32px] shadow-sakina hover:scale-105 transition-all flex items-center gap-4 uppercase text-[10px] tracking-[8px]">
                Log Out
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 🧬 EMOTIONAL IDENTITY CARD */}
        <div className="lg:col-span-4 space-y-10">
            <div className="bg-[#091426] rounded-[64px] p-16 text-white relative overflow-hidden shadow-sakina-lg group">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#00adef]/20 to-transparent"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                    <div className="relative group/avatar">
                        <div className="w-48 h-48 rounded-[56px] overflow-hidden border-4 border-white/10 p-1">
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-[48px]" />
                        </div>
                        <label className="absolute inset-0 bg-[#00adef]/60 rounded-[56px] flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                            <LucideFingerprint size={32} />
                            <input type="file" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>

                    <div className="space-y-3 flex flex-col items-center">
                        <div className="flex items-center gap-4">
                            <h2 className="text-4xl font-black uppercase tracking-tighter">{user?.name}</h2>
                            <button onClick={() => setIsEditModalOpen(true)} className="w-10 h-10 bg-white/10 border border-white/20 rounded-full flex items-center justify-center hover:bg-[#00adef] hover:border-transparent hover:text-white transition-all shadow-lg text-white backdrop-blur-sm">
                                <LucideEdit2 size={16} />
                            </button>
                        </div>
                        <p className="text-[#00adef] font-bold text-sm">{user?.email}</p>
                    </div>

                    <div className="grid grid-cols-2 w-full gap-4">
                        <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 text-center">
                            <p className="text-[8px] font-black text-white/30 uppercase tracking-[3px] mb-1">Status</p>
                            <p className="text-xl font-black text-emerald-400">Active</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 text-center">
                            <p className="text-[8px] font-black text-white/30 uppercase tracking-[3px] mb-1">Joined</p>
                            <p className="text-xl font-black text-white">{new Date(user?.createdAt || Date.now()).getFullYear()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 📊 ACCOUNT SETTINGS PANEL */}
        <div className="lg:col-span-8 space-y-12">
            <div className="bg-white rounded-[56px] p-12 shadow-sakina border border-gray-100 space-y-10">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Preferences</h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-[#f7f9fb] rounded-[32px] border border-gray-100">
                        <div>
                            <p className="font-bold text-[#091426]">Email Notifications</p>
                            <p className="text-sm text-gray-400">Receive weekly wellness reports</p>
                        </div>
                        <div 
                            onClick={() => setEmailNotif(!emailNotif)}
                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${emailNotif ? 'bg-[#00adef]' : 'bg-gray-200'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${emailNotif ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-[#f7f9fb] rounded-[32px] border border-gray-100">
                        <div>
                            <p className="font-bold text-[#091426]">Data Privacy</p>
                            <p className="text-sm text-gray-400">Allow anonymous analytics</p>
                        </div>
                        <div 
                            onClick={() => setDataPrivacy(!dataPrivacy)}
                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${dataPrivacy ? 'bg-[#00adef]' : 'bg-gray-200'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${dataPrivacy ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-[#f7f9fb] rounded-[32px] border border-gray-100">
                        <div>
                            <p className="font-bold text-[#091426]">Theme</p>
                            <p className="text-sm text-gray-400">App appearance</p>
                        </div>
                        <select 
                            value={theme}
                            onChange={(e) => {
                                setTheme(e.target.value);
                                if (e.target.value === 'Dark Mode') {
                                    document.documentElement.classList.add('dark-theme-override');
                                    let style = document.getElementById('dark-theme-style');
                                    if(!style) {
                                        style = document.createElement('style');
                                        style.id = 'dark-theme-style';
                                        style.innerHTML = `
                                            .dark-theme-override { filter: invert(1) hue-rotate(180deg); background: #000; min-height: 100vh; }
                                            .dark-theme-override img, .dark-theme-override video { filter: invert(1) hue-rotate(180deg); }
                                        `;
                                        document.head.appendChild(style);
                                    }
                                } else {
                                    document.documentElement.classList.remove('dark-theme-override');
                                }
                            }}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none font-bold text-sm text-[#091426]"
                        >
                            <option>Light Mode</option>
                            <option>Dark Mode</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-4 p-6 bg-[#f7f9fb] rounded-[32px] border border-gray-100">
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <p className="font-bold text-[#091426]">Emergency Contact <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span></p>
                                <p className="text-sm text-gray-400">Alert this contact in case of high risk or distress</p>
                            </div>
                        </div>
                        <div className="pt-2 space-y-3">
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus-within:border-[#00adef] transition-all">
                                <LucidePhone size={18} className="text-gray-400 shrink-0" />
                                <input 
                                    type="tel" 
                                    placeholder="Phone number (e.g. +1 234 567 8900)" 
                                    value={emergencyPhone}
                                    onChange={(e) => setEmergencyPhone(e.target.value)}
                                    className="flex-1 bg-transparent outline-none font-bold text-sm text-[#091426] placeholder-gray-300 w-full"
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus-within:border-[#00adef] transition-all">
                                <LucideMail size={18} className="text-gray-400 shrink-0" />
                                <input 
                                    type="email" 
                                    placeholder="Emergency email address" 
                                    value={emergencyEmail}
                                    onChange={(e) => setEmergencyEmail(e.target.value)}
                                    className="flex-1 bg-transparent outline-none font-bold text-sm text-[#091426] placeholder-gray-300 w-full"
                                />
                            </div>
                            <button 
                                onClick={async () => {
                                    try {
                                        const res = await updateProfile({ emergencyContact: { phone: emergencyPhone, email: emergencyEmail } });
                                        if(res.success) {
                                            setUser(res.data);
                                            localStorage.setItem('sakina_profile', JSON.stringify(res.data));
                                            alert('Emergency contact saved securely!');
                                        }
                                    } catch(e) {
                                        console.error(e);
                                        alert('Failed to save emergency contact');
                                    }
                                }}
                                className="w-full px-6 py-3 bg-[#091426] text-white font-bold rounded-xl hover:bg-[#00adef] transition-colors text-xs uppercase tracking-widest"
                            >
                                Save Emergency Contact
                            </button>
                            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                                If you send a crisis message in chat or your risk level reaches High, an alert email will be sent to this address.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* 📱 MOBILE ACTION BUTTONS (Hidden on Desktop) */}
      <div className="flex lg:hidden flex-col gap-4 mt-12 w-full">
          <button onClick={handleLogout} className="w-full py-6 bg-[#091426] text-white font-black rounded-[32px] shadow-sakina hover:bg-[#00adef] transition-all flex justify-center items-center gap-4 uppercase text-[11px] tracking-[8px]">
              Log Out
          </button>
          <button onClick={handleDeleteAccount} className="w-full py-5 bg-rose-50 text-rose-500 border border-rose-100 font-black rounded-[32px] hover:bg-rose-500 hover:text-white transition-all flex justify-center items-center gap-3 uppercase text-[10px] tracking-[4px]">
              Delete Account
          </button>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#091426]/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[48px] p-8 sm:p-12 w-full max-w-lg shadow-sakina-lg relative text-left">
                <button onClick={() => setIsEditModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-rose-500 transition-colors bg-gray-50 hover:bg-rose-50 w-10 h-10 rounded-full flex items-center justify-center">
                    <LucideX size={20} />
                </button>
                
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-14 h-14 bg-[#F4F9FF] rounded-2xl flex items-center justify-center text-[#00adef]">
                        <LucideUser size={24} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black uppercase tracking-tight text-[#091426]">Edit Profile</h4>
                        <p className="text-xs text-gray-400 font-medium">Update account information</p>
                    </div>
                </div>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[3px] text-gray-300">Name / Username</label>
                        <input 
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-[#f7f9fb] border border-gray-100 rounded-[20px] px-6 py-4 text-sm font-semibold text-[#091426] outline-none focus:border-[#00adef] transition-all"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[3px] text-gray-300">Email Address</label>
                        <input 
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full bg-[#f7f9fb] border border-gray-100 rounded-[20px] px-6 py-4 text-sm font-semibold text-[#091426] outline-none focus:border-[#00adef] transition-all"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[3px] text-gray-300">New Password</label>
                        <input 
                            type="password"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="Leave blank to keep current"
                            className="w-full bg-[#f7f9fb] border border-gray-100 rounded-[20px] px-6 py-4 text-sm font-semibold text-[#091426] outline-none focus:border-[#00adef] transition-all placeholder-gray-300"
                        />
                    </div>

                    {updateMessage && (
                        <div className={`p-4 rounded-[20px] text-xs font-bold text-center ${updateStatus === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {updateMessage}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="w-full py-5 bg-[#091426] text-white font-black rounded-[24px] uppercase tracking-[4px] text-[10px] hover:bg-[#00adef] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                    >
                        {isUpdatingProfile ? 'Updating...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

const ProfileStat = ({ label, value, icon, color }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined" style={{ color }}>{icon}</span>
            </div>
            <div>
                <p className="text-xl font-black text-[#091426] tracking-tight">{value}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">{label}</p>
            </div>
        </div>
    </div>
);

export default Profile;