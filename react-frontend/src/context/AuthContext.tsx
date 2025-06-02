import React, { createContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  refreshToken: null,
  setTokens: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("spotify_access_token")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("spotify_refresh_token")
  );

  // Save tokens to localStorage when setTokens called
  const setTokens = (newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem("spotify_access_token", newAccessToken);
    localStorage.setItem("spotify_refresh_token", newRefreshToken);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
  };

  // Optional: Auto-refresh access token before expiry
  useEffect(() => {
    if (!refreshToken) return;

    const interval = setInterval(() => {
      fetch(
        `http://127.0.0.1:5000/refresh-access-token?refresh_token=${refreshToken}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token) {
            setAccessToken(data.access_token);
            localStorage.setItem("spotify_access_token", data.access_token);
          }
        })
        .catch((err) => {
          console.error("Failed to refresh token:", err);
          logout();
        });
    }, 1000 * 60 * 10); // Refresh every 10 minutes

    return () => clearInterval(interval);
  }, [refreshToken]);

  return (
    <AuthContext.Provider
      value={{ accessToken, refreshToken, setTokens, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
