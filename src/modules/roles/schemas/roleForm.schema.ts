import { z } from "zod";

export const roleFormSchema = z.object({
  name: z.string().min(2, "Le nom est requis").max(100),
  code: z
    .string()
    .min(2, "Le code est requis")
    .max(50)
    .regex(
      /^[A-Z0-9_]+$/,
      "Code en majuscules, chiffres et underscores uniquement",
    ),
  description: z.string().max(500).optional().or(z.literal("")),
  permissionIds: z.array(z.string()).optional(),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
