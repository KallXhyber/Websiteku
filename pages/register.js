// pages/register.js
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react'; // Tambahkan Eye dan EyeOff
import { auth, db } from '../utils/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [username, setUsername] = useState(''); // State baru untuk username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State baru untuk visibilitas password
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!username) { // Validasi sederhana
        setError("Nama pengguna tidak boleh kosong.");
        return;
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: username, // Menggunakan state username
        photoURL: `https://api.dicebear.com/9.x/micah/svg?seed=${user.uid}`,
        verificationStatus: 'belum terverifikasi',
        createdAt: new Date(),
        points: 0, // Tambahkan ini
        level: 1,  // Tambahkan ini
      });
      
      router.push('/login');

    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const handleDiscordLogin = () => {
    signIn('discord', { callbackUrl: '/profile' });
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return React.createElement('div', { className: 'container mx-auto px-4 py-12 flex justify-center items-center' },
    React.createElement(Head, null, React.createElement('title', null, 'Daftar - XyCloud')),
    React.createElement(motion.div, {
      className: 'w-full max-w-md bg-black/20 border border-discord-darker p-8 rounded-lg shadow-xl',
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    },
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement(UserPlus, { className: 'mx-auto h-12 w-12 text-discord-blurple' }),
        React.createElement('h1', { className: 'text-3xl font-extrabold mt-4' }, 'Buat Akun Baru')
      ),
      React.createElement('form', { onSubmit: handleRegister, className: 'space-y-6' },
        // Kolom input username yang baru
        React.createElement('div', { className: 'relative' },
          React.createElement(UserPlus, { className: 'absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-discord-gray' }),
          React.createElement('input', {
            type: 'text', value: username, onChange: (e) => setUsername(e.target.value),
            placeholder: 'Nama Pengguna', required: true,
            className: 'w-full bg-discord-darker text-white p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-discord-blurple'
          })
        ),
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
            type: showPassword ? 'text' : 'password', // Mengubah tipe input berdasarkan state
            value: password, onChange: (e) => setPassword(e.target.value),
            placeholder: 'Password (min. 6 karakter)', required: true,
            className: 'w-full bg-discord-darker text-white p-3 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-discord-blurple'
          }),
          // Tombol untuk hide/show password
          React.createElement('button', {
            type: 'button',
            onClick: togglePasswordVisibility,
            className: 'absolute right-3 top-1/2 -translate-y-1/2 text-discord-gray hover:text-white'
          },
            showPassword ? React.createElement(EyeOff, null) : React.createElement(Eye, null)
          )
        ),
        error && React.createElement('p', { className: 'text-red-500 text-sm text-center' }, error),
        React.createElement('button', {
          type: 'submit',
          className: 'w-full bg-discord-blurple text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-80 transition-all duration-300'
        }, 'Daftar'),

        React.createElement('div', { className: 'relative my-6' },
          React.createElement('div', { className: 'absolute inset-0 flex items-center' },
            React.createElement('div', { className: 'w-full border-t border-discord-gray' })
          ),
          React.createElement('div', { className: 'relative flex justify-center text-sm' },
            React.createElement('span', { className: 'bg-black/20 px-2 text-discord-gray' }, 'Atau')
          )
        ),
        React.createElement('button', {
            onClick: handleDiscordLogin,
            type: 'button',
            className: 'w-full flex items-center justify-center bg-[#5865f2] text-white font-bold py-3 px-8 rounded-full hover:bg-[#4752c4] transition-all duration-300'
          },
          React.createElement('img', { src: 'https://i.imgur.com/tL4A08S.png', alt: 'Discord Logo', className: 'h-6 w-6 mr-3' }),
          'Daftar dengan Discord'
        ),

        React.createElement('p', { className: 'text-center text-sm text-discord-gray mt-6' },
          'Sudah punya akun? ',
          React.createElement(Link, { href: '/login', className: 'font-semibold text-discord-blurple hover:underline' }, 'Masuk di sini')
        )
      )
    )
  );
}