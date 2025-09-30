// components/Footer.js
import React from 'react';
import Link from 'next/link';
import { Twitter, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  return React.createElement('footer', {
    className: 'bg-black/30 backdrop-blur-lg text-discord-gray border-t border-white/10 mt-16'
  },
    React.createElement('div', {
      className: 'container mx-auto px-6 py-8'
    },
      React.createElement('div', {
        className: 'grid md:grid-cols-3 gap-8'
      },
        React.createElement('div', {},
          React.createElement('h3', { className: 'text-white font-bold text-lg mb-2' }, 'XyCloud'),
          React.createElement('p', { className: 'text-sm' }, 'Penyedia layanan sewa Cloud PC terdepan untuk kebutuhan gaming dan produktivitas Anda.')
        ),
        React.createElement('div', {},
          React.createElement('h3', { className: 'text-white font-bold text-lg mb-2' }, 'Navigasi'),
          React.createElement('ul', { className: 'space-y-2 text-sm' },
            React.createElement('li', null, React.createElement(Link, { href: '/sewa', className: 'hover:text-white' }, 'Sewa PC')),
            React.createElement('li', null, React.createElement(Link, { href: '/bantuan', className: 'hover:text-white' }, 'Bantuan')),
            React.createElement('li', null, React.createElement(Link, { href: '/faq', className: 'hover:text-white' }, 'FAQ')),
            React.createElement('li', null, React.createElement(Link, { href: '/tutorial', className: 'hover:text-white' }, 'Tutorial'))
          )
        ),
        React.createElement('div', {},
          React.createElement('h3', { className: 'text-white font-bold text-lg mb-2' }, 'Hubungi Kami'),
           React.createElement('ul', { className: 'space-y-2 text-sm' },
             React.createElement('li', null, React.createElement('a', { href: '#', className: 'hover:text-white' }, 'Customer Service')),
             React.createElement('li', { className: 'flex space-x-4 pt-2' },
               React.createElement('a', { href: '#', className: 'hover:text-white' }, React.createElement(Twitter, { size: 20 })),
               React.createElement('a', { href: '#', className: 'hover:text-white' }, React.createElement(Instagram, { size: 20 })),
               React.createElement('a', { href: '#', className: 'hover:text-white' }, React.createElement(Facebook, { size: 20 }))
             )
           )
        )
      ),
      React.createElement('div', {
        className: 'mt-8 border-t border-discord-dark pt-6 text-center text-sm'
      },
        React.createElement('p', null, `© ${new Date().getFullYear()} XyCloud. All Rights Reserved.`)
      )
    )
  );
};

export default Footer;