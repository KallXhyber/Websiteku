// pages/api/sendNotification.js
import admin from 'firebase-admin';

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

  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ message: 'Missing required fields: token, title, body' });
  }

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
    webpush: {
        fcm_options: {
            link: 'https://xycloud-769.vercel.app/profile' // Arahkan ke halaman profil saat notif diklik
        }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ message: 'Successfully sent message', response });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
}