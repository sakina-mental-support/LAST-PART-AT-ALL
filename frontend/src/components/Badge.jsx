import React from "react";

const Badge = ({ 
  children, 
  variant = "subtle", 
  color = "teal", 
  className = "", 
  size = "md",
  icon: Icon
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap";
  
  const sizes = {
    xs: "px-2 py-0.5 text-[9px] rounded-md gap-1",
    sm: "px-3 py-1 text-[10px] rounded-lg gap-1.5",
    md: "px-4 py-2 text-[11px] rounded-xl gap-2",
    lg: "px-6 py-3 text-[13px] rounded-2xl gap-2.5",
  };

  const colors = {
    teal: {
      solid: "bg-[#00adef] text-white shadow-lg shadow-[#00adef]/20",
      subtle: "bg-[#00adef]/10 text-[#00adef]",
      outline: "border border-[#00adef]/30 text-[#00adef]",
      glass: "bg-white/40 backdrop-blur-md text-[#00adef] border border-white/50"
    },
    navy: {
      solid: "bg-[#091426] text-white shadow-lg shadow-[#091426]/10",
      subtle: "bg-[#091426]/5 text-[#505f76]",
      outline: "border border-gray-200 text-[#505f76]",
      glass: "bg-white/10 backdrop-blur-md text-[#091426] border border-white/20"
    },
    amber: {
      solid: "bg-[#f59e0b] text-white shadow-lg shadow-[#f59e0b]/20",
      subtle: "bg-[#f59e0b]/10 text-[#d97706]",
      outline: "border border-[#f59e0b]/30 text-[#d97706]",
      glass: "bg-white/40 backdrop-blur-md text-[#d97706] border border-white/50"
    },
    rose: {
      solid: "bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/20",
      subtle: "bg-[#ef4444]/10 text-[#dc2626]",
      outline: "border border-[#ef4444]/30 text-[#dc2626]",
      glass: "bg-white/40 backdrop-blur-md text-[#dc2626] border border-white/50"
    },
    indigo: {
      solid: "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20",
      subtle: "bg-[#6366f1]/10 text-[#4f46e5]",
      outline: "border border-[#6366f1]/30 text-[#4f46e5]",
      glass: "bg-white/40 backdrop-blur-md text-[#4f46e5] border border-white/50"
    },
    white: {
      solid: "bg-white text-[#091426] shadow-lg shadow-black/5",
      subtle: "bg-white text-[#091426]",
      outline: "border border-white/30 text-white",
      glass: "bg-white/20 backdrop-blur-md text-white border border-white/30"
    }
  };

  const selectedColor = colors[color] || colors.teal;
  const variantStyle = selectedColor[variant] || selectedColor.subtle;

  return (
    <span className={`${baseStyles} ${sizes[size]} ${variantStyle} ${className}`}>
      {Icon && <span className="material-symbols-outlined !text-[inherit] !text-[1.3em]">{Icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
