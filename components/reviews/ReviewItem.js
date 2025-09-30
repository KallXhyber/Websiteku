// components/reviews/ReviewItem.js
import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const StarRatingDisplay = ({ rating }) => {
    return React.createElement('div', { className: 'flex' },
        [...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return React.createElement(Star, {
                key: index,
                size: 16,
                className: `${ratingValue <= rating ? 'text-yellow-400' : 'text-gray-600'} transition-colors duration-200`
            });
        })
    );
};

const ReviewItem = ({ review }) => {
    return React.createElement(motion.div, {
        className: 'bg-discord-darker p-4 rounded-lg shadow-sm',
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 }
    },
        React.createElement('div', { className: 'flex items-center mb-2' },
            React.createElement('img', {
                src: review.userAvatar || 'https://api.dicebear.com/9.x/micah/svg?seed=default',
                alt: 'User Avatar',
                className: 'w-8 h-8 rounded-full mr-3'
            }),
            React.createElement('div', null,
                React.createElement('p', { className: 'font-semibold' }, review.userName || review.userEmail),
                React.createElement(StarRatingDisplay, { rating: review.rating })
            )
        ),
        React.createElement('p', { className: 'text-sm text-discord-gray' }, review.comment)
    );
};

export default ReviewItem;