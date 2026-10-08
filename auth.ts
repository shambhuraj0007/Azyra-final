import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./lib/mongodb";
import User from "./models/User";
import { cookies } from "next/headers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        await connectToDatabase();
        const normalizedEmail = (credentials.email as string).toLowerCase().trim();

        // Retrieve user including password fields
        const user = await User.findOne({ email: normalizedEmail }).select("+password +passwordHash +passwordSalt");

        if (!user) {
          throw new Error("No account found with this email address.");
        }

        let isValid = false;
        if (user.password) {
          isValid = await bcrypt.compare(credentials.password as string, user.password);
        } else if (user.passwordHash && user.passwordSalt) {
          const { verifyPassword } = await import("./lib/auth");
          isValid = verifyPassword(credentials.password as string, user.passwordHash, user.passwordSalt);
        }

        if (!isValid) {
          throw new Error("Invalid password.");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || "",
          image: user.image || "",
          role: user.role || "creator",
          isProfileSetup: Boolean(user.isProfileSetup),
          creatorStatus: user.creatorStatus || "none",
          handle: user.handle || "",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'google') {
          await connectToDatabase();

          let desiredRole: 'creator' | 'brand' = 'creator';
          try {
            const cookieStore = await cookies();
            const roleCookie = cookieStore.get('auth_role')?.value;
            if (roleCookie === 'brand' || roleCookie === 'creator') {
              desiredRole = roleCookie;
            }
          } catch {
            // ignore if cookies are inaccessible in this context
          }

          const normalizedEmail = user.email?.toLowerCase();
          const googleId = account.providerAccountId || user.id;

          let dbUser = await User.findOne({
            $or: [
              { googleId: googleId },
              ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
            ],
          });

          if (!dbUser) {
            await User.create({
              googleId: googleId,
              email: normalizedEmail,
              name: user.name || '',
              image: user.image || '',
              role: desiredRole,
              isProfileSetup: false,
              creatorStatus: 'none',
              wallet_balance: 0,
              total_earned: 0,
              total_views_generated: 0,
              joinedCampaignIds: [],
            });
          } else {
            const updateData: any = { updatedAt: new Date() };
            if (!dbUser.googleId && googleId) {
              updateData.googleId = googleId;
            }
            if (!dbUser.image && user.image) {
              updateData.image = user.image;
            }
            if (!dbUser.name && user.name) {
              updateData.name = user.name;
            }
            await User.updateOne({ _id: dbUser._id }, { $set: updateData });
          }
          return true;
        }

        if (account?.provider === 'credentials') {
          return true;
        }

        return false;
      } catch (error) {
        console.error("NextAuth signIn Error:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      await connectToDatabase();
      const mongoose = require('mongoose');

      if (user) {
        if (account?.provider === 'google') {
          const dbUser = await User.findOne({ email: user.email?.toLowerCase() });
          if (dbUser) {
            token.dbId = dbUser._id.toString();
            token.role = dbUser.role;
            token.isProfileSetup = Boolean(dbUser.isProfileSetup);
            token.creatorStatus = dbUser.creatorStatus;
            token.handle = dbUser.handle || "";
          }
        } else {
          token.dbId = (user as any).id || (user as any)._id?.toString() || token.sub;
          token.role = (user as any).role || "creator";
          token.isProfileSetup = Boolean((user as any).isProfileSetup);
          token.creatorStatus = (user as any).creatorStatus || "none";
          token.handle = (user as any).handle || "";
        }
      } else if (token.dbId || token.email) {
        const isValidId = typeof token.dbId === 'string' && /^[0-9a-fA-F]{24}$/.test(token.dbId);
        const dbUser = isValidId
          ? await User.findById(token.dbId)
          : await User.findOne({ email: token.email?.toLowerCase() });

        if (dbUser) {
          token.dbId = dbUser._id.toString();
          token.role = dbUser.role;
          token.creatorStatus = dbUser.creatorStatus;
          token.isProfileSetup = Boolean(dbUser.isProfileSetup);
          token.handle = dbUser.handle || "";
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.creatorStatus = token.creatorStatus as string;
        session.user.isProfileSetup = Boolean(token.isProfileSetup);
        session.user.handle = (token.handle as string) || "";
        session.user.id = (token.dbId as string) || token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || 'azyra_super_secret_key_2026',
});
