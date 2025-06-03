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

export type { Artist, Track, User };
