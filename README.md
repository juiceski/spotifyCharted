# spotifyCharted
making some charts with spotify api data

Update: Found out the Spotify API is missing genres for popular artists (ex. Gorillaz, LIGHTs), skewing charts heavily towards "Unknown" since they cannot be categorized.
Seems to be broken since beginning of 2025 as per this forum post: https://community.spotify.com/t5/Spotify-for-Developers/Genres-from-artists-have-been-removed/td-p/6659559
Additional restrictions seem to be in place on the API as per this forum post: https://community.spotify.com/t5/Spotify-for-Developers/Updating-the-Criteria-for-Web-API-Extended-Access/td-p/6920661

Will be continuing the project if missing genre data ever gets fixed. I was mostly interested in breaking down user's liked songs by genre for a holistic view, and then charting the genre breakdown over time to see historical change.


Example of the genre breakdown
![image](https://github.com/user-attachments/assets/bd4077c3-a361-4906-ace0-742fb7a87ee5)
