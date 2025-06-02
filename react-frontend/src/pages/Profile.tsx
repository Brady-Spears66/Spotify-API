import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  useTheme,
  Button,
} from "@mui/material";
import type { User } from "../types";

interface ProfileProps {
  userProfile: User | null;
  setUserProfile: React.Dispatch<React.SetStateAction<User | null>>;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Profile: React.FC<ProfileProps> = ({
  userProfile,
  setUserProfile,
  setLoggedIn,
}) => {
  const theme = useTheme();
  if (!userProfile) {
    return (
      <Box
        sx={{
          p: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" color="error">
          User not found. Please log in again.
        </Typography>
      </Box>
    );
  }

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
        p: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100%",
        flexDirection: "column",
        gap: 5,
      }}
    >
      <Typography variant="h1" gutterBottom textAlign="center">
        Your Profile
      </Typography>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          minWidth: "300px",
          maxWidth: "500px",
          bgcolor: "#1ED760",
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
              bgcolor: theme.palette.secondary.main,
            }}
          >
            {!userProfile.image && userProfile.username[0].toUpperCase()}
          </Avatar>

          <Typography variant="h5" fontWeight={600}>
            {userProfile.username}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Country: {userProfile.country}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Followers: {userProfile.followers}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Email: {userProfile.email}
          </Typography>
        </Box>
      </Paper>

      <Button
        variant="outlined"
        sx={{ bgcolor: "grey", color: "text.primary" }}
        onClick={logout}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Profile;
