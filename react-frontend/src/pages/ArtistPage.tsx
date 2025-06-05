import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Card,
  Grid,
  Avatar,
  Box,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import { formatDuration, type Artist } from "../types";
import { ExplicitSharp } from "@mui/icons-material";

export const ArtistPage = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      const token = localStorage.getItem("spotify_access_token");
      if (!token) {
        setError("No Spotify access token found.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:5000/artist/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch artist.");
        }

        const data = await res.json();
        setArtist(data);
      } catch (err: unknown) {
        console.error("Artist fetch error:", err);
        //@ts-ignore
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setError(null);
    fetchArtist();
  }, [id]);

  console.log("Artist data:", artist);

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress sx={{ color: "#1db954" }} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Typography color="error" variant="body1" textAlign="center" mt={4}>
        {error}
      </Typography>
    );
  }

  // No artist data
  if (!artist) {
    return (
      <Typography variant="body1" textAlign="center" mt={4}>
        Artist not found.
      </Typography>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Card sx={{ bgcolor: "#242424", color: "white" }}>
        <Box sx={{ display: "flex", alignItems: "center", p: 3 }}>
          <Avatar
            src={artist.image}
            alt={artist.name}
            sx={{ width: 200, height: 200, mr: 3 }}
          />
          <Box>
            <Typography variant="h4" gutterBottom>
              {artist.name}
            </Typography>
            <Typography variant="subtitle1" color="grey" sx={{ mb: 1 }}>
              Popularity: {artist.popularity}
            </Typography>
            {artist.genres.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {artist.genres.map((genre) => (
                  <Chip
                    key={genre}
                    label={genre}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5, color: "#1db954" }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Card>

      {artist.topTracks && artist.topTracks.length > 0 && (
        <Box sx={{ mt: 4, mb: 2, px: 2 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Top Tracks
          </Typography>
          <Grid container spacing={2}>
            {artist.topTracks.map((track) => (
              <Grid size={{ xs: 12 }} key={track.id}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                    borderRadius: 2,
                    p: 1,
                  }}
                >
                  <Box flex={1}>
                    <Box
                      onClick={() => navigate(`/track/${track.id}`)}
                      sx={{
                        display: "inline-block",
                        "&:hover": {
                          color: "#1db954",
                          cursor: "pointer",
                        },
                        cursor: "pointer",
                      }}
                    >
                      <Typography variant="h6">{track.name}</Typography>
                    </Box>
                    <Typography variant="body2" color="grey">
                      {track.explicit && (
                        <ExplicitSharp
                          sx={{ mr: 1, verticalAlign: "middle" }}
                        />
                      )}
                      {track.artists.map((artist, artistIndex) => (
                        <span key={artist.id}>
                          <Box
                            component="span"
                            onClick={() => navigate(`/artist/${artist.id}`)}
                            sx={{
                              display: "inline",
                              "&:hover": {
                                color: "#1db954",
                                cursor: "pointer",
                              },
                              cursor: "pointer",
                            }}
                          >
                            {artist.name}
                          </Box>
                          {artistIndex < track.artists.length - 1 && ", "}
                        </span>
                      ))}{" "}
                      •{" "}
                      <Box
                        component="span"
                        onClick={() => navigate(`/album/${track.album.id}`)}
                        sx={{
                          display: "inline",
                          "&:hover": {
                            color: "#1db954",
                            cursor: "pointer",
                          },
                          cursor: "pointer",
                        }}
                      >
                        {/*  */}
                        {track.album.name}
                      </Box>
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="grey">
                    {formatDuration(track.duration_ms)}
                  </Typography>
                  {track.previewUrl && (
                    <Box
                      sx={{
                        ml: 2,
                        cursor: "pointer",
                        color: "#1db954",
                        "&:hover": { color: "#1ed760" },
                      }}
                    />
                  )}
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};
