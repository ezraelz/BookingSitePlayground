import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const PaymentReturnPage: React.FC = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "not_paid" | "error">("loading");
  const [message, setMessage] = useState<string>("Finalizing your payment…");

  useEffect(() => {
    const tx_ref = params.get("tx_ref");         // Chapa usually returns tx_ref
    // sometimes providers also append status, but we verify server-side anyway
    if (!tx_ref) {
      setStatus("error");
      setMessage("Missing tx_ref in URL.");
      return;
    }

    (async () => {
      try {
        // Server-side verify + flip bookings to APPROVED
        const res = await axios.post("/booking/payments/chapa/callback/", { tx_ref });
        const s = res.data?.status;
        if (s === "paid") {
          setStatus("success");
          setMessage("Payment successful! Your sessions are confirmed.");
        } else {
          setStatus("not_paid");
          setMessage("Payment not confirmed yet. If you were charged, contact support with your tx_ref.");
        }
      } catch (e: any) {
        console.error(e);
        setStatus("error");
        setMessage(e?.response?.data?.error || "Verification failed.");
      }
    })();
  }, [params]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin mx-auto h-10 w-10 border-b-2 border-emerald-600 rounded-full mb-4" />
            <h1 className="text-xl font-semibold text-gray-800 mb-2">{message}</h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <span className="text-emerald-700 text-2xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-x-3">
              <Link to="/" className="inline-block bg-emerald-600 text-white px-5 py-3 rounded-lg shadow hover:bg-emerald-700">
                Back Home
              </Link>
              <Link to="/my-bookings" className="inline-block bg-white border px-5 py-3 rounded-lg shadow hover:bg-gray-50">
                View My Bookings
              </Link>
            </div>
          </>
        )}

        {status === "not_paid" && (
          <>
            <div className="mx-auto h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
              <span className="text-yellow-700 text-2xl">!</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Pending</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link to="/" className="inline-block bg-white border px-5 py-3 rounded-lg shadow hover:bg-gray-50">
              Back Home
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <span className="text-red-700 text-2xl">×</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Error</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link to="/" className="inline-block bg-white border px-5 py-3 rounded-lg shadow hover:bg-gray-50">
              Back Home
            </Link>
          </>
        )}
      </div>
    </section>
  );
};

export default PaymentReturnPage;
