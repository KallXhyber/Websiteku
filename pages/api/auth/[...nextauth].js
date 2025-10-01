import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import CredentialsProvider from "next-auth/providers/credentials"
import { FirebaseAdapter } from "@next-auth/firebase-adapter"
import { db, auth } from "../../../utils/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from 'firebase/firestore'

export default NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            if (userCredential.user) {
              return userCredential.user;
            }
            return null;
          } catch (error) {
            return null;
          }
        }
    })
  ],
  adapter: FirebaseAdapter(db),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
        const userDocRef = doc(db, 'users', token.sub);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          session.user.role = userData.role;
          session.user.verificationStatus = userData.verificationStatus;
          session.user.saldoWaktu = userData.saldoWaktu;
          session.user.points = userData.points;
          session.user.level = userData.level;
          session.user.name = userData.displayName;
          session.user.image = userData.photoURL;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  }
})
