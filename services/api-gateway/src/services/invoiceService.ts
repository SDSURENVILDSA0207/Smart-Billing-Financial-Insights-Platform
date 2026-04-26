import { PaymentStatus, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "../config/prisma";
import { calculateProfit } from "./pythonEngine";
import { AppError } from "../utils/appError";
import { roundCurrency } from "../utils/decimal";

type InvoiceItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  taxRate: number;
  discount: number;
};

type CreateInvoiceInput = {
  userId: string;
  customerId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItemInput[];
};

export async function createInvoice(input: CreateInvoiceInput) {
  const calcItems = input.items.map((item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const tax = itemSubtotal * (item.taxRate / 100);
    const lineTotal = roundCurrency(itemSubtotal + tax - item.discount);
    return { ...item, lineTotal };
  });

  const subtotal = roundCurrency(calcItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0));
  const taxAmount = roundCurrency(calcItems.reduce((acc, item) => acc + item.quantity * item.unitPrice * (item.taxRate / 100), 0));
  const discountAmount = roundCurrency(calcItems.reduce((acc, item) => acc + item.discount, 0));
  const totalAmount = roundCurrency(subtotal + taxAmount - discountAmount);

  const profitResult = await calculateProfit({
    invoiceId: randomUUID(),
    items: calcItems.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice, unitCost: i.unitCost }))
  });

  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
    if (!customer) {
      throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found");
    }

    const created = await tx.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        userId: input.userId,
        customerId: input.customerId,
        issueDate: new Date(input.issueDate),
        dueDate: new Date(input.dueDate),
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        status: PaymentStatus.UNPAID,
        costAmount: roundCurrency(profitResult.cost),
        profitAmount: roundCurrency(profitResult.profit),
        marginPercent: roundCurrency(profitResult.marginPercent),
        items: {
          create: calcItems
        }
      },
      include: { items: true, customer: true }
    });

    await tx.customer.update({
      where: { id: input.customerId },
      data: {
        totalOutstanding: { increment: new Prisma.Decimal(totalAmount) }
      }
    });

    return created;
  });
}

export async function applyPayment(input: { invoiceId: string; userId: string; paidAmount: number }) {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({ where: { id: input.invoiceId } });
    if (!invoice || invoice.userId !== input.userId) {
      throw new AppError(404, "INVOICE_NOT_FOUND", "Invoice not found");
    }

    const currentPaid = Number(invoice.paidAmount);
    const total = Number(invoice.totalAmount);
    const nextPaidAmount = roundCurrency(Math.min(total, currentPaid + input.paidAmount));
    const deltaPaid = roundCurrency(nextPaidAmount - currentPaid);
    const status = nextPaidAmount >= total ? PaymentStatus.PAID : nextPaidAmount > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID;

    const updated = await tx.invoice.update({
      where: { id: invoice.id },
      data: { paidAmount: nextPaidAmount, status }
    });

    if (deltaPaid > 0) {
      await tx.customer.update({
        where: { id: invoice.customerId },
        data: {
          totalOutstanding: { decrement: new Prisma.Decimal(deltaPaid) }
        }
      });
    }

    return updated;
  });
}
