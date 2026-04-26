import cors from "cors";
import express from "express";
import { env } from "./config/env";
import authRoutes from "./routes/auth";
import customerRoutes from "./routes/customers";
import invoiceRoutes from "./routes/invoices";
import dashboardRoutes from "./routes/dashboard";
import riskRoutes from "./routes/risk";
import analyticsRoutes from "./routes/analytics";
import paymentsRoutes from "./routes/payments";
import assistantRoutes from "./routes/assistant";
import { authMiddleware } from "./middleware/auth";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/customers", authMiddleware, customerRoutes);
app.use("/api/v1/invoices", authMiddleware, invoiceRoutes);
app.use("/api/v1/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/v1/risk", authMiddleware, riskRoutes);
app.use("/api/v1/analytics", authMiddleware, analyticsRoutes);
app.use("/api/v1/payments", authMiddleware, paymentsRoutes);
app.use("/api/v1/assistant", authMiddleware, assistantRoutes);
app.use("/auth", authRoutes);
app.use("/customers", authMiddleware, customerRoutes);
app.use("/invoices", authMiddleware, invoiceRoutes);
app.use("/dashboard", authMiddleware, dashboardRoutes);
app.use("/risk", authMiddleware, riskRoutes);
app.use("/analytics", authMiddleware, analyticsRoutes);
app.use("/payments", authMiddleware, paymentsRoutes);
app.use("/assistant", authMiddleware, assistantRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API Gateway running on ${env.port}`);
});
