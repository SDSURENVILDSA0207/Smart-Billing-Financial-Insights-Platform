import { Router } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";
import { evaluateRisk } from "../services/pythonEngine";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { roundCurrency } from "../utils/decimal";

const router = Router();

router.get("/alerts", asyncHandler(async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "UNAUTHORIZED", "Unauthorized");

  const invoices = await prisma.invoice.findMany({
    where: { userId: req.userId },
    include: { customer: true }
  });

  const alerts = await Promise.all(
    invoices.map(async (invoice: (typeof invoices)[number]) => {
      const customerOutstanding = Number(invoice.totalAmount) - Number(invoice.paidAmount);
      const daysOverdue =
        invoice.status === "PAID"
          ? 0
          : Math.max(0, Math.floor((Date.now() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      const risk = await evaluateRisk({
        invoiceId: invoice.id,
        customerOutstanding: roundCurrency(customerOutstanding),
        marginPercent: roundCurrency(Number(invoice.marginPercent)),
        daysOverdue
      });
      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customer.name,
        ...risk
      };
    })
  );

  return res.json(alerts.filter((alert) => alert.level !== "LOW"));
}));

export default router;
