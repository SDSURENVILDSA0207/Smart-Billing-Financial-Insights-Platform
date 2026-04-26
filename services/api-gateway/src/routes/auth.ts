import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

const router = Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/register", asyncHandler(async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, "INVALID_AUTH_INPUT", "Invalid auth payload", parsed.error.flatten());

  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "Email is already registered");
  }

  const user = await prisma.user.create({
    data: { email, passwordHash: password }
  });

  const token = jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: "7d" });
  return res.status(201).json({ token, user: { id: user.id, email: user.email } });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, "INVALID_AUTH_INPUT", "Invalid auth payload", parsed.error.flatten());
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.passwordHash !== password) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid credentials");
  }

  const token = jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: "7d" });
  return res.json({ token, user: { id: user.id, email: user.email } });
}));

export default router;
