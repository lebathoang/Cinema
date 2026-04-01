import axios from "axios";

const bookingApi = axios.create({
  baseURL: "http://localhost:5000/api",
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
    return error.response?.data?.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
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

export interface CheckoutPayload {
  showTimeId: number;
  seatIds: number[];
}

export interface CreatePaymentPayload {
  orderId: number;
  amount: number;
  provider?: string;
}

export interface ConfirmPaymentPayload {
  paymentId: number;
  orderId: number;
  seatIds: number[];
  transactionCode?: string;
}

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

export const checkoutOrder = async (payload: CheckoutPayload) => {
  try {
    const response = await bookingApi.post("/order/checkout", payload);
    return response.data as {
      success: boolean;
      orderId: number;
      totalPrice: number;
      paymentUrl?: string;
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create order"));
  }
};

export const createPayment = async (payload: CreatePaymentPayload) => {
  try {
    const response = await bookingApi.post("/payment/create", payload);
    return response.data as {
      success: boolean;
      paymentId: number;
      paymentUrl?: string;
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create payment"));
  }
};

export const confirmPayment = async (payload: ConfirmPaymentPayload) => {
  try {
    const response = await bookingApi.post("/payment/confirm", payload);
    return response.data as { success: boolean; message: string };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to confirm payment"));
  }
};
