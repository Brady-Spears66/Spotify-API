import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import type { Artist } from "../types";
import { useNavigate } from "react-router-dom";

type TimeRange = "short_term" | "medium_term" | "long_term";

interface TimeRangeOption {
  value: TimeRange;
  label: string;
}

const timeRangeOptions: TimeRangeOption[] = [
  { value: "short_term", label: "1 Month" },
  { value: "medium_term", label: "6 Months" },
  { value: "long_term", label: "1 Year" },
];

const TopArtistsPage = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("medium_term");

  const fetchTopArtists = (timeRange: TimeRange) => {
    const token = localStorage.getItem("spotify_access_token");
    if (!token) {
      setError("Missing access token.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`http://127.0.0.1:5000/top-artists?time_range=${timeRange}`, {
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
  };

  useEffect(() => {
    fetchTopArtists(selectedTimeRange);
  }, [selectedTimeRange]);

  const handleTimeRangeChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ) => {
    setSelectedTimeRange(timeRangeOptions[newValue].value);
  };

  const selectedTabIndex = timeRangeOptions.findIndex(
    (option) => option.value === selectedTimeRange
  );

  const navigate = useNavigate();
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
      {/* Time Range Tabs */}
      <Box sx={{ mb: 3, width: "100%", maxWidth: 800 }}>
        <Tabs
          value={selectedTabIndex}
          onChange={handleTimeRangeChange}
          centered
          sx={{
            mb: 2,
            "& .MuiTabs-indicator": {
              backgroundColor: "#1db954", // Spotify green
            },
            "& .MuiTab-root": {
              "&.Mui-selected": {
                color: "#1db954",
              },
              "& .MuiTouchRipple-root": {
                display: "none", // This also removes the ripple effect
              },
            },
          }}
        >
          {timeRangeOptions.map((option) => (
            <Tab
              key={option.value}
              label={option.label}
              sx={{
                color: "white",
                borderRadius: 5,
                "&:focus": { outline: "none" },
                "&:focus-visible": { outline: "none" },
              }}
            />
          ))}
        </Tabs>
      </Box>

      <Typography variant="h2" gutterBottom textAlign="center">
        Your Top Artists
      </Typography>

      {loading ? (
        <CircularProgress sx={{ color: "#1db954" }} />
      ) : error ? (
        <Typography color="error" variant="body1" textAlign="center">
          {error}
        </Typography>
      ) : artists.length === 0 ? (
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No top artists available for this time period.
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
                <Box
                  onClick={(_) => navigate(`/artist/${artist.id}`)}
                  sx={{
                    display: "inline-block",
                    "&:hover": {
                      color: "#1db954",
                      cursor: "pointer",
                    },
                    cursor: "pointer",
                  }}
                >
                  <Typography variant="h6">{artist.name}</Typography>
                </Box>
                {artist.genres.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {artist.genres.slice(0, 3).map((genre) => (
                      <Chip
                        key={genre}
                        label={genre}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5, color: "#1db954" }}
                      />
                    ))}
                  </Box>
                )}
                <Typography variant="body2" color="grey">
                  Followers: {artist.followers.toLocaleString()}
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
