import { Router } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";
import { fetchInsights } from "../services/pythonEngine";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { roundCurrency } from "../utils/decimal";

const router = Router();

router.get("/", asyncHandler(async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "UNAUTHORIZED", "Unauthorized");

  const invoices = await prisma.invoice.findMany({ where: { userId: req.userId } });
  const totalRevenue = roundCurrency(invoices.reduce((sum: number, invoice: (typeof invoices)[number]) => sum + Number(invoice.totalAmount), 0));
  const totalProfit = roundCurrency(invoices.reduce((sum: number, invoice: (typeof invoices)[number]) => sum + Number(invoice.profitAmount), 0));
  const unpaidCount = invoices.filter((invoice: (typeof invoices)[number]) => invoice.status !== "PAID").length;
  const overdueCount = invoices.filter((invoice: (typeof invoices)[number]) => invoice.status !== "PAID" && invoice.dueDate < new Date()).length;

  const insights = await fetchInsights({ totalRevenue, totalProfit, unpaidCount, overdueCount });

  const recent = await prisma.invoice.findMany({
    where: { userId: req.userId },
    take: 6,
    orderBy: { updatedAt: "desc" },
    include: { customer: true }
  });

  const activity = recent.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customer.name,
    status: inv.status,
    totalAmount: Number(inv.totalAmount),
    paidAmount: Number(inv.paidAmount),
    updatedAt: inv.updatedAt
  }));

  return res.json({
    metrics: {
      totalRevenue,
      totalProfit,
      unpaidCount,
      overdueCount
    },
    insights,
    activity
  });
}));

export default router;
