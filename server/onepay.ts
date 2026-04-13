import crypto from "crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import {
  bookings,
  createOnePayTransactionSchema,
  onepayTransactions,
  orders,
  payments,
  type CreateOnePayTransaction,
  type OnePayTransaction,
} from "@shared/schema";

const ONEPAY_PAYMENT_URL = process.env.ONEPAY_PAYMENT_URL || "https://mtf.onepay.vn/paygate/vpcpay.op";
const ONEPAY_MERCHANT = process.env.ONEPAY_MERCHANT || "TESTONEPAY";
const ONEPAY_ACCESS_CODE = process.env.ONEPAY_ACCESS_CODE || "6BEB2546";
const ONEPAY_SECURE_SECRET = process.env.ONEPAY_SECURE_SECRET || "6D0870CDE5D40475";
const DEFAULT_APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";
const DEFAULT_API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const ONEPAY_RETURN_PATH = "/api/onepay/return";
const ONEPAY_IPN_PATH = "/api/onepay/ipn";

type ParamRecord = Record<string, string>;

const ONEPAY_RESPONSE_MESSAGES: Record<string, string> = {
  "0": "Giao dich thanh cong",
  "1": "Ngan hang tu choi giao dich",
  "3": "Merchant khong ton tai",
  "4": "Access code khong hop le",
  "5": "So tien khong hop le",
  "6": "Ma don hang khong hop le",
  "7": "Loi khong xac dinh",
  "8": "So the khong dung",
  "9": "Ten chu the khong dung",
  "A": "The het han",
  "D": "Giao dich bi tu choi",
  "F": "Giao dich dang duoc xu ly",
  "I": "Dia chi IP bi tu choi",
  "N": "The khong ho tro",
  "P": "Giao dich da duoc thanh toan",
  "R": "Giao dich bi hold review",
  "S": "Ngan hang dang bao tri",
  "T": "Giao dich khong hop le",
  "U": "Don hang khong ton tai",
  "V": "Xac thuc secure hash that bai",
  "99": "Loi khong xac dinh tu cong thanh toan",
};

const getResponseMessage = (code?: string | null) =>
  (code ? ONEPAY_RESPONSE_MESSAGES[code] : null) || "Khong xac dinh";

const padAmount = (amount: number) => String(Math.round(amount * 100));

const buildClientIp = (candidate?: string | null) => {
  if (!candidate) {
    return "127.0.0.1";
  }

  return candidate.split(",")[0]?.trim() || "127.0.0.1";
};

const sortParams = (params: ParamRecord) =>
  Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .sort()
    .reduce<ParamRecord>((accumulator, key) => {
      accumulator[key] = params[key];
      return accumulator;
    }, {});

const encodeParams = (params: ParamRecord) => new URLSearchParams(params).toString();

const buildHashData = (params: ParamRecord) => encodeParams(sortParams(params));

const buildSecureHash = (params: ParamRecord) => {
  const hashData = buildHashData(params);
  return crypto
    .createHmac("sha256", Buffer.from(ONEPAY_SECURE_SECRET, "utf8"))
    .update(hashData, "utf8")
    .digest("hex")
    .toUpperCase();
};

const buildGatewayUrl = (params: ParamRecord) => {
  const secureHash = buildSecureHash(params);
  const query = encodeParams({
    ...sortParams(params),
    vpc_SecureHash: secureHash,
  });

  return `${ONEPAY_PAYMENT_URL}?${query}`;
};

const sanitizeIncomingParams = (query: Record<string, unknown>) => {
  const normalized: ParamRecord = {};

  Object.entries(query).forEach(([key, value]) => {
    if (typeof value === "string") {
      normalized[key] = value;
    }
  });

  return normalized;
};

const safeCompareHash = (left: string, right: string) => {
  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(left), Buffer.from(right));
};

const verifyIncomingHash = (params: ParamRecord) => {
  const incomingHash = params.vpc_SecureHash || params.secureHash || "";
  const filteredParams = Object.keys(params).reduce<ParamRecord>((accumulator, key) => {
    const isGatewayParam = key.startsWith("vpc_") || key.startsWith("user_");

    if (isGatewayParam && key !== "vpc_SecureHash" && key !== "vpc_SecureHashType") {
      accumulator[key] = params[key];
    }

    return accumulator;
  }, {});

  const computedHash = buildSecureHash(filteredParams);
  const hashValid =
    incomingHash.length > 0 &&
    safeCompareHash(incomingHash.toUpperCase(), computedHash.toUpperCase());

  return {
    hashValid,
    incomingHash,
    computedHash,
  };
};

const isSuccessResponse = (responseCode?: string | null) => responseCode === "0";

