import { Box, Container } from "@mui/material";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Navbar from "./components/navbar";
import logo from "./images/Spotify_icon.svg";
import TopTracks from "./pages/TopTracks";
import TopArtists from "./pages/TopArtists";
import { useEffect, useState } from "react";
import type { User } from "./types";
import Profile from "./pages/Profile";

function App() {
  // @ts-ignore
  const loc = useLocation().pathname.replace(/^\/+/, "") || "Home";
  const titleString = loc.charAt(0).toUpperCase() + loc.slice(1) + " Page";
  const [userProfile, setUserProfile] = useState<User | null>(() => {
    const stored = localStorage.getItem("userProfile");
    return stored ? JSON.parse(stored) : null;
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
    }
  }, [userProfile]);

  return (
    <HelmetProvider>
      <Helmet>
        <title>{titleString}</title>
        <link rel="icon" href={logo} />
      </Helmet>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Navbar userProfile={userProfile} />
        <Container
          sx={{
            mt: 5,
            flex: "1 0 auto", // This makes the container take up available space
            mb: 4, // Add some margin before the footer
          }}
        >
          <Routes>
            <Route
              path="/"
              element={<Home setUserProfile={setUserProfile} />}
            />
            <Route path="/top-tracks" element={<TopTracks />} />
            <Route path="/top-artists" element={<TopArtists />} />
            <Route
              path="/profile"
              element={<Profile userProfile={userProfile} />}
            ></Route>
            {/* Add other routes here as needed */}
          </Routes>
        </Container>
      </Box>
    </HelmetProvider>
  );
}

export default App;
