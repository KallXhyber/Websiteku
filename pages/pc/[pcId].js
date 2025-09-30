// pages/pc/[pcId].js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Monitor, Server, WifiOff } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReviewList from '../../components/reviews/ReviewList'; // Import komponen baru

const PCDetailPage = () => {
    const router = useRouter();
    const { pcId } = router.query;
    const [pcData, setPcData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!pcId) return;
        const fetchPcData = async () => {
            const docRef = doc(db, 'pc_slots', pcId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPcData({ id: docSnap.id, ...docSnap.data() });
            } else {
                // Handle PC not found
                console.log("No such PC slot!");
            }
            setLoading(false);
        };
        fetchPcData();
    }, [pcId]);

    if (loading) {
        return React.createElement('div', { className: 'flex justify-center items-center h-screen' }, 'Memuat detail PC...');
    }

    if (!pcData) {
        return React.createElement('div', { className: 'flex justify-center items-center h-screen' }, 'PC tidak ditemukan.');
    }

    return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
        React.createElement(Head, null, React.createElement('title', null, pcData.slotId)),
        React.createElement(motion.div, { 
            className: 'bg-black/20 border border-discord-darker p-8 rounded-lg shadow-xl max-w-4xl mx-auto',
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
        },
            React.createElement('div', { className: 'text-center mb-10' },
                React.createElement(Monitor, { className: 'mx-auto h-12 w-12 text-discord-blurple mb-4' }),
                React.createElement('h1', { className: 'text-4xl font-extrabold' }, pcData.slotId),
                React.createElement('p', { className: `mt-2 text-lg font-semibold ${pcData.status === 'READY' ? 'text-green-400' : pcData.status === 'DIGUNAKAN' ? 'text-yellow-400' : 'text-gray-400'}` }, pcData.status)
            ),
            
            // --- BAGIAN BARU UNTUK MENAMPILKAN ULASAN ---
            React.createElement(ReviewList, { pcId: pcData.id })
            
        )
    );
};

export default PCDetailPage;