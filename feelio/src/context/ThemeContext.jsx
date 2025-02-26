// feelio/src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme
      ? JSON.parse(savedTheme)
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
