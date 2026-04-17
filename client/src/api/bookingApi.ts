import axios from "axios";
import { API_BASE_URL } from "./apiBaseUrl";

const bookingApi = axios.create({
  baseURL: API_BASE_URL,
});

bookingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.error || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const asArray = (value: unknown) => (Array.isArray(value) ? value : []);

const asNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);
    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return fallback;
};

const asString = (value: unknown, fallback = "") => {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
};

const pickFirst = <T>(...values: Array<T | null | undefined>) =>
  values.find((value) => value !== null && value !== undefined);

const shouldTryNextRequest = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const statusCode = error.response?.status;
  return statusCode === 400 || statusCode === 404 || statusCode === 422;
};

const normalizeStatus = (value: unknown): BookingStatus => {
  const normalizedValue = asString(value).toLowerCase();

  if (["paid", "completed", "success", "confirmed"].includes(normalizedValue)) {
    return "paid";
  }

  if (["failed", "cancelled", "canceled", "expired"].includes(normalizedValue)) {
    return "failed";
  }

  return "pending";
};

export interface SeatStatus {
  seatId: number;
  status: "selected" | "booked";
  expiresAt?: string | null;
  isMine?: boolean;
}

export interface SeatLayoutSeat {
  id: number;
  seat_row: string;
  seat_number: number;
  type: string;
  status: "available" | "selected" | "booked";
  expiresAt?: string | null;
  isMine?: boolean;
}

export interface HoldSeatsPayload {
  showTimeId: number;
  seatIds: number[];
}

export interface CreateBookingPayload {
  showTimeId: number;
  seatIds: number[];
  offerId?: number;
}

export interface CreateOnePayCheckoutPayload {
  orderId: number;
  bookingId?: number;
  amount: number;
  orderInfo: string;
  locale?: "vn" | "en";
  cardList?: "INTERNATIONAL" | "DOMESTIC" | "QR";
  returnBaseUrl?: string;
}

export type BookingStatus = "pending" | "paid" | "failed";

export interface PaymentQrPayload {
  paymentId: number | null;
  provider?: string | null;
  merchTxnRef?: string | null;
  transactionNo?: string | null;
  gatewayResponseCode?: string | null;
  gatewayMessage?: string | null;
  secureHashValid?: boolean | null;
  paidAt?: string | null;
  paymentUrl: string | null;
  bankName: string | null;
  bankCode: string | null;
  accountName: string | null;
  accountNumber: string | null;
  amount: number;
  expiresAt: string | null;
}

export interface TicketPayload {
  ticketCode: string | null;
  qrCodeUrl: string | null;
  qrCodeBase64: string | null;
  qrContent: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerAge?: number | null;
}

export interface BookingDetail {
  bookingId: number;
  orderId: number;
  status: BookingStatus;
  totalPrice: number;
  payment: PaymentQrPayload | null;
  ticket: TicketPayload | null;
  raw: any;
}

const normalizePaymentPayload = (payload: any, fallbackAmount = 0): PaymentQrPayload | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return {
    paymentId: asNumber(pickFirst(payload.paymentId, payload.id), 0) || null,
    provider: pickFirst(payload.provider, payload.gateway, payload.method) ?? null,
    merchTxnRef: pickFirst(payload.merchTxnRef, payload.transactionRef, payload.txnRef, payload.vpc_MerchTxnRef) ?? null,
    transactionNo: pickFirst(payload.transactionNo, payload.vpc_TransactionNo, payload.gatewayTransactionNo) ?? null,
    gatewayResponseCode: pickFirst(payload.gatewayResponseCode, payload.responseCode, payload.vpc_TxnResponseCode) ?? null,
    gatewayMessage: pickFirst(payload.gatewayMessage, payload.message, payload.responseMessage) ?? null,
    secureHashValid: typeof payload.secureHashValid === "boolean" ? payload.secureHashValid : null,
    paidAt: pickFirst(payload.paidAt, payload.completedAt, payload.successAt) ?? null,
    paymentUrl: pickFirst(payload.paymentUrl, payload.checkoutUrl, payload.checkout_url, payload.deeplink, payload.deepLink, payload.url) ?? null,
    bankName: pickFirst(payload.bankName, payload.bank_name, payload.provider) ?? null,
    bankCode: pickFirst(payload.bankCode, payload.bank_code, payload.bin) ?? null,
    accountName: pickFirst(payload.accountName, payload.account_name) ?? null,
    accountNumber: pickFirst(payload.accountNumber, payload.account_number) ?? null,
    amount: asNumber(pickFirst(payload.amount, payload.totalPrice), fallbackAmount),
    expiresAt: pickFirst(payload.expiresAt, payload.expiredAt, payload.expireAt) ?? null,
  };
};

