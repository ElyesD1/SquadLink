import NextAuth from 'next-auth';
import type { Session, DefaultSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { API_URL } from '@/lib/constants';

interface GoogleProfile {
  given_name?: string;
  family_name?: string;
}

interface ExtendedUser {
  id: string;
  email?: string | null;
  name?: string | null;
  accessToken?: string;
}

interface ExtendedSession extends Session {
  accessToken?: string;
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data = await res.json();

          if (res.ok && data.access_token) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: `${data.user.firstName} ${data.user.lastName}`,
              accessToken: data.access_token,
            };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists or create new user
          const googleProfile = profile as GoogleProfile;
          const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              firstName: googleProfile?.given_name || user.name?.split(' ')[0] || '',
              lastName: googleProfile?.family_name || user.name?.split(' ').slice(1).join(' ') || '',
              googleId: user.id,
            }),
          });
          
          if (res.ok) {
            return true;
          }
        } catch (error) {
          console.error('Google OAuth error:', error);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        // Store the access token and user ID in the JWT token
        token.accessToken = (user as ExtendedUser).accessToken;
        token.userId = (user as ExtendedUser).id;
        token.email = (user as ExtendedUser).email;
      }
      return token;
    },
    async session({ session, token }) {
      // Add access token and user ID to the session
      const extendedSession = session as ExtendedSession;
      extendedSession.accessToken = token.accessToken as string;
      if (extendedSession.user) {
        extendedSession.user.id = token.userId as string;
        extendedSession.user.email = token.email as string;
      }
      return extendedSession;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
