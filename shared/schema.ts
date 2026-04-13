import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullname: text("fullname").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  age: integer("age"),
  phone: text("phone"),
  avatar: text("avatar"),
  address: text("address"),
});

export const orders = pgTable("orders", {
  id: integer("id").primaryKey(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  totalAmount: integer("total_amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("VND"),
  paymentMethod: varchar("payment_method", { length: 30 }).default("onepay"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

export const bookings = pgTable("bookings", {
  id: integer("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  totalPrice: integer("total_price").notNull(),
  movieTitle: text("movie_title"),
  cinemaName: text("cinema_name"),
  seatsText: text("seats_text"),
  showtime: timestamp("showtime"),
  ticketCode: varchar("ticket_code", { length: 50 }),
  ticketQrContent: text("ticket_qr_content"),
  ticketQrUrl: text("ticket_qr_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: integer("order_id").notNull(),
  bookingId: integer("booking_id"),
  provider: varchar("provider", { length: 20 }).notNull().default("onepay"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("VND"),
  merchTxnRef: varchar("merch_txn_ref", { length: 64 }).unique(),
  gatewayTransactionNo: varchar("gateway_transaction_no", { length: 50 }),
  responseCode: varchar("response_code", { length: 10 }),
  message: text("message"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const onepayTransactions = pgTable("onepay_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  merchTxnRef: varchar("merch_txn_ref", { length: 64 }).notNull().unique(),
  orderId: integer("order_id").notNull(),
  bookingId: integer("booking_id"),
  amount: integer("amount").notNull(),
  locale: varchar("locale", { length: 5 }).notNull().default("vn"),
  clientIp: varchar("client_ip", { length: 64 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  responseCode: varchar("response_code", { length: 10 }),
  transactionNo: varchar("transaction_no", { length: 50 }),
  message: text("message"),
  secureHashValid: varchar("secure_hash_valid", { length: 5 }).notNull().default("false"),
  gatewayUrl: text("gateway_url"),
  returnQuery: text("return_query"),
  ipnQuery: text("ipn_query"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  fullname: true,
  username: true,
  password: true,
});

export const updateProfileSchema = z.object({
  fullname: z.string().trim().min(3, "Full name must be at least 3 characters"),
  age: z.coerce.number().int().min(1, "Age must be at least 1").max(120, "Age must be at most 120"),
  phone: z.string().trim().min(8, "Phone must be at least 8 characters").max(20, "Phone must be at most 20 characters"),
  avatar: z
    .string()
    .trim()
    .url("Avatar must be a valid URL")
    .or(z.literal("")),
  address: z.string().trim().min(5, "Address must be at least 5 characters"),
});

export const createOnePayTransactionSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  bookingId: z.coerce.number().int().positive().optional(),
  amount: z.coerce.number().int().positive(),
  orderInfo: z.string().trim().min(3).max(255),
  locale: z.enum(["vn", "en"]).default("vn"),
  cardList: z.enum(["INTERNATIONAL", "DOMESTIC", "QR"]).optional(),
  returnBaseUrl: z.string().trim().url().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type CreateOnePayTransaction = z.infer<typeof createOnePayTransactionSchema>;
export type User = typeof users.$inferSelect;
export type OnePayTransaction = typeof onepayTransactions.$inferSelect;