const normalizeTicketPayload = (payload: any): TicketPayload | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return {
    ticketCode: pickFirst(payload.ticketCode, payload.code, payload.bookingCode, payload.id) ?? null,
    qrCodeUrl: pickFirst(payload.qrCodeUrl, payload.qrImageUrl, payload.qr_url, payload.ticketQrUrl, payload.ticket_qr_url) ?? null,
    qrCodeBase64: pickFirst(payload.qrCodeBase64, payload.qr_base64, payload.ticketQrBase64) ?? null,
    qrContent: pickFirst(payload.qrContent, payload.qr_content, payload.ticketQrContent) ?? null,
    customerName: pickFirst(payload.customerName, payload.fullname, payload.customer?.fullname, payload.customer?.name) ?? null,
    customerEmail: pickFirst(payload.customerEmail, payload.email, payload.customer?.email) ?? null,
    customerAge: (() => {
      const value = pickFirst(payload.customerAge, payload.age, payload.customer?.age);
      return value === null || value === undefined ? null : asNumber(value, 0);
    })(),
  };
};

const normalizeBookingDetail = (payload: any): BookingDetail => {
  const raw = payload?.data ?? payload;
  const booking = raw?.booking ?? raw?.order ?? raw ?? {};
  const payment = raw?.payment ?? raw?.paymentInfo ?? booking?.payment ?? null;
  const ticket = raw?.ticket ?? raw?.ticketInfo ?? booking?.ticket ?? null;

  const totalPrice = asNumber(
    pickFirst(raw?.totalPrice, raw?.total_amount, booking?.totalPrice, booking?.total_amount),
    0
  );

  return {
    bookingId: asNumber(pickFirst(raw?.bookingId, raw?.id, booking?.bookingId, booking?.id), 0),
    orderId: asNumber(pickFirst(raw?.orderId, booking?.orderId, booking?.id, raw?.id), 0),
    status: normalizeStatus(pickFirst(raw?.status, booking?.status, payment?.status)),
    totalPrice,
    payment: normalizePaymentPayload(payment, totalPrice),
    ticket: normalizeTicketPayload(ticket),
    raw,
  };
};

const requestFirstSuccess = async <T>(requests: Array<() => Promise<T>>) => {
  let lastError: unknown = null;

  for (const request of requests) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (!shouldTryNextRequest(error)) {
        break;
      }
    }
  }

  throw lastError;
};

export const getSeatStatuses = async (showTimeId: number) => {
  try {
    const response = await bookingApi.get(`/seat/status/${showTimeId}`);
    return response.data?.seats as SeatStatus[];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load seat statuses"));
  }
};

export const getSeatLayout = async (showTimeId: number) => {
  try {
    const response = await bookingApi.get(`/seat/layout/${showTimeId}`);
    return response.data as {
      success: boolean;
      room: {
        id: number;
        cinema_id: number;
        name: string;
        total_seats: number;
      };
      seats: SeatLayoutSeat[];
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load seat layout"));
  }
};

export const holdSeats = async (payload: HoldSeatsPayload) => {
  try {
    const response = await bookingApi.post("/seat/hold-seats", payload);
    return response.data as { success: boolean; message: string; expiresAt?: string };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to hold seats"));
  }
};

export const createPendingBooking = async (payload: CreateBookingPayload) => {
  try {
    const response = await bookingApi.post("/order/checkout", payload);
    return normalizeBookingDetail(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create booking"));
  }
};

export const createOnePayCheckout = async (payload: CreateOnePayCheckoutPayload) => {
  try {
    const response = await bookingApi.post("/onepay/create", payload);
    const rawPayment = response.data?.payment ?? response.data;

    return {
      paymentUrl: pickFirst(response.data?.paymentUrl, rawPayment?.paymentUrl, rawPayment?.gatewayUrl) ?? null,
      merchTxnRef: pickFirst(response.data?.merchTxnRef, rawPayment?.merchTxnRef) ?? null,
      provider: pickFirst(response.data?.provider, rawPayment?.provider) ?? "onepay",
      payment: normalizePaymentPayload(rawPayment, payload.amount),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create OnePay checkout"));
  }
};

export const getOnePayPaymentByTxnRef = async (merchTxnRef: string) => {
  try {
    const response = await bookingApi.get(`/onepay/payment/${merchTxnRef}`);
    return normalizePaymentPayload(response.data?.payment ?? response.data, 0);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load OnePay transaction"));
  }
};

export const getOnePayPaymentByOrderId = async (orderId: number) => {
  try {
    const response = await bookingApi.get(`/onepay/order/${orderId}`);
    return normalizePaymentPayload(response.data?.payment ?? response.data, 0);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load OnePay transaction"));
  }
};

export const getBookingDetail = async (bookingId: number) => {
  try {
    const response = await requestFirstSuccess([
      () => bookingApi.get(`/booking/${bookingId}`),
      () => bookingApi.get(`/order/${bookingId}`),
      () => bookingApi.get(`/booking/detail/${bookingId}`),
    ]);

    return normalizeBookingDetail((response as any).data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load booking"));
  }
};

export const getMyBookings = async () => {
  try {
    const response = await requestFirstSuccess([
      () => bookingApi.get("/booking/my-bookings"),
      () => bookingApi.get("/booking/history"),
      () => bookingApi.get("/order/history"),
      () => bookingApi.get("/booking/list"),
    ]);

    const items = asArray((response as any).data?.data ?? (response as any).data?.bookings ?? (response as any).data);
    return items.map((item) => normalizeBookingDetail(item));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load booking history"));
  }
};
