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
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { User } from "@/app/types";

const loginSchema = z.object({
  username: z.string().min(1, "Korisničko ime je obavezno"),
  password: z.string().min(1, "Lozinka je obavezna"),
});

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    try {
      loginSchema.parse({ username, password });
      setErrors({});
      
      setIsLoading(true);
      try {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const user = users.find((u: User) => u.username === username && u.password === password);
        
        if (user) {
          localStorage.setItem(
            "user-current",
            JSON.stringify({
              username: username,
              password: password,
              authenticated: true,
            })
          );
          router.push("/");
        } else {
          toast.error("Pogrešno korisničko ime ili lozinka");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Došlo je do greške prilikom logovanja");
      } finally {
        setIsLoading(false);
      }
    } catch (error: any) {
      if (error.errors) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          formattedErrors[field] = err.message;
        });
        setErrors(formattedErrors);
        toast.error("Molimo ispravite greške u formi.");
      }
    }
  };

  return (
    <div className="container h-screen m-auto py-4 flex flex-col gap-4 justify-center items-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Ulogujte se u filmadžiju</CardTitle>
          <CardDescription>Hajde podaci na pregled!</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} disabled={isLoading}>
            {isLoading ? "Učitavanje..." : "Ulogujte se"}
          </Button>
        </CardFooter>
      </Card>
      <p className="text-xs">
        Nemate nalog?{" "}
        <Link href="/auth/register" className="text-yellow-500">
          Registrujte se
        </Link>
      </p>
    </div>
  );
}
