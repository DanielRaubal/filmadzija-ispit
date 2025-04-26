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

export type ProfileFormData = z.infer<typeof profileSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>; 