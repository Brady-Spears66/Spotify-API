import { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Stack,
  Tabs,
  Tab,
  InputAdornment,
  Divider,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  ExplicitSharp,
  PlayArrow,
  Stop,
} from "@mui/icons-material";
import type {
  SearchResults,
  SearchArtist,
  SearchAlbum,
  SearchTrack,
} from "../types";

type SearchCategory = "all" | "artists" | "albums" | "tracks";

interface FilterOption {
  value: SearchCategory;
  label: string;
}

const search_filters: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "artists", label: "Artists" },
  { value: "albums", label: "Albums" },
  { value: "tracks", label: "Tracks" },
];

const Search = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResults>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [currentPreview, setCurrentPreview] = useState<HTMLAudioElement | null>(
    null
  );
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const handlePreviewPlay = (track: SearchTrack) => {
    if (!track.previewUrl) return;

    if (currentPreview) {
      currentPreview.pause();
      currentPreview.currentTime = 0;
    }

    const audio = new Audio(track.previewUrl);
    audio.play();
    setCurrentPreview(audio);
    setPlayingTrackId(track.id);

    audio.onended = () => {
      setPlayingTrackId(null);
      setCurrentPreview(null);
    };
  };

  const handlePreviewStop = () => {
    if (currentPreview) {
      currentPreview.pause();
      currentPreview.currentTime = 0;
      setCurrentPreview(null);
      setPlayingTrackId(null);
    }
  };

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({});
      setHasSearched(false);
      return;
    }

    const token = localStorage.getItem("spotify_access_token");
    if (!token) {
      setError("Missing access token.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/search?q=${encodeURIComponent(
          searchQuery
        )}&type=artist,album,track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || "Search failed");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleCategoryChange = (
    _event: React.SyntheticEvent,
    newValue: SearchCategory
  ) => {
    setActiveCategory(newValue);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  const renderArtists = (artists: SearchArtist[]) => (
    <Stack spacing={2}>
      {artists.map((artist) => (
        <Stack
          key={artist.id}
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            p: 2,
            borderRadius: 2,
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" },
            cursor: "pointer",
          }}
        >
          <Box
            component="img"
            src={artist.image || "/default-artist.png"}
            alt={artist.name}
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <Box flex={1}>
            <Typography variant="h6">{artist.name}</Typography>
            <Typography variant="body2" color="grey">
              {artist.followers.toLocaleString()} followers
            </Typography>
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
          </Box>
        </Stack>
      ))}
    </Stack>
  );

  const renderAlbums = (albums: SearchAlbum[]) => (
    <Stack spacing={2}>
      {albums.map((album) => (
        <Stack
          key={album.id}
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            p: 2,
            borderRadius: 2,
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" },
            cursor: "pointer",
          }}
        >
          <Box
            component="img"
            src={album.image || "/default-album.png"}
            alt={album.name}
            sx={{
              width: 60,
              height: 60,
              borderRadius: 1,
              objectFit: "cover",
            }}
          />
          <Box flex={1}>
            <Typography variant="h6">{album.name}</Typography>
            <Typography variant="body2" color="grey">
              {album.artists.join(", ")} • {album.release_date.split("-")[0]}
            </Typography>
            <Typography variant="body2" color="grey">
              {album.album_type} • {album.total_tracks} tracks
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );

  const renderTracks = (tracks: SearchTrack[]) => (
    <Stack spacing={2}>
      {tracks.map((track) => (
        <Stack
          key={track.id}
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            p: 2,
            borderRadius: 2,
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" },
            cursor: "pointer",
          }}
        >
          <Box
            component="img"
            src={track.albumImage || "/default-album.png"}
            alt={track.name}
            sx={{
              width: 60,
              height: 60,
              borderRadius: 1,
              objectFit: "cover",
            }}
          />
          <Box flex={1}>
            <Typography variant="h6">{track.name}</Typography>
            <Typography variant="body2" color="grey">
              {track.explicit && (
                <ExplicitSharp sx={{ mr: 1, verticalAlign: "middle" }} />
              )}
              {track.artists.join(", ")} • {track.album}
            </Typography>
          </Box>
          <Typography variant="body2" color="grey">
            {formatDuration(track.duration_ms)}
          </Typography>
          {track.previewUrl && (
            <Box
              onClick={() =>
                playingTrackId === track.id
                  ? handlePreviewStop()
                  : handlePreviewPlay(track)
              }
              sx={{
                ml: 2,
                cursor: "pointer",
                color: "#1db954",
                "&:hover": { color: "#1ed760" },
              }}
            >
              {playingTrackId === track.id ? <Stop /> : <PlayArrow />}
            </Box>
          )}
        </Stack>
      ))}
    </Stack>
  );

  const getDisplayResults = () => {
    switch (activeCategory) {
      case "artists":
        return results.artists || [];
      case "albums":
        return results.albums || [];
      case "tracks":
        return results.tracks || [];
      default:
        return results;
    }
  };

  const hasResults = () => {
    const displayResults = getDisplayResults();
    if (activeCategory === "all") {
      return (
        (results.artists?.length || 0) +
          (results.albums?.length || 0) +
          (results.tracks?.length || 0) >
        0
      );
    }
    return Array.isArray(displayResults) && displayResults.length > 0;
  };

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
      {/* Search Input */}
      <Box sx={{ width: "100%", maxWidth: "70%", mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search for artists, albums, or tracks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
            },
          }}
        />
      </Box>

      {/* Category Tabs */}
      {hasSearched && (
        <Box sx={{ width: "100%", maxWidth: 800, mb: 3 }}>
          <Tabs
            value={activeCategory}
            onChange={handleCategoryChange}
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#1db954",
              },
              "& .MuiTab-root": {
                "&.Mui-selected": {
                  color: "#1db954",
                },
              },
            }}
          >
            {search_filters.map((filter) => (
              <Tab
                key={filter.value}
                value={filter.value}
                label={filter.label}
                disableRipple
                sx={{
                  color: "white",
                  "&:focus": { outline: "none" },
                  "&:focus-visible": { outline: "none" },
                }}
              />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Results */}
      <Box sx={{ width: "100%", maxWidth: 800 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress sx={{ color: "#1db954" }} />
          </Box>
        ) : error ? (
          <Typography color="error" variant="body1" textAlign="center">
            {error}
          </Typography>
        ) : hasSearched && !hasResults() ? (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No results found for "{query}"
          </Typography>
        ) : activeCategory === "all" ? (
          // Show all categories
          <Stack spacing={4}>
            {results.tracks && results.tracks.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 2, color: "#1db954" }}>
                  Tracks
                </Typography>
                {renderTracks(results.tracks.slice(0, 5))}
              </Box>
            )}
            {results.artists && results.artists.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 2, color: "#1db954" }}>
                  Artists
                </Typography>
                {renderArtists(results.artists.slice(0, 5))}
                <Divider sx={{ mt: 3 }} />
              </Box>
            )}
            {results.albums && results.albums.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 2, color: "#1db954" }}>
                  Albums
                </Typography>
                {renderAlbums(results.albums.slice(0, 5))}
                <Divider sx={{ mt: 3 }} />
              </Box>
            )}
          </Stack>
        ) : (
          // Show specific category
          <Box>
            {activeCategory === "artists" &&
              results.artists &&
              renderArtists(results.artists)}
            {activeCategory === "albums" &&
              results.albums &&
              renderAlbums(results.albums)}
            {activeCategory === "tracks" &&
              results.tracks &&
              renderTracks(results.tracks)}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Search;
