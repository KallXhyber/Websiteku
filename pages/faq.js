// pages/faq.js
import React from 'react'; // <-- Koma sudah dihapus
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';

// Data FAQ (Anda bisa ganti pertanyaan dan jawabannya di sini)
const faqData = [
  {
    question: "Bagaimana cara menyewa Cloud PC?",
    answer: "Pertama, Anda harus mendaftar dan login. Kemudian, masuk ke halaman Sewa PC, pilih admin yang sedang online, dan ikuti proses verifikasi (jika ini sewa pertama Anda). Setelah itu, Anda akan diarahkan ke WhatsApp admin untuk konfirmasi pembayaran."
  },
  {
    question: "Apa saja syarat untuk verifikasi?",
    answer: "Untuk sewa pertama kali, Anda perlu meng-upload screenshot dari akun Discord, Steam, dan Cfx.re Anda. Ini hanya perlu dilakukan satu kali untuk memastikan keamanan dan validitas pengguna."
  },
  {
    question: "Bagaimana cara saya mengakses Cloud PC setelah membayar?",
    answer: "Setelah pembayaran Anda dikonfirmasi oleh admin via WhatsApp, admin akan memberikan Anda sebuah 'deeplink' khusus. Anda bisa mengakses Cloud PC melalui link tersebut dari perangkat apa saja, baik HP maupun laptop."
  },
  {
    question: "Apakah akun game yang dijual aman?",
    answer: "Tentu saja. Semua akun yang dijual di marketplace kami berasal langsung dari admin terpercaya kami. Kami memastikan semua akun aman dan sesuai dengan deskripsi yang diberikan."
  },
  {
    question: "Bagaimana jika admin yang saya pilih sedang offline?",
    answer: "Anda hanya bisa menyewa dari admin yang berstatus 'Online'. Setiap admin memiliki jam operasionalnya masing-masing. Silakan periksa kembali halaman Sewa PC untuk melihat admin mana yang sedang bertugas."
  }
];

// Komponen untuk satu item FAQ (Accordion)
const FaqItem = ({ item }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return React.createElement('div', { className: 'border-b border-discord-darker' },
        React.createElement('button', {
            onClick: () => setIsOpen(!isOpen),
            className: 'w-full flex justify-between items-center text-left py-4 px-2'
        },
            React.createElement('h3', { className: 'text-lg font-semibold' }, item.question),
            React.createElement(motion.div, {
                animate: { rotate: isOpen ? 180 : 0 }
            }, React.createElement(ChevronDown, null))
        ),
        React.createElement(AnimatePresence, null,
            isOpen && React.createElement(motion.div, {
                initial: { height: 0, opacity: 0 },
                animate: { height: 'auto', opacity: 1 },
                exit: { height: 0, opacity: 0 },
                transition: { duration: 0.3, ease: 'easeInOut' },
                className: 'overflow-hidden'
            },
                React.createElement('p', { className: 'pb-4 px-2 text-discord-gray' }, item.answer)
            )
        )
    );
};


// Halaman FAQ Utama
export default function FaqPage() {
    return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
        React.createElement(Head, null, React.createElement('title', null, 'FAQ - XyCloud')),
        React.createElement('div', { className: 'text-center mb-12' },
            React.createElement(HelpCircle, { className: 'mx-auto h-12 w-12 text-discord-blurple mb-4' }),
            React.createElement('h1', { className: 'text-4xl font-extrabold' }, 'Frequently Asked Questions (FAQ)'),
            React.createElement('p', { className: 'text-discord-gray mt-2 max-w-2xl mx-auto' }, 'Temukan jawaban untuk pertanyaan paling umum mengenai layanan kami di sini.')
        ),
        React.createElement(motion.div, {
            className: 'max-w-3xl mx-auto bg-black/20 border border-discord-darker rounded-lg shadow-lg',
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
        },
            faqData.map((item, index) => React.createElement(FaqItem, { key: index, item: item }))
        )
    );
}