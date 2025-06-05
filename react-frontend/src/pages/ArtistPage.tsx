import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Avatar,
  Box,
  Stack,
} from "@mui/material";
import { formatDuration, type Artist } from "../types";
import { ExplicitSharp } from "@mui/icons-material";

export const ArtistPage = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtist = async () => {
      const token = localStorage.getItem("spotify_access_token");
      const res = await fetch(`http://127.0.0.1:5000/artist/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setArtist(data);
    };

    fetchArtist();
  }, [id]);

  if (!artist) {
    return <Typography>Loading artist...</Typography>;
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
            <Typography variant="body2" color="grey">
              Genres: {artist.genres.join(", ")}
            </Typography>
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
                  onClick={() => navigate(`/track/${track.id}`)}
                  sx={{
                    borderRadius: 2,
                    p: 1,
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" },
                    cursor: "pointer",
                  }}
                >
                  <Box flex={1}>
                    <Typography variant="h6">{track.name}</Typography>
                    <Typography variant="body2" color="grey">
                      {track.explicit && (
                        <ExplicitSharp
                          sx={{ mr: 1, verticalAlign: "middle" }}
                        />
                      )}
                      {track.artists?.map((artist) => artist.name).join(", ")}
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
