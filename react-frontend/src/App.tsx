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
import Search from "./pages/Search";

function App() {
  // @ts-ignore
  const loc = useLocation().pathname.replace(/^\/+/, "") || "Home";
  const titleString = loc.charAt(0).toUpperCase() + loc.slice(1) + " Page";
  const [userProfile, setUserProfile] = useState<User | null>(() => {
    const stored = localStorage.getItem("userProfile");
    return stored ? JSON.parse(stored) : null;
  });
  const [loggedIn, setLoggedIn] = useState<boolean>(
    !!localStorage.getItem("spotify_access_token")
  );

  // Handle token parsing once, here
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const accessToken = query.get("access_token");
    const refreshToken = query.get("refresh_token");

    if (accessToken && refreshToken) {
      localStorage.setItem("spotify_access_token", accessToken);
      localStorage.setItem("spotify_refresh_token", refreshToken);
      setLoggedIn(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem("spotify_access_token");

    if (token) {
      fetch("http://127.0.0.1:5000/user-profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUserProfile(data))
        .catch(() => {
          localStorage.removeItem("spotify_access_token");
          setLoggedIn(false);
          setUserProfile(null);
        });
    }
  }, []);

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
        <Navbar
          userProfile={userProfile}
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          setUserProfile={setUserProfile}
        />
        <Container
          sx={{
            mt: 5,
            flex: "1 0 auto", // This makes the container take up available space
            mb: 4, // Add some margin before the footer
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/top-tracks" element={<TopTracks />} />
            <Route path="/top-artists" element={<TopArtists />} />
            <Route path="/search" element={<Search />} />
            <Route
              path="/profile"
              element={
                <Profile
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  setLoggedIn={setLoggedIn}
                />
              }
            ></Route>
            {/* Add other routes here as needed */}
          </Routes>
        </Container>
      </Box>
    </HelmetProvider>
  );
}

export default App;
