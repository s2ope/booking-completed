import React, { useState, useEffect } from "react";
import { api } from "../../api/axios";

import { showToast } from "../../helpers/ToastHelper";

const MailList = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(null);

  // Use useEffect to show toast when subscribed state changes
  useEffect(() => {
    if (subscribed) {
      showToast("Subscribed", "success");
    }
  }, [subscribed]);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  // Function to validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error before submission

    // Validate email format
    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    try {
      const response = await api.post("/api/subscribe", { email });
      setSubscribed(true);
      setEmail(""); // Clear input field after successful subscription
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        showToast("An error occurred. Please try again.", "error");
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="mail bg-[#003580] text-white flex flex-col items-center gap-5 pt-12 pb-12 px-12 mt-12 w-full">
      <h1 className="mailTitle text-2xl font-semibold text-center">
        Save time, save money!
      </h1>
      <span className="mailDesc text-base text-center">
        Sign up and we'll send the best deals to you
      </span>
      <form
        className="mailInputContainer flex items-center justify-center gap-4 mt-5"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleInputChange}
          required
          className="w-[300px] h-[40px] p-[10px] border-none rounded-md text-black"
        />
        <button
          type="submit"
          className="h-[40px] bg-[#0071c2] text-white font-medium border-none rounded-md cursor-pointer w-[150px]"
        >
          Subscribe
        </button>
      </form>
      {error && (
        <p className="errorMessage text-red-500 mt-3">Error: {error}</p>
      )}
    </div>
  );
};

export default MailList;
