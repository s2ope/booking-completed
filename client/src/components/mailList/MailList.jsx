import React, { useState } from "react";
import { api } from "../../api/axios";
import { showToast } from "../../helpers/ToastHelper";

const MailList = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    setMessage("");
    setError("");

    if (!validateEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/subscribe", { email: normalizedEmail });
      const successMessage = response.data?.message || "Subscribed successfully.";
      setMessage(successMessage);
      setEmail("");
      showToast(successMessage, "success");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Subscription failed. Please try again.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mail bg-[#003580] text-white flex flex-col items-center gap-5 pt-12 pb-12 px-6 sm:px-12 mt-12 w-full">
      <h1 className="mailTitle text-2xl font-semibold text-center">
        Save time, save money!
      </h1>
      <span className="mailDesc text-base text-center">
        Sign up and we'll send the best deals to you
      </span>
      <form
        className="mailInputContainer flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="h-10 w-full rounded-md border-none p-3 text-black sm:flex-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-10 w-full rounded-md bg-[#0071c2] px-5 font-medium text-white hover:bg-[#005fa3] disabled:bg-gray-400 sm:w-40"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {message && <p className="text-sm text-green-100">{message}</p>}
      {error && <p className="text-sm text-red-200">{error}</p>}
    </div>
  );
};

export default MailList;
