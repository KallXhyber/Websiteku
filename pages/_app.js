// pages/_app.js
import React from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.5, ease: 'easeInOut' } },
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  const [background] = React.useState('https://unsplash.com/id/foto/latar-belakang-abstrak-hitam-dan-kuning-dengan-kotak-dan-persegi-panjang-QPCMXLUQWnA');

  const bodyStyle = {
    backgroundImage: background ? `url(${background})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative', // Dibutuhkan untuk overlay
    zIndex: 1, // Dibutuhkan untuk overlay
  };
  
  const contentWrapperStyle = { flex: '1 0 auto' };

  return React.createElement(AuthProvider, null,
    // Tambahkan class 'bg-overlay' di sini
    React.createElement('div', { style: bodyStyle, className: 'bg-discord-darker text-discord-light bg-overlay' },
      React.createElement(Header),
      React.createElement('div', { style: contentWrapperStyle },
        React.createElement(AnimatePresence, { mode: 'wait' },
          React.createElement(motion.div, {
            key: router.route,
            variants: pageVariants,
            initial: "initial",
            animate: "animate",
            exit: "exit"
          },
            React.createElement(Component, { ...pageProps })
          )
        )
      ),
      React.createElement(Footer)
    )
  );
}

export default MyApp;