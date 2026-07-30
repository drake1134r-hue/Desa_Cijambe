import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { findOne } from "@/lib/db/index";
import { users } from "@/lib/db/schema";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        console.debug("Auth lookup", { collection: users.collectionName, username: credentials.username });

        let user;

        try {
          user = await findOne<Record<string, any>>(users.collectionName, { username: credentials.username });

          console.log("========== USER ==========");
          console.dir(user, { depth: null });

        } catch (err) {
          console.error("findOne ERROR");
          console.error(err);
          throw err;
        }

        if (!user) {
          console.debug("Auth: user not found", { username: credentials.username });
          return null;
        }

        // Support both hashed passwords (`password_hash`) and plaintext `password` saved in DB
        const stored = user.password_hash ?? user.password ?? null;
        if (!stored) {
          console.debug("Auth: missing password field for user", { username: credentials.username });
          return null;
        }

        let isValid = false;
        try {
          // if looks like a bcrypt hash, use compare, otherwise compare plaintext
          if (typeof stored === 'string' && stored.startsWith('$2')) {
            isValid = await compare(credentials.password, stored);
          } else {
            isValid = credentials.password === stored;
          }
        } catch (err) {
          console.error('Auth: password compare error', err);
          return null;
        }

        // Accept either `is_active` or `isActive` fields; default to false if explicitly false
        const activeFlag = user.is_active ?? user.isActive ?? false;
        console.debug("Auth: password check", { username: credentials.username, valid: !!isValid, is_active: !!activeFlag });
        if (!isValid || !activeFlag) {
          return null;
        }

        // Normalize role: prefer numeric role_id, otherwise map string role
        let roleValue: number | string | undefined = undefined;
        if (user.role_id != null) roleValue = user.role_id;
        else if (user.role != null) roleValue = user.role;

        return {
          id: (user.id ?? user._id ?? '').toString(),
          name: user.name,
          email: user.email ?? undefined,
          username: user.username,
          role: roleValue,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/cms-login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as typeof user & { role?: string | number; username?: string };
        token.role = typedUser.role;
        if (typedUser.username) {
          token.username = typedUser.username;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.role) {
        session.user = session.user ?? {};
        session.user.role = token.role;
      }
      if (token?.username) {
        session.user = session.user ?? {};
        session.user.username = token.username as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };