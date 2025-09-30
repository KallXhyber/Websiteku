// components/reviews/ReviewList.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReviewItem from './ReviewItem';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const ReviewList = ({ pcId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!pcId) return;
        
        const q = query(collection(db, 'reviews'), where('pcId', '==', pcId), where('status', '==', 'published'));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const fetchedReviews = await Promise.all(snapshot.docs.map(async docSnapshot => {
                const reviewData = docSnapshot.data();
                const userDoc = await getDoc(doc(db, 'users', reviewData.userId));
                const userData = userDoc.data();
                return {
                    id: docSnapshot.id,
                    ...reviewData,
                    userName: userData.displayName,
                    userAvatar: userData.photoURL
                };
            }));
            setReviews(fetchedReviews);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [pcId]);

    const averageRating = reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 0;

    if (loading) {
        return React.createElement('p', { className: 'text-center text-discord-gray' }, 'Memuat ulasan...');
    }

    return React.createElement('div', { className: 'mt-10' },
        React.createElement('h2', { className: 'text-2xl font-bold mb-4 flex items-center' },
            React.createElement(Star, { className: 'text-yellow-400 mr-2' }),
            'Ulasan Pengguna'
        ),
        reviews.length > 0 ?
            React.createElement(React.Fragment, null,
                React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
                    React.createElement('p', { className: 'text-4xl font-extrabold text-yellow-400' }, averageRating),
                    React.createElement('p', { className: 'text-sm text-discord-gray' }, `dari ${reviews.length} ulasan`)
                ),
                React.createElement('div', { className: 'space-y-4' },
                    reviews.map(review => React.createElement(ReviewItem, { key: review.id, review: review }))
                )
            ) :
            React.createElement('p', { className: 'text-center text-discord-gray p-4 bg-black/20 rounded-lg' }, 'Belum ada ulasan untuk PC ini.')
    );
};

export default ReviewList;