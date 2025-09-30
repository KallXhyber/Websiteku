// pages/review/[reviewId].js
'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../context/AuthContext';

// Komponen untuk Rating Bintang
const StarRating = ({ rating, onRatingChange }) => {
  const [hover, setHover] = useState(0);
  return React.createElement('div', { className: 'flex justify-center mb-6' },
    [...Array(5)].map((star, index) => {
      const ratingValue = index + 1;
      return React.createElement('label', { key: index },
        React.createElement('input', {
          type: 'radio',
          name: 'rating',
          value: ratingValue,
          onClick: () => onRatingChange(ratingValue),
          className: 'hidden'
        }),
        React.createElement(Star, {
          className: 'cursor-pointer transition-colors duration-200',
          color: ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9",
          fill: ratingValue <= (hover || rating) ? "#ffc107" : "none",
          size: 36,
          onMouseEnter: () => setHover(ratingValue),
          onMouseLeave: () => setHover(0)
        })
      );
    })
  );
};


// Komponen Halaman Ulasan Utama
export default function ReviewPage() {
  const router = useRouter();
  const { reviewId } = router.query;
  const { user, loading: authLoading } = useAuth();
  
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reviewId) return;

    const fetchReviewData = async () => {
      try {
        const reviewDocRef = doc(db, 'reviews', reviewId);
        const reviewDoc = await getDoc(reviewDocRef);

        if (!reviewDoc.exists()) {
          setError('Link ulasan tidak valid.');
          setLoading(false);
          return;
        }

        const data = reviewDoc.data();
        if (data.rating) {
          setIsSubmitted(true);
          setReviewData(data);
        } else {
          setReviewData(data);
          // Opsi: cek apakah user yang login sama dengan yang di review
          if (user && data.userId !== user.uid) {
             setError('Anda tidak memiliki izin untuk mengisi ulasan ini.');
          }
        }
      } catch (err) {
        console.error('Error fetching review data:', err);
        setError('Gagal memuat ulasan. Silakan coba lagi.');
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchReviewData();
    }
  }, [reviewId, authLoading, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Harap berikan rating bintang.');
      return;
    }

    try {
      const reviewDocRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewDocRef, {
        rating: rating,
        comment: comment,
        status: 'published' // Ganti status menjadi published
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Gagal mengirim ulasan. Silakan coba lagi.');
    }
  };

  const renderContent = () => {
    if (loading) {
      return React.createElement('p', null, 'Memuat formulir ulasan...');
    }
    
    if (error) {
      return React.createElement('div', { className: 'text-center text-red-400' },
        React.createElement(XCircle, { className: 'mx-auto h-12 w-12 mb-4' }),
        React.createElement('h2', { className: 'text-2xl font-bold' }, 'Terjadi Kesalahan'),
        React.createElement('p', null, error)
      );
    }

    if (isSubmitted) {
      return React.createElement('div', { className: 'text-center text-green-400' },
        React.createElement(CheckCircle, { className: 'mx-auto h-12 w-12 mb-4' }),
        React.createElement('h2', { className: 'text-2xl font-bold' }, 'Terima Kasih!'),
        React.createElement('p', null, 'Ulasan Anda berhasil dikirim dan akan segera ditampilkan.')
      );
    }

    return React.createElement('form', { onSubmit: handleSubmitReview, className: 'space-y-6' },
      React.createElement('div', { className: 'text-center' },
        React.createElement('h2', { className: 'text-xl font-semibold' }, 'Bagaimana pengalaman Anda dengan Cloud PC ini?'),
        React.createElement('p', { className: 'text-discord-gray text-sm' }, `Ulasan untuk PC ID: ${reviewData?.pcId || '...'}`)
      ),
      
      React.createElement(StarRating, { rating: rating, onRatingChange: setRating }),
      
      React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-discord-gray mb-1' }, 'Komentar (Opsional)'),
        React.createElement('textarea', { 
          value: comment, 
          onChange: (e) => setComment(e.target.value),
          placeholder: 'Ceritakan pengalaman Anda...', 
          rows: 4, 
          className: 'w-full bg-discord-darker p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-blurple'
        })
      ),

      error && React.createElement('p', { className: 'text-red-400 text-sm text-center' }, error),

      React.createElement('button', {
        type: 'submit',
        className: 'w-full bg-discord-blurple text-white font-bold py-3 rounded-full hover:bg-opacity-80'
      }, 'Kirim Ulasan')
    );
  };

  return React.createElement('div', { className: 'container mx-auto px-4 py-12 flex justify-center items-center h-full' },
    React.createElement(Head, null, React.createElement('title', null, 'Beri Ulasan - XyCloud')),
    React.createElement(motion.div, { 
      className: 'w-full max-w-lg bg-black/20 border border-discord-darker p-8 rounded-lg shadow-xl',
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    },
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement(Star, { className: 'mx-auto h-12 w-12 text-yellow-400 mb-4' }),
        React.createElement('h1', { className: 'text-3xl font-extrabold' }, 'Beri Ulasan'),
      ),
      renderContent()
    )
  );
}