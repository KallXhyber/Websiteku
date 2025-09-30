// pages/index.js
import React from 'react';
import Head from 'next/head';
import BannerSlider from '../components/BannerSlider';
import { motion } from 'framer-motion';
import { Cpu, Globe, Clock } from 'lucide-react';
import PCMonitor from '../components/PCMonitor';

export default function HomePage() {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return React.createElement('div', {
    className: 'container mx-auto px-4 py-8 space-y-16 md:space-y-24'
  },
    React.createElement(Head, null,
      React.createElement('title', null, 'XyCloud - Sewa PC Cloud Gaming'),
      React.createElement('link', { rel: 'icon', href: '/favicon.ico' })
    ),
    
    React.createElement(BannerSlider, null),

    React.createElement(motion.section, {
      className: 'text-center bg-black/20 border border-discord-darker p-10 rounded-lg shadow-xl',
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5 }
    },
      React.createElement('h2', { className: 'text-4xl md:text-5xl font-extrabold mb-4' }, 'Selamat Datang di XyCloud'),
      React.createElement('p', { className: 'text-lg text-discord-gray max-w-2xl mx-auto' }, 'Solusi sewa PC Cloud performa tinggi untuk segala kebutuhan gaming dan produktivitas Anda.'),
      React.createElement(motion.a, {
        href: '/sewa',
        className: 'mt-8 btn-3d inline-block',
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 }
      }, 'Mulai Sekarang')
    ),

    React.createElement('section', {},
        React.createElement('h3', { className: 'text-3xl font-bold text-center mb-8' }, 'Monitoring Status PC'),
        React.createElement(PCMonitor, null)
    ),

    React.createElement('section', {},
      React.createElement('h3', { className: 'text-3xl font-bold text-center mb-12' }, 'Kenapa Memilih Kami?'),
      React.createElement(motion.div, { 
        className: 'grid md:grid-cols-3 gap-8',
        variants: containerVariants,
        initial: "hidden",
        animate: "visible"
      },
        React.createElement(motion.div, { 
          className: 'bg-black/20 border border-discord-darker p-8 rounded-lg text-center hover:border-discord-blurple transition-colors',
          variants: itemVariants
        },
          React.createElement(Cpu, { className: 'mx-auto h-12 w-12 text-discord-blurple mb-4' }),
          React.createElement('h4', { className: 'text-xl font-bold mb-2' }, 'Performa Maksimal'),
          React.createElement('p', { className: 'text-discord-gray' }, 'Spesifikasi PC terbaru untuk gaming tanpa kompromi.')
        ),
        React.createElement(motion.div, { 
          className: 'bg-black/20 border border-discord-darker p-8 rounded-lg text-center hover:border-discord-blurple transition-colors',
          variants: itemVariants
        },
          React.createElement(Globe, { className: 'mx-auto h-12 w-12 text-discord-blurple mb-4' }),
          React.createElement('h4', { className: 'text-xl font-bold mb-2' }, 'Akses Fleksibel'),
          React.createElement('p', { className: 'text-discord-gray' }, 'Mainkan game dari perangkat apa saja, di mana saja.')
        ),
        React.createElement(motion.div, { 
          className: 'bg-black/20 border border-discord-darker p-8 rounded-lg text-center hover:border-discord-blurple transition-colors',
          variants: itemVariants
        },
          React.createElement(Clock, { className: 'mx-auto h-12 w-12 text-discord-blurple mb-4' }),
          React.createElement('h4', { className: 'text-xl font-bold mb-2' }, 'Setup Instan'),
          React.createElement('p', { className: 'text-discord-gray' }, 'Pesan, bayar, dan PC Cloud siap dalam hitungan menit.')
        )
      )
    )
  );
}