// hooks/useApi.ts
import { useAuth } from "../context/AuthContext";

export const useApi = () => {
  const { accessToken, refreshAccessToken } = useAuth();

  const fetchWithAuth = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const addAuthHeader = (token: string) => ({
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    // First try with current token
    let res = await fetch(url, addAuthHeader(accessToken || ""));

    // If expired, try refreshing
    if (res.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const newToken = localStorage.getItem("spotify_access_token");
        res = await fetch(url, addAuthHeader(newToken || ""));
      } else {
        throw new Error("Session expired. Please log in again.");
      }
    }

    return res;
  };

  return { fetchWithAuth };
};
