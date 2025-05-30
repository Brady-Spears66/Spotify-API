import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Box, Container, Stack, Typography } from "@mui/material";

interface Track {
  name: string;
  artists: any[];
  albumImage: string;
}

const TopTracksPage = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("access_token");

    if (token) {
      axios
        .get("https://api.spotify.com/v1/me/top/tracks?limit=10", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const trackData = res.data.items.map((track: any) => ({
            name: track.name,
            artists: track.artists,
            albumImage: track.album.images[0]?.url || "",
          }));
          setTracks(trackData);
        })
        .catch((err) => console.error("Failed to fetch tracks", err));
    }
  }, [location.search]);

  return (
    <Box
      sx={{
        minHeight: "100%", // full viewport height
        minWidth: "100%", // full viewport width
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", // vertical centering
        alignItems: "center", // horizontal centering
      }}
    >
      <Typography variant="h1" gutterBottom>
        Your Top Tracks
      </Typography>
      <Stack spacing={3} alignItems="center">
        {tracks.map((track, index) => (
          <Stack
            key={index}
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{
              p: 2,
              borderRadius: 2,
              width: "100%",
              maxWidth: 600, // limits max width so it’s not too wide on large screens
            }}
          >
            <Box
              component="img"
              src={track.albumImage}
              alt={`${track.name} album cover`}
              sx={{
                width: "50%",
                height: "50%",
                borderRadius: 1,
                objectFit: "cover",
              }}
            />

            <Box sx={{ width: "50%" }}>
              <Typography variant="h6" textAlign="center">
                {track.name}
              </Typography>
              <Typography variant="body2" color="grey" textAlign="center">
                {track.artists.map((artist) => artist.name).join(", ")}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default TopTracksPage;
