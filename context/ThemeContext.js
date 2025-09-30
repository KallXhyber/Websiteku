// context/ThemeContext.js
'use client';

import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Pastikan kelas 'dark' selalu ada di elemen <html>
    const root = window.document.documentElement;
    root.classList.add('dark');
  }, []);

  const value = { theme: 'dark' };

  return React.createElement(ThemeContext.Provider, { value }, children);
};

export const useTheme = () => {
  return useContext(ThemeContext);
};