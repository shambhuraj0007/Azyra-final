import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      creatorStatus: string;
      isProfileSetup: boolean;
      handle?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string;
    creatorStatus?: string;
    isProfileSetup?: boolean;
    handle?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dbId: string;
    role: string;
    creatorStatus: string;
    isProfileSetup: boolean;
    handle?: string;
  }
}
