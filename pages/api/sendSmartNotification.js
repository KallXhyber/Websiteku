// pages/api/sendSmartNotification.js
import admin from 'firebase-admin';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

// Inisialisasi Firebase Admin SDK
try {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Firebase Admin Initialization Error', error.stack);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { pcId } = req.body;

  if (!pcId) {
    return res.status(400).json({ message: 'Missing required field: pcId' });
  }

  try {
    // 1. Cari semua pengguna di waiting_list yang menunggu pcId ini
    const waitingListQuery = query(collection(db, 'waiting_list'), where('pcId', '==', pcId));
    const waitingListSnapshot = await getDocs(waitingListQuery);
    
    if (waitingListSnapshot.empty) {
      return res.status(200).json({ message: 'Tidak ada pengguna di daftar tunggu.', recipientCount: 0 });
    }

    const tokensToNotify = [];
    const deletePromises = [];
    
    // 2. Kumpulkan FCM token dari setiap pengguna
    for (const waitingUserDoc of waitingListSnapshot.docs) {
      const userId = waitingUserDoc.data().userId;
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists() && userDoc.data().fcmToken) {
        tokensToNotify.push(userDoc.data().fcmToken);
      }
      
      // Siapkan janji untuk menghapus entri dari waiting_list
      deletePromises.push(deleteDoc(waitingUserDoc.ref));
    }
    
    const recipientCount = tokensToNotify.length;

    if (recipientCount > 0) {
      const message = {
        notification: {
          title: 'PC Sudah Siap! 🎉',
          body: `PC ${pcId} yang kamu tunggu kini sudah tersedia. Cepat disewa!`
        },
        tokens: tokensToNotify,
        webpush: {
            fcm_options: {
                link: `${process.env.NEXTAUTH_URL}/sewa` // Arahkan ke halaman sewa
            }
        }
      };
      
      const response = await admin.messaging().sendEachForMulticast(message);
      
      // Hapus entri dari waiting_list setelah notifikasi terkirim
      await Promise.all(deletePromises);
      
      res.status(200).json({ message: 'Notifikasi berhasil dikirim.', recipientCount: recipientCount, firebaseResponse: response });
    } else {
      res.status(200).json({ message: 'Tidak ada token notifikasi yang valid.', recipientCount: 0 });
    }

  } catch (error) {
    console.error('Error sending smart notification:', error);
    res.status(500).json({ error: 'Error sending smart notification' });
  }
}