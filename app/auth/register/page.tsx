"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Genre } from "@/app/types";
import { registerSchema } from "@/app/lib/validations";

export default function Register() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  

  const handleRegister = async () => {
    try {
      // Create user object for validation
      const userData = {
        username,
        password,
        email,
        name,
        lastName,
        address,
        phone,
        genre: selectedGenres
      };
      
      // Validate the user data
      registerSchema.parse(userData);
      setErrors({});
      
      // Get existing users or initialize empty array
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Check if username already exists
      if (existingUsers.some((user: any) => user.username === username)) {
        toast.error("Korisničko ime već postoji!");
        return;
      }

      // Add new user to array
      existingUsers.push(userData);
      localStorage.setItem("users", JSON.stringify(existingUsers));
      router.push("/auth/login");
    } catch (error: any) {
      if (error.errors) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          formattedErrors[field] = err.message;
        });
        setErrors(formattedErrors);
        toast.error("Molimo ispravite greške u formi.");
      } else {
        toast.error("Došlo je do greške prilikom registracije.");
      }
    }
  };

  useEffect(() => {
    const fetchGenres = async () => {
      const response = await fetch("https://movie.pequla.com/api/genre");
      const data = await response.json();
      setGenres(data);
    };

    fetchGenres();
  }, []);

  const handleGenreSelect = (value: string) => {
    setSelectedGenres(prev => {
      const newGenres = prev.includes(value)
        ? prev.filter(g => g !== value)
        : [...prev, value];
      
      // Clear genre error when a genre is added
      if (!prev.includes(value)) {
        setErrors(current => ({...current, genre: ""}));
      }
      
      return newGenres;
    });
  };

  return (
    <div className="container h-screen m-auto py-4 flex flex-col gap-4 justify-center items-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Registrujte se u filmadžiju</CardTitle>
          <CardDescription>Hajde podaci na pregled!</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Input
              type="text"
              placeholder="Ime"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({...errors, name: ""});
              }}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          
          <div>
            <Input
              type="text"
              placeholder="Prezime"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (errors.lastName) setErrors({...errors, lastName: ""});
              }}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
          </div>
          
          <div>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors({...errors, username: ""});
              }}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
          </div>
          
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({...errors, email: ""});
              }}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({...errors, password: ""});
              }}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
          
          <div>
            <Input
              type="text"
              placeholder="Adresa"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) setErrors({...errors, address: ""});
              }}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
          </div>
          
          <div>
            <Input
              type="text"
              placeholder="Telefon"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors({...errors, phone: ""});
              }}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>
          
          <div className="flex flex-col gap-2">
            <label>Omiljeni žanrovi</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedGenres.map((g) => (
                <div key={g} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm flex items-center gap-2">
                  {g}
                  <button
                    type="button"
                    onClick={() => handleGenreSelect(g)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <Select onValueChange={handleGenreSelect}>
              <SelectTrigger className={errors.genre ? "border-red-500" : ""}>
                <SelectValue placeholder="Dodaj žanr" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem
                    key={genre.genreId}
                    value={genre.name}
                    disabled={selectedGenres.includes(genre.name)}
                  >
                    {genre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.genre && <p className="text-red-500 text-sm">{errors.genre}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRegister}>Registrujte se</Button>
        </CardFooter>
      </Card>
      <p className="text-xs">
        Imate nalog i znate šifru?{" "}
        <Link href="/auth/login" className="text-yellow-500">
          Ulogujte se
        </Link>
      </p>
    </div>
  );
}
