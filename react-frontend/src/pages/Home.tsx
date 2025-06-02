import { useEffect, useState } from "react";
import { Button, Box, Typography, CircularProgress } from "@mui/material";
import type { User } from "../types";

interface HomeProps {
  setUserProfile: React.Dispatch<React.SetStateAction<User | null>>;
}

const Home: React.FC<HomeProps> = ({ setUserProfile }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const accessTokenFromUrl = query.get("access_token");
    const refreshTokenFromUrl = query.get("refresh_token");
    const tokenFromStorage = localStorage.getItem("spotify_access_token");

    if (accessTokenFromUrl && refreshTokenFromUrl) {
      // Store both tokens
      localStorage.setItem("spotify_access_token", accessTokenFromUrl);
      localStorage.setItem("spotify_refresh_token", refreshTokenFromUrl);
      setLoggedIn(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (tokenFromStorage) {
      setLoggedIn(true);
    }
    const token = localStorage.getItem("spotify_access_token");
    fetch("http://127.0.0.1:5000/user-profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUserProfile(data))
      .catch((err) => {
        console.error("Failed to fetch user profile", err);
        setUserProfile(null);
      });
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/login-url");
      const data = await res.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Login failed", error);
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("userProfile");
    setLoggedIn(false);
    setUserProfile(null);
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="h3">Welcome to Spotify Stats</Typography>

      {loggedIn ? (
        <>
          <Typography variant="h5" color="success.main">
            ✅ Successfully Logged In To Spotify!
          </Typography>
          <Typography variant="body1">
            Navigate to Top Tracks or Top Artists to see statistics about your
            profile.
          </Typography>
          <Button
            variant="outlined"
            onClick={logout}
            sx={{ fontSize: "1rem", px: 3, py: 1 }}
          >
            Logout
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          onClick={login}
          disabled={loading}
          sx={{ fontSize: "1.2rem", px: 4, py: 2 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Login with Spotify"
          )}
        </Button>
      )}
    </Box>
  );
};

export default Home;
