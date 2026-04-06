import axios from "axios";

const bookingApi = axios.create({
  baseURL: import.meta.env.VITE_CINEMA_API_BASE_URL || "http://localhost:5000/api",
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

export interface CreatePaymentPayload {
  orderId: number;
  amount: number;
  provider?: string;
}

export type BookingStatus = "pending" | "paid" | "failed";

export interface PaymentQrPayload {
  paymentId: number | null;
  qrCodeUrl: string | null;
  qrCodeBase64: string | null;
  qrContent: string | null;
  paymentUrl: string | null;
  bankName: string | null;
  bankCode: string | null;
  accountName: string | null;
  accountNumber: string | null;
  transferContent: string | null;
  amount: number;
  expiresAt: string | null;
}

export interface TicketPayload {
  ticketCode: string | null;
  qrCodeUrl: string | null;
  qrCodeBase64: string | null;
  qrContent: string | null;
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
    qrCodeUrl: pickFirst(payload.qrCodeUrl, payload.qr_url, payload.qr_image_url, payload.vietQrUrl, payload.qrImage, payload.qr, payload.dataURL) ?? null,
    qrCodeBase64: pickFirst(payload.qrCodeBase64, payload.qr_base64, payload.qrImageBase64, payload.vietQrBase64, payload.dataURL, payload.qrDataURL) ?? null,
    qrContent: pickFirst(payload.qrContent, payload.qr_content, payload.content, payload.vietQrContent, payload.rawQrContent, payload.raw_content, payload.addInfo) ?? null,
    paymentUrl: pickFirst(payload.paymentUrl, payload.checkoutUrl, payload.checkout_url, payload.deeplink, payload.deepLink, payload.url) ?? null,
    bankName: pickFirst(payload.bankName, payload.bank_name, payload.provider) ?? null,
    bankCode: pickFirst(payload.bankCode, payload.bank_code, payload.bin) ?? null,
    accountName: pickFirst(payload.accountName, payload.account_name) ?? null,
    accountNumber: pickFirst(payload.accountNumber, payload.account_number) ?? null,
    transferContent: pickFirst(payload.transferContent, payload.transfer_content, payload.transferNote, payload.transfer_note, payload.addInfo, payload.description) ?? null,
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
    qrCodeUrl: pickFirst(payload.qrCodeUrl, payload.qr_url, payload.ticketQrUrl, payload.ticket_qr_url) ?? null,
    qrCodeBase64: pickFirst(payload.qrCodeBase64, payload.qr_base64, payload.ticketQrBase64) ?? null,
    qrContent: pickFirst(payload.qrContent, payload.qr_content, payload.ticketQrContent) ?? null,
  };
};

const normalizeBookingDetail = (payload: any): BookingDetail => {
  const raw = payload?.data ?? payload;
  const booking = raw?.booking ?? raw?.order ?? raw ?? {};
  const payment = raw?.payment ?? raw?.paymentInfo ?? booking?.payment ?? null;
  const paymentWithVietQr =
    payment && typeof payment === "object"
      ? {
          ...payment,
          ...(payment.vietQr && typeof payment.vietQr === "object" ? payment.vietQr : {}),
        }
      : payment;
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
    payment: normalizePaymentPayload(paymentWithVietQr, totalPrice),
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

export const createPayment = async (payload: CreatePaymentPayload) => {
  try {
    const response = await bookingApi.post("/payment/create", payload);
    return normalizePaymentPayload(response.data?.data ?? response.data, payload.amount);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create payment"));
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

export const getPaymentStatus = async (orderId: number, paymentId?: number | null) => {
  try {
    const response = await requestFirstSuccess([
      () => bookingApi.get(`/payment/status/${orderId}`),
      () => bookingApi.get(`/order/${orderId}`),
      () => bookingApi.get(`/booking/${orderId}`),
      () => {
        if (!paymentId) {
          throw new Error("Missing payment id");
        }

        return bookingApi.get(`/payment/${paymentId}`);
      },
    ]);

    return normalizeBookingDetail((response as any).data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to check payment status"));
  }
};

export const simulateVietQrPayment = async (orderId: number) => {
  try {
    const response = await bookingApi.post(`/payment/simulate/${orderId}`);
    return normalizeBookingDetail(response.data?.result ?? response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to simulate payment"));
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
