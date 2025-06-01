"use client";

import { useSession } from "next-auth/react";
import GenreList from "@/components/GenreList";

export default function Dashboard() {
    const { data: session, status } = useSession();

    if (status === "loading") return <p>Loading...</p>;
    if (!session) return <p>Please <a href="/api/auth/signin">sign in</a> to continue.</p>;

    // Returning sections as needed...
    return (
        <div className="dashboard-container">
            <h1 className="text-3x1 font-bold mb-6">Dashboard</h1>

            <section className="genre-list-section">
                <h2 className="text-xl font-semibold">Your Genre Breakdown</h2>
                <GenreList session={session}/>
            </section>

        </div>
    );
}
