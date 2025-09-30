// components/PCMonitor.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, User, Clock, WifiOff, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const [[page, direction], setPage] = useState([0, 0]);

    useEffect(() => {
        const q = query(collection(db, 'pc_slots'), orderBy('slotId'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const slots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPcSlots(slots);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0
        })
    };

    const pcIndex = pcSlots.length > 0 ? ((page % pcSlots.length) + pcSlots.length) % pcSlots.length : 0;
    
    const paginate = (newDirection) => {
        setPage([page + newDirection, newDirection]);
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

    if (loading) {
        return React.createElement('div', { className: 'h-48 flex justify-center items-center' },
            React.createElement('p', { className: 'text-center text-discord-gray' }, 'Memuat status PC...')
        );
    }
    
    return React.createElement('div', { className: 'w-full max-w-sm mx-auto flex flex-col items-center' },
        React.createElement('div', { className: 'relative h-48 w-full flex items-center justify-center overflow-hidden' },
            React.createElement(AnimatePresence, { initial: false, custom: direction },
                pcSlots.length > 0 && React.createElement(motion.div, {
                    key: page,
                    custom: direction,
                    variants: variants,
                    initial: "enter",
                    animate: "center",
                    exit: "exit",
                    transition: {
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    },
                    drag: "x",
                    dragConstraints: { left: 0, right: 0 },
                    dragElastic: 1,
                    onDragEnd: (e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);
                        if (swipe < -swipeConfidenceThreshold) { paginate(1); } 
                        else if (swipe > swipeConfidenceThreshold) { paginate(-1); }
                    },
                    className: 'absolute bg-black/20 border border-discord-darker rounded-lg p-4 w-72 flex-shrink-0'
                },
                    React.createElement('div', { className: 'flex justify-between items-center mb-3' },
                        React.createElement('div', { className: 'flex items-center' },
                            React.createElement(Monitor, { className: 'h-6 w-6 mr-2 text-discord-blurple' }),
                            React.createElement('h3', { className: 'text-xl font-bold' }, pcSlots[pcIndex].slotId)
                        ),
                        React.createElement(StatusBadge, { status: pcSlots[pcIndex].status })
                    ),
                    pcSlots[pcIndex].status === 'DIGUNAKAN' ? React.createElement('div', { className: 'text-sm space-y-2 h-12' },
                        React.createElement('div', { className: 'flex items-center text-discord-gray' }, React.createElement(User, { size: 16, className: 'mr-2' }), `Digunakan oleh: ${pcSlots[pcIndex].currentUser || '...'}`),
                        React.createElement('div', { className: 'flex items-center text-discord-gray' }, React.createElement(Clock, { size: 16, className: 'mr-2' }), 'Sisa Waktu: ', React.createElement(CountdownTimer, {startTime: pcSlots[pcIndex].startTime, durationHours: pcSlots[pcIndex].durationHours}))
                    ) : pcSlots[pcIndex].status === 'READY' ? React.createElement('div', { className: 'text-center text-green-400 h-12 flex items-center justify-center' }, 'Siap Digunakan')
                    : React.createElement('div', { className: 'text-center text-gray-400 h-12 flex items-center justify-center' }, React.createElement(WifiOff, {size: 16, className: 'mr-2'}), 'PC Sedang Offline')
                )
            )
        ),
        
        React.createElement('div', { className: 'flex items-center gap-4 mt-4' },
            React.createElement('button', { onClick: () => paginate(-1), className: 'bg-discord-darker p-2 rounded-full hover:bg-discord-dark' }, React.createElement(ChevronLeft, null)),
            React.createElement('div', { className: 'flex gap-2' },
                pcSlots.map((_, i) => React.createElement('div', {
                    key: i,
                    className: `h-2 w-2 rounded-full transition-colors ${i === pcIndex ? 'bg-white' : 'bg-gray-600'}`
                }))
            ),
            React.createElement('button', { onClick: () => paginate(1), className: 'bg-discord-darker p-2 rounded-full hover:bg-discord-dark' }, React.createElement(ChevronRight, null))
        )
    );
};

export default PCMonitor;