import { z } from "zod";

export const profileSchema = z.object({
  fullname: z.string().trim().min(3, "Full name must be at least 3 characters"),
  age: z.coerce.number().int().min(1, "Age must be at least 1").max(120, "Age must be at most 120"),
  phone: z.string().trim().min(8, "Phone must be at least 8 characters").max(20, "Phone must be at most 20 characters"),
  avatar: z
    .string()
    .trim()
    .url("Avatar must be a valid URL")
    .or(z.literal("")),
  address: z.string().trim().min(5, "Address must be at least 5 characters"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
