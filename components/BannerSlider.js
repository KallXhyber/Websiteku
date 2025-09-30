// components/BannerSlider.js
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Daftar gambar banner Anda
const banners = [
  'https://placehold.co/1200x400/5865f2/ffffff?text=Promo+Spesial!',
  'https://placehold.co/1200x400/23272a/ffffff?text=Sewa+PC+Gaming',
  'https://placehold.co/1200x400/2c2f33/ffffff?text=Akun+Rockstar+Ready'
];

// Konfigurasi animasi slide
const slideVariants = {
  enter: {
    x: "100%",
    opacity: 0
  },
  center: {
    x: 0,
    opacity: 1
  },
  exit: {
    x: "-100%",
    opacity: 0
  }
};

const BannerSlider = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); // Ganti banner setiap 5 detik

    return () => clearInterval(timer);
  }, []);

  return React.createElement('div', {
    className: 'relative w-full h-64 md:h-96 overflow-hidden rounded-lg shadow-2xl bg-discord-darker'
  },
    React.createElement(AnimatePresence, { initial: false },
      React.createElement(motion.img, {
        key: currentBanner, // Kunci agar AnimatePresence tahu gambarnya berubah
        src: banners[currentBanner],
        alt: `Banner ${currentBanner + 1}`,
        className: 'absolute inset-0 w-full h-full object-cover',
        variants: slideVariants,
        initial: "enter",
        animate: "center",
        exit: "exit",
        transition: {
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 }
        }
      })
    )
  );
};

export default BannerSlider;