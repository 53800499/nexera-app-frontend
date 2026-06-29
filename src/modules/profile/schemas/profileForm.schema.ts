import { z } from "zod";

export const profileInfoSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  firstName: z.string().trim().min(2, "Le prénom est requis"),
  lastName: z.string().trim().min(2, "Le nom est requis"),
});

export type ProfileInfoFormValues = z.infer<typeof profileInfoSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z.string().min(8, "8 caractères minimum"),
    confirmPassword: z.string().min(8, "8 caractères minimum"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
