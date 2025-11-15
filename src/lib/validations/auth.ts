import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(64),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const requestResetSchema = z.object({ email: z.string().email() });
export const resetSchema = z.object({ token: z.string().min(10), password: z.string().min(8) });