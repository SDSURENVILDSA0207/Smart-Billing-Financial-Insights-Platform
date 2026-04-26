import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";
import { fetchAssistantBrief } from "../services/pythonEngine";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { roundCurrency } from "../utils/decimal";

const router = Router();

router.post("/brief", asyncHandler(async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "UNAUTHORIZED", "Unauthorized");

  const schema = z.object({ question: z.string().max(2000).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, "INVALID_INPUT", "Invalid request", parsed.error.flatten());

  const invoices = await prisma.invoice.findMany({
    where: { userId: req.userId },
    take: 80,
    include: { customer: true },
    orderBy: { updatedAt: "desc" }
  });

  const totalRevenue = roundCurrency(invoices.reduce((s, i) => s + Number(i.totalAmount), 0));
  const totalProfit = roundCurrency(invoices.reduce((s, i) => s + Number(i.profitAmount), 0));
  const unpaid = invoices.filter((i) => i.status !== "PAID").length;
  const overdue = invoices.filter((i) => i.status !== "PAID" && i.dueDate < new Date()).length;

  const context = JSON.stringify({
    metrics: { totalRevenue, totalProfit, unpaidInvoices: unpaid, overdueInvoices: overdue },
    recent: invoices.slice(0, 12).map((i) => ({
      invoiceNumber: i.invoiceNumber,
      customer: i.customer.name,
      status: i.status,
      marginPercent: Number(i.marginPercent)
    }))
  });

  const brief = await fetchAssistantBrief({ context, question: parsed.data.question });

  return res.json(brief);
}));

export default router;
