// pages/bantuan.js
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { LifeBuoy, Bot, Send, User } from 'lucide-react';

// --- OTAK DARI BOT "KallKwanjut" (Bisa Anda Tambah Sendiri) ---
const getBotResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();

    // Sapaan
    if (lowerInput.includes('halo') || lowerInput.includes('hai') || lowerInput.includes('hi')) {
        return "Halo! Saya KallKwanjut, asisten virtual XyCloud. Ada yang bisa saya bantu?";
    }
    // Pertanyaan tentang sewa
    if (lowerInput.includes('sewa') || lowerInput.includes('menyewa')) {
        return "Untuk menyewa PC, silakan kunjungi halaman 'Sewa PC'. Anda perlu login dan melakukan verifikasi satu kali jika ini adalah sewa pertama Anda.";
    }
    // Pertanyaan tentang verifikasi
    if (lowerInput.includes('verifikasi') || lowerInput.includes('verif')) {
        return "Verifikasi hanya diperlukan untuk sewa pertama kali. Anda perlu mengupload screenshot akun Discord, Steam, dan Cfx.re. Setelah disetujui admin, Anda tidak perlu verifikasi lagi.";
    }
    // Pertanyaan tentang harga
    if (lowerInput.includes('harga') || lowerInput.includes('biaya')) {
        return "Harga sewa PC berbeda-beda tergantung admin yang sedang bertugas. Anda bisa melihat harga pastinya di halaman 'Sewa PC' setelah memilih admin yang online.";
    }
    // Pertanyaan tentang akun game
    if (lowerInput.includes('akun') || lowerInput.includes('beli')) {
        return "Tentu, kami menjual berbagai akun game. Silakan lihat daftar lengkapnya di halaman 'Jual Akun'. Proses pembelian akan diarahkan ke WhatsApp admin.";
    }
     // Pertanyaan tentang admin
    if (lowerInput.includes('admin') || lowerInput.includes('kontak')) {
        return "Anda bisa menghubungi admin kami langsung melalui WhatsApp. Setiap admin memiliki jam operasionalnya masing-masing yang tertera di halaman sewa.";
    }
    // Jawaban default jika tidak mengerti
    return "Maaf, saya belum mengerti pertanyaan itu. Anda bisa coba bertanya tentang 'sewa', 'verifikasi', 'harga', atau 'akun'. Jika butuh bantuan lebih lanjut, silakan hubungi admin kami.";
};


// --- KOMPONEN CHATBOT ---
const Chatbot = () => {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: "Halo! Saya KallKwanjut. Ketik pertanyaan Anda di bawah, ya!" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const userMessage = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        const responseText = getBotResponse(userInput); // Panggil otak bot lokal
        setUserInput('');

        setTimeout(() => {
            const botMessage = { sender: 'bot', text: responseText };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1200); // Jeda untuk simulasi bot mengetik
    };

    return React.createElement('div', { className: 'bg-black/20 border border-discord-darker rounded-lg shadow-lg h-[60vh] flex flex-col' },
        // Header Chat
        React.createElement('div', { className: 'p-4 border-b border-discord-darker flex items-center' },
            React.createElement(Bot, { className: 'h-8 w-8 text-discord-blurple mr-3' }),
            React.createElement('div', null,
                React.createElement('h3', { className: 'text-lg font-bold' }, 'KallKwanjut'),
                React.createElement('p', { className: 'text-xs text-green-400' }, '● Online')
            )
        ),
        // Area Pesan
        React.createElement('div', { className: 'flex-grow p-4 overflow-y-auto' },
            messages.map((msg, index) => React.createElement('div', {
                key: index,
                className: `flex items-end mb-4 gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`
            },
                msg.sender === 'bot' && React.createElement(Bot, { className: 'h-6 w-6 text-discord-blurple flex-shrink-0' }),
                React.createElement('div', { className: `max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-discord-blurple text-white' : 'bg-discord-darker text-gray-200'}` }, msg.text),
                msg.sender === 'user' && React.createElement(User, { className: 'h-6 w-6 text-discord-gray flex-shrink-0' })
            )),
            isTyping && React.createElement('div', { className: 'flex justify-start' }, React.createElement('p', { className: 'text-sm text-discord-gray italic' }, 'KallKwanjut is typing...')),
            React.createElement('div', { ref: chatEndRef })
        ),
        // Form Input
        React.createElement('form', { onSubmit: handleSendMessage, className: 'p-4 border-t border-discord-darker flex items-center' },
            React.createElement('input', {
                type: 'text', value: userInput, onChange: e => setUserInput(e.target.value),
                placeholder: 'Tanya sesuatu pada KallKwanjut...',
                className: 'w-full bg-discord-darker text-white p-3 rounded-l-lg focus:outline-none'
            }),
            React.createElement('button', { type: 'submit', className: 'bg-discord-blurple text-white p-3 rounded-r-lg hover:bg-opacity-80' }, React.createElement(Send, null))
        )
    );
};


// --- HALAMAN BANTUAN UTAMA ---
export default function BantuanPage() {
    return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
        React.createElement(Head, null, React.createElement('title', null, 'Bantuan & CS - XyCloud')),
        React.createElement('div', { className: 'text-center mb-12' },
            React.createElement(LifeBuoy, { className: 'mx-auto h-12 w-12 text-discord-blurple mb-4' }),
            React.createElement('h1', { className: 'text-4xl font-extrabold' }, 'Pusat Bantuan'),
            React.createElement('p', { className: 'text-discord-gray mt-2 max-w-2xl mx-auto' }, 'Punya pertanyaan? Coba tanyakan pada bot kami atau hubungi admin langsung.')
        ),
        React.createElement('div', { className: 'max-w-3xl mx-auto' },
            React.createElement(Chatbot, null)
        )
    );
}