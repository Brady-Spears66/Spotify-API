import React from "react";
import { Box, Typography, Avatar, Paper } from "@mui/material";
import type { User } from "../types";

interface ProfileProps {
  userProfile: User | null;
}

const Profile: React.FC<ProfileProps> = ({ userProfile }) => {
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
            sx={{ width: 100, height: 100, fontSize: "2rem" }}
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
    </Box>
  );
};

export default Profile;