const createMerchTxnRef = (orderId: number) =>
  `ORD${orderId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

const buildTicketCode = (bookingId: number, orderId: number) => `TICKET-${bookingId || orderId}`;

const syncPendingBusinessRows = async (payload: CreateOnePayTransaction, merchTxnRef: string) => {
  if (!db) {
    throw new Error("Database connection is not configured");
  }

  const now = new Date();

  await db
    .insert(orders)
    .values({
      id: payload.orderId,
      status: "pending",
      totalAmount: payload.amount,
      currency: "VND",
      paymentMethod: "onepay",
      note: payload.orderInfo,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: orders.id,
      set: {
        status: "pending",
        totalAmount: payload.amount,
        currency: "VND",
        paymentMethod: "onepay",
        note: payload.orderInfo,
        updatedAt: now,
      },
    });

  if (payload.bookingId) {
    await db
      .insert(bookings)
      .values({
        id: payload.bookingId,
        orderId: payload.orderId,
        status: "pending",
        totalPrice: payload.amount,
        movieTitle: payload.orderInfo,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: bookings.id,
        set: {
          orderId: payload.orderId,
          status: "pending",
          totalPrice: payload.amount,
          movieTitle: payload.orderInfo,
          updatedAt: now,
        },
      });
  }

  await db
    .insert(payments)
    .values({
      orderId: payload.orderId,
      bookingId: payload.bookingId ?? null,
      provider: "onepay",
      status: "pending",
      amount: payload.amount,
      currency: "VND",
      merchTxnRef,
      message: payload.orderInfo,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: payments.merchTxnRef,
      set: {
        orderId: payload.orderId,
        bookingId: payload.bookingId ?? null,
        provider: "onepay",
        status: "pending",
        amount: payload.amount,
        currency: "VND",
        message: payload.orderInfo,
        updatedAt: now,
      },
    });
};

const syncBusinessStatusFromOnePay = async (input: {
  orderId: number;
  bookingId?: number | null;
  merchTxnRef: string;
  amount?: number | null;
  responseCode: string;
  message: string;
  transactionNo?: string | null;
  success: boolean;
}) => {
  if (!db) {
    throw new Error("Database connection is not configured");
  }

  const now = new Date();
  const status = input.success ? "paid" : input.responseCode === "F" ? "pending" : "failed";

  await db
    .update(orders)
    .set({
      status,
      totalAmount: input.amount ?? undefined,
      paidAt: input.success ? now : null,
      updatedAt: now,
    })
    .where(eq(orders.id, input.orderId));

  if (input.bookingId) {
    await db
      .update(bookings)
      .set({
        status,
        totalPrice: input.amount ?? undefined,
        ticketCode: input.success ? buildTicketCode(input.bookingId, input.orderId) : null,
        ticketQrContent: input.success ? `BOOKING_${input.bookingId}` : null,
        paidAt: input.success ? now : null,
        updatedAt: now,
      })
      .where(eq(bookings.id, input.bookingId));
  }

  await db
    .update(payments)
    .set({
      status,
      amount: input.amount ?? undefined,
      gatewayTransactionNo: input.transactionNo || null,
      responseCode: input.responseCode,
      message: input.message,
      paidAt: input.success ? now : null,
      updatedAt: now,
    })
    .where(eq(payments.merchTxnRef, input.merchTxnRef));
};

export const createOnePayCheckout = async (
  payloadInput: CreateOnePayTransaction,
  requestMeta: { clientIp?: string | null; returnBaseUrl?: string | null } = {}
) => {
  if (!db) {
    throw new Error("Database connection is not configured");
  }

  const payload = createOnePayTransactionSchema.parse(payloadInput);
  const merchTxnRef = createMerchTxnRef(payload.orderId);
  const appBaseUrl = payload.returnBaseUrl || requestMeta.returnBaseUrl || DEFAULT_APP_BASE_URL;
  const apiBaseUrl = DEFAULT_API_BASE_URL;
  const clientIp = buildClientIp(requestMeta.clientIp);

  const onepayParams: ParamRecord = {
    Title: "Cinema Checkout",
    vpc_AccessCode: ONEPAY_ACCESS_CODE,
    vpc_Amount: padAmount(payload.amount),
    vpc_Command: "pay",
    vpc_Currency: "VND",
    vpc_Locale: payload.locale,
    vpc_MerchTxnRef: merchTxnRef,
    vpc_Merchant: ONEPAY_MERCHANT,
    vpc_OrderInfo: payload.orderInfo,
    vpc_ReturnURL: `${apiBaseUrl}${ONEPAY_RETURN_PATH}?redirect=${encodeURIComponent(`${appBaseUrl}/payment/onepay/result`)}`,
    vpc_CallbackURL: `${apiBaseUrl}${ONEPAY_IPN_PATH}`,
    vpc_TicketNo: clientIp,
    vpc_Version: "2",
  };

  if (payload.cardList) {
    onepayParams.vpc_CardList = payload.cardList;
  }

  const paymentUrl = buildGatewayUrl(onepayParams);
  await syncPendingBusinessRows(payload, merchTxnRef);

  const [transaction] = await db
    .insert(onepayTransactions)
    .values({
      merchTxnRef,
      orderId: payload.orderId,
      bookingId: payload.bookingId ?? null,
      amount: payload.amount,
      locale: payload.locale,
      clientIp,
      status: "pending",
      gatewayUrl: paymentUrl,
      message: payload.orderInfo,
    })
    .returning();

  return {
    transaction,
    paymentUrl,
    merchTxnRef,
    provider: "onepay" as const,
    expiresAt: null,
  };
};

const updateTransactionFromGateway = async (
  merchTxnRef: string,
  params: ParamRecord,
  source: "return" | "ipn"
) => {
  if (!db) {
    throw new Error("Database connection is not configured");
  }

  const { hashValid } = verifyIncomingHash(params);
  const responseCode = params.vpc_TxnResponseCode || params.txnResponseCode || "99";
  const success = hashValid && isSuccessResponse(responseCode);
  const status = success ? "paid" : responseCode === "F" ? "pending" : "failed";
  const now = new Date();
  const rawQuery = JSON.stringify(params);
  const payloadToUpdate =
    source === "return"
      ? {
          status,
          responseCode,
          transactionNo: params.vpc_TransactionNo || null,
          secureHashValid: hashValid ? "true" : "false",
          message: getResponseMessage(responseCode),
          paidAt: success ? now : null,
          returnQuery: rawQuery,
          updatedAt: now,
        }
      : {
          status,
          responseCode,
          transactionNo: params.vpc_TransactionNo || null,
          secureHashValid: hashValid ? "true" : "false",
          message: getResponseMessage(responseCode),
          paidAt: success ? now : null,
          ipnQuery: rawQuery,
          updatedAt: now,
        };

  const [transaction] = await db
    .update(onepayTransactions)
    .set(payloadToUpdate)
    .where(eq(onepayTransactions.merchTxnRef, merchTxnRef))
    .returning();

  if (transaction) {
    await syncBusinessStatusFromOnePay({
      orderId: transaction.orderId,
      bookingId: transaction.bookingId,
      merchTxnRef,
      amount: transaction.amount,
      responseCode,
      message: getResponseMessage(responseCode),
      transactionNo: params.vpc_TransactionNo || null,
      success,
    });
  }

  return {
    transaction,
    hashValid,
    responseCode,
    success,
    message: getResponseMessage(responseCode),
  };
};

export const handleOnePayGatewayReturn = async (query: Record<string, unknown>) => {
  const params = sanitizeIncomingParams(query);
  const merchTxnRef = params.vpc_MerchTxnRef || "";

  if (!merchTxnRef) {
    return {
      transaction: null,
      hashValid: false,
      responseCode: "99",
      success: false,
      message: "Khong tim thay ma giao dich",
    };
  }

  return updateTransactionFromGateway(merchTxnRef, params, "return");
};

export const handleOnePayIpn = async (query: Record<string, unknown>) => {
  const params = sanitizeIncomingParams(query);
  const merchTxnRef = params.vpc_MerchTxnRef || "";

  if (!merchTxnRef) {
    return {
      responseText: "responsecode=1&desc=missing-merch-txn-ref",
      payload: null,
    };
  }

  const payload = await updateTransactionFromGateway(merchTxnRef, params, "ipn");
  return {
    responseText: payload.hashValid ? "responsecode=1&desc=confirm-success" : "responsecode=0&desc=invalid-hash",
    payload,
  };
};

export const getOnePayTransactionByTxnRef = async (merchTxnRef: string): Promise<OnePayTransaction | undefined> => {
  if (!db) {
    return undefined;
  }

  const [transaction] = await db
    .select()
    .from(onepayTransactions)
    .where(eq(onepayTransactions.merchTxnRef, merchTxnRef))
    .limit(1);

  return transaction;
};

export const getOnePayTransactionByOrderId = async (orderId: number): Promise<OnePayTransaction | undefined> => {
  if (!db) {
    return undefined;
  }

  const [transaction] = await db
    .select()
    .from(onepayTransactions)
    .where(eq(onepayTransactions.orderId, orderId))
    .orderBy(desc(onepayTransactions.createdAt))
    .limit(1);

  return transaction;
};

export const normalizeOnePayTransactionForClient = (transaction: OnePayTransaction | undefined | null) => {
  if (!transaction) {
    return null;
  }

  return {
    id: transaction.id,
    merchTxnRef: transaction.merchTxnRef,
    orderId: transaction.orderId,
    bookingId: transaction.bookingId,
    status: transaction.status,
    amount: transaction.amount,
    provider: "onepay",
    paymentUrl: transaction.gatewayUrl,
    transactionNo: transaction.transactionNo,
    gatewayResponseCode: transaction.responseCode,
    gatewayMessage: transaction.message,
    paidAt: transaction.paidAt?.toISOString?.() ?? null,
    secureHashValid: transaction.secureHashValid === "true",
    createdAt: transaction.createdAt?.toISOString?.() ?? null,
    updatedAt: transaction.updatedAt?.toISOString?.() ?? null,
  };
};

export const buildOnePayReturnRedirectUrl = (redirectBaseUrl: string, query: Record<string, string | number | boolean | null>) => {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  return `${redirectBaseUrl}?${searchParams.toString()}`;
};
