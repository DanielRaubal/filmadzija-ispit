export interface ReservationItem {
  id: number;
  showingId: number;
  username: string;
  date: string;
  time: string;
  price: number;
  paid: boolean;
  cinema: string;
  status: string;
  availableSeats: number;
  quantity: number;
  movie: SimpleMovie;
  createdAt: string;
}

export interface SimpleMovie {
  movieId: number;
  title: string;
  poster: string;
  startDate: string;
  runTime: number;
  rating: number;
  director: Director;
}

export interface Director {
  created_at: string;
  directorId: number;
  name: string;
}

export interface Showing {
  showingId: number;
  date: string;
  time: string;
  price: number;
  movie: SimpleMovie;
  paid: boolean;
  cinema: string;
  availableSeats: number;
}

export interface Movie {
  corporateId: string;
  createdAt: string;
  description: string;
  director: Director;
  directorId: number;
  internalId: string;
  movieActors: Actor[];
  movieGenres: MovieGenre[];
  movieId: number;
  originalTitle: string;
  poster: string;
  runTime: number;
  shortDescription: string;
  shortUrl: string;
  startDate: string;
  title: string;
  updatedAt: null;
  rating: number;
}

export interface Actor {
  actor: {
    actorId: number;
    createdAt: string;
    name: string;
  };
  actorId: number;
  movieActorId: number;
  movieId: number;
}

export interface MovieGenre {
  movieGenreId: number;
  movieId: number;
  genreId: number;
  genre: {
    genreId: number;
    name: string;
    createdAt: string;
  };
}

export interface Review {
  reviewId: number;
  movieId: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface StarType {
  selected: boolean;
}

export interface Profile {
  username: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  genre: string[];
}

export interface Genre {
  genreId: number;
  name: string;
  createdAt: string;
}

export interface User {
  username: string;
  password: string;
  authenticated: boolean;
}

export interface ActorData {
  actorId: number;
  name: string;
  createdAt: string;
}

export interface SearchCardProps {
  movie: Movie;
  averageRating: number;
  reviewCount: number;
  isSortedByRating?: boolean;
}
