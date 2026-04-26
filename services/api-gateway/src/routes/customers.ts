import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

const router = Router();

router.post("/", asyncHandler(async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
  const schema = z.object({ name: z.string().min(2), email: z.string().email().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, "INVALID_CUSTOMER_INPUT", "Invalid customer payload", parsed.error.flatten());

  const customer = await prisma.customer.create({
    data: {
      ...parsed.data,
      totalOutstanding: 0
    }
  });
  return res.status(201).json(customer);
}));

router.get("/", asyncHandler(async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  const customers = await prisma.customer.findMany({
    ...(q
      ? {
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } }
            ]
          }
        }
      : {}),
    include: {
      invoices: {
        where: { userId: req.userId },
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const mapped = customers.map((customer: (typeof customers)[number]) => {
    const outstanding = customer.invoices.reduce((sum: number, invoice: (typeof customer.invoices)[number]) => {
      return sum + (Number(invoice.totalAmount) - Number(invoice.paidAmount));
    }, 0);
    return { ...customer, outstanding: Number(outstanding.toFixed(2)) };
  });
  return res.json(mapped);
}));

router.get("/:customerId", asyncHandler(async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "UNAUTHORIZED", "Unauthorized");

  const customer = await prisma.customer.findFirst({
    where: {
      id: req.params.customerId,
      invoices: { some: { userId: req.userId } }
    },
    include: {
      invoices: {
        where: { userId: req.userId },
        include: { items: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!customer) throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found");

  const outstanding = customer.invoices.reduce(
    (sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount)),
    0
  );

  return res.json({
    ...customer,
    outstanding: Number(outstanding.toFixed(2))
  });
}));

export default router;
