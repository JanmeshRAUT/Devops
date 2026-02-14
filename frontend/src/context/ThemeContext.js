import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {

    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme) {

      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {

      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const detectedTheme = prefersDark ? "dark" : "light";
      setTheme(detectedTheme);
      applyTheme(detectedTheme);
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleSystemThemeChange = (e) => {
      const savedTheme = localStorage.getItem("theme");

      if (!savedTheme) {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };


    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }

    mediaQuery.addListener(handleSystemThemeChange);
    return () => mediaQuery.removeListener(handleSystemThemeChange);
  }, []);

  const applyTheme = (themeName) => {
    const root = document.documentElement;
    if (themeName === "dark") {
      root.setAttribute("data-theme", "dark");
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      root.setAttribute("data-theme", "light");
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
