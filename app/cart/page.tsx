"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Plus, Minus } from "lucide-react";
import {ReservationItem} from "@/app/types";

export default function Cart() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const existingReservationsJson =
        localStorage.getItem("user_reservations");
      let reservations: ReservationItem[] = [];
      const userCurrent =
        JSON.parse(localStorage.getItem("user-current") || "{}") || null;


      console.log(existingReservationsJson);

      if (existingReservationsJson) {
        try {
          reservations = JSON.parse(existingReservationsJson);
          // Filter reservations by current username and unpaid status
          reservations = reservations.filter(
            (item) => item.username === userCurrent.username && !item.paid && item.status === "Rezervisano"

          );
        } catch (error) {
          console.error("Error parsing reservations cookie:", error);
        }
      }
      setReservations(reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Došlo je do greške prilikom učitavanja rezervacija");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReservation = async (id: number) => {
    if (isDeleting) return;
  
    try {
      setIsDeleting(true);
      
      const existingReservationsJson = localStorage.getItem("user_reservations");
      let reservations = JSON.parse(existingReservationsJson || "[]");
      
      // Find the index of the reservation with the matching id
      const reservationIndex = reservations.findIndex(
        (reservation: ReservationItem) => reservation.id === id
      );
      
      // If found, change its status to "otkazano" instead of deleting
      if (reservationIndex !== -1) {
        reservations[reservationIndex].status = "Otkazano";
        localStorage.setItem("user_reservations", JSON.stringify(reservations));
        
        // Update the state by removing this reservation from the displayed list
        setReservations(prev => prev.filter(item => item.id !== id));
        toast.success(`Rezervacija uspešno otkazana`);
      } else {
        toast.error(`Rezervacija sa ID ${id} nije pronađena`);
      }
    } catch (error) {
      console.error("Error canceling reservation:", error);
      toast.error("Došlo je do greške prilikom otkazivanja rezervacije");
    } finally {
      setIsDeleting(false);
    }
  };

  const updateQuantity = async (id: number, newQuantity: number) => {
    if (isUpdating || newQuantity < 1) return;
    
    try {
      setIsUpdating(true);
      
      const existingReservationsJson = localStorage.getItem("user_reservations");
      let allReservations = JSON.parse(existingReservationsJson || "[]");
      
      // Find the reservation with the matching id
      const reservationIndex = allReservations.findIndex(
        (reservation: ReservationItem) => reservation.id === id
      );
      
      if (reservationIndex !== -1) {
        allReservations[reservationIndex].quantity = newQuantity;
        localStorage.setItem("user_reservations", JSON.stringify(allReservations));
        
        // Update the state with modified reservations
        setReservations(prev => 
          prev.map(item => 
            item.id === id ? {...item, quantity: newQuantity} : item
          )
        );
        
        toast.success("Broj karata uspešno ažuriran");
      } else {
        toast.error(`Rezervacija sa ID ${id} nije pronađena`);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Došlo je do greške prilikom ažuriranja");
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateTotal = () => {
    return reservations.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const payReservations = async () => {
    try {
      const userReservationsStr = localStorage.getItem("user_reservations");
      if (!userReservationsStr) {
        toast.error("Nema rezervacija za plaćanje");
        return;
      }
      const userReservations = JSON.parse(userReservationsStr);
      
      // Only process reservations that are not canceled
      const validReservations = userReservations.filter(
        (reservation: ReservationItem) => reservation.status !== "Otkazano"
      );
      
      if (validReservations.length === 0) {
        toast.error("Nema validnih rezervacija za plaćanje");
        return;
      }

      validReservations.forEach((reservation: ReservationItem) => {
        reservation.paid = true;
      });
      
      // Update only the valid reservations in localStorage
      const updatedReservations = userReservations.map((reservation: ReservationItem) => {
        const validReservation = validReservations.find((r: ReservationItem) => r.id === reservation.id);
        return validReservation || reservation;
      });
      
      localStorage.setItem("user_reservations", JSON.stringify(updatedReservations));
      
      toast.success("Rezervacije su uspešno placene");
      setReservations([]);
    } catch (error) {
      toast.error("Došlo je do greške prilikom plaćanja");
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Moja korpa</h1>

      {isLoading ? (
        <div className="text-center py-10">Učitavanje...</div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-10">
          <p className="mb-4">Vaša korpa je prazna</p>
          <Link href="/search">
            <Button>Pregledaj filmove</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-md shadow overflow-auto border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Film
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bioskop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vreme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Broj karata
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cena
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/search/${item.movie.movieId}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        {item.movie.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.cinema}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating}
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="min-w-[30px] text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.price * item.quantity} RSD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => deleteReservation(item.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 flex flex-row items-center justify-between border rounded-md shadow">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">
                Ukupno:{" "}
                <span className="text-xl font-bold text-yellow-600">
                  {calculateTotal()} RSD
                </span>
              </span>
            </div>
            <Button
              className="w-auto bg-yellow-500 hover:bg-yellow-600"
              onClick={payReservations}
            >
              Plati
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
