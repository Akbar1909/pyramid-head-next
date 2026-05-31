import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

class AdminOnlyError extends CredentialsSignin {
  code = "admin_only";
}

function getServerApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const res = await fetch(`${getServerApiBaseUrl()}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        if (!res.ok) {
          return null;
        }

        const data = (await res.json()) as {
          accessToken: string;
          user: { id: string; email: string; role: string };
        };

        if (data.user.role !== "ADMIN") {
          throw new AdminOnlyError();
        }

        return {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          accessToken: data.accessToken,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken ?? "";
      session.user.id = token.sub ?? "";
      session.user.role = token.role ?? "";
      return session;
    },
  },
});
