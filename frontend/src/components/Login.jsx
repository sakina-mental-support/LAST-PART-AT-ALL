import React, { useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const InputField = ({ type, placeholder, value, onChange, icon, rightIcon, onRightClick }) => (
  <div className="relative group">
    {icon && (
      <span className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#00adef] transition-colors">{icon}</span>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-18 pr-16 py-7 bg-[#f7f9fb] border border-gray-100 rounded-[32px] text-[16px] text-[#091426] outline-none focus:bg-white focus:border-[#00adef]/20 focus:ring-[15px] focus:ring-[#00adef]/5 transition-all placeholder:text-gray-300 font-medium"
    />
    {rightIcon && (
      <button
        type="button"
        onClick={onRightClick}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#00adef] transition-colors"
      >
        {rightIcon}
      </button>
    )}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your credentials to continue.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      // Check role from profile and redirect accordingly
      const profile = JSON.parse(localStorage.getItem('sakina_profile') || '{}');
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        const hasOnboarded = localStorage.getItem('sakina_onboarding');
        navigate(hasOnboarded ? '/' : '/onboarding');
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-['Inter'] overflow-hidden animate-fade-in relative">
      
      {/* Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00adef]/5 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6366f1]/5 rounded-full blur-[120px] animate-blob [animation-delay:2s]"></div>
      </div>

      {/* Left Side: Brand Visual */}
      <div className="w-full lg:w-[45%] bg-[#091426] relative flex flex-col justify-between p-8 sm:p-12 lg:p-24 overflow-hidden text-white">
        {/* Background Visual */}
        <div className="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format,compress&q=90&w=1920" 
                className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                alt="Meditation"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#091426] via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10 sm:mb-16 lg:mb-24 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[16px] sm:rounded-[20px] bg-[#00adef] flex items-center justify-center shadow-xl shadow-[#00adef]/20 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-white text-[22px] sm:text-[28px]">spa</span>
            </div>
            <span className="text-2xl sm:text-3xl font-['Inter'] font-bold tracking-tighter uppercase">Sakina</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-7xl font-['Inter'] font-bold mb-6 sm:mb-10 leading-[1.1] tracking-tighter uppercase">
            Find Your <br />
            <span className="text-[#00adef]">Inner Calm.</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg lg:text-xl font-medium leading-relaxed max-w-sm opacity-80">
            A sanctuary for mental wellness, guided by empathy and enhanced by AI.
          </p>
        </div>

        
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-40 py-10 sm:py-16 lg:py-20 bg-white relative z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-['Inter'] font-bold text-[#091426] mb-3 sm:mb-4 tracking-tighter uppercase">Sign In</h2>
            <p className="text-[#505f76] font-medium text-sm sm:text-base lg:text-lg opacity-70">Welcome back to your serenity space.</p>
          </div>

          <form className="space-y-6 sm:space-y-8 lg:space-y-10" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="space-y-4">
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[4px] ml-4">Your Email</label>
              <InputField
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={
                  <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>mail</span>
                }
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-4">
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[4px]">Password</label>
                <button 
                  type="button" 
                  onClick={() => navigate("/forgot-password")}
                  className="text-[11px] font-extrabold text-[#00adef] uppercase tracking-[3px] hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <InputField
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={
                  <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>lock</span>
                }
                rightIcon={
                  <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                }
                onRightClick={() => setShowPassword(!showPassword)}
              />
            </div>

            {error && (
              <div className="p-4 sm:p-6 lg:p-8 bg-rose-50 text-rose-600 text-[13px] sm:text-[15px] font-bold rounded-[20px] sm:rounded-[32px] border border-rose-100 flex items-center gap-3 sm:gap-5 animate-in shake duration-500">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <span className="material-symbols-outlined">error</span>
                </div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 sm:py-6 lg:py-8 bg-[#091426] text-white font-bold rounded-[24px] sm:rounded-[32px] transition-all duration-500 flex items-center justify-center gap-3 sm:gap-5 shadow-2xl shadow-[#091426]/20 active:scale-[0.98] ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#00adef] hover:shadow-[#00adef]/30"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="uppercase tracking-[6px] text-xs">Authenticating...</span>
                </>
              ) : (
                <>
                  <span className="uppercase tracking-[6px] text-xs">Login</span>
                  <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                </>
              )}
            </button>

            <div className="pt-6 sm:pt-8 lg:pt-12 text-center">
              <p className="text-sm text-[#505f76] font-medium tracking-wide">
                First time here?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="font-bold text-[#00adef] uppercase tracking-[2px] hover:underline ml-2"
                >
                  Register
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;