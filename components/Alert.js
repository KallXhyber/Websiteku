// components/Alert.js
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

// Objek untuk menyimpan konfigurasi setiap jenis notifikasi
const alertConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-100 dark:bg-green-900',
    borderColor: 'border-green-500 dark:border-green-700',
    textColor: 'text-green-900 dark:text-green-100',
    iconColor: 'text-green-600',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    borderColor: 'border-blue-500 dark:border-blue-700',
    textColor: 'text-blue-900 dark:text-blue-100',
    iconColor: 'text-blue-600',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    borderColor: 'border-yellow-500 dark:border-yellow-700',
    textColor: 'text-yellow-900 dark:text-yellow-100',
    iconColor: 'text-yellow-600',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-100 dark:bg-red-900',
    borderColor: 'border-red-500 dark:border-red-700',
    textColor: 'text-red-900 dark:text-red-100',
    iconColor: 'text-red-600',
  },
};

const Alert = ({ type = 'info', message, onClose }) => {
  const config = alertConfig[type] || alertConfig.info;
  const IconComponent = config.icon;

  return React.createElement(motion.div, {
    role: 'alert',
    className: `p-3 rounded-lg flex items-center transition duration-300 ease-in-out border-l-4 relative ${config.bgColor} ${config.borderColor} ${config.textColor}`,
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { duration: 0.3 }
  },
    React.createElement(IconComponent, { className: `h-5 w-5 flex-shrink-0 mr-3 ${config.iconColor}` }),
    React.createElement('p', { className: 'text-sm font-semibold' }, message),
    onClose && React.createElement('button', {
        onClick: onClose,
        className: 'absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-white'
    }, React.createElement(X, {className: 'h-4 w-4'}))
  );
};

export default Alert;