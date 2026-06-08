import { useState } from "react";
import { api } from "../../api/axios.js";

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function HomePayment({ booking, embedded = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isBookingPayment = Boolean(booking?._id);
  const hotelName = booking?.hotel?.name || "your booking";
  const amount = isBookingPayment ? booking.totalPrice : 25;

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError("");

      const response = isBookingPayment
        ? await api.post(`/checkout/bookings/${booking._id}/session`)
        : await api.post("/checkout/create-checkout-session", {
            productName: "Premium Plan",
            amount: 25,
            quantity: 1,
          });

      const data = response.data || {};
      if (!data.url) {
        throw new Error("Checkout URL was not returned from the server.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Payment could not be started."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={embedded ? styles.embeddedPage : styles.page}>
      <div style={embedded ? styles.embeddedPanel : styles.card}>
        <h1 style={embedded ? styles.embeddedTitle : styles.title}>
          {isBookingPayment ? "Complete Payment" : "Premium Plan"}
        </h1>
        <p style={styles.description}>
          {isBookingPayment
            ? `Pay securely with Stripe to confirm ${hotelName}.`
            : "Complete your payment securely with Stripe Checkout."}
        </p>

        <div style={embedded ? styles.embeddedPrice : styles.price}>
          {formatPrice(amount)}
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading
            ? "Opening checkout..."
            : `Pay ${formatPrice(amount)} with Stripe`}
        </button>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </section>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "#f6f7f9",
    fontFamily: "Arial, sans-serif",
  },
  embeddedPage: {
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "32px",
    borderRadius: "8px",
    background: "#ffffff",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
  },
  embeddedPanel: {
    width: "100%",
    maxWidth: "420px",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "28px",
    color: "#111827",
  },
  embeddedTitle: {
    margin: "0 0 8px",
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    margin: "0 0 24px",
    color: "#4b5563",
    lineHeight: 1.5,
  },
  price: {
    marginBottom: "24px",
    fontSize: "36px",
    fontWeight: "700",
    color: "#111827",
  },
  embeddedPrice: {
    marginBottom: "18px",
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
  },
  button: {
    width: "100%",
    padding: "14px 18px",
    border: "none",
    borderRadius: "6px",
    background: "#635bff",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
  },
  error: {
    marginTop: "16px",
    color: "#dc2626",
    fontSize: "14px",
  },
};
