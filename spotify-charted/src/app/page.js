"use client";

import { signIn, signOut, useSession, SessionProvider } from "next-auth/react";
import GenreList from "@/components/GenreList";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading session...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Spotify Genre Breakdown</h1>

      {!session ? (
        <button onClick={() => signIn("spotify")} className="bg-green-500 px-4 py-2 rounded">
          Sign in with Spotify
        </button>
      ) : (
        <>
          <button onClick={() => signOut()} className="bg-red-500 px-4 py-2 rounded mb-4">
            Sign Out
          </button>
          <GenreList session={session} />
        </>
      )}
    </div>
  );
}
