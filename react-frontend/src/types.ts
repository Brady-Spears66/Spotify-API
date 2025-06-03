type User = {
  username: string;
  email: string;
  followers: number;
  image: string;
  country: string;
};

type Artist = {
  name: string;
  genres: string[];
  image: string;
  followers: number;
};

interface Track {
  name: string;
  artists: string[];
  album: string;
  albumImage: string;
}

interface SearchArtist {
  id: string;
  name: string;
  genres: string[];
  image: string;
  followers: number;
  popularity: number;
}

interface SearchAlbum {
  id: string;
  name: string;
  artists: string[];
  image: string;
  release_date: string;
  total_tracks: number;
  album_type: string;
}

interface SearchTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumImage: string;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  previewUrl?: string;
}

interface SearchResults {
  artists?: SearchArtist[];
  albums?: SearchAlbum[];
  tracks?: SearchTrack[];
}

export type {
  Artist,
  Track,
  User,
  SearchAlbum,
  SearchArtist,
  SearchTrack,
  SearchResults,
};
