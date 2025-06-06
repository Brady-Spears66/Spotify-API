import React from "react";
import { Box, Typography, Avatar, Paper, Button } from "@mui/material";
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

  const handleLogin = async () => {
    const res = await fetch("http://127.0.0.1:5000/login-url");
    const data = await res.json();
    window.location.href = data.url;
  };

  const logout = () => {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("userProfile");
    setLoggedIn(false);
    setUserProfile(null);
    navigate("/");
  };

  // Show login prompt if user is not logged in
  if (!loggedIn || !userProfile) {
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
        >
          Login with Spotify
        </Button>
      </Box>
    );
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
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          minWidth: "300px",
          maxWidth: "500px",
          bgcolor: "grey",
        }}
      >
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
            {!userProfile.image && userProfile.username[0].toUpperCase()}
          </Avatar>

          <Typography variant="h5" fontWeight={600} sx={{ color: "white" }}>
            {userProfile.username}
          </Typography>

          <Typography variant="body1" color="white">
            Country: {userProfile.country}
          </Typography>

          <Typography variant="body1" color="white">
            Followers: {userProfile.followers}
          </Typography>

          <Typography variant="body2" color="white">
            Email: {userProfile.email}
          </Typography>
        </Box>
      </Paper>

      <Button
        variant="outlined"
        sx={{ bgcolor: "#1ED760", color: "text.primary" }}
        onClick={logout}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Profile;
