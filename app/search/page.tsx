"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cat, SearchIcon, Star } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchCard } from "@/components/ui/search/card";
import { Director, Genre, Movie, Review } from "../types";

interface ActorData {
  actorId: number;
  name: string;
  createdAt: string;
}


export default function Search() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortByRating, setSortByRating] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [reviews, setReviews] = useState<Review[]>([]);

  // Filters state
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [directors, setDirectors] = useState<Director[]>([]);
  const [selectedDirector, setSelectedDirector] = useState<Director | null>(
    null
  );
  const [actors, setActors] = useState<ActorData[]>([]);
  const [selectedActor, setSelectedActor] = useState<ActorData | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [runtimes, setRuntimes] = useState<number[]>([]);
  const [selectedRuntime, setSelectedRuntime] = useState<number | null>(null);

  useEffect(() => {
    // Initial data fetch with no filters
    fetchMovies();
    fetchDirectors();
    fetchActors();
    fetchGenres();
    fetchRuntimes();

    // Load reviews
    const reviewsStr = localStorage.getItem("user-reviews");
    if (reviewsStr) {
      setReviews(JSON.parse(reviewsStr));
    }
  }, []);

  const fetchMovies = async (
    filters: {
      search?: string;
      director?: number;
      actor?: number;
      genre?: number;
      runtime?: number;
    } = {}
  ) => {
    setIsLoading(true);
    try {
      let url = "https://movie.pequla.com/api/movie";

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.director)
        params.append("director", filters.director.toString());
      if (filters.actor) params.append("actor", filters.actor.toString());
      if (filters.genre) params.append("genre", filters.genre.toString());
      if (filters.runtime) params.append("runtime", filters.runtime.toString());

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      // alert(url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();

      setMovies(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDirectors = async () => {
    try {
      const response = await fetch("https://movie.pequla.com/api/director");

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      setDirectors(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  const fetchActors = async () => {
    try {
      const response = await fetch("https://movie.pequla.com/api/actor");

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      setActors(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await fetch("https://movie.pequla.com/api/genre");

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      setGenres(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  const fetchRuntimes = async () => {
    try {
      const response = await fetch(
        "https://movie.pequla.com/api/movie/runtime"
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      setRuntimes(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  const handleSearch = () => {
    fetchMovies({
      search: searchTitle,
      director: selectedDirector?.directorId,
      actor: selectedActor?.actorId,
      genre: selectedGenre?.genreId,
      runtime: selectedRuntime ?? undefined,
    });
  };

  const sortMoviesByRating = (moviesToSort: Movie[]) => {
    return [...moviesToSort].sort((a, b) => {
      const ratingA = calculateAverageRating(a.movieId);
      const ratingB = calculateAverageRating(b.movieId);
      return sortOrder === "desc" ? ratingB - ratingA : ratingA - ratingB;
    });
  };

  const handleSortByRating = () => {
    if (!sortByRating) {
      setSortByRating(true);
      setSortOrder("desc");
      setMovies(sortMoviesByRating(movies));
    } else {
      // Toggle sort order if already sorting by rating
      const newOrder = sortOrder === "desc" ? "asc" : "desc";
      setSortOrder(newOrder);
      setMovies((prev) => [...prev].reverse());
    }
  };

  const resetFilters = () => {
    setSearchTitle("");
    setSelectedDirector(null);
    setSelectedActor(null);
    setSelectedGenre(null);
    setSelectedRuntime(null);
    setSortByRating(false);
    setSortOrder("desc");
    fetchMovies();
  };

  const getMovieReviews = (movieId: number) => {
    return reviews.filter((review) => review.movieId === movieId);
  };

  const calculateAverageRating = (movieId: number) => {
    const movieReviews = getMovieReviews(movieId);
    if (movieReviews.length === 0) return 0;
    const sum = movieReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / movieReviews.length;
  };

  if (isLoading && movies.length === 0)
    return (
      <div className="min-h-screen flex justify-center items-center text-5xl">
        Loading, hang in there...{" "}
        <Cat className="animate-bounce text-yellow-500" />
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="py-4 container mx-auto flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="text-2xl font-bold">Filmovi</p>
      </div>
      <div className="border rounded-md p-4 grid grid-cols-2 gap-4">
        <Input
          type="text"
          placeholder="Naziv filma"
          value={searchTitle}
          className="col-span-2"
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <div className="col-span-2 grid grid-cols-2 gap-4 h-9">
          <DropdownMenu>
            <DropdownMenuTrigger className="border rounded-md text-left px-4">
              {selectedDirector ? selectedDirector.name : "Režiser"}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[470px] max-h-[300px] overflow-y-auto">
              <DropdownMenuItem
                className="bg-red-600 text-white font-bold hover:bg-red-700 transition-all duration-300"
                onClick={() => setSelectedDirector(null)}
              >
                Resetuj
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {directors.map((director) => (
                <DropdownMenuItem
                  key={director.directorId}
                  onClick={() => setSelectedDirector(director)}
                >
                  {director.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="border rounded-md text-left px-4">
              {selectedActor ? selectedActor.name : "Glumac"}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[470px] max-h-[300px] overflow-y-auto">
              <DropdownMenuItem
                className="bg-red-600 text-white font-bold hover:bg-red-700 transition-all duration-300"
                onClick={() => setSelectedActor(null)}
              >
                Resetuj
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {actors.map((actor) => (
                <DropdownMenuItem
                  key={actor.actorId}
                  onClick={() => setSelectedActor(actor)}
                >
                  {actor.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="col-span-2 grid grid-cols-3 gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="border rounded-md text-left px-4">
              {selectedGenre ? selectedGenre.name : "Žanr"}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[320px] max-h-[300px] overflow-y-auto">
              <DropdownMenuItem
                className="bg-red-600 text-white font-bold hover:bg-red-700 transition-all duration-300"
                onClick={() => setSelectedGenre(null)}
              >
                Resetuj
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {genres.map((genre) => (
                <DropdownMenuItem
                  key={genre.genreId}
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="border rounded-md text-left px-4">
              {selectedRuntime ? `${selectedRuntime} min` : "Vreme trajanja"}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[320px] max-h-[300px] overflow-y-auto">
              <DropdownMenuItem
                className="bg-red-600 text-white font-bold hover:bg-red-700 transition-all duration-300"
                onClick={() => setSelectedRuntime(null)}
              >
                Resetuj
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {runtimes.map((runtime) => (
                <DropdownMenuItem
                  key={runtime}
                  onClick={() => setSelectedRuntime(runtime)}
                >
                  {runtime} min
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            className={`flex items-center gap-2 ${
              sortByRating ? "bg-yellow-500 hover:bg-yellow-600 text-black" : ""
            }`}
            onClick={handleSortByRating}
          >
            <Star className={`w-4 h-4 ${sortByRating ? "fill-current" : ""}`} />
            {sortByRating
              ? `Sortirano po oceni ${
                  sortOrder === "desc" ? "(najviše prvo)" : "(najniže prvo)"
                }`
              : "Sortiraj po oceni"}
          </Button>
        </div>

        <Button className="col-span-1" onClick={handleSearch}>
          Pretraži <SearchIcon className="w-4 h-4 ml-2" />
        </Button>
        <Button
          className="col-span-1 bg-red-600 text-white font-bold hover:bg-red-700 transition-all duration-300"
          onClick={resetFilters}
        >
          Resetuj filtere
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center text-2xl p-8">
          Pretraga... <Cat className="animate-bounce text-yellow-500 ml-2" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <SearchCard
                key={movie.movieId || movie.title}
                movie={movie}
                averageRating={calculateAverageRating(movie.movieId)}
                reviewCount={getMovieReviews(movie.movieId).length}
                isSortedByRating={sortByRating}
              />
            ))
          ) : (
            <div className="col-span-full text-center p-8">
              <p className="text-xl">
                Nema pronađenih filmova za zadate filtere.
              </p>
              <Button onClick={resetFilters} className="mt-4">
                Resetuj filtere
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
