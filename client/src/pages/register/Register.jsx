import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";
import { showToast } from "../../helpers/ToastHelper";
import { api } from "../../api/axios.js";

import { GoogleLogin } from "@react-oauth/google";

const Register = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    email: "",
    password: "",
    role: "buyer",
  });

  const [validationError, setValidationError] = useState(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [isVerificationStep, setIsVerificationStep] = useState(false);

  const { loading, error, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleTokenChange = (e) => {
    setVerificationToken(e.target.value);
  };

  const validateInputs = () => {
    const { username, email, password } = credentials;

    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    if (!usernameRegex.test(username)) {
      return "Username must be 3-15 characters long.";
    }

    if (!emailRegex.test(email)) {
      return "Invalid email format.";
    }

    if (!passwordRegex.test(password)) {
      return "Password must be strong (uppercase, lowercase, number, 8+ chars).";
    }

    return null;
  };

  // EMAIL REGISTER
  const handleClick = async (e) => {
    e.preventDefault();
    setValidationError(null);

    const validationError = validateInputs();
    if (validationError) {
      setValidationError(validationError);
      return;
    }

    dispatch({ type: "REGISTER_START" });

    try {
      const registrationData = {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        isAdmin: credentials.role === "seller",
      };

      const res = await api.post("/auth/register", registrationData);

      dispatch({ type: "REGISTER_SUCCESS" });

      showToast(res.data?.message || "Registration successful!", "success");

      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";

      dispatch({ type: "REGISTER_FAILURE", payload: message });

      showToast(message, "error");
    }
  };

  // GOOGLE REGISTER / LOGIN
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      dispatch({ type: "REGISTER_START" });

      const res = await api.post("/auth/google", {
        token: credentialResponse.credential,
      });

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: res.data.details,
      });

      showToast("Google signup/login successful!", "success");

      navigate("/");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Google authentication failed",
        "error",
      );

      dispatch({
        type: "REGISTER_FAILURE",
        payload: "Google auth failed",
      });
    }
  };

  const handleGoogleError = () => {
    showToast("Google signup failed!", "error");
  };

  // EMAIL VERIFICATION (unchanged)
  const handleVerification = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/verify-email", {
        token: verificationToken,
      });

      showToast(res.data, "success");
      navigate("/login");
    } catch (err) {
      showToast(err.response?.data?.message || "Verification failed", "error");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          {/* GOOGLE AUTH */}
          {!isVerificationStep && (
            <div className="mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />

              <div className="text-center my-3 text-gray-400 text-sm">OR</div>
            </div>
          )}

          {/* EMAIL REGISTER */}
          {!isVerificationStep ? (
            <form onSubmit={handleClick} className="space-y-4">
              <input
                type="text"
                placeholder="username"
                id="username"
                onChange={handleChange}
                value={credentials.username}
                className="w-full px-4 py-2 border rounded-md"
              />

              <input
                type="email"
                placeholder="email"
                id="email"
                onChange={handleChange}
                value={credentials.email}
                className="w-full px-4 py-2 border rounded-md"
              />

              <input
                type="password"
                placeholder="password"
                id="password"
                onChange={handleChange}
                value={credentials.password}
                className="w-full px-4 py-2 border rounded-md"
              />

              <select
                id="role"
                onChange={handleChange}
                value={credentials.role}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md"
              >
                Register
              </button>
            </form>
          ) : (
            // VERIFICATION
            <form onSubmit={handleVerification} className="space-y-4">
              <input
                type="text"
                placeholder="Verification Code"
                onChange={handleTokenChange}
                value={verificationToken}
                className="w-full px-4 py-2 border rounded-md"
              />

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md"
              >
                Verify
              </button>
            </form>
          )}

          {validationError && (
            <p className="text-red-600 text-sm mt-2">{validationError}</p>
          )}

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </>
  );
};

export default Register;
