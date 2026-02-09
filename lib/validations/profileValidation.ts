import { z } from "zod";

const nameRegex = /^[a-zA-Z\s]*$/;
const phoneRegex = /^[+]?[0-9\s-]*$/;
const zipRegex = /^\d*$/;

export const builderProfileSchema = z.object({
  first_name: z
    .string()
    .regex(nameRegex, "Name cannot contain numbers or symbols")
    .nullish()
    .or(z.literal("")),
  last_name: z
    .string()
    .regex(nameRegex, "Name cannot contain numbers or symbols")
    .nullish()
    .or(z.literal("")),
  nationality: z.string().nullish().or(z.literal("")),
  date_of_birth: z.string().nullish().or(z.literal("")),
  gender: z.string().nullish().or(z.literal("")),
  marital_status: z.string().nullish().or(z.literal("")),
  religion: z.string().nullish().or(z.literal("")),
  mother_tongue: z.string().nullish().or(z.literal("")),

  phone_number: z
    .string()
    .regex(phoneRegex, "Invalid phone number format")
    .nullish()
    .or(z.literal("")),
  whatsapp_number: z
    .string()
    .regex(phoneRegex, "Invalid phone number format")
    .nullish()
    .or(z.literal("")),
  address: z.string().nullish().or(z.literal("")),
  city: z.string().nullish().or(z.literal("")),
  zip_code: z
    .string()
    .regex(zipRegex, "Zip code must be numbers only")
    .nullish()
    .or(z.literal("")),

  education_history: z
    .array(
      z.object({
        level: z.string().nullish().or(z.literal("")),
        schoolName: z.string().nullish().or(z.literal("")),
        startDate: z.string().nullish().or(z.literal("")),
        endDate: z.string().nullish().or(z.literal("")),
        fieldOfStudy: z.string().nullish().or(z.literal("")),
        gpa: z.string().nullish().or(z.literal("")),
      }),
    )
    .nullish(),

  has_visited_china: z.boolean().nullish(),
  in_china_now: z.boolean().nullish(),

  passport_number: z.string().nullish().or(z.literal("")),
  passport_expiry: z.string().nullish().or(z.literal("")),
});

export const profileSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .regex(nameRegex, "Name cannot contain numbers or symbols"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .regex(nameRegex, "Name cannot contain numbers or symbols"),
  nationality: z.string().min(1, "Nationality is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  marital_status: z.string().optional(),
  religion: z.string().optional(),
  mother_tongue: z.string().optional(),

  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Invalid phone number format"),
  whatsapp_number: z
    .string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), {
      message: "Invalid phone number format",
    }),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zip_code: z
    .string()
    .optional()
    .refine((val) => !val || zipRegex.test(val), {
      message: "Zip code must be numbers only",
    }),

  education_history: z
    .array(
      z.object({
        level: z.string().min(1, "Degree level is required"),
        schoolName: z.string().min(1, "School name is required"),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().min(1, "End date is required"),
      }),
    )
    .min(1, "At least one education entry is required"),

  has_visited_china: z.boolean().optional(),
  in_china_now: z.boolean().optional(),

  passport_number: z.string().optional(),
  passport_expiry: z.string().optional(),
});

export type BuilderProfileValues = z.infer<typeof builderProfileSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
