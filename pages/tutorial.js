import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { BookOpen, UserPlus, ShieldCheck, MessageSquare, Link as LinkIcon, Youtube } from 'lucide-react';

// Data untuk setiap langkah tutorial
const tutorialSteps = [
  {
    icon: UserPlus,
    title: "Langkah 1: Daftar & Login",
    description: "Buat akun baru menggunakan email Anda atau masuk jika sudah memiliki akun. Ini adalah langkah pertama untuk mengakses semua layanan kami."
  },
  {
    icon: ShieldCheck,
    title: "Langkah 2: Verifikasi Diri (Sewa Pertama)",
    description: "Untuk penyewaan PC pertama kali, Anda akan diminta untuk melakukan verifikasi. Cukup upload screenshot akun Discord, Steam, dan Cfx.re Anda. Proses ini hanya dilakukan satu kali."
  },
  {
    icon: MessageSquare,
    title: "Langkah 3: Pilih Admin & Konfirmasi",
    description: "Di halaman Sewa PC, pilih admin yang sedang online. Setelah itu, isi formulir singkat dan Anda akan diarahkan ke WhatsApp admin untuk melakukan konfirmasi pesanan dan pembayaran."
  },
  {
    icon: LinkIcon,
    title: "Langkah 4: Akses Cloud PC Anda",
    description: "Setelah pembayaran dikonfirmasi oleh admin, Anda akan menerima sebuah 'deeplink' khusus. Klik link tersebut untuk langsung meremote dan menggunakan Cloud PC Anda dari perangkat mana saja."
  },
  // --- Video Tutorial ---
  {
    icon: Youtube,
    title: "Video Tutorial: Main FiveM",
    description: "Panduan lengkap cara bermain FiveM di Cloud PC kami.",
    videoUrl: "Comming soon" // Ganti dengan link YouTube jika sudah ada
  },
  {
    icon: Youtube,
    title: "Video Tutorial: Buat Akun Discord",
    description: "Langkah-langkah mudah membuat akun Discord.",
    videoUrl: "https://www.youtube.com/embed/KAuhg-6kXhY" // Link embed
  },
  {
    icon: Youtube,
    title: "Video Tutorial: Buat Akun Steam",
    description: "Panduan membuat akun Steam untuk platform gaming.",
    videoUrl: "https://www.youtube.com/embed/4kPkifr2ZUI" // Link embed
  },
  {
    icon: Youtube,
    title: "Video Tutorial: Buat Akun Cfx.re",
    description: "Langkah-langkah membuat akun Cfx.re.",
    videoUrl: "Comming soon" // Ganti dengan link YouTube jika sudah ada
  },
  {
    icon: Youtube,
    title: "Video Tutorial: ON MIC di PC Deeplink",
    description: "Cara mengaktifkan mikrofon di Cloud PC melalui deeplink.",
    videoUrl: "https://www.youtube.com/embed/0PY7c_1FaoM" // Link embed
  },
  {
    icon: Youtube,
    title: "Video Tutorial: ON MIK ANODOR",
    description: "Panduan mengaktifkan mikrofon ANODOR.",
    videoUrl: "Comming soon" // Ganti dengan link YouTube jika sudah ada
  },
];

// Komponen untuk satu kartu langkah tutorial
const TutorialStepCard = ({ step, index }) => {
    const Icon = step.icon;
    const isVideo = step.videoUrl && step.videoUrl !== "Comming soon";
    const videoEmbedUrl = isVideo ? step.videoUrl.replace("watch?v=", "embed/") : null; // Ubah ke format embed

    return React.createElement(motion.div, {
        className: 'bg-black/20 border border-discord-darker p-6 rounded-lg flex flex-col',
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        transition: { delay: index * 0.2, duration: 0.5 }
    },
        React.createElement('div', { className: 'flex items-center mb-4' }, // Wrap icon and title
            React.createElement('div', { className: 'mr-4' },
                React.createElement(Icon, { className: 'h-10 w-10 text-discord-blurple' })
            ),
            React.createElement('h3', { className: 'text-xl font-bold' }, step.title),
        ),
        React.createElement('p', { className: 'text-discord-gray mb-4 flex-grow' }, step.description),
        
        isVideo ?
            React.createElement('div', { className: 'w-full aspect-video mt-auto' }, // Responsif untuk video
                React.createElement('iframe', {
                    width: "100%",
                    height: "100%",
                    src: videoEmbedUrl,
                    title: step.title,
                    frameBorder: "0",
                    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                    allowFullScreen: true,
                    className: 'rounded-lg'
                })
            ) :
            React.createElement('p', { className: 'text-discord-gray italic mt-auto' }, 
                step.videoUrl === "Comming soon" ? "Video akan segera tersedia." : ""
            )
    );
};


// Halaman Tutorial Utama
export default function TutorialPage() {
    return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
        React.createElement(Head, null, React.createElement('title', null, 'Tutorial - XyCloud')),
        React.createElement('div', { className: 'text-center mb-12' },
            React.createElement(BookOpen, { className: 'mx-auto h-12 w-12 text-discord-blurple mb-4' }),
            React.createElement('h1', { className: 'text-4xl font-extrabold' }, 'Panduan Penggunaan XyCloud'),
            React.createElement('p', { className: 'text-discord-gray mt-2 max-w-2xl mx-auto' }, 'Ikuti langkah-langkah mudah di bawah ini untuk memulai pengalaman sewa Cloud PC Anda.')
        ),
        React.createElement('div', {
            className: 'grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto' // Layout grid
        },
            tutorialSteps.map((step, index) => React.createElement(TutorialStepCard, { key: index, step: step, index: index }))
        )
    );
}