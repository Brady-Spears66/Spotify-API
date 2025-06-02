type User = {
  username: string;
  email: string;
  followers: string;
  image: string;
  country: string;
};

type Artist = {
  name: string;
  genres: string[];
  image: string;
};

interface Track {
  name: string;
  artists: string[];
  albumImage: string;
}

export type { Artist, Track, User };
