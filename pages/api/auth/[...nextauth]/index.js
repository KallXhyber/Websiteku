// pages/api/auth/[...nextauth]/index.js
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../../utils/firebase';

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Ambil ID unik pengguna dari Discord
        const discordId = profile.id;
        
        // Cek apakah pengguna sudah terdaftar di Firestore berdasarkan Discord ID
        const userRef = doc(db, 'users', discordId);
        
        // Simpan data ke Firestore hanya jika pengguna belum ada
        await setDoc(userRef, {
          uid: discordId,
          email: profile.email || null, // Email bisa null jika pengguna tidak membagikannya
          displayName: profile.username || profile.global_name,
          photoURL: `https://cdn.discordapp.com/avatars/${discordId}/${profile.avatar}.png`,
          discordId: discordId,
          verificationStatus: 'belum terverifikasi',
          createdAt: new Date(),
          role: 'user', // Set role default
          points: 0, // Tambahkan ini
          level: 1,  // Tambahkan ini
        }, { merge: true }); // Opsi merge: true agar tidak menimpa data yang sudah ada

        console.log('User signed in with Discord:', profile);
        return true;
      } catch (error) {
        console.error("Gagal menyimpan data pengguna Discord ke Firestore:", error);
        return false;
      }
    },
    async session({ session, user }) {
        // Tambahkan data pengguna dari Firestore ke session
        session.user.uid = user.id;
        // Kamu juga bisa menambahkan data lain yang kamu simpan di Firestore, misal role
        // const userDoc = await getDoc(doc(db, 'users', user.id));
        // session.user.role = userDoc.data().role;
        return session;
    }
  },
};

export default NextAuth(authOptions);