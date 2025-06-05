import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Paper,
  Box,
  Stack,
} from "@mui/material";
import { formatDuration, type Album } from "../types";
import { ExplicitSharp } from "@mui/icons-material";

export const AlbumPage = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbum = async () => {
      const token = localStorage.getItem("spotify_access_token");
      const res = await fetch(`http://127.0.0.1:5000/album/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setAlbum(data);
    };

    fetchAlbum();
  }, [id]);

  if (!album) {
    return <Typography>Loading album...</Typography>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Card sx={{ bgcolor: "#242424", color: "white" }}>
        <CardMedia
          component="img"
          height="600"
          image={album.image}
          alt={album.name}
          sx={{ objectFit: "contain", backgroundColor: "#242424" }}
        />
        <CardContent sx={{}}>
          <Typography variant="h4" gutterBottom color="white">
            {album.name}
          </Typography>
          <Typography variant="subtitle1" color="white">
            By {album.artists.map((artist) => artist.name).join(", ")}
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
                onClick={() => navigate(`/track/${track.id}`)}
                sx={{
                  borderRadius: 2,
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" },
                  cursor: "pointer",
                }}
              >
                <Box flex={1}>
                  <Typography variant="h6">{track.name}</Typography>
                  <Typography variant="body2" color="grey">
                    {track.explicit && (
                      <ExplicitSharp sx={{ mr: 1, verticalAlign: "middle" }} />
                    )}
                    {track.artists.map((artist) => artist.name).join(", ")} •{" "}
                    {album.name}
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
