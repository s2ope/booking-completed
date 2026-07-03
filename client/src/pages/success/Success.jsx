import { useEffect } from "react";
import { trackClarityEvent } from "../../utils/clarity";

export default function Success() {
  useEffect(() => {
    trackClarityEvent(
      "payment_success_page_viewed",
      {
        clarity_payment_context: "standalone",
      },
      "payment success",
    );
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>✅ Payment Successful</h1>
      <p>Thank you for your purchase.</p>
    </div>
  );
}
