import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),

  password: z
    .string()
    .min(6, "Password phải >= 6 ký tự"),
});

export type LoginFormData = z.infer<typeof loginSchema>;