import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, CircleDashed, CreditCard, ShieldAlert, Ticket, XCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getOnePayPaymentByOrderId, getOnePayPaymentByTxnRef } from "@/api/bookingApi";
import { getStoredBookingByOrderId, updateStoredBookingByOrderId } from "@/lib/bookingStore";
import { formatVndCurrency } from "@/lib/seatLayout";

const getQueryValue = (key: string) => new URLSearchParams(window.location.search).get(key);

export function OnePayResult() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState("");

  const orderId = Number(getQueryValue("orderId") || 0);
  const merchTxnRef = getQueryValue("merchTxnRef") || "";
  const statusFromQuery = getQueryValue("status") || "pending";
  const messageFromQuery = getQueryValue("message") || "";
  const successFromQuery = getQueryValue("success") === "true";
  const secureHashValid = getQueryValue("secureHashValid") === "true";

  useEffect(() => {
    const syncPaymentResult = async () => {
      try {
        let nextPayment = null;

        if (merchTxnRef) {
          nextPayment = await getOnePayPaymentByTxnRef(merchTxnRef);
        } else if (orderId > 0) {
          nextPayment = await getOnePayPaymentByOrderId(orderId);
        }

        const normalizedPayment = nextPayment || {
          provider: "onepay",
          amount: Number(getQueryValue("amount") || 0),
          gatewayMessage: messageFromQuery,
          secureHashValid,
          merchTxnRef,
          gatewayResponseCode: getQueryValue("responseCode"),
          paymentUrl: null,
          bankName: "OnePay",
          bankCode: null,
          accountName: null,
          accountNumber: null,
          expiresAt: null,
          paymentId: null,
          paidAt: successFromQuery ? new Date().toISOString() : null,
        };

        setPayment(normalizedPayment);

        if (orderId > 0) {
          const updatedBooking = updateStoredBookingByOrderId(orderId, (booking) => ({
            ...booking,
            status:
              normalizedPayment.gatewayResponseCode === "0" || successFromQuery
                ? "paid"
                : normalizedPayment.gatewayResponseCode === "F"
                  ? "pending"
                  : "failed",
            payment: {
              ...(booking.payment ?? {}),
              ...normalizedPayment,
              provider: "onepay",
            },
            updatedAt: new Date().toISOString(),
            ticket:
              normalizedPayment.gatewayResponseCode === "0" || successFromQuery
                ? booking.ticket ?? {
                    ticketCode: `TICKET-${booking.orderId}`,
                    qrContent: `BOOKING_${booking.orderId}`,
                    qrCodeUrl: null,
                    qrCodeBase64: null,
                    customerName: booking.customerName ?? null,
                    customerEmail: booking.customerEmail ?? null,
                    customerAge: booking.customerAge ?? null,
                  }
                : booking.ticket,
          }));

          if (updatedBooking && (normalizedPayment.gatewayResponseCode === "0" || successFromQuery)) {
            sessionStorage.removeItem("pending-booking");
            sessionStorage.removeItem("pending-booking-expires-at");
          }
        }
      } catch (nextError) {
        console.error(nextError);
        setError(nextError instanceof Error ? nextError.message : "Không thể tải kết quả giao dịch OnePay.");
      } finally {
        setLoading(false);
      }
    };

    syncPaymentResult();
  }, [messageFromQuery, merchTxnRef, orderId, secureHashValid, successFromQuery]);

  const booking = useMemo(() => (orderId > 0 ? getStoredBookingByOrderId(orderId) : null), [orderId, loading]);
  const isPaid = payment?.gatewayResponseCode === "0" || successFromQuery || payment?.status === "paid";
  const isPending = payment?.gatewayResponseCode === "F" || statusFromQuery === "pending";
  const title = isPaid ? "Thanh toán thành công" : isPending ? "Giao dịch đang xử lý" : "Thanh toán thất bại";
  const description =
    payment?.gatewayMessage ||
    messageFromQuery ||
    (isPaid
      ? "OnePay đã xác nhận giao dịch thành công."
      : isPending
        ? "OnePay đang xử lý giao dịch. Bạn có thể kiểm tra lại trong lịch sử booking."
        : "Giao dịch không được OnePay xác nhận thành công.");

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="container mx-auto px-4 pt-32">
        <div className="mx-auto max-w-3xl space-y-6">
          <Card className="rounded-[2rem] border-white/10 bg-card p-8">
            {loading ? (
              <div className="space-y-4 text-center">
                <CircleDashed className="mx-auto h-12 w-12 animate-spin text-primary" />
                <h1 className="text-4xl font-display uppercase tracking-tight text-white">Đang xác thực OnePay</h1>
                <p className="text-muted-foreground">Hệ thống đang đồng bộ trạng thái giao dịch từ backend.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  {isPaid ? (
                    <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
                  ) : isPending ? (
                    <CircleDashed className="mx-auto h-14 w-14 text-primary" />
                  ) : (
                    <XCircle className="mx-auto h-14 w-14 text-red-500" />
                  )}

                  <h1 className="text-4xl font-display uppercase tracking-tight text-white">{title}</h1>
                  <p className="text-muted-foreground">{description}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-background/40 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-white">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold uppercase tracking-wider">Payment Details</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Order ID</span>
                        <span className="text-white font-medium">#{orderId || "--"}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">OnePay Ref</span>
                        <span className="text-white font-medium text-right break-all">{merchTxnRef || "--"}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="text-white font-medium">{formatVndCurrency(payment?.amount || 0)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Response Code</span>
                        <span className="text-white font-medium">{payment?.gatewayResponseCode || getQueryValue("responseCode") || "--"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-background/40 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-white">
                      <ShieldAlert className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold uppercase tracking-wider">Verification</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Provider</span>
                        <span className="text-white font-medium uppercase">{payment?.provider || "onepay"}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Secure Hash</span>
                        <span className={secureHashValid || payment?.secureHashValid ? "font-medium text-green-500" : "font-medium text-red-500"}>
                          {secureHashValid || payment?.secureHashValid ? "Valid" : "Invalid"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Booking Status</span>
                        <span className="text-white font-medium uppercase">{booking?.status || statusFromQuery}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  {booking && isPaid ? (
                    <Button className="flex-1 rounded-2xl font-bold" onClick={() => setLocation(`/ticket/${booking.id}`)}>
                      <Ticket className="mr-2 h-4 w-4" />
                      VIEW TICKET
                    </Button>
                  ) : null}

                  <Link href="/bookings">
                    <Button variant="outline" className="w-full rounded-2xl border-white/10 text-white hover:bg-white/5 sm:w-auto">
                      BOOKING HISTORY
                    </Button>
                  </Link>

                  <Link href="/movies">
                    <Button variant="ghost" className="w-full rounded-2xl sm:w-auto">
                      BACK TO MOVIES
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
