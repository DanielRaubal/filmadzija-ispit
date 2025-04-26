"use client";
import { Button } from "./button";
import { DoorOpen, Popcorn, ShoppingCart, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

interface CurrentUser {
  authenticated: boolean;
  username: string;
  password: string;
}

export default function Navbar() {
  const router = useRouter();
  const [status, setStatus] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const handleStatus = async () => {
    const userCurrent = localStorage.getItem("user-current");
    setStatus(userCurrent ? JSON.parse(userCurrent) : null);
    setIsLoading(false);
  };

  useEffect(() => {
    handleStatus();
  }, []);

  // Check authentication when route changes
  useEffect(() => {
    handleStatus();
    // if (!status?.authenticated && pathname == "/profile") {
    //   router.push("/");
    // }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user-current");
      await router.push("/");
      setStatus(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="border-b">
      <div className="container mx-auto py-2 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/filmadzija.jpg"
            width={521}
            height={512}
            alt="logo"
            className="h-10 w-10 grayscale-100 rounded-sm"
          />
          <p className="text-4xl font-extrabold">Filmadžija</p>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/search">
            <Button variant="outline" className="hover:cursor-pointer">
              Filmovi <Popcorn className="w-4 h-4 text-yellow-600" />
            </Button>
          </Link>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              {status?.authenticated ? (
                <Link href="/cart">
                  <Button variant="outline" className="hover:cursor-pointer">
                    Korpa <ShoppingCart className="w-4 h-4 text-yellow-600" />
                  </Button>
                </Link>
              ) : null}
              {status?.authenticated ? (
                <Link href="/reservations">
                  <Button variant="outline" className="hover:cursor-pointer">
                    Karte <Ticket className="w-4 h-4 text-yellow-600" />
                  </Button>
                </Link>
              ) : null}
              <div className="flex items-center gap-2 border pl-1 rounded-md">
                {status?.authenticated ? (
                  <Link href="/profile" className="py-1.5 px-2">
                    {status.username.slice(0, 10)}
                  </Link>
                ) : (
                  <Link href="/auth/login" className="py-1.5 px-2">
                    Login/Registracija
                  </Link>
                )}
                {status?.authenticated ? (
                  <Button
                    variant="default"
                    className="rounded-l-none"
                    onClick={handleLogout}
                  >
                    Logout <DoorOpen className="w-4 h-4" />
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
