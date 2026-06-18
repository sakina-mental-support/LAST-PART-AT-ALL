import React, { useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const InputField = ({ label, type, name, placeholder, value, onChange, icon, rightIcon, onRightClick }) => (
  <div className="space-y-3">
    <label className="text-[11px] font-extrabold text-[#75777d] uppercase tracking-[2px] ml-1">{label}</label>
    <div className="relative group">
      {icon && (
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00adef] transition-colors">{icon}</span>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-14 pr-12 py-5 bg-[#f2f4f6] border border-gray-100 rounded-[24px] text-[15px] text-[#191c1e] outline-none focus:border-[#00adef]/20 focus:bg-white focus:ring-4 focus:ring-[#00adef]/5 transition-all placeholder:text-[#75777d] font-medium"
        required
      />
      {rightIcon && (
        <button
          type="button"
          onClick={onRightClick}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#45474c] transition-colors"
        >
          {rightIcon}
        </button>
      )}
    </div>
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields to create your account.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please check again.");
      return;
    }
    if (form.password.length < 8) {
      setError("Security first: Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      setSuccess("Welcome to Sakina! Redirecting you to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-['Inter'] overflow-hidden">
      
      {/* Left Side: Brand & Visual */}
      <div className="w-full lg:w-[40%] bg-[#091426] relative flex flex-col justify-between p-8 sm:p-12 lg:p-20 overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#00adef]/20 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full">
            <img 
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80" 
                className="w-full h-full object-cover opacity-40 mix-blend-overlay grayscale-[20%]"
                alt="Yoga"
            />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10 sm:mb-20">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[16px] sm:rounded-2xl bg-[#00adef] flex items-center justify-center shadow-lg shadow-[#00adef]/20">
               <img src={logo} alt="Sakina" className="w-5 h-5 sm:w-6 sm:h-6 object-contain brightness-0 invert" />
            </div>
            <span className="text-xl sm:text-2xl font-['Inter'] font-bold tracking-tight">Sakina</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-['Inter'] font-bold mb-8 sm:mb-10 leading-[1.2] tracking-tight">
            Begin Your <br />
            Journey to <br />
            <span className="text-[#00adef]">Mindfulness.</span>
          </h1>
          
          <div className="space-y-8">
            {[
                "Personalized Mental Wellness Tracks",
                "AI-Powered Emotional Support",
                "Advanced Mood & Health Analytics"
            ].map((feature, i) => (
                <div key={i} className="flex items-center gap-5 group">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00adef] group-hover:bg-[#00adef] group-hover:text-white transition-all shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                    <p className="text-sm font-bold text-gray-300">{feature}</p>
                </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-10 border-t border-white/5">
            <p className="text-[10px] font-extrabold text-[#75777d] uppercase tracking-[5px]">Oceanic Serenity v3.0</p>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-10 sm:py-12 bg-[#f7f9fb] relative overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-['Inter'] font-bold text-[#091426] mb-3 sm:mb-4 tracking-tight">Create Account</h2>
            <p className="text-[#505f76] font-medium text-base sm:text-lg">Join our community of mindfulness practitioners.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <InputField
                label="Full Name"
                name="fullName"
                placeholder="Sakina Henderson"
                value={form.fullName}
                onChange={handleChange}
                icon={<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>}
            />

            <InputField
                label="Email Address"
                type="email"
                name="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                icon={<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mail</span>}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    icon={<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock</span>}
                />
                <InputField
                    label="Confirm"
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    icon={<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>verified_user</span>}
                />
            </div>

            {error && (
              <div className="p-6 bg-red-50 text-red-600 text-sm font-bold rounded-[24px] border border-red-100 flex items-center gap-4 animate-in shake duration-500">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}
            {success && (
              <div className="p-6 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-[24px] border border-emerald-100 flex items-center gap-4">
                <span className="material-symbols-outlined">check_circle</span>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 bg-[#091426] text-white font-bold rounded-[24px] transition-all flex items-center justify-center gap-4 shadow-xl shadow-[#091426]/10 active:scale-[0.98] mt-6 ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#00adef] hover:shadow-[#00adef]/20"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="uppercase tracking-widest text-xs">Creating...</span>
                </>
              ) : (
                <span className="uppercase tracking-widest text-xs">Create My Account</span>
              )}
            </button>

            <div className="pt-8 text-center">
              <p className="text-sm text-[#505f76] font-medium">
                Already part of the community?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-bold text-[#00adef] hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;