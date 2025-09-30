// components/Header.js
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Menu, X, User, LogIn, LogOut, Shield, Sun, Moon, Cloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';

const Header = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { user, userData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    router.push('/login');
  };

  const navLinks = [
    { href: '/', text: 'Beranda' },
    { href: '/sewa', text: 'Sewa PC' },
    { href: '/akun', text: 'Jual Akun' },
    { href: '/tutorial', text: 'Tutorial' },
    { href: '/faq', text: 'FAQ' },
    { href: '/tentang', 'text': 'Tentang Kami' }
  ];

  const AnimatedLogo = () => {
    const logoText = "XyCloud";
    const containerVariants = { initial: {}, hover: { transition: { staggerChildren: 0.07 } } };
    const letterVariants = { initial: { y: 0 }, hover: { y: -5, transition: { type: 'spring', stiffness: 300, damping: 10 } } };
    return React.createElement(motion.div, { 
        variants: containerVariants, initial: "initial", whileHover: "hover", 
        className: 'flex cursor-pointer relative items-center z-10'
    },
      React.createElement(Cloud, { className: 'mr-2 text-discord-blurple animate-pulse' }),
      logoText.split('').map((char, index) => React.createElement(motion.span, { key: `${char}-${index}`, variants: letterVariants, className: 'inline-block text-2xl font-bold' }, char))
    );
  };

  return React.createElement('header', { 
      className: 'bg-white/5 dark:bg-black/30 backdrop-blur-md text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50 border-b border-white/10 dark:border-white/5' 
  },
    React.createElement(Link, { href: '/' }, React.createElement(AnimatedLogo)),
    React.createElement('nav', { className: 'hidden md:flex items-center space-x-6' },
      navLinks.map(link => React.createElement(Link, { key: link.href, href: link.href, className: 'hover:text-discord-blurple transition-colors font-medium' }, link.text)),
      React.createElement('button', { onClick: toggleTheme, className: 'p-2 rounded-full hover:bg-white/10' },
        theme === 'dark' ? React.createElement(Sun, { size: 20 }) : React.createElement(Moon, { size: 20 })
      ),
      userData?.role === 'admin' && React.createElement(Link, { href: '/admin', className: 'flex items-center text-yellow-400 hover:text-yellow-300' }, React.createElement(Shield, { size: 20, className: 'mr-2' }), 'Admin'),
      user ?
        React.createElement(Link, { href: '/profile', className: 'flex items-center bg-discord-blurple p-2 rounded-full hover:bg-opacity-80' }, React.createElement(User, { size: 20 })) :
        React.createElement(Link, { href: '/login', className: 'bg-discord-blurple font-semibold py-2 px-4 rounded-lg hover:bg-opacity-80' }, 'Masuk / Daftar')
    ),
    React.createElement('div', { className: 'md:hidden' },
      React.createElement('button', { onClick: () => setMenuOpen(!isMenuOpen) }, isMenuOpen ? React.createElement(X, { size: 28 }) : React.createElement(Menu, { size: 28 }))
    ),
    isMenuOpen && React.createElement('div', { className: 'absolute top-full left-0 w-full bg-black/30 backdrop-blur-lg border-t border-white/10 shadow-lg md:hidden' },
      React.createElement('nav', { className: 'flex flex-col p-4' },
        navLinks.map(link => React.createElement(Link, { key: link.href, href: link.href, className: 'py-2 px-2 text-lg hover:bg-white/10 rounded', onClick: () => setMenuOpen(false) }, link.text)),
        
        React.createElement('div', {className: 'border-t border-white/10 my-2'}),

        // Tombol Ganti Tema untuk menu mobile
        React.createElement('button', {
            onClick: () => { setMenuOpen(false); toggleTheme(); },
            className: 'flex items-center py-2 px-2 text-lg w-full rounded hover:bg-white/10'
          },
            theme === 'dark' ? 
              React.createElement(Sun, { size: 20, className: 'mr-2' }) : 
              React.createElement(Moon, { size: 20, className: 'mr-2' }),
            'Ganti Tema'
        ),

        React.createElement('div', {className: 'border-t border-white/10 my-2'}),

        user ?
          React.createElement(React.Fragment, null,
            userData?.role === 'admin' && React.createElement(Link, { href: '/admin', className: 'flex items-center text-yellow-400 py-2 px-2 text-lg', onClick: () => setMenuOpen(false) }, React.createElement(Shield, { className: 'mr-2', size: 20 }), 'Panel Admin'),
            React.createElement(Link, { href: '/profile', className: 'flex items-center py-2 px-2 text-lg', onClick: () => setMenuOpen(false) }, React.createElement(User, { className: 'mr-2', size: 20 }), 'Profil Saya'),
            React.createElement('button', { onClick: handleLogout, className: 'flex items-center text-red-400 py-2 px-2 text-lg w-full' }, React.createElement(LogOut, { className: 'mr-2', size: 20 }), 'Keluar')
          ) :
          React.createElement(Link, { href: '/login', className: 'flex items-center py-2 px-2 text-lg', onClick: () => setMenuOpen(false) }, React.createElement(LogIn, { className: 'mr-2', size: 20 }), 'Masuk / Daftar')
      )
    )
  );
};

export default Header;