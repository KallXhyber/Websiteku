// pages/profile.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { User, Shield, Clock, LogOut, CheckCircle, XCircle, Edit, Check, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useRouter } from 'next/router';

// ... (Komponen-komponen lainnya)
// VerificationStatus dan TransactionItem

const LevelProgress = ({ currentPoints, level }) => {
    // Asumsi: Level up setiap 1000 poin
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
    const { user, userData, loading, setUserData } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (userData) {
            setNewName(userData.displayName || '');
        }
    }, [user, userData, loading, router]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => { try { await signOut(auth); router.push('/login'); } catch (error) { console.error("Gagal logout:", error); } };

    const handleSaveName = async () => {
        if (newName.trim() === '' || !user) return;
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { displayName: newName });
        setUserData({ ...userData, displayName: newName });
        setIsEditing(false);
    };

    if (loading || !user || !userData) { return React.createElement('div', { className: 'flex justify-center items-center h-screen' }, 'Loading...'); }

    return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
        React.createElement(Head, null, React.createElement('title', null, 'Profil Saya - XyCloud')),
        React.createElement(motion.div, { className: 'bg-black/20 border border-discord-darker p-8 rounded-lg shadow-xl' },
            React.createElement('div', { className: 'flex flex-col md:flex-row items-center md:items-start text-center md:text-left mb-10' },
                React.createElement('div', { className: 'w-24 h-24 bg-discord-darker rounded-full mb-4 md:mb-0 md:mr-6 p-1' },
                    React.createElement('img', {
                        src: userData.photoURL,
                        alt: "Profile Avatar",
                        className: 'w-full h-full rounded-full object-cover'
                    })
                ),
                React.createElement('div', { className: 'mt-2' },
                    isEditing ?
                        React.createElement('div', { className: 'flex items-center gap-2' },
                            React.createElement('input', { type: 'text', value: newName, onChange: (e) => setNewName(e.target.value), className: 'bg-discord-darker p-2 rounded text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-discord-blurple' }),
                            React.createElement('button', { onClick: handleSaveName, className: 'bg-green-600 p-2 rounded hover:bg-green-700' }, React.createElement(Check, null))
                        ) :
                        React.createElement('div', { className: 'flex items-center gap-4' },
                            React.createElement('h1', { className: 'text-3xl font-extrabold' }, userData.displayName || user.email.split('@')[0]),
                            React.createElement('button', { onClick: () => setIsEditing(true), className: 'text-discord-gray hover:text-white' }, React.createElement(Edit, { size: 20 }))
                        ),
                    React.createElement('p', { className: 'text-discord-gray' }, user.email)
                )
            ),
            React.createElement('div', { className: 'grid lg:grid-cols-3 gap-6' },
                React.createElement('div', { className: 'lg:col-span-1 space-y-4' },
                    React.createElement(VerificationStatus, { status: userData.verificationStatus }),
                    // --- Kartu Poin & Level Baru ---
                    React.createElement('div', { className: 'bg-discord-darker p-6 rounded-lg' },
                        React.createElement('div', { className: 'flex items-center mb-2' },
                            React.createElement(Star, { className: 'h-6 w-6 text-yellow-400 mr-3' }),
                            React.createElement('h2', { className: 'text-xl font-bold' }, `Level ${userData.level || 1}`)
                        ),
                        React.createElement('p', { className: 'text-discord-gray' }, `Poin Anda: ${userData.points || 0}`),
                        React.createElement(LevelProgress, { currentPoints: userData.points || 0, level: userData.level || 1 })
                    )
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
                React.createElement('button', { onClick: handleLogout, className: 'flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full' },
                    React.createElement(LogOut, { className: 'h-5 w-5 mr-2' }),
                    'Keluar'
                )
            )
        )
    );
}