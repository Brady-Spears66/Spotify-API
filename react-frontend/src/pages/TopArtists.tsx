import { useEffect, useState } from "react";
import { Box, Stack, Typography, CircularProgress } from "@mui/material";

interface Artist {
  name: string;
  genres: string[];
  image: string;
}

const TopArtistsPage = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("spotify_access_token");
    if (!token) {
      setError("Missing access token.");
      setLoading(false);
      return;
    }

    fetch("http://127.0.0.1:5000/top-artists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArtists(data);
        } else {
          setError("Unexpected response from server.");
          console.error("Server response:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to load top artists.");
        setLoading(false);
      });
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 4,
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h2" gutterBottom textAlign="center">
        Your Top Artists
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error" variant="body1" textAlign="center">
          {error}
        </Typography>
      ) : artists.length === 0 ? (
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No top artists available.
        </Typography>
      ) : (
        <Stack spacing={3} alignItems="center" width="100%" maxWidth={800}>
          {artists.map((artist, index) => (
            <Stack
              key={index}
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                width: "100%",
                p: 2,
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ width: 30, textAlign: "center", userSelect: "none" }}
              >
                {index + 1}
              </Typography>
              <Box
                component="img"
                src={artist.image}
                alt={artist.name}
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 2,
                  objectFit: "cover",
                }}
              />
              <Box flex={1}>
                <Typography variant="h6">{artist.name}</Typography>
                <Typography variant="body2">
                  {artist.genres.length > 0
                    ? artist.genres.join(", ")
                    : "No genres available"}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default TopArtistsPage;
