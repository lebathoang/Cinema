import type { BookingStatus, PaymentQrPayload, TicketPayload } from "@/api/bookingApi";

const STORAGE_KEY = "cinema-bookings";

export interface StoredBooking {
  id: string;
  bookingId: number;
  orderId: number;
  paymentId: number | null;
  movieId: string;
  movieTitle: string;
  posterUrl: string | null;
  cinema: string;
  hall: string;
  seats: string[];
  showtime: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
  status: BookingStatus;
  payment: PaymentQrPayload | null;
  ticket: TicketPayload | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerAge?: number | null;
}

const canUseStorage = () => typeof window !== "undefined";

export const getStoredBookings = (): StoredBooking[] => {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const saveStoredBookings = (bookings: StoredBooking[]) => {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

export const upsertStoredBooking = (booking: StoredBooking) => {
  const bookings = getStoredBookings();
  const bookingIndex = bookings.findIndex((item) => item.id === booking.id);

  if (bookingIndex >= 0) {
    bookings[bookingIndex] = booking;
  } else {
    bookings.unshift(booking);
  }

  saveStoredBookings(bookings);
};

export const getStoredBookingById = (id: string) =>
  getStoredBookings().find((booking) => booking.id === id) ?? null;

export const getStoredBookingByOrderId = (orderId: number) =>
  getStoredBookings().find((booking) => booking.orderId === orderId) ?? null;

export const updateStoredBookingByOrderId = (
  orderId: number,
  updater: (booking: StoredBooking) => StoredBooking
) => {
  const bookings = getStoredBookings();
  const bookingIndex = bookings.findIndex((item) => item.orderId === orderId);

  if (bookingIndex === -1) {
    return null;
  }

  bookings[bookingIndex] = updater(bookings[bookingIndex]);
  saveStoredBookings(bookings);
  return bookings[bookingIndex];
};
