// components/NotificationPermission.js
'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getToken } from 'firebase/messaging';
import { messaging } from '../utils/firebase'; // Kita perlu export 'messaging' dari firebase.js
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const NotificationPermission = () => {
    const { user } = useAuth();
    const [notificationStatus, setNotificationStatus] = useState('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationStatus(Notification.permission);
        }
    }, []);

    const handleRequestPermission = async () => {
        if (!user) {
            alert("Anda harus login untuk mengaktifkan notifikasi.");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            setNotificationStatus(permission);

            if (permission === 'granted') {
                console.log('Notification permission granted.');
                
                // Dapatkan token
                const currentToken = await getToken(messaging(), { 
                    vapidKey: 'BHqzounEogPfENNhA7_GnX5P8BkP5pF4iduVwxLGWcXqS4HaTq9h2w5DNYR6NHc_mlH0mS1Z6YNMUE2a59FpQ9Q' // Ganti dengan VAPID key Anda dari Firebase
                });

                if (currentToken) {
                    console.log('FCM Token:', currentToken);
                    // Simpan token ke data user di Firestore
                    const userDocRef = doc(db, 'users', user.uid);
                    await updateDoc(userDocRef, {
                        fcmToken: currentToken
                    });
                    alert("Notifikasi berhasil diaktifkan!");
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            } else {
                console.log('Unable to get permission to notify.');
            }
        } catch (error) {
            console.error('An error occurred while requesting permission. ', error);
        }
    };
    
    // Jangan tampilkan apa-apa jika notifikasi sudah diizinkan atau diblokir
    if (notificationStatus === 'granted' || notificationStatus === 'denied') {
        return null;
    }

    return React.createElement('div', {
        className: 'fixed bottom-4 right-4 bg-discord-blurple text-white p-4 rounded-lg shadow-lg flex items-center gap-4'
    },
        React.createElement(Bell, null),
        React.createElement('p', { className: 'text-sm' }, 'Aktifkan notifikasi untuk update penting?'),
        React.createElement('button', {
            onClick: handleRequestPermission,
            className: 'bg-white/20 hover:bg-white/30 font-semibold py-1 px-3 rounded'
        }, 'Aktifkan')
    );
};

export default NotificationPermission;