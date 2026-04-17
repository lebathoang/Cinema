import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createOnePayTransactionSchema, updateProfileSchema } from "@shared/schema";
import {
  buildOnePayReturnRedirectUrl,
  createOnePayCheckout,
  getOnePayTransactionByOrderId,
  getOnePayTransactionByTxnRef,
  handleOnePayGatewayReturn,
  handleOnePayIpn,
  normalizeOnePayTransactionForClient,
} from "./onepay";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.put("/api/auth/profile/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const payload = updateProfileSchema.parse(req.body);

      const updatedUser = await storage.updateUserProfile(id, payload);

      return res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/onepay/create", async (req, res, next) => {
    try {
      const payload = createOnePayTransactionSchema.parse(req.body);
      const clientIp = (req.headers["x-forwarded-for"] as string | undefined) || req.socket.remoteAddress || req.ip;
      const returnBaseUrl = typeof req.body?.returnBaseUrl === "string" ? req.body.returnBaseUrl : undefined;
      const result = await createOnePayCheckout(payload, { clientIp, returnBaseUrl });

      return res.json({
        message: "OnePay checkout created successfully",
        payment: normalizeOnePayTransactionForClient(result.transaction),
        paymentUrl: result.paymentUrl,
        merchTxnRef: result.merchTxnRef,
        provider: result.provider,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/onepay/return", async (req, res, next) => {
    try {
      const redirectTarget =
        typeof req.query.redirect === "string" && req.query.redirect.trim()
          ? req.query.redirect
          : `${process.env.APP_BASE_URL || "http://localhost:3000"}/payment/onepay/result`;

      const payload = await handleOnePayGatewayReturn(req.query as Record<string, unknown>);
      const transaction = normalizeOnePayTransactionForClient(payload.transaction);

      const redirectUrl = buildOnePayReturnRedirectUrl(redirectTarget, {
        provider: "onepay",
        success: payload.success,
        status: transaction?.status || "failed",
        orderId: transaction?.orderId ?? 0,
        bookingId: transaction?.bookingId ?? 0,
        merchTxnRef: transaction?.merchTxnRef ?? "",
        amount: transaction?.amount ?? 0,
        responseCode: payload.responseCode,
        message: payload.message,
        secureHashValid: payload.hashValid,
      });

      return res.redirect(302, redirectUrl);
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/onepay/ipn", async (req, res, next) => {
    try {
      const payload = await handleOnePayIpn(req.query as Record<string, unknown>);
      res.type("text/plain");
      return res.send(payload.responseText);
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/onepay/payment/:merchTxnRef", async (req, res, next) => {
    try {
      const transaction = await getOnePayTransactionByTxnRef(req.params.merchTxnRef);

      if (!transaction) {
        return res.status(404).json({ message: "OnePay transaction not found" });
      }

      return res.json({
        payment: normalizeOnePayTransactionForClient(transaction),
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/onepay/order/:orderId", async (req, res, next) => {
    try {
      const transaction = await getOnePayTransactionByOrderId(Number(req.params.orderId));

      if (!transaction) {
        return res.status(404).json({ message: "OnePay transaction not found" });
      }

      return res.json({
        payment: normalizeOnePayTransactionForClient(transaction),
      });
    } catch (error) {
      return next(error);
    }
  });

  return httpServer;
}
