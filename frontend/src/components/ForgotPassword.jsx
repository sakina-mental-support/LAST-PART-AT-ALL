import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    navigate("/check-email");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div
        className="bg-white px-6 py-8 font-sans"
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "40px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/login")}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {!sent ? (
          <>
            {/* Illustration */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-[#e8f4ff] flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#cce5ff] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#71BCFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                {/* Small key badge */}
                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#71BCFF] flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Forgot Password?</h1>
              <p className="text-sm text-gray-400 leading-relaxed">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="yourname@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 outline-none focus:border-[#71BCFF] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-[#71BCFF] hover:bg-[#5aadf0] text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2 mb-6"
            >
              Send Reset Link
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-400">
              Remember your password?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#71BCFF] font-medium hover:underline"
              >
                Log in
              </button>
            </p>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="flex justify-center mb-8">
              <div className="w-28 h-28 rounded-full bg-[#e8f4ff] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#cce5ff] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#71BCFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Check your email</h1>
              <p className="text-sm text-gray-400 leading-relaxed">
                We sent a password reset link to{" "}
                <span className="text-[#71BCFF] font-medium">{email}</span>
              </p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#71BCFF] hover:bg-[#5aadf0] text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg text-sm mb-3"
            >
              Back to Sign In
            </button>

            <button
              onClick={() => setSent(false)}
              className="w-full border border-gray-200 text-gray-500 font-semibold py-4 rounded-2xl hover:bg-gray-50 transition-all duration-200 text-sm mb-6"
            >
              Try a different email
            </button>

            <p className="text-center text-xs text-gray-400">
              Didn't receive the email?{" "}
              <button onClick={handleSubmit} className="text-[#71BCFF] hover:underline">
                Resend
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;