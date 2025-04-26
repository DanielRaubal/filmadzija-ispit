import { Card } from "../card";
import Link from "next/link";
import { TicketX } from "lucide-react";
import Image from "next/image";
import { ReservationItem } from "@/app/types";

export default function CanceledReservations( {cancledReservations}: {cancledReservations: ReservationItem[]}) {
  return (
    <div>
      <div className="flex flex-row items-center gap-2 w-full border-b-2 mb-4">
        <TicketX className="inline text-red-600" />
        <h3 className="text-2xl font-bold">Otkazane karte</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
        {cancledReservations.map((canceledReservation, index) => (
          <Link
            href={`/search/${canceledReservation.movie.movieId}`}
            key={`canceled-${canceledReservation.id}-${index}`}
          >
            <Card className="shadow-lg p-0 relative h-full">
              <div className="absolute z-20 bg-red-800/10 rounded-md w-full h-full top-0 left-0" />
              <Image
                src={canceledReservation.movie.poster}
                alt={canceledReservation.movie.title}
                width={512}
                height={512}
                className="w-full rounded-t-md h-64 object-cover"
              />
              <div className="mt-2 flex flex-row gap-2 items-center absolute top-0 left-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md border border-red-600 text-xs font-medium bg-red-100 text-red-800">
                  Otkazano
                </span>
              </div>
              <div className="text-sm text-gray-600 p-4">
                <h3 className="text-lg font-semibold text-black">
                  {canceledReservation.cinema}
                </h3>

                <p>Datum: {canceledReservation.date}</p>
                <p>Vreme: {canceledReservation.time}</p>
                <p>Broj karata: {canceledReservation.quantity}</p>
                <p>Cena: {canceledReservation.price} RSD</p>
                <div className="flex flex-row items-center gap-1">
                  <div className="mt-2 flex flex-row gap-2 items-center">
                    {canceledReservation.paid && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm border border-green-600 text-xs font-medium bg-green-100 text-green-800">
                        Plaćeno
                      </span>
                    )}
                    {canceledReservation.paid && (
                      <p>
                        Vreme transakcije:{" "}
                        {new Date(
                          canceledReservation.createdAt
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 border-3 border-red-600 rounded-md border-dashed">
                  <p className="text-red-600 my-4 text-xl text-center">
                    Otkazana rezervacija
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
