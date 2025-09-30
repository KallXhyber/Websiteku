// public/firebase-messaging-sw.js

// Skrip ini di-host oleh Firebase dan akan di-cache oleh browser
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Inisialisasi Firebase dengan kunci dari environment variables
// Vercel akan otomatis mengganti ini saat proses build
const firebaseConfig = {
  apiKey: "%NEXT_PUBLIC_FIREBASE_API_KEY%",
  authDomain: "%NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN%",
  projectId: "%NEXT_PUBLIC_FIREBASE_PROJECT_ID%",
  storageBucket: "%NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET%",
  messagingSenderId: "%NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID%",
  appId: "%NEXT_PUBLIC_FIREBASE_APP_ID%",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Kosongkan bagian ini untuk sekarang
// Ini digunakan jika Anda ingin menampilkan notifikasi kustom saat diterima
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // Ganti dengan path logo Anda di folder public
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});