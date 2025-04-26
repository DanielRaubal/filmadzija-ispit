"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Genre, Profile } from "@/app/types";
import { profileSchema } from "@/app/lib/validations";


export default function ProfilePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<Profile>({
    username: "",
    name: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    genre: [],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const userCurrentStr = localStorage.getItem("user-current");
      const users = JSON.parse(localStorage.getItem("users") || "[]");

      if (userCurrentStr) {
        const userCurrent = JSON.parse(userCurrentStr);
        const user = users.find((u: any) => 
          u.username === userCurrent.username && u.password === userCurrent.password
        );

        if (user) {
          setProfile((prevProfile) => ({
            ...prevProfile,
            ...user,
            // Ensure genre is always an array
            genre: Array.isArray(user.genre) ? user.genre : user.genre ? [user.genre] : [],
          }));
        }
      }
    };

    const fetchGenres = async () => {
      const response = await fetch("https://movie.pequla.com/api/genre");
      const data = await response.json();
      setGenres(data);
    };

    fetchGenres();
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      // Validate the profile data
      profileSchema.parse(profile);
      setErrors({});
      
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = users.map((user: any) => 
        user.username === profile.username ? profile : user
      );
      
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      localStorage.setItem(
        "user-current",
        JSON.stringify({
          username: profile.username,
          password: profile.password,
          authenticated: true,
        })
      );

      toast.success("Profil je ažuriran.");
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
        toast.error("Došlo je do greške prilikom čuvanja profila.");
      }
    }
  };

  const handleGenreSelect = (value: string) => {
    setProfile(prev => {
      const newGenres = prev.genre.includes(value)
        ? prev.genre.filter(g => g !== value)
        : [...prev.genre, value];
      return { ...prev, genre: newGenres };
    });
  };

  return (
    <div className="container p-4 md:p-0 md:py-4 min-h-screen mx-auto py-4 flex flex-col gap-4">
      <div className="flex flex-row items-center gap-2">
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="p-1 px-3 rounded-md text-xs bg-black text-white">
          gledalac
        </p>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <p>
          username: <span className="font-bold"></span>
        </p>
        <Input
          type="text"
          placeholder="username"
          value={profile.username}
          onChange={(e) => {
            setProfile({ ...profile, username: e.target.value });
            setErrors({ ...errors, username: "" });
          }}
          autoComplete="off"
          autoCorrect="off"
          className={errors.username ? "border-red-500" : ""}
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
      </div>
      <div className="flex flex-row gap-2 items-center">
        <p>
          password: <span className="font-bold"></span>
        </p>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="password"
          value={profile.password}
          onChange={(e) => {
            setProfile({ ...profile, password: e.target.value });
            setErrors({ ...errors, password: "" });
          }}
          autoComplete="new-password"
          autoCorrect="off"
          className={errors.password ? "border-red-500" : ""}
        />
        <Button type="button" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      <div className="flex flex-row items-center gap-2">
        <p>
          email: <span className="font-bold"></span>
        </p>
        <Input
          placeholder="email"
          type="email"
          value={profile.email}
          onChange={(e) => {
            setProfile({ ...profile, email: e.target.value });
            setErrors({ ...errors, email: "" });
          }}
          autoComplete="off"
          autoCorrect="off"
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
      <h1 className="text-2xl font-bold">Ostale informacije</h1>
      <div className="grid grid-cols-2 gap-2">
        <div className=" items-center">
          <p>ime</p>
          <Input
            type="text"
            placeholder="ime"
            value={profile.name}
            onChange={(e) => {
              setProfile({ ...profile, name: e.target.value });
            }}
          />
        </div>
        <div className=" items-center">
          <p>prezime</p>
          <Input
            type="text"
            placeholder="prezime"
            value={profile.lastName}
            onChange={(e) => {
              setProfile({ ...profile, lastName: e.target.value });
            }}
          />
        </div>
        <div className=" items-center">
          <p>adresa</p>
          <Input
            type="text"
            placeholder="adresa"
            value={profile.address}
            onChange={(e) => {
              setProfile({ ...profile, address: e.target.value });
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p>telefon</p>
          <Input
            type="text"
            placeholder="telefon"
            value={profile.phone}
            onChange={(e) => {
              setProfile({ ...profile, phone: e.target.value });
              setErrors({ ...errors, phone: "" });
            }}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <label>Omiljeni žanrovi</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.genre.map((g) => (
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
            <SelectTrigger>
              <SelectValue placeholder="Dodaj žanr" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem
                  key={genre.genreId}
                  value={genre.name}
                  disabled={profile.genre.includes(genre.name)}
                >
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="button" className="hover:cursor-pointer" onClick={handleSave}>
        Sacuvaj promene
      </Button>
    </div>
  );
}
