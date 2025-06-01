import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";

export const revalidate = 1800; // Cache API response for 30 mins, todo: Figure out caching for users

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const accessToken = session.accessToken;
    const headers = { Authorization: `Bearer ${accessToken}` };
    let allSongs = [];
    let next = "https://api.spotify.com/v1/me/tracks?limit=50"; // Start with the first page

    try {
        // 1. Fetch all liked songs by handling pagination
        while (next) {
            const likedTracks = await axios.get(next, { headers });
            allSongs = allSongs.concat(likedTracks.data.items);
            next = likedTracks.data.next; // Update 'next' to the next page URL
        }
    
        // 2. Extract Artist IDs (ensure uniqueness)
        const artistIds = [...new Set(allSongs.map(song => song.track.artists[0].id))]; // Counting only first artist as the "main" artist
    
        // 3. Fetch Artist Details
        const artists = await fetchArtistsInParallel(artistIds, headers);
    
        // 4. Map Tracks to Genres
        const genreMap = {};
        allSongs.forEach(({ track }) => {
            const artist = artists.find(a => a.id === track.artists[0].id);
            const genre = artist?.genres[0] || "Unknown"; // Use first genre or default to 'Unknown'
        
            // Group tracks by genre
            if (!genreMap[genre]) {
                genreMap[genre] = [];
            }
            genreMap[genre].push({ name: track.name, artist: track.artists[0].name });
        });
    
        // 5. Return the data grouped by genre
        return new Response(JSON.stringify(genreMap), { status: 200 });
    } catch (error) {
        console.error("Error fetching liked songs or artist data:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
    }
}

async function fetchArtistsInParallel(artistIds, headers) {
    // Split artist IDs into batches of 50 (Spotify's limit)
    const batches = [];
    for (let i = 0; i < artistIds.length; i += 50) {
        batches.push(artistIds.slice(i, i + 50));
    }

    try {
        // Fetch all batches in parallel using Promise.all()
        const responses = await Promise.all(
            batches.map(batch =>
                axios.get(`https://api.spotify.com/v1/artists?ids=${batch.join(",")}`, { headers })
            )
        );

        // Extract artist data from all responses
        return responses.flatMap(response => response.data.artists);
    } catch (error) {
        console.error("Error fetching artists:", error.response?.data || error.message);
        return []; // Return empty array on failure to prevent breaking
    }
}