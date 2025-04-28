import { z } from "zod";

export const profileSchema = z.object({
  username: z.string().min(1, "Korisničko ime je obavezno"),
  name: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Nevažeća email adresa"),
  phone: z.string().regex(/^\d+$/, "Telefon mora sadržati samo brojeve"),
  address: z.string().optional(),
  password: z.string().min(1, "Lozinka je obavezna"),
  genre: z.array(z.string()).default([]),
});

export const registerSchema = z.object({
  username: z.string().min(1, "Korisničko ime je obavezno"),
  name: z.string().min(1, "Ime je obavezno"),
  lastName: z.string().min(1, "Prezime je obavezno"),
  email: z.string().email("Nevažeća email adresa"),
  phone: z.string().regex(/^\d+$/, "Telefon mora sadržati samo brojeve"),
  address: z.string().min(1, "Adresa je obavezna"),
  password: z.string().min(6, "Lozinka mora imati najmanje 6 karaktera"),
  genre: z.array(z.string()).min(1, "Morate izabrati barem jedan žanr"),
});

export const reviewSchema = z.object({
  movieId: z.number().min(1, "ID filma je obavezan"),
  rating: z.number().min(1, "Ocena mora biti između 1 i 5").max(5, "Ocena mora biti između 1 i 5"),
  comment: z.string().min(1, "Komentar mora imati najmanje 1 karakter").max(500, "Komentar ne sme biti duži od 500 karaktera"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>; 