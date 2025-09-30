// pages/_app.js
import React from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NotificationPermission from '../components/NotificationPermission';

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.5, ease: 'easeInOut' } },
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  const bodyStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 1,
  };
  
  const contentWrapperStyle = { flex: '1 0 auto' };

  return React.createElement(AuthProvider, null,
    React.createElement('div', { style: bodyStyle, className: 'text-discord-light bg-animated-gradient' },
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
      React.createElement(Footer),
      React.createElement(NotificationPermission, null)
    )
  );
}

export default MyApp;