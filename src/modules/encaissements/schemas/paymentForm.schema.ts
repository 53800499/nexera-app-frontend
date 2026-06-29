import { z } from "zod";

const imputationSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().min(0.01, "Montant invalide"),
});

export const paymentFormSchema = z
  .object({
    clientId: z.string().min(1, "Client obligatoire"),
    amount: z.number().min(0.01, "Montant obligatoire"),
    paymentMethod: z.enum(["wire", "check", "cash", "card", "other"]),
    allocationMode: z.enum(["fifo", "manual"]),
    currency: z.string().min(1),
    exchangeRate: z.number().min(0.0001),
    paymentDate: z
      .string()
      .min(1, "Date obligatoire")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
    reference: z.string().optional(),
    notes: z.string().optional(),
    imputations: z.array(imputationSchema),
  })
  .superRefine((values, ctx) => {
    if (values.allocationMode !== "manual") return;
    if (!values.imputations.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Saisissez au moins une imputation manuelle",
        path: ["imputations"],
      });
      return;
    }
    const total = values.imputations.reduce((sum, row) => sum + row.amount, 0);
    if (total > values.amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le total imputé dépasse le montant encaissé",
        path: ["imputations"],
      });
    }
  });

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
