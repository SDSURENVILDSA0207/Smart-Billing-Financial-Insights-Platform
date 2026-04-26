import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";
import { applyPayment, createInvoice } from "../services/invoiceService";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

const router = Router();

const invoiceSchema = z.object({
  customerId: z.string(),
  issueDate: z.string(),
  dueDate: z.string(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().nonnegative(),
      unitCost: z.number().nonnegative().default(0),
      taxRate: z.number().nonnegative().default(0),
      discount: z.number().nonnegative().default(0)
    })
  )
});

router.post("/", asyncHandler(async (req: AuthRequest, res) => {
  const parsed = invoiceSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, "INVALID_INVOICE_INPUT", "Invalid invoice payload", parsed.error.flatten());
  if (!req.userId) throw new AppError(401, "UNAUTHORIZED", "Unauthorized");

  const created = await createInvoice({ ...parsed.data, userId: req.userId });
  return res.status(201).json(created);
}));

router.get("/", asyncHandler(async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const status = typeof req.query.status === "string" ? req.query.status : undefined;

  const invoices = await prisma.invoice.findMany({
    where: {
      userId: req.userId,
      ...(status === "paid" || status === "unpaid" || status === "partial"
        ? {
            status: status === "paid" ? "PAID" : status === "unpaid" ? "UNPAID" : "PARTIAL"
          }
        : {}),
      ...(q
        ? {
            OR: [
              { invoiceNumber: { contains: q, mode: "insensitive" } },
              { customer: { name: { contains: q, mode: "insensitive" } } }
            ]
          }
        : {})
    },
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" }
  });
  return res.json(invoices);
}));

router.get("/:invoiceId", asyncHandler(async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
  const invoice = await prisma.invoice.findFirst({
    where: { id: req.params.invoiceId, userId: req.userId },
    include: { customer: true, items: true }
  });
  if (!invoice) throw new AppError(404, "INVOICE_NOT_FOUND", "Invoice not found");
  return res.json(invoice);
}));

router.patch("/:invoiceId/payment", asyncHandler(async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "UNAUTHORIZED", "Unauthorized");

  const schema = z.object({ paidAmount: z.number().nonnegative() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, "INVALID_PAYMENT_INPUT", "Invalid payment payload", parsed.error.flatten());

  const updated = await applyPayment({ invoiceId: req.params.invoiceId, userId: req.userId, paidAmount: parsed.data.paidAmount });
  return res.json(updated);
}));

export default router;
