import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
      message: "Password must contain at least one letter and one number",
    }),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, { message: "Full name is required" })
    .min(2, { message: "Name must be at least 2 characters" }),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
      message: "Password must contain at least one letter and one number",
    }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
