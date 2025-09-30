// pages/register.js
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock } from 'lucide-react';
import { auth, db } from '../utils/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Membuat dokumen user baru di Firestore dengan avatar unik dari Dicebear
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.email.split('@')[0],
        // --- INI BAGIAN YANG BARU ---
        // Membuat URL avatar unik berdasarkan ID pengguna
        photoURL: `https://api.dicebear.com/9.x/micah/svg?seed=${user.uid}`,
        // -------------------------
        verificationStatus: 'belum terverifikasi',
        createdAt: new Date(),
      });
      
      router.push('/login');

    } catch (err) {
      setError(err.message);
      console.error(err);
    }
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
            placeholder: 'Password (min. 6 karakter)', required: true,
            className: 'w-full bg-discord-darker text-white p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-discord-blurple'
          })
        ),
        error && React.createElement('p', { className: 'text-red-500 text-sm text-center' }, error),
        React.createElement('button', {
          type: 'submit',
          className: 'w-full bg-discord-blurple text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-80 transition-all duration-300'
        }, 'Daftar'),
        React.createElement('p', { className: 'text-center text-sm text-discord-gray' },
          'Sudah punya akun? ',
          React.createElement(Link, { href: '/login', className: 'font-semibold text-discord-blurple hover:underline' }, 'Masuk di sini')
        )
      )
    )
  );
}