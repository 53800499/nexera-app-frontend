import { z } from "zod";

export const TENANT_TYPE_VALUES = ["company", "cabinet"] as const;

export const signUpSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Adresse e-mail invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  tenantType: z.enum(TENANT_TYPE_VALUES),
  tenantName: z.string().min(2, "Le nom de l'organisation est requis"),
  acceptTerms: z.boolean().refine((value) => value, {
    message: "Vous devez accepter les conditions",
  }),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
