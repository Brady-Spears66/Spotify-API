import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, useTheme } from "@mui/material";
import spotifyLogo from "../images/Spotify_icon.svg";
import type { User } from "../types";

interface NavProps {
  userProfile: User | null;
}

const ResponsiveAppBar: React.FC<NavProps> = ({ userProfile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const backgroundColor = theme.palette.mode === "dark" ? "#101010" : "grey";

  type navItem = {
    label: string;
    path: string;
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Top Tracks", path: "/top-tracks" },
    { label: "Top Artists", path: "/top-artists" },
  ];

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const getInitials = (name: string | null) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    return words.length === 1
      ? words[0][0].toUpperCase()
      : (words[0][0] + words[1][0]).toUpperCase();
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const menuItemClicked = (item: navItem) => {
    navigate(item.path);
    handleCloseNavMenu();
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor,
        width: "100vw",
        overflow: "hidden",
        height: { lg: "120px" },
        left: 0,
        right: 0,
        maxWidth: "100%",
      }}
    >
      <Box sx={{ width: "100%", height: "100%", margin: 0, padding: 0 }}>
        <Toolbar
          disableGutters
          sx={{
            px: { xs: 2, md: 4 },
            display: "flex",
            justifyContent: "space-between",
            height: "100%",
            maxWidth: "100%",
            margin: 0,
          }}
        >
          {/* Desktop Logo */}
          <Box
            sx={{
              display: { xs: "none", md: "none", lg: "flex" },
              height: "75%",
              width: "auto",
              alignItems: "center",
              mr: 4,
            }}
          >
            <Box
              component="img"
              src={spotifyLogo}
              alt="Logo"
              sx={{
                height: "90%",
                width: "auto",
                cursor: "pointer",
                objectFit: "contain",
              }}
              onClick={() => navigate("/")}
            />
          </Box>

          {/* Mobile Left Section - Menu */}
          <Box
            sx={{
              display: { xs: "flex", md: "flex", lg: "none" },
              flex: "1 1 0",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <IconButton
              size="large"
              aria-label="menu"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{
                "&:focus": { outline: "none" },
                "&:focus-visible": { outline: "none" },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", lg: "none" } }}
            >
              {navItems.map((item) => (
                <MenuItem
                  key={item.label}
                  onClick={() => menuItemClicked(item)}
                >
                  <Typography
                    sx={{
                      textAlign: "center",
                      color:
                        location.pathname === item.path
                          ? theme.palette.secondary.main
                          : theme.palette.text.primary,
                    }}
                  >
                    {item.label}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Center Section - Logo */}
          <Box
            sx={{
              display: { xs: "flex", md: "flex", lg: "none" },
              flex: "1 1 0",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={spotifyLogo}
              alt="Mobile Logo"
              sx={{ height: "50px", width: "auto", cursor: "pointer" }}
              onClick={() => navigate("/")}
            />
          </Box>

          {/* Desktop Nav Items */}
          <Box
            sx={{
              display: { xs: "none", md: "none", lg: "flex" },
              alignItems: "center",
              flex: 1,
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 5,
                  color:
                    location.pathname === item.path
                      ? theme.palette.secondary.main
                      : "white",
                  fontSize: { md: "0.7rem", lg: "1.2rem" },
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderBottomColor: "rgb(25, 190, 207)",
                  },
                  "&:focus": { outline: "none" },
                  "&:focus-visible": { outline: "none" },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Profile Info */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              minWidth: "150px",
              gap: 1,
              flex: "0 0 auto",
            }}
          >
            {userProfile && (
              <IconButton
                onClick={() => navigate("/profile")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  borderRadius: 5,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                  "&:focus": { outline: "none" },
                  "&:focus-visible": { outline: "none" },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    width: 32,
                    height: 32,
                    fontSize: "0.9rem",
                  }}
                >
                  {getInitials(userProfile.username)}
                </Avatar>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "white",
                    fontWeight: 500,
                    fontSize: { xs: "0.8rem", sm: "1rem" },
                  }}
                >
                  {userProfile.username}
                </Typography>
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  );
};

export default ResponsiveAppBar;
