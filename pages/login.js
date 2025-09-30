// pages/login.js
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';
// Import koneksi Firebase
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // 1. Lakukan proses login dengan Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Arahkan ke halaman profil setelah berhasil
      router.push('/profile');

    } catch (err) {
      // Tangani error (misal: user tidak ditemukan, password salah)
      setError("Email atau password salah. Silakan coba lagi.");
      console.error(err);
    }
  };

  return React.createElement('div', { className: 'container mx-auto px-4 py-12 flex justify-center items-center' },
    React.createElement(Head, null, React.createElement('title', null, 'Masuk - XyCloud')),
    React.createElement(motion.div, {
      className: 'w-full max-w-md bg-black/20 border border-discord-darker p-8 rounded-lg shadow-xl',
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    },
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement(LogIn, { className: 'mx-auto h-12 w-12 text-discord-blurple' }),
        React.createElement('h1', { className: 'text-3xl font-extrabold mt-4' }, 'Selamat Datang Kembali')
      ),
      React.createElement('form', { onSubmit: handleLogin, className: 'space-y-6' },
        React.createElement('div', { className: 'relative' },
          React.createElement(Mail, { className: 'absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-discord-gray' }),
          React.createElement('input', {
            type: 'email', value: email, onChange: (e) => setEmail(e.target.value),
            placeholder: 'Alamat Email', required: true,
            className: 'w-full bg-discord-darker text-white p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-discord-blurple'
          })
        ),
        React.createElement('div', { className: 'relative' },
          React.createElement(Lock, { className: 'absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-discord-gray' }),
          React.createElement('input', {
            type: 'password', value: password, onChange: (e) => setPassword(e.target.value),
            placeholder: 'Password', required: true,
            className: 'w-full bg-discord-darker text-white p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-discord-blurple'
          })
        ),
        error && React.createElement('p', { className: 'text-red-500 text-sm text-center' }, error),
        React.createElement('button', {
          type: 'submit',
          className: 'w-full bg-discord-blurple text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-80 transition-all duration-300'
        }, 'Masuk'),
        React.createElement('p', { className: 'text-center text-sm text-discord-gray' },
          'Belum punya akun? ',
          React.createElement(Link, { href: '/register', className: 'font-semibold text-discord-blurple hover:underline' }, 'Daftar di sini')
        )
      )
    )
  );
}