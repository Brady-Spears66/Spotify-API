type User = {
  username: string;
  email: string;
  followers: number;
  image: string;
  country: string;
};

type Artist = {
  id: string;
  name: string;
  genres: string[];
  image: string;
  followers: number;
  popularity: number;
  topTracks?: Track[];
};

interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  albumImage: string;
  explicit: boolean;
  duration_ms: number;
  popularity: number;
  previewUrl?: string;
}

interface Album {
  id: string;
  name: string;
  artists: Artist[];
  tracks: Track[];
  image: string;
  release_date: string;
  total_tracks: number;
  album_type: string;
}

interface SearchResults {
  artists?: Artist[];
  albums?: Album[];
  tracks?: Track[];
}

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, "0")}`;
};

export type { Album, Artist, Track, User, SearchResults };
export { formatDuration };
