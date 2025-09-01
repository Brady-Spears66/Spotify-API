import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";

interface ProfileProps {
  userProfile: User | null;
  loggedIn: boolean;
  setUserProfile: React.Dispatch<React.SetStateAction<User | null>>;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Profile: React.FC<ProfileProps> = ({
  userProfile,
  loggedIn,
  setUserProfile,
  setLoggedIn,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh access token
  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    if (!refreshToken) return null;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/refresh-access-token?refresh_token=${refreshToken}`
      );

      if (response.ok) {
        const tokenData = await response.json();
        localStorage.setItem("spotify_access_token", tokenData.access_token);

        // Update refresh token if provided
        if (tokenData.refresh_token) {
          localStorage.setItem(
            "spotify_refresh_token",
            tokenData.refresh_token
          );
        }

        return tokenData.access_token;
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }

    return null;
  };

  // Function to make authenticated API calls with automatic token refresh
  const makeAuthenticatedRequest = async (
    url: string,
    options: RequestInit = {}
  ) => {
    const accessToken = localStorage.getItem("spotify_access_token");
    const refreshToken = localStorage.getItem("spotify_refresh_token");

    if (!accessToken) {
      throw new Error("No access token available");
    }

    const makeRequest = async (token: string) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          "X-Refresh-Token": refreshToken || "", // Include refresh token in header if using server-side refresh
        },
      });
    };

    let response = await makeRequest(accessToken);

    // If we get a 401 and have a refresh token, try to refresh and retry
    if (response.status === 401 && refreshToken) {
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        response = await makeRequest(newAccessToken);
      } else {
        // Refresh failed, force logout
        logout();
        throw new Error("Session expired. Please log in again.");
      }
    }

    return response;
  };

  // Function to fetch user profile with error handling
  const fetchUserProfile = async () => {
    if (!loggedIn) return;

    setLoading(true);
    setError(null);

    try {
      const response = await makeAuthenticatedRequest(
        "http://127.0.0.1:5000/user-profile"
      );

      if (response.ok) {
        const userData = await response.json();

        // Check if response includes new token data (if using server-side refresh)
        if (userData.new_token_data) {
          localStorage.setItem(
            "spotify_access_token",
            userData.new_token_data.access_token
          );
          if (userData.new_token_data.refresh_token) {
            localStorage.setItem(
              "spotify_refresh_token",
              userData.new_token_data.refresh_token
            );
          }
        }

        setUserProfile(userData);
        localStorage.setItem("userProfile", JSON.stringify(userData));
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile when component mounts or login status changes
  useEffect(() => {
    if (loggedIn && !userProfile) {
      fetchUserProfile();
    }
  }, [loggedIn, userProfile]);

  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/login-url");
      const data = await res.json();
      window.location.href = data.url;
    } catch (error) {
      setError("Failed to initiate login");
    }
  };

  const logout = () => {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("userProfile");
    setLoggedIn(false);
    setUserProfile(null);
    setError(null);
    navigate("/");
  };

  const handleRetry = () => {
    setError(null);
    fetchUserProfile();
  };

  // Show login prompt if user is not logged in
  if (!loggedIn) {
    return (
      <Box
        sx={{
          p: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography variant="h3" textAlign="center" gutterBottom>
          Welcome to Your Profile
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="grey"
          sx={{ mb: 3 }}
        >
          Please log in with your Spotify account to view your profile
          information.
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: "#1ED760",
            color: "black",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            "&:hover": {
              bgcolor: "#1DB954",
            },
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Login with Spotify"}
        </Button>
      </Box>
    );
  }

  // Show loading state
  if (loading && !userProfile) {
    return (
      <Box
        sx={{
          p: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <CircularProgress size={60} sx={{ color: "#1ED760" }} />
        <Typography variant="h6" textAlign="center">
          Loading your profile...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error && !userProfile) {
    return (
      <Box
        sx={{
          p: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Alert severity="error" sx={{ mb: 2, maxWidth: "500px" }}>
          {error}
        </Alert>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleRetry}
            sx={{
              bgcolor: "#1ED760",
              color: "black",
              "&:hover": { bgcolor: "#1DB954" },
            }}
          >
            Try Again
          </Button>
          <Button variant="outlined" onClick={logout}>
            Logout
          </Button>
        </Box>
      </Box>
    );
  }

  // Show profile data
  if (!userProfile) {
    return null; // This shouldn't happen, but just in case
  }

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100%",
        flexDirection: "column",
        gap: 5,
      }}
    >
      <Typography variant="h2" gutterBottom textAlign="center">
        Your Profile
      </Typography>

      {/* Show error if there was one but we still have cached profile data */}
      {error && (
        <Alert
          severity="warning"
          sx={{ maxWidth: "500px" }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Refresh
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          minWidth: "300px",
          maxWidth: "500px",
          bgcolor: "grey",
          position: "relative",
        }}
      >
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "rgba(0,0,0,0.5)",
              borderRadius: 4,
            }}
          >
            <CircularProgress sx={{ color: "#1ED760" }} />
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            src={userProfile.image}
            alt={userProfile.username}
            sx={{
              width: 100,
              height: 100,
              fontSize: "2rem",
              bgcolor: "#1ED760",
              color: "black",
            }}
          >
            {!userProfile.image && userProfile.username[0]?.toUpperCase()}
          </Avatar>

          <Typography variant="h5" fontWeight={600} sx={{ color: "white" }}>
            {userProfile.username}
          </Typography>

          <Typography variant="body1" color="white">
            Country: {userProfile.country}
          </Typography>

          <Typography variant="body1" color="white">
            Followers: {userProfile.followers?.toLocaleString() || 0}
          </Typography>

          <Typography variant="body2" color="white">
            Email: {userProfile.email}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#1ED760",
            color: "black",
            "&:hover": { bgcolor: "#1DB954" },
          }}
          onClick={handleRetry}
          disabled={loading}
        >
          Refresh Profile
        </Button>

        <Button
          variant="outlined"
          sx={{
            borderColor: "#1ED760",
            color: "#1ED760",
            "&:hover": {
              borderColor: "#1DB954",
              color: "#1DB954",
              bgcolor: "rgba(29, 215, 96, 0.1)",
            },
          }}
          onClick={logout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Profile;
