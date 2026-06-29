import { z } from "zod";

const baseUserFields = {
  email: z.string().email("Adresse e-mail invalide"),
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string()).optional(),
};

export const createUserFormSchema = z.object({
  ...baseUserFields,
  password: z
    .string()
    .min(8, "8 caractères minimum")
    .optional()
    .or(z.literal("")),
  requestPasswordReset: z.boolean().optional(),
});

export const updateUserFormSchema = z.object({
  ...baseUserFields,
  password: z
    .string()
    .min(8, "8 caractères minimum")
    .optional()
    .or(z.literal("")),
});

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;
export type UserFormValues = CreateUserFormValues;
