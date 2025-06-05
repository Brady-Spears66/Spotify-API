import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Card,
  CardMedia,
  CardContent,
  Box,
  Stack,
  CircularProgress,
} from "@mui/material";
import { ExplicitSharp } from "@mui/icons-material";
import { formatDuration, type Track } from "../types";

export const TrackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrack = async () => {
      const token = localStorage.getItem("spotify_access_token");
      if (!token) {
        setError("No access token found.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:5000/track/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch track.");
        }

        const data = await res.json();
        setTrack(data);
      } catch (err: unknown) {
        console.error("Error fetching track:", err);
        //@ts-ignore
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setError(null);
    fetchTrack();
  }, [id]);

  // Show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress sx={{ color: "#1db954" }} />
      </Box>
    );
  }

  // Show error message
  if (error) {
    return (
      <Typography color="error" variant="body1" textAlign="center" mt={4}>
        {error}
      </Typography>
    );
  }

  // No track found
  if (!track) {
    return (
      <Typography variant="body1" textAlign="center" mt={4}>
        Track not found.
      </Typography>
    );
  }

  // Render track info
  return (
    <Container sx={{ mt: 4 }}>
      <Card sx={{ bgcolor: "#242424", color: "white" }}>
        <CardMedia
          component="img"
          height="600"
          image={track.albumImage}
          alt={track.album.name}
          sx={{ objectFit: "contain", backgroundColor: "#242424" }}
        />
        <CardContent>
          <Typography variant="h4" gutterBottom color="white">
            {track.name}
            {track.explicit && (
              <ExplicitSharp sx={{ ml: 1, verticalAlign: "middle" }} />
            )}
          </Typography>

          <Typography variant="subtitle1" color="white" sx={{ mb: 1 }}>
            By{" "}
            {track.artists.map((artist, index) => (
              <span key={artist.id}>
                <Box
                  component="span"
                  onClick={() => navigate(`/artist/${artist.id}`)}
                  sx={{
                    display: "inline",
                    "&:hover": { color: "#1db954", cursor: "pointer" },
                    cursor: "pointer",
                  }}
                >
                  {artist.name}
                </Box>
                {index < track.artists.length - 1 && ", "}
              </span>
            ))}
          </Typography>

          <Typography variant="body2" color="grey">
            Album:{" "}
            <Box
              component="span"
              onClick={() => navigate(`/album/${track.album.id}`)}
              sx={{
                display: "inline",
                "&:hover": { color: "#1db954", cursor: "pointer" },
                cursor: "pointer",
              }}
            >
              {track.album.name}
            </Box>
          </Typography>

          <Typography variant="body2" color="grey">
            Duration: {formatDuration(track.duration_ms)}
          </Typography>
        </CardContent>
      </Card>

      {track.previewUrl && (
        <Box sx={{ mt: 4, px: 2 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Preview
          </Typography>
          <Card sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box flex={1}>
                <Typography variant="h6">30-second preview</Typography>
                <Typography variant="body2" color="grey">
                  {track.name}
                </Typography>
              </Box>
              <Box
                sx={{
                  color: "#1db954",
                  "&:hover": { color: "#1ed760" },
                  cursor: "pointer",
                }}
              >
                <audio controls>
                  <source src={track.previewUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </Box>
            </Stack>
          </Card>
        </Box>
      )}
    </Container>
  );
};
