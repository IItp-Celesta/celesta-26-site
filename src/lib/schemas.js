import { z } from "zod";

export const invoiceSchema = z.object({
  transaction_id: z.string(),
  item_id: z.string(),
  qty: z.number(),
});

export const registrationSchema = z
  .object({
    // Form fields
    name: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().regex(/^\d{10}$/, "Must be exactly 10 digits"),
    college: z.string().min(2, "Institute name is required"),
    cityState: z.string().min(2, "City/State is required"),
    workshop: z.string().min(1, "Please select a workshop"),

    isIITP: z.enum(["yes", "no"], {
      required_error: "Please specify IITP status",
    }),

    rollNumber: z
      .string()
      .transform((value) => value.toUpperCase())
      .optional(),

    requireAccommodation: z.enum(["yes", "no"]).default("no"),

    id: z.string().optional(),
    amountPaid: z.number().optional(),
    upiId: z.string().optional(),
    screenshot: z.string().optional(),
    registrationTime: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isIITP === "yes") {
      // Required
      if (!data.rollNumber || data.rollNumber.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rollNumber"],
          message: "Roll Number is mandatory",
        });
        return;
      }

      // Format: 2401ES09
      if (!/^\d{4}[A-Z]{2}\d{2}$/.test(data.rollNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rollNumber"],
          message: "Enter a valid Roll Number",
        });
      }
    }
  });
