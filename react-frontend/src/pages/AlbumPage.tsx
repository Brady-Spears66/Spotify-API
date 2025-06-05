import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Box,
  Stack,
  CircularProgress,
} from "@mui/material";
import { formatDuration, type Album } from "../types";
import { ExplicitSharp } from "@mui/icons-material";

export const AlbumPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      const token = localStorage.getItem("spotify_access_token");
      if (!token) {
        setError("No Spotify access token found.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:5000/album/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch album.");
        }

        const data = await res.json();
        setAlbum(data);
      } catch (err: unknown) {
        console.error("Album fetch error:", err);
        //@ts-ignore
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setError(null);
    fetchAlbum();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress sx={{ color: "#1db954" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body1" textAlign="center" mt={4}>
        {error}
      </Typography>
    );
  }

  if (!album) {
    return (
      <Typography variant="body1" textAlign="center" mt={4}>
        Album not found.
      </Typography>
    );
  }
  return (
    <Container sx={{ mt: 4 }}>
      <Card sx={{ overflow: "hidden", bgcolor: "#242424" }}>
        <CardMedia
          component="img"
          height="600"
          image={album.image}
          alt={album.name}
          sx={{ objectFit: "contain", backgroundColor: "#242424" }}
        />
        <CardContent>
          <Typography variant="h4" gutterBottom color="white">
            {album.name}
          </Typography>
          <Typography variant="subtitle1" color="white">
            By{" "}
            {album.artists.map((artist, artistIndex) => (
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
                {artistIndex < album.artists.length - 1 && ", "}
              </span>
            ))}
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, mb: 2, px: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Tracks
        </Typography>
        <Grid container spacing={2}>
          {album.tracks.map((track) => (
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
                      <ExplicitSharp sx={{ mr: 1, verticalAlign: "middle" }} />
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
                      onClick={() => navigate(`/album/${album.id}`)}
                      sx={{
                        display: "inline",
                        "&:hover": {
                          color: "#1db954",
                          cursor: "pointer",
                        },
                        cursor: "pointer",
                      }}
                    >
                      {album.name}
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
    </Container>
  );
};
