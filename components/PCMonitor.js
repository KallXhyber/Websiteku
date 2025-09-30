// components/PCMonitor.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, User, Clock, WifiOff } from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const StatusBadge = ({ status }) => {
    const config = {
        'DIGUNAKAN': 'bg-yellow-500/20 text-yellow-400',
        'READY': 'bg-green-500/20 text-green-400',
        'OFFLINE': 'bg-gray-500/20 text-gray-400',
    };
    return React.createElement('span', {
        className: `px-2 py-1 text-xs font-semibold rounded-full ${config[status] || 'bg-gray-500/20 text-gray-400'}`
    }, status);
};

const CountdownTimer = ({ startTime, durationHours }) => {
    const [remainingTime, setRemainingTime] = useState('Menghitung...');

    useEffect(() => {
        if (!startTime || !durationHours) {
            setRemainingTime('N/A');
            return;
        }

        const interval = setInterval(() => {
            const now = new Date();
            const start = startTime.toDate();
            const endTime = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
            const diff = endTime.getTime() - now.getTime();

            if (diff <= 0) {
                setRemainingTime("Waktu Habis");
                clearInterval(interval);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
            const minutes = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
            const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');

            setRemainingTime(`${hours}:${minutes}:${seconds}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, durationHours]);

    return React.createElement('span', null, remainingTime);
};

const PCMonitor = () => {
    const [pcSlots, setPcSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'pc_slots'), orderBy('slotId'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const slots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPcSlots(slots);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return React.createElement('div', { className: 'h-32 flex justify-center items-center' },
            React.createElement('p', { className: 'text-center text-discord-gray' }, 'Memuat status PC...')
        );
    }

    return React.createElement('div', { className: 'w-full overflow-hidden' },
        React.createElement(motion.div, {
            className: 'flex gap-6 p-2 cursor-grab',
            drag: 'x',
            dragConstraints: { right: 0, left: pcSlots.length > 3 ? - (pcSlots.length - 2.5) * 312 : 0 } 
        },
            pcSlots.map(pc => React.createElement('div', {
                key: pc.id,
                className: 'bg-black/20 border border-discord-darker rounded-lg p-4 w-72 flex-shrink-0'
            },
                React.createElement('div', { className: 'flex justify-between items-center mb-3' },
                    React.createElement('div', { className: 'flex items-center' },
                        React.createElement(Monitor, { className: 'h-6 w-6 mr-2 text-discord-blurple' }),
                        React.createElement('h3', { className: 'text-xl font-bold' }, pc.slotId)
                    ),
                    React.createElement(StatusBadge, { status: pc.status })
                ),
                pc.status === 'DIGUNAKAN' ? React.createElement('div', { className: 'text-sm space-y-2 h-12' },
                    React.createElement('div', { className: 'flex items-center text-discord-gray' },
                        React.createElement(User, { size: 16, className: 'mr-2' }), `Digunakan oleh: ${pc.currentUser || '...'}`
                    ),
                    React.createElement('div', { className: 'flex items-center text-discord-gray' },
                        React.createElement(Clock, { size: 16, className: 'mr-2' }), 'Sisa Waktu: ', React.createElement(CountdownTimer, {startTime: pc.startTime, durationHours: pc.durationHours})
                    )
                ) : pc.status === 'READY' ? React.createElement('div', { className: 'text-center text-green-400 h-12 flex items-center justify-center' }, 'Siap Digunakan')
                  : React.createElement('div', { className: 'text-center text-gray-400 h-12 flex items-center justify-center' }, React.createElement(WifiOff, {size: 16, className: 'mr-2'}), 'PC Sedang Offline')
            ))
        )
    );
};

export default PCMonitor;