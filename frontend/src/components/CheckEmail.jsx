import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const CheckEmail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
      <div
        className="font-sans"
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#f0f4f8",
        }}
      >
        {/* Card */}
        <div
          className="bg-white mx-5 rounded-3xl px-8 py-10 flex flex-col items-center text-center w-full"
          style={{ boxShadow: "0 8px 40px rgba(113,188,255,0.15)" }}
        >
          {/* Logo circle */}
          <div className="w-20 h-20 rounded-full bg-[#e8f4ff] flex items-center justify-center mb-6">
            <img src={logo} alt="Sakina Logo" className="w-12 h-12 object-contain" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h2>

          {/* Description */}
          <p className="text-sm text-gray-400 leading-relaxed mb-8">
            We have sent a password recovery link to your email address. Please check your inbox and follow the instructions.
          </p>

          {/* Back to Login */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full bg-[#71BCFF] hover:bg-[#5aadf0] text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg text-sm mb-5"
          >
            Back to Login
          </button>

          {/* Resend */}
          <p className="text-xs text-gray-400 mb-1">Didn't receive the email?</p>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-[#71BCFF] font-medium hover:underline"
          >
            Resend Link
          </button>
        </div>

        {/* Bottom branding */}
        <div className="flex items-center gap-2 mt-8">
          <div className="w-7 h-7 rounded-full bg-[#71BCFF] flex items-center justify-center">
            <img src={logo} alt="Sakina" className="w-4 h-4 object-contain" />
          </div>
          <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Sakina</span>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;