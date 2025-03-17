"use client";

import React from "react";
import { useTheme } from "@/app/contexts/themeContext";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "default" ? "y2k" : "default");
  };

  return (
    <button 
      onClick={toggleTheme} 
      className={`px-3 py-1 rounded-md transition-colors ${
        theme === "y2k" 
          ? "bg-[#15191A] text-[#29B5B0] border-2 border-[#29B5B0]" 
          : "bg-accentgreen text-white"
      }`}
      aria-label="Toggle theme"
    >
      {theme === "y2k" ? "Modern Theme" : "Y2K Theme"}
    </button>
  );
};