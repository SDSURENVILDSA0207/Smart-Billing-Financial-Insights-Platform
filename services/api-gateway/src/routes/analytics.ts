import { Router } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { roundCurrency } from "../utils/decimal";

const router = Router();

router.get("/", asyncHandler(async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "UNAUTHORIZED", "Unauthorized");

  const invoices = await prisma.invoice.findMany({
    where: { userId: req.userId },
    include: { customer: true }
  });

  const monthlyMap = new Map<string, { revenue: number; profit: number; count: number }>();
  const customerRevenue = new Map<string, { name: string; revenue: number; invoiceCount: number }>();

  const now = new Date();
  let overdueAmount = 0;
  let overdueCount = 0;

  for (const inv of invoices) {
    const key = `${inv.issueDate.getFullYear()}-${String(inv.issueDate.getMonth() + 1).padStart(2, "0")}`;
    const cur = monthlyMap.get(key) ?? { revenue: 0, profit: 0, count: 0 };
    cur.revenue += Number(inv.totalAmount);
    cur.profit += Number(inv.profitAmount);
    cur.count += 1;
    monthlyMap.set(key, cur);

    const cid = inv.customerId;
    const cr = customerRevenue.get(cid) ?? { name: inv.customer.name, revenue: 0, invoiceCount: 0 };
    cr.revenue += Number(inv.totalAmount);
    cr.invoiceCount += 1;
    customerRevenue.set(cid, cr);

    if (inv.status !== "PAID" && inv.dueDate < now) {
      overdueAmount += Number(inv.totalAmount) - Number(inv.paidAmount);
      overdueCount += 1;
    }
  }

  const monthlyTrend = Array.from(monthlyMap.entries())
    .map(([period, v]) => ({
      period,
      revenue: roundCurrency(v.revenue),
      profit: roundCurrency(v.profit),
      invoiceCount: v.count
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  const topCustomers = Array.from(customerRevenue.entries())
    .map(([customerId, c]) => ({
      customerId,
      name: c.name,
      revenue: roundCurrency(c.revenue),
      invoiceCount: c.invoiceCount
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  return res.json({
    monthlyTrend,
    topCustomers,
    overdue: {
      count: overdueCount,
      amountOutstanding: roundCurrency(overdueAmount)
    }
  });
}));

export default router;
