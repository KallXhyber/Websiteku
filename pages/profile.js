// pages/profile.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { User, Shield, Clock, LogOut, CheckCircle, XCircle, Edit, Check, Star, Wallet } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

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
        React.createElement('span', { className: `px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[tx.status] || ''}` }, tx.status.replace(/ /g, '-').toUpperCase())
    );
};

const LevelProgress = ({ currentPoints, level }) => {
    const pointsForNextLevel = level * 1000;
    const progress = (currentPoints / pointsForNextLevel) * 100;
    return React.createElement('div', { className: 'mt-2' },
        React.createElement('div', { className: 'h-2 w-full bg-discord-darker rounded-full' },
            React.createElement(motion.div, {
                className: 'h-full bg-yellow-400 rounded-full',
                initial: { width: 0 },
                animate: { width: `${progress > 100 ? 100 : progress}%` }
            })
        ),
        React.createElement('p', { className: 'text-xs text-discord-gray mt-1' }, `${currentPoints} / ${pointsForNextLevel} Poin`)
    );
};

export default function ProfilePage() {
    const { data: session, status } = useSession({ required: true, onUnauthenticated() { router.push('/login') } });
    const router = useRouter();
    const [transactions, setTransactions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');

    const user = session?.user;

    useEffect(() => {
        if (user) {
            setNewName(user.name || '');
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'transactions'), where('userId', '==', user.id), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const handleLogout = () => signOut({ callbackUrl: '/login' });
    
    const handleSaveName = async () => {
        if (newName.trim() === '' || !user) return;
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, { 
            displayName: newName,
            name: newName
        });
        setIsEditing(false);
        alert("Nama berhasil diperbarui! Perubahan akan terlihat setelah Anda me-refresh halaman atau login kembali.");
    };

    if (status === 'loading' || !user) {
        return React.createElement('div', { className: 'flex justify-center items-center h-screen' }, 'Loading...');
    }

    return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
        React.createElement(Head, null, React.createElement('title', null, 'Profil Saya - XyCloud')),
        React.createElement(motion.div, { className: 'bg-black/20 border border-discord-darker p-8 rounded-lg shadow-xl' },
            React.createElement('div', { className: 'flex flex-col md:flex-row items-center md:items-start text-center md:text-left mb-10' },
                React.createElement('div', { className: 'w-24 h-24 bg-discord-darker rounded-full mb-4 md:mb-0 md:mr-6 p-1' },
                    React.createElement('img', { src: user.image, alt: user.name, className: 'w-full h-full rounded-full object-cover' })
                ),
                React.createElement('div', { className: 'mt-2' },
                    isEditing ?
                        React.createElement('div', { className: 'flex items-center gap-2' },
                            React.createElement('input', { type: 'text', value: newName, onChange: (e) => setNewName(e.target.value), className: 'bg-discord-darker p-2 rounded text-2xl font-bold' }),
                            React.createElement('button', { onClick: handleSaveName, className: 'bg-green-600 p-2 rounded' }, React.createElement(Check, null))
                        ) :
                        React.createElement('div', { className: 'flex items-center gap-4' },
                            React.createElement('h1', { className: 'text-3xl font-extrabold' }, user.name),
                            React.createElement('button', { onClick: () => setIsEditing(true) }, React.createElement(Edit, { size: 20 }))
                        ),
                    React.createElement('p', { className: 'text-discord-gray' }, user.email)
                )
            ),
            React.createElement('div', { className: 'grid lg:grid-cols-3 gap-6' },
                React.createElement('div', { className: 'lg:col-span-1 space-y-4' },
                    React.createElement(VerificationStatus, { status: user.verificationStatus }),
                    user.saldoWaktu > 0 && React.createElement('div', {className: 'bg-discord-darker p-6 rounded-lg'}, 
                        React.createElement('h2', {className: 'font-bold flex items-center mb-2'}, React.createElement(Wallet, {className:'mr-2'}), 'Saldo Waktu'), 
                        React.createElement('p', {className: 'text-lg'}, `${Math.floor(user.saldoWaktu / 60)} jam ${user.saldoWaktu % 60} menit`)
                    ),
                    React.createElement('div', { className: 'bg-discord-darker p-6 rounded-lg' },
                        React.createElement('h2', { className: 'text-xl font-bold flex items-center' }, React.createElement(Star, { className:'mr-2 text-yellow-400'}), `Level ${user.level || 1}`),
                        React.createElement('p', { className: 'text-discord-gray' }, `Poin Anda: ${user.points || 0}`),
                        React.createElement(LevelProgress, { currentPoints: user.points || 0, level: user.level || 1 })
                    )
                ),
                React.createElement('div', { className: 'lg:col-span-2' },
                    React.createElement('h2', { className: 'text-xl font-bold mb-4 flex items-center' }, React.createElement(Clock, { className: 'mr-2' }), 'Riwayat Transaksi'),
                    React.createElement('div', { className: 'space-y-3' },
                        transactions.length > 0 ?
                            transactions.map(tx => React.createElement(TransactionItem, { key: tx.id, tx: tx })) :
                            React.createElement('p', { className: 'text-discord-gray text-center p-4' }, 'Tidak ada riwayat transaksi.')
                    )
                )
            ),
            React.createElement('div', { className: 'mt-10 flex justify-center' },
                React.createElement('button', { onClick: handleLogout, className: 'flex items-center bg-red-600 text-white font-bold py-3 px-6 rounded-full' },
                    React.createElement(LogOut, { className: 'h-5 w-5 mr-2' }),
                    'Keluar'
                )
            )
        )
    );
}