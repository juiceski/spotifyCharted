"use client";

import { useEffect, useState } from "react";
import PackedCircleChart from "@/components/PackedCircleChart";

export default function GenreList({ session }) {
  const [genres, setGenres] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session) return;
    
    async function fetchData() {
      try {
        const res = await fetch("/api/liked-songs");
        if (!res.ok) throw new Error("Failed to fetch songs");
        
        const data = await res.json();

        const genreCounts = Object.entries(data).map(([genre, songs]) => ({
          name: genre,
          value: songs.length
        }));

        setGenres(genreCounts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  if (loading) return <p>Loading your liked songs...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!genres || genres.length === 0) return <p>No data found.</p>;

  return (
    <div className="mt-6 w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Your Liked Songs by Genre</h2>
      <PackedCircleChart data={genres} />
    </div>
  );
}
