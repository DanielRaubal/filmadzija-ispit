import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import {SearchCardProps } from "@/app/types";



export function SearchCard({
  movie,
  averageRating,
  reviewCount,
  isSortedByRating = false,
}: SearchCardProps) {
  return (
    <Link
      href={`/search/${movie.movieId}`}
      className="border rounded-t-md hover:cursor-pointer hover:bg-gray-100 hover:border-yellow-700 hover:scale-101 transition-all duration-300"
    >
      <Image
        src={movie.poster}
        alt={movie.title}
        width={521}
        height={512}
        className="rounded-t-md w-full h-[300px] object-cover"
        priority={true}
        unoptimized={true}
      />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center gap-2">
            <Star
              className={`w-5 h-5 ${
                isSortedByRating
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-yellow-400"
              }`}
            />
            <div className="flex flex-col">
              <p className="text-lg font-bold">{averageRating.toFixed(1)}</p>
              <div className="flex flex-row gap-1 items-center">
                <p className="text-xs text-gray-500">{reviewCount} recenzija</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-sm text-gray-500">Trajanje:</p>
            <p className="text-sm font-semibold">{movie.runTime} min</p>
          </div>
        </div>
        <p className="text-xl font-bold">{movie.title}</p>
        <div className="flex flex-row gap-2 flex-wrap">
          {movie.movieGenres &&
            movie.movieGenres.map((movieGenre) => (
              <p
                key={movieGenre.genreId}
                className="text-xs text-black border border-black p-0.5 px-2 rounded-md bg-yellow-500"
              >
                {movieGenre.genre?.name}
              </p>
            ))}
        </div>
        <p className="text-sm text-gray-500">
          Režiser: {movie.director?.name || "Unknown"}
        </p>
        <p>{movie.description.slice(0, 100)}...</p>
      </div>
    </Link>
  );
}
