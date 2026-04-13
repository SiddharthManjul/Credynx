import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/server/prisma';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        };
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials provider already handled in authorize()
      if (account?.provider === 'credentials') return true;

      // OAuth providers (github, google) — upsert the user by email
      if (!user.email) return false;

      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      if (!existing) {
        const created = await prisma.user.create({
          data: {
            email: user.email,
            role: UserRole.DEVELOPER,
            isVerified: true,
            lastLoginAt: new Date(),
          },
        });
        (user as any).id = created.id;
        (user as any).role = created.role;
        (user as any).isVerified = created.isVerified;
      } else {
        await prisma.user.update({
          where: { id: existing.id },
          data: { lastLoginAt: new Date() },
        });
        (user as any).id = existing.id;
        (user as any).role = existing.role;
        (user as any).isVerified = existing.isVerified;
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      // On initial sign-in, copy identity onto the token
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.isVerified = (user as any).isVerified;
      }

      // On session refresh, re-fetch from DB so role/email stay current
      if (trigger === 'update' && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { email: true, role: true, isVerified: true },
        });
        if (fresh) {
          token.email = fresh.email;
          token.role = fresh.role;
          token.isVerified = fresh.isVerified;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isVerified = token.isVerified;
      }
      return session;
    },
  },
});
