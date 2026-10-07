import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { connectToDatabase } from "./lib/mongodb"
import User from "./models/User"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await connectToDatabase();
        
        await User.updateOne(
          { googleId: user.id },
          {
            $setOnInsert: {
              googleId: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              role: "brand",
              creatorStatus: "none",
              publicProfileEnabled: false,
              handle: null,
              createdAt: new Date()
            },
            $set: { updatedAt: new Date() }
          },
          { upsert: true }
        );
        return true;
      }
      return false;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        await connectToDatabase();
        const dbUser = await User.findOne({ googleId: user.id });
        if (dbUser) {
          token.role = dbUser.role;
          token.creatorStatus = dbUser.creatorStatus;
          token.dbId = dbUser._id.toString();
        }
      } else if (token.dbId) {
        await connectToDatabase();
        const dbUser = await User.findById(token.dbId);
        if (dbUser) {
          token.role = dbUser.role;
          token.creatorStatus = dbUser.creatorStatus;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.creatorStatus = token.creatorStatus as string;
        session.user.id = token.dbId as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || 'azyra_super_secret_key_2026',
});
