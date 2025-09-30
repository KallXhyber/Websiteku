// pages/tentang.js
import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Target, Users, Mail } from 'lucide-react';

// Data untuk tim admin (Anda bisa ganti foto dan deskripsi)
const teamData = [
  {
    name: "Kall",
    role: "Founder & Night Shift Admin",
    avatar: "https://api.dicebear.com/9.x/micah/svg?seed=Kall",
    description: "Bertanggung jawab atas operasional malam hari dan pengembangan teknis XyCloud."
  },
  {
    name: "Dwingi",
    role: "Day Shift Admin",
    avatar: "https://api.dicebear.com/9.x/micah/svg?seed=Dwingi",
    description: "Siap melayani semua kebutuhan sewa Anda dari pagi hingga sore hari."
  },
  {
    name: "Dlii",
    role: "Afternoon Shift Admin",
    avatar: "https://api.dicebear.com/9.x/micah/svg?seed=Dlii",
    description: "Menemani sesi gaming sore hingga tengah malam Anda dengan pelayanan terbaik."
  }
];

const TeamCard = ({ member, index }) => {
    return React.createElement(motion.div, {
        className: 'bg-black/20 border border-discord-darker p-6 rounded-lg text-center',
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: index * 0.2, duration: 0.5 }
    },
        React.createElement('img', { src: member.avatar, alt: member.name, className: 'w-24 h-24 rounded-full mx-auto mb-4 bg-discord-dark' }),
        React.createElement('h3', { className: 'text-xl font-bold' }, member.name),
        React.createElement('p', { className: 'text-discord-blurple text-sm font-semibold mb-2' }, member.role),
        React.createElement('p', { className: 'text-discord-gray text-sm' }, member.description)
    );
};

export default function TentangPage() {
    return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
        React.createElement(Head, null, React.createElement('title', null, 'Tentang Kami - XyCloud')),
        React.createElement('div', { className: 'text-center mb-16' },
            React.createElement(Target, { className: 'mx-auto h-12 w-12 text-discord-blurple mb-4' }),
            React.createElement('h1', { className: 'text-4xl font-extrabold' }, 'Tentang XyCloud'),
            React.createElement('p', { className: 'text-discord-gray mt-4 max-w-3xl mx-auto' }, 
                "XyCloud didirikan dengan satu misi sederhana: menyediakan akses mudah ke Cloud PC berperforma tinggi bagi para gamer dan profesional di seluruh Indonesia. Kami percaya bahwa setiap orang berhak mendapatkan pengalaman komputasi terbaik tanpa harus terbebani oleh biaya perangkat keras yang mahal."
            )
        ),
        
        React.createElement('div', { className: 'mb-16' },
            React.createElement('h2', { className: 'text-3xl font-bold text-center mb-8 flex items-center justify-center' }, 
                React.createElement(Users, { className: 'mr-3' }), 'Tim Kami'
            ),
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto' },
                teamData.map((member, index) => React.createElement(TeamCard, { key: member.name, member: member, index: index }))
            )
        ),

        React.createElement('div', { className: 'text-center max-w-3xl mx-auto bg-black/20 border border-discord-darker p-8 rounded-lg' },
             React.createElement('h2', { className: 'text-3xl font-bold mb-4 flex items-center justify-center' }, 
                React.createElement(Mail, { className: 'mr-3' }), 'Hubungi Kami'
            ),
            React.createElement('p', { className: 'text-discord-gray' }, 'Untuk pertanyaan bisnis, kemitraan, atau pertanyaan umum lainnya, Anda bisa menghubungi kami melalui email:'),
            React.createElement('a', { href: 'mailto:kontak@xycloud.com', className: 'text-discord-blurple text-lg font-semibold mt-2 inline-block hover:underline' }, 'kontak@xycloud.com')
        )
    );
}