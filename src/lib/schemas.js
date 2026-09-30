import { z } from "zod";
import { isPassItem } from "@/lib/pricing_algo";

export const registrationSchema = z
  .object({
    // Form fields
    name: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email format"),
    gender: z.enum(["Male", "Female", "Other"], {
      errorMap: () => ({ message: "Please select a gender" }),
    }),

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
    accommodationDays: z.string().optional(),

    couponCode: z.string().optional(),

    id: z.string().optional(),
    workshopFee: z.number().optional(),
    accommodationFee: z.number().optional(),
    totalAmount: z.number().optional(),

    upiId: z.string().optional(),
    workshopTxnId: z.string().optional(),
    accomTxnId: z.string().optional(),

    workshopScreenshot: z.any().optional(),
    accommodationScreenshot: z.any().optional(),
    aadhaarScreenshot: z.any().optional(),

    registrationTime: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isIITP === "yes") {
      if (!data.rollNumber || data.rollNumber.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rollNumber"],
          message: "Roll Number is mandatory",
        });
        return;
      }
      if (!/^\d{4}[A-Z]{2}\d{2}$/.test(data.rollNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rollNumber"],
          message: "Enter a valid Roll Number",
        });
      }
    }
  });

export const flagshipTeamSchema = z.object({
  teamName: z.string().min(2, "Team name is required"),
  college: z.string().min(2, "College is required"),
  numMembers: z.string().or(z.number()),
  members: z.array(
    z.object({
      name: z.string().min(2, "Full name is required"),
      email: z.string().email("Invalid email format"),
      phone: z.string().regex(/^\d{10}$/, "Must be exactly 10 digits"),
      gender: z.enum(["Male", "Female", "Other"], {
        errorMap: () => ({ message: "Please select a gender" }),
      }),
      aadhaar: z
        .any()
        .refine((files) => files && files.length > 0, {
          message: "ID Document is required",
        })
        .refine(
          (files) => {
            if (!files || files.length === 0) return true;
            const file = files[0];
            const validTypes = ["image/jpeg", "image/jpg", "image/png"];
            return validTypes.includes(file.type);
          },
          { message: "Only PNG, JPG, or JPEG images are allowed" },
        ),
    }),
  ),
});

const teamMemberSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/),
  gender: z.enum(["Male", "Female", "Other"]),
  aadhaar: z.string().optional(),
});

const teamDetailsSchema = z.object({
  teamName: z.string().min(2),
  college: z.string().min(2),
  numMembers: z.string().or(z.number()),
  members: z.array(teamMemberSchema),
  registeredEmail: z.string().email().optional(),
  registeredUid: z.string().optional(),
  eventName: z.string().optional(),
  registrationTime: z.string().optional(),
});

const cartItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cost: z.number().nonnegative().optional(),
  quantity: z.number().int().positive().default(1),
  type: z.string().optional(),
  teamDetails: teamDetailsSchema.optional(),
});

const checkoutPayloadSchema = z.object({
  name: z.string().min(2, "Name is required").optional(),
  college: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  phone: z.string().regex(/^\d{10}$/, "Must be exactly 10 digits"),
  email: z.string().email().optional(),
  aadhaar: z.string().optional(),
});

export const orderRequestSchema = z
  .object({
    cart: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
    payload: checkoutPayloadSchema,
  })
  .superRefine((data, ctx) => {
    let ticketCount = 0;

    data.cart.forEach((item) => {
      const isTicket = isPassItem(item);
      if (isTicket) {
        ticketCount += item.quantity;
      }
    });

    if (ticketCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cart"],
        message: "Strict Limit: Only 1 ticket/pass is allowed per account.",
      });
    }

    const hasEvent = data.cart.some(
      (item) => item.type === "event" || String(item.id).startsWith("EVENT_"),
    );
    if (!hasEvent) {
      if (!data.payload.name || data.payload.name.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["payload", "name"],
          message: "Name is required",
        });
      }
      if (!data.payload.aadhaar) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["payload", "aadhaar"],
          message: "aadhaar is required",
        });
      }
      if (!data.payload.gender) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["payload", "gender"],
          message: "Gender is required",
        });
      }
    }
  });