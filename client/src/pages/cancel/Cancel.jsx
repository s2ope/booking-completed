import { useEffect } from "react";
import { trackClarityEvent } from "../../utils/clarity";

export default function Cancel() {
  useEffect(() => {
    trackClarityEvent("payment_cancelled", {
      clarity_payment_context: "standalone",
    });
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>❌ Payment Cancelled</h1>
      <p>You can try again anytime.</p>
    </div>
  );
}
