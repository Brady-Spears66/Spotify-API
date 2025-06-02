import { Box, Typography, Button, Grid, Paper } from "@mui/material";
import GraphicEqIcon from "@mui/icons-material/GraphicEq"; // Spotify-like icon
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 6,
        px: 3,
        textAlign: "center",
      }}
    >
      <Box>
        <GraphicEqIcon sx={{ fontSize: 64, color: "#1DB954" }} />
        <Typography variant="h3" gutterBottom>
          Welcome to Spotify Stats
        </Typography>
        <Typography variant="h6" color="grey">
          Dive into your music habits — explore your top tracks, artists, and
          more.
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 4, bgcolor: "grey" }}>
            <Typography variant="h5" gutterBottom>
              🎧 Top Tracks
            </Typography>
            <Typography variant="body1" color="text.secondary">
              See which songs you've been listening to the most over time.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2, bgcolor: "#1DB954" }}
              onClick={() => navigate("/top-tracks")}
            >
              View Top Tracks
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 4, bgcolor: "grey" }}>
            <Typography variant="h5" gutterBottom>
              🎤 Top Artists
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover your favorite artists and their genres.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2, bgcolor: "#1DB954" }}
              onClick={() => navigate("/top-artists")}
            >
              View Top Artists
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 4, bgcolor: "grey" }}>
            <Typography variant="h5" gutterBottom>
              👤 Your Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View your Spotify profile details and public stats.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2, bgcolor: "#1DB954" }}
              onClick={() => navigate("/profile")}
            >
              View Profile
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;
