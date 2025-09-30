import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { User, Shield, Clock, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useRouter } from 'next/router';

// Komponen untuk menampilkan status verifikasi
const VerificationStatus = ({ status }) => {
    const config = {
        'terverifikasi': { text: 'Terverifikasi', icon: CheckCircle, color: 'text-green-400' },
        'pending': { text: 'Sedang Ditinjau', icon: Clock, color: 'text-yellow-400' },
        'ditolak': { text: 'Ditolak', icon: XCircle, color: 'text-red-400' },
        'belum terverifikasi': { text: 'Belum Terverifikasi', icon: Shield, color: 'text-yellow-500' }
    };
    const currentStatus = config[status] || config['belum terverifikasi'];
    const Icon = currentStatus.icon;

    return React.createElement('div', { className: 'bg-discord-darker p-6 rounded-lg' },
        React.createElement('div', { className: 'flex items-center mb-2' },
            React.createElement(Icon, { className: `h-6 w-6 ${currentStatus.color} mr-3` }),
            React.createElement('h2', { className: 'text-xl font-bold' }, 'Status Verifikasi')
        ),
        React.createElement('p', { className: `${currentStatus.color}` }, currentStatus.text),
        status === 'belum terverifikasi' && React.createElement('p', { className: 'text-sm text-discord-gray mt-1' }, 'Lakukan verifikasi saat akan menyewa PC.')
    );
};

// Komponen untuk menampilkan satu item transaksi
const TransactionItem = ({ tx }) => {
    const statusConfig = {
        'selesai': 'bg-green-500/20 text-green-400',
        'aktif': 'bg-blue-500/20 text-blue-400',
        'menunggu konfirmasi': 'bg-yellow-500/20 text-yellow-400',
        'dibatalkan': 'bg-red-500/20 text-red-400'
    };
    
    return React.createElement('div', { className: 'bg-discord-darker p-4 rounded-lg flex justify-between items-center' },
        React.createElement('div', null,
            React.createElement('p', { className: 'font-bold' }, `${tx.paket} - Admin ${tx.adminName}`),
            React.createElement('p', { className: 'text-sm text-discord-gray' }, `Rp ${tx.harga.toLocaleString('id-ID')} - ${new Date(tx.createdAt?.toDate()).toLocaleDateString()}`)
        ),
        React.createElement('span', { className: `px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[tx.status] || ''}` },
            tx.status.replace(/ /g, '-').toUpperCase()
        )
    );
};

// --- Halaman Profil Utama ---
export default function ProfilePage() {
    const { user, userData, loading } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error("Gagal logout:", error);
        }
    };

    if (loading || !user) {
        return React.createElement('div', { className: 'flex justify-center items-center h-screen' }, 'Loading...');
    }

    return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
        React.createElement(Head, null, React.createElement('title', null, 'Profil Saya - XyCloud')),
        React.createElement(motion.div, {
            className: 'bg-black/20 border border-discord-darker p-8 rounded-lg shadow-xl',
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
        },
            React.createElement('div', { className: 'flex flex-col md:flex-row items-center md:items-start text-center md:text-left mb-10' },
                React.createElement('div', { className: 'w-24 h-24 bg-discord-darker rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6' },
                    React.createElement(User, { className: 'h-12 w-12 text-discord-blurple' })
                ),
                React.createElement('div', {},
                    React.createElement('h1', { className: 'text-3xl font-extrabold' }, userData?.displayName || user.email.split('@')[0]),
                    React.createElement('p', { className: 'text-discord-gray' }, user.email)
                )
            ),
            React.createElement('div', { className: 'grid lg:grid-cols-3 gap-6' },
                React.createElement('div', { className: 'lg:col-span-1' },
                    React.createElement(VerificationStatus, { status: userData?.verificationStatus })
                ),
                React.createElement('div', { className: 'lg:col-span-2' },
                    React.createElement('h2', { className: 'text-xl font-bold mb-4 flex items-center' }, React.createElement(Clock, { className: 'mr-2' }), 'Riwayat Transaksi'),
                    React.createElement('div', { className: 'space-y-3' },
                        transactions.length > 0 ?
                            transactions.map(tx => React.createElement(TransactionItem, { key: tx.id, tx: tx })) :
                            React.createElement('p', { className: 'text-discord-gray text-center p-4' }, 'Anda belum memiliki riwayat transaksi.')
                    )
                )
            ),
            React.createElement('div', { className: 'mt-10 flex justify-center' },
                React.createElement('button', {
                    onClick: handleLogout,
                    className: 'flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition-colors'
                },
                    React.createElement(LogOut, { className: 'h-5 w-5 mr-2' }),
                    'Keluar'
                )
            )
        )
    );
}
