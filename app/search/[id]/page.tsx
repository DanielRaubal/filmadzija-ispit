"use client";
import { Button } from "@/components/ui/button";
import { Star, Ticket, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ReservationItem, Showing, Movie, Review } from "@/app/types";

export default function MoviePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showings, setShowings] = useState<Showing[]>([]);
  const [selectedShowing, setSelectedShowing] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchMovie = async () => {
      const response = await fetch(`https://movie.pequla.com/api/movie/${id}`);
      const data = await response.json();
      setMovie(data);

      setShowings(
        new Array(3).fill(null).map((_, i) => ({
          showingId: i,
          date: data.startDate,
          time: ["14:00", "17:30", "20:15"][i],
          price: 1200,
          cinema: "Bioskop Filmadzija",
          availableSeats: [50, 30, 80][i],
          movie: {
            movieId: data.movieId,
            title: data.title,
            poster: data.poster,
            startDate: data.startDate,
            runTime: data.runTime,
            rating: data.rating,
            director: data.director,
          },
          paid: false,
        }))
      );
    };

    const handleReview = () => {
      const reviewStr = localStorage.getItem("user-reviews");
      if (!reviewStr) {
        console.log("Nema recenzija");
        return;
      }

      setReviews(JSON.parse(reviewStr));
    };

    handleReview();
    fetchMovie();
  }, [id]);

  const addToCart = async (selectedShowing: number) => {
    const userCurrentStr = localStorage.getItem("user-current");
    if (!userCurrentStr) {
      toast("Niste ulogovani.");
      return;
    }

    const userCurrent = JSON.parse(userCurrentStr);

    if (!showings[selectedShowing]) {
      toast("Došlo je do greške prilikom dodavanja rezervacije.");
      return;
    }

    const existingReservationsJson = localStorage.getItem("user_reservations");
    let reservations: ReservationItem[] = [];

    if (existingReservationsJson) {
      try {
        reservations = JSON.parse(existingReservationsJson);
      } catch (error) {
        console.error("Error parsing reservations cookie:", error);
      }
    }

    // Check if this showing is already in the reservations
    const existingItemIndex = reservations.findIndex(
      (item) =>
        item.showingId === showings[selectedShowing].showingId &&
        item.username === userCurrent.username &&
        item.date === showings[selectedShowing].date &&
        item.time === showings[selectedShowing].time &&
        item.cinema === showings[selectedShowing].cinema &&
        item.paid === false
    );

    const lastId = localStorage.getItem("user_reservations")?.length || 0;
    const id = lastId + 1;

    if (existingItemIndex !== -1) {
      // Increment quantity if the same showing is already reserved
      reservations[existingItemIndex].quantity += 1;
    } else {
      // Add new reservation
      reservations.push({
        id: id,
        showingId: showings[selectedShowing].showingId,
        username: userCurrent.username,
        date: showings[selectedShowing].date,
        time: showings[selectedShowing].time,
        price: showings[selectedShowing].price,
        cinema: showings[selectedShowing].cinema,
        paid: false,
        availableSeats: showings[selectedShowing].availableSeats,
        quantity: 1,
        status: "Rezervisano",
        movie: showings[selectedShowing].movie,
        createdAt: new Date().toISOString(),
      });
    }

    // Store updated reservations back in the cookie
    localStorage.setItem("user_reservations", JSON.stringify(reservations));
    console.log(localStorage.getItem("user_reservations"));
    toast("Rezervacija je uspešno dodata.");
  };

  const calculateAverageRating = () => {
    const movieReviews = reviews.filter(
      (review) => review.movieId === movie?.movieId
    );
    if (movieReviews.length === 0) {
      return 0;
    }
    const sum = movieReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / movieReviews.length;
  };

  return (
    <div className="min-h-screen container mx-auto p-4 ">
      <div className="flex flex-col gap-4">
        <div className="grid lg:grid-cols-2 gap-8">
          {movie?.poster ? (
            <Image
              src={movie.poster}
              alt={movie.title || "Movie poster"}
              width={512}
              height={512}
              unoptimized
              className="border shadow-lg rounded-md border-gray-400 w-full"
            />
          ) : (
            <div className="border shadow-lg rounded-md border-gray-400 w-full h-[512px] flex items-center justify-center">
              Loading poster...
            </div>
          )}
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">{movie?.title}</h1>

            <div className="flex flex-row gap-8">
              <div className="flex flex-row gap-2 items-center">
                <p className="font-bold text-sm">Vreme trajanja:</p>
                <p>{movie?.runTime} min</p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <p className="font-bold text-sm">Datum premijere:</p>
                <p>{movie?.startDate}</p>
              </div>
            </div>
            <div className="flex flex-row gap-8">
              <div className="flex flex-row gap-2 items-center">
                <p className="font-bold text-sm">Režiser:</p>
                <p>{movie?.director?.name}</p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <p>{calculateAverageRating().toFixed(1)}</p>
                <Star fill="#fdc700" className="w-4 h-4 text-yellow-500" />
                <p className="border px-2 rounded-md text-sm text-gray-600">
                  {
                    reviews.filter(
                      (review) => review.movieId === movie?.movieId
                    ).length
                  }{" "}
                  recenzija
                </p>
              </div>
            </div>

            <div>
              <p className="font-bold text-sm">Žanrovi</p>
              <div className="flex flex-row gap-1">
                {movie?.movieGenres?.map((genre) => (
                  <p
                    key={genre.movieGenreId}
                    className="bg-yellow-500 rounded-md px-2 py-1 text-xs"
                  >
                    {genre.genre.name}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold text-sm">Deskripcija</p>
              <p>{movie?.description}</p>
            </div>
            <p className="font-bold text-sm">Glumci</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {movie?.movieActors?.map((actor) => (
                <div
                  key={actor.movieActorId}
                  className="flex flex-row gap-2 items-center"
                >
                  <p>{actor.actor.name}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-bold text-sm">Prikazi filma</p>
              <p className="font-extrabold text-yellow-500 w-fit rounded-md px-2 py-1 bg-black">
                Cena: 1200RSD
              </p>

              {showings.map((showing) => (
                <div
                  key={showing.showingId}
                  className={`flex flex-row gap-1 items-center border rounded-md p-2 cursor-pointer ${
                    selectedShowing === showing.showingId
                      ? "bg-yellow-500 text-black border-black"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedShowing(showing.showingId)}
                >
                  <p>
                    {showing.date}, {showing.time}, {showing.cinema},
                  </p>
                  <p>{showing.availableSeats} slobodnih mesta</p>
                </div>
              ))}
              <Button
                className="bg-yellow-500"
                disabled={selectedShowing === null}
                onClick={() => {
                  if (selectedShowing !== null) {
                    // Handle reservation
                    addToCart(selectedShowing);
                  }
                }}
              >
                Rezerviši <Ticket className="w-4 h-4" />
              </Button>
              <Link href="/search">
                <Button className="w-full">Nazad na pretragu</Button>
              </Link>
            </div>
            <p className="font-bold text-sm">Recenzije</p>
            {reviews.filter((review) => review.movieId === movie?.movieId)
              .length > 0 ? (
              reviews
                .filter((review) => review.movieId === movie?.movieId)
                .map((review) => (
                  <div
                    key={review.reviewId}
                    className="flex flex-row gap-2 items-center border rounded-md p-2"
                  >
                    <div className="flex flex-col gap-2 p-2 w-full">
                      <div className="flex flex-row gap-2 items-center border p-1 rounded-md px-3 justify-between">
                        <div className="flex flex-row gap-2 items-center">
                          <div className="bg-gray-500/30 rounded-full p-2 text-white w-fit">
                            <User className="w-4 h-4" />
                          </div>
                          <p className="text-xs">{review.username}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                          <p className="text-xs text-gray-500">
                            {review.rating}
                          </p>
                          <Star
                            fill="#fdc700"
                            className="w-4 h-4 text-yellow-500"
                          />
                        </div>
                      </div>

                      <p className="break-all px-2">{review.comment}</p>
                      <p className="text-xs text-gray-500 ml-auto mr-1 mt-3">
                        {new Date(review.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex justify-center items-center p-6 border-dashed border-3 rounded-md">
                <p className="text-gray-500 font-medium uppercase">Nema recenzija</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
