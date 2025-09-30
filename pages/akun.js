// pages/akun.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Gamepad2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

// --- Komponen Kartu Akun ---
const AccountCard = ({ account }) => {
    const { user, userData } = useAuth();
    const router = useRouter();

    const handleBuy = () => {
        if (!user) {
            alert("Anda harus login untuk membeli akun.");
            router.push('/login');
            return;
        }

        const userName = userData.displayName || user.email.split('@')[0];
        const text = `Halo! ${account.adminName}, saya tertarik untuk membeli akun *${account.gameName}*.\n\n*Nama Saya:* ${userName}\n*Harga:* Rp ${account.price.toLocaleString('id-ID')}`;
        const encodedText = encodeURIComponent(text);
        const waLink = `https://wa.me/${account.adminWa}?text=${encodedText}`;
        
        window.open(waLink, '_blank');
    };

    return React.createElement(motion.div, {
        className: 'bg-black/20 border border-discord-darker rounded-lg shadow-lg overflow-hidden flex flex-col',
        whileHover: { y: -5 },
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
    },
        React.createElement('img', { 
            src: account.imageUrl || 'https://placehold.co/600x400/2c2f33/FFFFFF/png?text=XyCloud', 
            alt: account.gameName, 
            className: 'w-full h-48 object-cover' 
        }),
        React.createElement('div', { className: 'p-4 flex flex-col flex-grow' },
            React.createElement('h3', { className: 'text-xl font-bold mb-2' }, account.gameName),
            React.createElement('p', { className: 'text-sm text-discord-gray flex-grow mb-4' }, account.description),
            React.createElement('p', { className: 'text-xs text-discord-gray mb-1' }, `Dijual oleh: ${account.adminName}`),
            React.createElement('p', { className: 'text-2xl font-bold text-green-400 mb-4' }, `Rp ${account.price.toLocaleString('id-ID')}`),
            React.createElement('button', {
                onClick: handleBuy,
                className: 'mt-auto w-full bg-discord-blurple text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-80 flex items-center justify-center'
            }, 'Beli via WhatsApp', React.createElement(ExternalLink, {size: 16, className: 'ml-2'}))
        )
    );
};


// --- Halaman Utama Jual Akun ---
export default function JualAkunPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Mengambil data dari Firebase Firestore secara real-time
        const q = query(collection(db, 'game_accounts'), where('isSold', '==', false), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAccounts(fetchedAccounts);
            setLoading(false);
        }, (error) => {
            console.error("Gagal mengambil data akun:", error);
            setLoading(false);
        });

        // Membersihkan listener saat komponen dilepas
        return () => unsubscribe();
    }, []);

    return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
        React.createElement(Head, null, React.createElement('title', null, 'Jual Akun Game - XyCloud')),
        React.createElement('div', { className: 'text-center mb-12' },
            React.createElement(Gamepad2, { className: 'mx-auto h-12 w-12 text-discord-blurple mb-4' }),
            React.createElement('h1', { className: 'text-4xl font-extrabold' }, 'Marketplace Akun Game'),
            React.createElement('p', { className: 'text-discord-gray mt-2 max-w-2xl mx-auto' }, 'Temukan akun game siap pakai yang dijual langsung oleh admin terpercaya kami.')
        ),
        loading ? 
            React.createElement('p', { className: 'text-center text-discord-gray' }, 'Memuat produk...') :
        accounts.length > 0 ?
            React.createElement(motion.div, {
                className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
                initial: "initial",
                animate: "animate",
                variants: { animate: { transition: { staggerChildren: 0.1 } } }
            },
                accounts.map(acc => React.createElement(AccountCard, { key: acc.id, account: acc }))
            ) :
            React.createElement('p', { className: 'text-center text-discord-gray bg-black/20 border border-discord-darker p-8 rounded-lg' }, 'Saat ini belum ada produk akun yang tersedia.')
    );
}