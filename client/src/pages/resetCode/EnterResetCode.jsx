import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios.js";

import { showToast } from "../../helpers/ToastHelper";

const EnterResetCode = () => {
  const [resetCode, setResetCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!resetCode || resetCode.trim().length === 0) {
      showToast("Reset code cannot be empty.");
      setError("Reset code cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/api/auth/verify-reset-code", {
        token: resetCode,
      });

      if (response.status === 200) {
        navigate(`/reset-password?code=${resetCode}`);
      } else {
        showToast("Invalid reset code.");
        setError("Invalid reset code.");
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        showToast("An error occurred. Please try again.");
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Enter the Reset Code Sent to Your Email
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Reset Code"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors duration-200
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              }`}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-600 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default EnterResetCode;
