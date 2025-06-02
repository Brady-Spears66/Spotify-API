interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
  auth: AuthContextType
): Promise<Response> => {
  if (!auth.accessToken) {
    throw new Error("No access token available");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${auth.accessToken}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
