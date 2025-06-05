import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import type { Track } from "../types";
import { ExplicitSharp } from "@mui/icons-material";

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

const TopTracksPage = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("medium_term");

  const fetchTopTracks = (timeRange: TimeRange) => {
    const token = localStorage.getItem("spotify_access_token");
    if (!token) {
      setError("Missing access token.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`http://127.0.0.1:5000/top-tracks?time_range=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTracks(data);
          console.log(data);
        } else {
          setError("Unexpected response from server.");
          console.error("Server response:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to load top tracks.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTopTracks(selectedTimeRange);
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
                color: "White",
                borderRadius: 5,
                "&:focus": { outline: "none" },
                "&:focus-visible": { outline: "none" },
              }}
            />
          ))}
        </Tabs>
      </Box>

      <Typography variant="h2" gutterBottom textAlign="center">
        Your Top Tracks
      </Typography>

      {loading ? (
        <CircularProgress sx={{ color: "#1db954" }} />
      ) : error ? (
        <Typography color="error" variant="body1" textAlign="center">
          {error}
        </Typography>
      ) : tracks.length === 0 ? (
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No top tracks available for this time period.
        </Typography>
      ) : (
        <Stack spacing={3} alignItems="center" width="100%" maxWidth={800}>
          {tracks.map((track, index) => (
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
                src={track.albumImage}
                alt={track.name}
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 2,
                  objectFit: "cover",
                }}
              />
              <Box flex={1}>
                <Typography variant="h6">{track.name}</Typography>
                <Typography variant="body2" color="grey">
                  {track.explicit && (
                    <ExplicitSharp sx={{ mr: 1, verticalAlign: "middle" }} />
                  )}
                  {track.artists.map((artist) => artist.name).join(", ")} •{" "}
                  {track.album.name}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default TopTracksPage;
