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
} from "@mui/material";
import { formatDuration, type Track } from "../types";
import { ExplicitSharp } from "@mui/icons-material";

export const TrackPage = () => {
  const { id } = useParams();
  const [track, setTrack] = useState<Track | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrack = async () => {
      const token = localStorage.getItem("spotify_access_token");
      const res = await fetch(`http://127.0.0.1:5000/track/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setTrack(data);
    };

    fetchTrack();
  }, [id]);

  if (!track) {
    return <Typography>Loading track...</Typography>;
  }

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
            By {track.artists.map((artist) => artist.name).join(", ")}
          </Typography>
          <Typography variant="body2" color="grey">
            Album: {track.album.name}
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
