import { api } from "../../api/axios.js";
import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";
import { showToast } from "../../helpers/ToastHelper";
import { sanitizeClarityPath, trackClarityEvent } from "../../utils/clarity";

import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState("");

  const { loading, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const clarityRedirectPath = sanitizeClarityPath(from);

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const validateInputs = () => {
    const { username, password } = credentials;

    if (username.length < 3) {
      trackClarityEvent("login_validation_error", {
        clarity_auth_method: "password",
        clarity_validation_reason: "username_too_short",
      });
      showToast("Username must be at least 3 characters long", "error");
      return false;
    }

    if (password.length < 8) {
      trackClarityEvent("login_validation_error", {
        clarity_auth_method: "password",
        clarity_validation_reason: "password_too_short",
      });
      showToast("Password must be at least 8 characters long", "error");
      return false;
    }

    return true;
  };

  // EMAIL LOGIN
  const handleClick = async (e) => {
    e.preventDefault();

    trackClarityEvent("login_attempt", {
      clarity_auth_method: "password",
      clarity_redirect_path: clarityRedirectPath,
    });

    if (!validateInputs()) return;

    dispatch({ type: "LOGIN_START" });

    try {
      const res = await api.post("/auth/login", credentials);

      dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });

      trackClarityEvent(
        "login_success",
        {
          clarity_auth_method: "password",
          clarity_redirect_path: clarityRedirectPath,
        },
        "login success",
      );
      showToast("Login successful!", "success");
      navigate(from);
    } catch (err) {
      trackClarityEvent("login_error", {
        clarity_auth_method: "password",
        clarity_error_status: err.response?.status || "unknown",
      });
      showToast(err.response?.data?.message || "Login failed!", "error");

      dispatch({
        type: "LOGIN_FAILURE",
        payload: err.response?.data?.message || "Login failed!",
      });
    }
  };

  // GOOGLE LOGIN
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      trackClarityEvent("login_attempt", {
        clarity_auth_method: "google",
        clarity_redirect_path: clarityRedirectPath,
      });
      dispatch({ type: "LOGIN_START" });

      const res = await api.post("/auth/google", {
        token: credentialResponse.credential,
      });

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: res.data.details,
      });

      trackClarityEvent(
        "login_success",
        {
          clarity_auth_method: "google",
          clarity_redirect_path: clarityRedirectPath,
        },
        "login success",
      );
      showToast("Google login successful!", "success");
      navigate(from);
    } catch (err) {
      trackClarityEvent("login_error", {
        clarity_auth_method: "google",
        clarity_error_status: err.response?.status || "unknown",
      });
      showToast(err.response?.data?.message || "Google login failed!", "error");

      dispatch({
        type: "LOGIN_FAILURE",
        payload: "Google login failed!",
      });
    }
  };

  const handleGoogleError = () => {
    trackClarityEvent("login_error", {
      clarity_auth_method: "google",
      clarity_error_status: "google_widget_error",
    });
    showToast("Google login failed!", "error");
  };

  // FORGOT PASSWORD
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    trackClarityEvent("password_reset_request_attempt", {
      clarity_auth_method: "email",
    });

    if (!email.includes("@")) {
      trackClarityEvent("password_reset_request_validation_error", {
        clarity_validation_reason: "invalid_email",
      });
      showToast("Please enter a valid email address.", "error");
      return;
    }

    try {
      await api.post("/auth/forgot-password", { email });

      trackClarityEvent("password_reset_request_success", {
        clarity_auth_method: "email",
      });
      showToast("Reset link sent! Check your email.", "success");
      navigate("/enter-reset-code");
    } catch (err) {
      trackClarityEvent("password_reset_request_error", {
        clarity_error_status: err.response?.status || "unknown",
      });
      showToast("Failed to send reset link. Try again!", "error");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-[300px] flex flex-col items-center p-5 bg-white rounded-lg shadow-md">
          {/* GOOGLE LOGIN */}
          {!isResetMode && (
            <div className="w-full mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />

              <div className="text-center my-3 text-gray-400 text-sm">OR</div>
            </div>
          )}

          {/* EMAIL LOGIN */}
          {!isResetMode ? (
            <form
              onSubmit={handleClick}
              className="w-full"
              data-clarity-mask="true"
            >
              <input
                type="text"
                placeholder="Username"
                id="username"
                onChange={handleChange}
                className="w-full mb-2.5 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={credentials.username}
              />

              <input
                type="password"
                placeholder="Password"
                id="password"
                onChange={handleChange}
                className="w-full mb-2.5 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={credentials.password}
              />

              <button
                disabled={loading}
                type="submit"
                data-clarity-event="login_button_click"
                data-clarity-label="Login form submit"
                className="w-full p-2.5 bg-blue-600 text-white rounded-md mb-2.5 hover:bg-blue-700 transition-colors"
              >
                Login
              </button>

              <button
                type="button"
                className="w-full text-blue-600 underline cursor-pointer"
                data-clarity-event="forgot_password_mode_click"
                data-clarity-label="Forgot password"
                onClick={() => setIsResetMode(true)}
              >
                Forgot Password?
              </button>
            </form>
          ) : (
            // RESET PASSWORD
            <form
              onSubmit={handleForgotPassword}
              className="w-full"
              data-clarity-mask="true"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full mb-2.5 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button
                disabled={loading}
                type="submit"
                data-clarity-event="password_reset_request_click"
                data-clarity-label="Reset password request"
                className="w-full p-2.5 bg-blue-600 text-white rounded-md mb-2.5 hover:bg-blue-700 transition-colors"
              >
                Reset Password
              </button>

              <button
                type="button"
                className="w-full text-blue-600 underline cursor-pointer"
                onClick={() => setIsResetMode(false)}
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
