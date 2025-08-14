import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { upsertUser } from '@/lib/sheets';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = (profile as any).email || token.email;
        token.name = (profile as any).name || token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email) session.user = { ...(session.user || {}), email: token.email as string, name: (token.name as string) || session.user?.name || undefined } as any;
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user?.email) {
        try { await upsertUser(user.email, user.name || undefined); } catch {}
      }
    },
  },
};
