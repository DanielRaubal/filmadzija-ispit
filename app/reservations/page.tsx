"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReservationItem, Review, StarType,User } from "@/app/types";
import {
  SquareArrowOutUpRight,
  Star,
  Ticket,
  TicketCheck,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";
import CanceledReservations from "@/components/ui/reservations/cancledReservations";

export default function Reservations() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [paidReservations, setPaidReservations] = useState<ReservationItem[]>([]);
  const [rating, setRating] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stars, setStars] = useState<StarType[]>([
    { selected: true },
    { selected: false },
    { selected: false },
    { selected: false },
    { selected: false },
  ]);
  const [userCurrent, setUserCurrent] = useState<User | null>(null);

  const [cancledReservations, setCanceledReservations] = useState<
    ReservationItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const userCurrentStr = localStorage.getItem("user-current");
        if (!userCurrentStr) {
          toast.error("Morate biti prijavljen da biste videli svoje rezervacije");
          return;
        }

        const currentUser = JSON.parse(userCurrentStr);
        setUserCurrent(currentUser);

        if (!currentUser || !currentUser.authenticated) {
          toast.error("Morate biti prijavljen da biste videli svoje rezervacije");
          return;
        }

        const userReservationsStr = localStorage.getItem("user_reservations");
        const reviewsStr = localStorage.getItem("user-reviews");
        
        if (reviewsStr) {
          setReviews(JSON.parse(reviewsStr));
        }

        if (!userReservationsStr) {
          setLoading(false);
          return;
        }

        let userReservations: ReservationItem[] = JSON.parse(userReservationsStr);
        userReservations = userReservations.reverse();

        // Filter correctly based on status and paid properties
        setCanceledReservations(
          userReservations.filter(
            (r: ReservationItem) => r.status === "Otkazano" && r.username === currentUser.username
          )
        );

        setReservations(
          userReservations.filter(
            (r: ReservationItem) => !r.paid && r.status !== "Otkazano" && r.username === currentUser.username
          )
        );

        setPaidReservations(
          userReservations.filter(
            (r: ReservationItem) => r.paid && r.status !== "Otkazano" && r.username === currentUser.username
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen container mx-auto py-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading reservations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen container mx-auto py-4">
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (
    reservations.length === 0 &&
    paidReservations.length === 0 &&
    cancledReservations.length === 0
  ) {
    return (
      <div className="min-h-screen container mx-auto py-4">
        <h1 className="text-3xl font-bold mb-6">Moje Rezervacije</h1>
        <div className="text-center text-gray-600">
          Nemate aktivnih rezervacija.
        </div>
      </div>
    );
  }

  const handleCancel = async (reservation: ReservationItem) => {
    try {
      const userCurrentStr = localStorage.getItem("user-current");
      if (!userCurrentStr) {
        toast.error("Morate biti prijavljen da biste otkazali rezervaciju");
        return;
      }
      const currentUser = JSON.parse(userCurrentStr);

      const userReservationsStr = localStorage.getItem("user_reservations");
      if (!userReservationsStr) {
        return;
      }
      const userReservations: ReservationItem[] = JSON.parse(userReservationsStr);
      const updatedReservations = userReservations.map((r: ReservationItem) => {
        if (r.id === reservation.id && r.username === currentUser.username) {
          return { ...r, status: "Otkazano" };
        }
        return r;
      });

      localStorage.setItem(
        "user_reservations",
        JSON.stringify(updatedReservations)
      );

      // Update all state variables to reflect the change
      const reversedReservations = [...updatedReservations].reverse();

      setCanceledReservations(
        reversedReservations.filter(
          (r: ReservationItem) => r.status === "Otkazano" && r.username === currentUser.username
        )
      );

      setReservations(
        reversedReservations.filter(
          (r: ReservationItem) => !r.paid && r.status !== "Otkazano" && r.username === currentUser.username
        )
      );

      setPaidReservations(
        reversedReservations.filter(
          (r: ReservationItem) => r.paid && r.status !== "Otkazano" && r.username === currentUser.username
        )
      );
      
      toast.success("Rezervacija je uspešno otkazana");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Došlo je do greške prilikom otkazivanja rezervacije");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const userCurrentStr = localStorage.getItem("user-current");
      if (!userCurrentStr) {
        toast.error("Morate biti prijavljen da biste obrisali rezervaciju");
        return;
      }
      const currentUser = JSON.parse(userCurrentStr);

      const existingReservationsJson = localStorage.getItem("user_reservations");
      let reservations = JSON.parse(existingReservationsJson || "[]");

      // Find the reservation and verify it belongs to the current user
      const reservationIndex = reservations.findIndex(
        (reservation: ReservationItem) => 
          reservation.id === id && 
          reservation.username === currentUser.username
      );

      // If found and belongs to current user, remove it
      if (reservationIndex !== -1) {
        reservations.splice(reservationIndex, 1);
        localStorage.setItem("user_reservations", JSON.stringify(reservations));

        // Update the states with filtered reservations
        const reversedReservations = [...reservations].reverse();
        
        setCanceledReservations(
          reversedReservations.filter(
            (r: ReservationItem) => r.status === "Otkazano" && r.username === currentUser.username
          )
        );

        setReservations(
          reversedReservations.filter(
            (r: ReservationItem) => !r.paid && r.status !== "Otkazano" && r.username === currentUser.username
          )
        );

        setPaidReservations(
          reversedReservations.filter(
            (r: ReservationItem) => r.paid && r.status !== "Otkazano" && r.username === currentUser.username
          )
        );

        toast.success(`Rezervacija uspešno obrisana`);
      } else {
        toast.error(`Rezervacija nije pronađena ili nije vaša`);
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      toast.error("Došlo je do greške prilikom brisanja rezervacije");
    }
  };

  const handleReservationViewed = async (reservation: ReservationItem) => {
    try {
      const userCurrentStr = localStorage.getItem("user-current");
      if (!userCurrentStr) {
        toast.error("Morate biti prijavljen da biste označili rezervaciju kao gledanu");
        return;
      }
      const currentUser = JSON.parse(userCurrentStr);

      const userReservationsStr = localStorage.getItem("user_reservations");
      if (!userReservationsStr) {
        return;
      }
      const userReservations: ReservationItem[] = JSON.parse(userReservationsStr);
      const updatedReservations = userReservations.map((r: ReservationItem) => {
        if (r.id === reservation.id && r.username === currentUser.username) {
          return { ...r, status: "Gledano" };
        }
        return r;
      });

      localStorage.setItem(
        "user_reservations",
        JSON.stringify(updatedReservations)
      );

      // Update all state variables to reflect the change
      const reversedReservations = [...updatedReservations].reverse();

      setCanceledReservations(
        reversedReservations.filter(
          (r: ReservationItem) => r.status === "Otkazano" && r.username === currentUser.username
        )
      );

      setReservations(
        reversedReservations.filter(
          (r: ReservationItem) => !r.paid && r.status !== "Otkazano" && r.username === currentUser.username
        )
      );

      setPaidReservations(
        reversedReservations.filter(
          (r: ReservationItem) => r.paid && r.status !== "Otkazano" && r.username === currentUser.username
        )
      );

      toast.success("Rezervacija je označena kao gledana");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Došlo je do greške prilikom označavanja rezervacije kao gledane");
    }
  };

  const handleNewReview = async (data: any) => {
    try {
      const userCurrentStr = localStorage.getItem("user-current");
      if (!userCurrentStr) {
        toast.error("Morate biti prijavljeni da biste ocenili film");
        return;
      }
      const currentUser = JSON.parse(userCurrentStr);
      if (!currentUser.authenticated) {
        toast.error("Morate biti prijavljeni da biste ocenili film");
        return;
      }

      const reviewStr = localStorage.getItem("user-reviews");
      let reviews: Review[] = reviewStr ? JSON.parse(reviewStr) : [];

      // Check if user already reviewed this movie
      const existingReview = reviews.find(
        (r) => r.movieId === data.movieId && r.username === currentUser.username
      );

      if (existingReview) {
        toast.error("Već ste ocenili ovaj film");
        return;
      }

      if (data && data.movieId && data.rating && data.comment) {
        const review: Review = {
          reviewId: reviews.length + 1,
          movieId: data.movieId,
          username: currentUser.username,
          rating: data.rating,
          comment: data.comment,
          createdAt: new Date().toISOString(),
        };

        reviews.push(review);
        localStorage.setItem("user-reviews", JSON.stringify(reviews));
        toast.success("Recenzija je uspešno kreirana");

        // Update the movie's rating in localStorage
        const movieStr = localStorage.getItem("movies");
        if (movieStr) {
          let movies = JSON.parse(movieStr);
          const movieIndex = movies.findIndex((m: any) => m.movieId === data.movieId);
          if (movieIndex !== -1) {
            const movieReviews = reviews.filter((r) => r.movieId === data.movieId);
            const avgRating = movieReviews.reduce((acc, r) => acc + r.rating, 0) / movieReviews.length;
            movies[movieIndex].rating = avgRating;
            localStorage.setItem("movies", JSON.stringify(movies));
          }
        }
      } else {
        toast.error("Molimo vas da unesete i ocenu i komentar");
      }
    } catch (error) {
      console.error("Error creating review:", error);
      toast.error("Došlo je do greške prilikom kreiranja recenzije");
    }
  };

  const handleRating = (rating: number) => {
    setRating(rating);
    setStars((prev) =>
      prev.map((star, index) => ({
        ...star,
        selected: index < rating,
      }))
    );
  };

  const hasUserReviewedMovie = (movieId: number) => {
    const userCurrent = JSON.parse(localStorage.getItem("user-current") || "{}") || null;
    if (!userCurrent) return false;

    return reviews.some(
      (review) => review.movieId === movieId && review.username === userCurrent.username
    );
  };

  return (
    <div className="min-h-screen container mx-auto p-4 flex flex-col gap-4">
      <h1 className="text-3xl font-bold mb-6">Moje Rezervacije</h1>

      {reservations.length > 0 && (
        <>
          <div className="flex flex-row items-center gap-2 w-full border-b-2">
            <Ticket className="inline text-yellow-600" />
            <h3 className="text-2xl font-bold">Rezervisane karte</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reservations.map((reservation, index) => (
              <Card
                key={`unpaid-${reservation.id}-${index}`}
                className="shadow-lg p-0"
              >
                <Link
                  href={`/search/${reservation.movie.movieId}`}
                  className="relative overflow-hidden  rounded-t-lg"
                >
                  <Image
                    src={reservation.movie.poster}
                    alt={reservation.movie.title}
                    width={512}
                    height={512}
                    className="w-full rounded-t-lg h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <SquareArrowOutUpRight className="absolute top-2 right-2 bg-white p-1 border-black border rounded-full" />
                  <div className="mt-2 flex flex-row gap-2 items-center absolute top-0 left-2">
                    {reservation.status === "Rezervisano" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md border border-yellow-600 text-xs font-medium bg-yellow-100 text-yellow-800">
                        Rezervisano
                      </span>
                    )}
                  </div>
                </Link>

                <div className="text-sm text-gray-600 p-4">
                  <h3 className="text-lg font-semibold text-black">
                    {reservation.cinema}
                  </h3>

                  <p>Datum: {reservation.date}</p>
                  <p>Vreme: {reservation.time}</p>
                  <p>Broj karata: {reservation.quantity}</p>
                  <p>Cena: {reservation.price} RSD</p>
                  <div className="mt-2 flex flex-row gap-2 justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md border border-red-600 text-xs font-medium bg-red-100 text-red-800">
                      Ne Plaćeno
                    </span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger className="w-full">
                      <p className="border-red-700 bg-red-500 py-2 rounded-md text-white mt-2">
                        Otkazi projekciju
                      </p>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ova akcija ne može biti poništena. Ovo će trajno
                          otkazati vašu rezervaciju.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Odustani</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCancel(reservation)}
                        >
                          Da siguran sam
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {paidReservations.length > 0 && (
        <>
          <div className="flex flex-row items-center gap-2 w-full border-b-2">
            <TicketCheck className="inline text-green-600" />
            <h3 className="text-2xl font-bold">Kupljene karte</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paidReservations.map((paidReservation, index) => (
              <Card
                key={`paid-${paidReservation.id}-${index}`}
                className="shadow-lg p-0 relative"
              >
                <Link
                  href={`/search/${paidReservation.movie.movieId}`}
                  className="relative overflow-hidden rounded-t-lg"
                >
                  <Image
                    src={paidReservation.movie.poster}
                    alt={paidReservation.movie.title}
                    width={512}
                    height={512}
                    className="w-full rounded-t-md h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <SquareArrowOutUpRight className="absolute top-2 right-2 bg-white p-1 border-black border rounded-full" />
                </Link>

                <div className="mt-2 flex flex-row gap-2 items-center absolute top-0 left-2">
                  {paidReservation.status === "Gledano" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md border border-indigo-600 text-xs font-medium bg-indigo-100 text-indigo-800">
                      Gledano
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 p-4">
                  <h3 className="text-lg font-semibold text-black">
                    {paidReservation.cinema}
                  </h3>
                  <p>Film: {paidReservation.movie.title}</p>
                  <p>Datum: {paidReservation.date}</p>
                  <p>Vreme: {paidReservation.time}</p>
                  <p>Broj karata: {paidReservation.quantity}</p>
                  <p className="font-bold text-black">Cena: {paidReservation.price * paidReservation.quantity}<span className="text-yellow-700">RSD</span></p>
                  <div className="flex flex-row items-center gap-1">
                    <div className="mt-2 flex flex-row gap-2 items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm border border-green-600 text-xs font-medium bg-green-100 text-green-800">
                        Plaćeno
                      </span>
                      <p>
                        Vreme transakcije:{" "}
                        {new Date(paidReservation.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="w-full mt-2 h-auto"
                      onClick={() => handleReservationViewed(paidReservation)}
                    >
                      Pogledaj film
                    </Button>
                    {paidReservation.status === "Gledano" && 
                     !hasUserReviewedMovie(paidReservation.movie.movieId) && (
                      <AlertDialog>
                        <AlertDialogTrigger className="w-full">
                          <p className="hover:bg-gray-100 py-2 rounded-md text-black border-black border mt-2">
                            Oceni projekciju
                          </p>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-center">
                              Kako vam se dopala projekcija?
                            </AlertDialogTitle>
                            <div className="flex flex-col gap-4 items-center justify-center">
                              <div className="flex flex-row gap-2 items-center">
                                {stars.map((star, index) => (
                                  <button
                                    key={index}
                                    className="text-gray-200 transition-all duration-300"
                                    onClick={() => handleRating(index + 1)}
                                  >
                                    <Star 
                                      className={`h-10 w-10 hover:text-yellow-500 ${
                                        star.selected ? 'text-yellow-500 scale-110' : ''
                                      }`}
                                      fill={star.selected ? "#fdc700" : "none"}
                                    />
                                  </button>
                                ))}
                              </div>
                              <p className="text-sm text-gray-500">
                                {rating === 1 && "Loše"}
                                {rating === 2 && "Ispod proseka"}
                                {rating === 3 && "Prosečno"}
                                {rating === 4 && "Dobro"}
                                {rating === 5 && "Odlično"}
                              </p>
                            </div>
                            <Textarea
                              className="w-full mt-4"
                              placeholder="Napišite vaš komentar o filmu..."
                              id="comment"
                            />
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Odustani</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleNewReview({
                                  movieId: paidReservation.movie.movieId,
                                  rating: rating,
                                  comment: (document.getElementById("comment") as HTMLTextAreaElement)?.value || "",
                                })
                              }
                            >
                              Postavi ocenu
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {paidReservation.status === "Gledano" && 
                     hasUserReviewedMovie(paidReservation.movie.movieId) && (
                      <div className="w-full">
                        <p className="text-center py-2 rounded-md text-gray-500 border-gray-300 border mt-2">
                          Već ste ocenili ovaj film
                        </p>
                      </div>
                    )}
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger className="w-full" disabled={paidReservation.status === "Gledano"}>
                      <p className={`border-red-700 bg-red-500 py-2 rounded-md text-white mt-2 ${paidReservation.status === "Gledano" ?"opacity-50 cursor-not-allowed":""}`}>
                        Obrisi projekciju
                      </p>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ova akcija ne može biti poništena. Ovo će trajno
                          obrisati vašu rezervaciju.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Odustani</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(paidReservation.id)}
                        >
                          Da siguran sam
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {cancledReservations.length > 0 && (
        <>
         <CanceledReservations cancledReservations={cancledReservations} />
        </>
      )}
    </div>
  );
}
