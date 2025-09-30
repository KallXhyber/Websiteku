// context/ThemeContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Tema default adalah 'dark'

  useEffect(() => {
    // Cek tema yang tersimpan di localStorage saat pertama kali load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);
  
  useEffect(() => {
    // Terapkan class 'dark' atau hapus dari elemen <html>
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Simpan pilihan tema ke localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const value = { theme, toggleTheme };

  return React.createElement(ThemeContext.Provider, { value }, children);
};

export const useTheme = () => {
  return useContext(ThemeContext);
};