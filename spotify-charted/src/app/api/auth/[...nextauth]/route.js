import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

export const authOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            authorization: "https://accounts.spotify.com/authorize?scope=user-library-read",
        }),
    ],
    debug: true, // REMOVE FOR PROD
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
                token.expiresAt = Date.now() + account.expires_at * 1000; // For millisecond comparison with Date.now()
                token.refreshToken = account.refresh_token;
            }
            // If the token has expired, refresh it 
            // Todo: additional retries if API unavailable
            if (Date.now() > token.expiresAt) {
                console.log('Refreshing token for user...');
                return await refreshAccessToken(token);
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.error = token.error; // Todo: Trigger UI alerts on specific errors for user, re-authenticate button if refresh failed
            return session;
        },
    },
};

async function refreshAccessToken(token) {
    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`, // Base64 encoding
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            }),
        }); // POST Request to Spotify API for a new access token via previously given refresh token, see https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens

        const refreshedTokens = await response.json();
        if (!response.ok) throw refreshedTokens;
        console.log(`New access token: ${refreshedTokens.access_token}`);

        return {
            ...token,
            accessToken: refreshedTokens.access_token, // New access token
            expiresAt: Date.now() + refreshedTokens.expires_in * 1000, // For millisecond comparison with Date.now()
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Use new refresh token if provided
        };
    } catch (error) {
        console.error("Error refreshing access token", error);
        return { ...token, error: "RefreshAccessTokenError" }; // Todo: Add error info
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };