import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { auth, db } from '../utils/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (!displayName) { setError("Nama pengguna tidak boleh kosong."); return; }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: displayName,
        email: user.email,
        image: `https://api.dicebear.com/9.x/micah/svg?seed=${user.uid}`,
        emailVerified: null,
        displayName: displayName,
        photoURL: `https://api.dicebear.com/9.x/micah/svg?seed=${user.uid}`,
        verificationStatus: 'belum terverifikasi',
        createdAt: new Date(),
        role: 'user',
        points: 0,
        level: 1,
        saldoWaktu: 0,
      });

      const result = await signIn('credentials', { redirect: false, email: email, password: password });
      if (result.ok) {
        router.push('/profile');
      } else {
        setError("Gagal login setelah daftar. Coba login manual.");
      }
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? "Email ini sudah terdaftar." : "Terjadi kesalahan.");
      console.error(err);
    }
  };

  const handleDiscordLogin = () => signIn('discord', { callbackUrl: '/profile' });
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return React.createElement('div', { className: 'container mx-auto px-4 py-12 flex justify-center items-center' },
    React.createElement(Head, null, React.createElement('title', null, 'Daftar - XyCloud')),
    React.createElement(motion.div, { className: 'w-full max-w-md bg-black/20 border border-discord-darker p-8 rounded-lg shadow-xl' },
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement(UserPlus, { className: 'mx-auto h-12 w-12 text-discord-blurple' }),
        React.createElement('h1', { className: 'text-3xl font-extrabold mt-4' }, 'Buat Akun Baru')
      ),
      React.createElement('form', { onSubmit: handleRegister, className: 'space-y-6' },
        React.createElement('div', { className: 'relative' }, React.createElement(User, { className: 'absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-discord-gray' }), React.createElement('input', { type: 'text', value: displayName, onChange: (e) => setDisplayName(e.target.value), placeholder: 'Nama Pengguna', required: true, className: 'w-full bg-discord-darker text-white p-3 pl-10 rounded-lg' })),
        React.createElement('div', { className: 'relative' }, React.createElement(Mail, { className: 'absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-discord-gray' }), React.createElement('input', { type: 'email', value: email, onChange: (e) => setEmail(e.target.value), placeholder: 'Alamat Email', required: true, className: 'w-full bg-discord-darker text-white p-3 pl-10 rounded-lg' })),
        React.createElement('div', { className: 'relative' }, React.createElement(Lock, { className: 'absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-discord-gray' }), React.createElement('input', { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), placeholder: 'Password (min. 6 karakter)', required: true, className: 'w-full bg-discord-darker text-white p-3 pl-10 pr-10 rounded-lg' }), React.createElement('button', { type: 'button', onClick: togglePasswordVisibility, className: 'absolute right-3 top-1/2 -translate-y-1/2' }, showPassword ? React.createElement(EyeOff, {size: 20}) : React.createElement(Eye, {size: 20}))),
        error && React.createElement('p', { className: 'text-red-500 text-sm text-center' }, error),
        React.createElement('button', { type: 'submit', className: 'w-full bg-discord-blurple text-white font-bold py-3 rounded-full' }, 'Daftar'),
        React.createElement('div', { className: 'relative my-4' }, React.createElement('div', { className: 'absolute inset-0 flex items-center' }, React.createElement('div', { className: 'w-full border-t border-discord-darker' })), React.createElement('div', { className: 'relative flex justify-center text-sm' }, React.createElement('span', { className: 'bg-black/20 px-2 text-discord-gray' }, 'Atau'))),
        React.createElement('button', { onClick: handleDiscordLogin, type: 'button', className: 'w-full flex items-center justify-center bg-[#5865f2] text-white font-bold py-3 rounded-full' }, React.createElement('img', { src: 'https://i.imgur.com/tL4A08S.png', alt: 'Discord Logo', className: 'h-6 w-6 mr-3' }), 'Lanjut dengan Discord'),
        React.createElement('p', { className: 'text-center text-sm text-discord-gray mt-4' }, 'Sudah punya akun? ', React.createElement(Link, { href: '/login', className: 'font-semibold text-discord-blurple' }, 'Masuk di sini'))
      )
    )
  );
}
