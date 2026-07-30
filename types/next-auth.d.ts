/* eslint-disable @typescript-eslint/no-empty-interface */
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id: string;
      username?: string | null;
      role?: number | string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: number | string;
  }
}

export {};
