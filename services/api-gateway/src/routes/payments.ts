import { PaymentStatus } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { roundCurrency } from "../utils/decimal";

const router = Router();

router.get("/", asyncHandler(async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "UNAUTHORIZED", "Unauthorized");

  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const where: { userId: string; status?: PaymentStatus } = { userId: req.userId };
  if (status === "paid" || status === "unpaid" || status === "partial") {
    where.status = status === "paid" ? PaymentStatus.PAID : status === "unpaid" ? PaymentStatus.UNPAID : PaymentStatus.PARTIAL;
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: { customer: true },
    orderBy: { updatedAt: "desc" }
  });

  const items = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customerId: inv.customerId,
    customerName: inv.customer.name,
    totalAmount: Number(inv.totalAmount),
    paidAmount: Number(inv.paidAmount),
    balance: roundCurrency(Number(inv.totalAmount) - Number(inv.paidAmount)),
    status: inv.status,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    updatedAt: inv.updatedAt
  }));

  const summary = {
    totalCollected: roundCurrency(invoices.reduce((s, i) => s + Number(i.paidAmount), 0)),
    totalOutstanding: roundCurrency(invoices.reduce((s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0)),
    paidCount: invoices.filter((i) => i.status === "PAID").length,
    partialCount: invoices.filter((i) => i.status === "PARTIAL").length,
    unpaidCount: invoices.filter((i) => i.status === "UNPAID").length
  };

  return res.json({ summary, items });
}));

export default router;
