import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  rememberMe: z.boolean().optional(),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
