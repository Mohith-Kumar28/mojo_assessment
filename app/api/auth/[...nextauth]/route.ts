import NextAuth, { Session, TokenSet } from "next-auth";
import { Account, User as AuthUser } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import User from "@/models/User";
import connect from "@/utils/db";

export const authOptions: any = {
  // Configure one or more authentication providers
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope:
            "read_insights,pages_show_list,pages_read_engagement,pages_read_user_content,pages_manage_engagement",
          redirect_uri:
            "https://3nmnjo2ttz.loclx.io/api/auth/callback/facebook",
        },
      },
    }),
  ],
  callbacks: {
    authorized({ request, auth }: { request: any; auth: any }) {
      return !!auth;
    },
    async jwt({
      token,
      user,
      account,
    }: {
      token: TokenSet;
      user: AuthUser;
      account: Account;
    }) {
      console.log("first time ", token);
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          access_token: account.access_token,
          issued_at: Date.now(),
          expires_at: Date.now() + Number(account.expires_in) * 1000, // 3600 seconds
          refresh_token: account.refresh_token,
        };
      } else if (Date.now() < Number(token.expires_at)) {
        return token;
      } else {
        try {
          console.log("initial token", token);
          return {
            ...token, // Keep the previous token properties
            access_token: token.access_token,
            expires_at: Date.now() + Number(token.expires_in) * 1000,
            // Fall back to old refresh token, but note that
            // many providers may only allow using a refresh token once.
            refresh_token: token.refresh_token ?? token.refresh_token,
          }; // updated inside our session-token cookie
        } catch (error) {
          // The error property will be used client-side to handle the refresh token error
          return { ...token, error: "RefreshAccessTokenError" as const };
        }
      }
    },
    async session({
      session,
      token,
      user,
    }: {
      session: Session;
      token: TokenSet;
      user: AuthUser;
    }) {
      console.log("Incoming user info: ", session);
      // console.log("Incoming token info: ", token);
      // This will be accessible in the client side using useSession hook
      // So becareful what you return here. Don't return sensitive data.
      // The auth() function should return jwt response but instead it returns
      // the session object. This is a bug in next-auth.
      // Follow this bug https://github.com/nextauthjs/next-auth/issues/9329
      return {
        ...session,
        accessToken: String(token.access_token),
        refreshToken: String(token.refresh_token),
        accessTokenIssuedAt: Number(token.issued_at),
        accessTokenExpiresAt: Number(token.expires_at),
      } satisfies EnrichedSession;
    },
  },
};

export interface EnrichedSession extends Session {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  accessTokenIssuedAt: number;
}

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
