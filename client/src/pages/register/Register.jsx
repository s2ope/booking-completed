import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";
import { showToast } from "../../helpers/ToastHelper";
import axios from "axios";

const Register = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    email: "",
    password: "",
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
      return "Username must be 3-15 characters long and can only contain letters, numbers, and underscores.";
    }

    if (!emailRegex.test(email)) {
      return "Invalid email format.";
    }

    if (!passwordRegex.test(password)) {
      return "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.";
    }

    return null;
  };

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
      const res = await axios.post(
        "http://localhost:8800/api/auth/register",
        credentials
      );

      dispatch({ type: "REGISTER_SUCCESS", payload: res.data });
      showToast(
        "success",
        "Registration successful. Check your email for a verification code."
      );
      setIsVerificationStep(true);
    } catch (err) {
      dispatch({ type: "REGISTER_FAILURE", payload: err.response.data });
      showToast("error", err.response.data);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8800/api/auth/verify-email",
        { token: verificationToken }
      );
      showToast("success", res.data);
      navigate("/login");
    } catch (err) {
      showToast("error", err.response.data);
    }
  };

  const handleLoginNavigation = () => {
    navigate("/login");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          {!isVerificationStep ? (
            <form onSubmit={handleClick} className="space-y-4">
              <input
                type="text"
                placeholder="username"
                id="username"
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={credentials.username}
                autoComplete="username"
              />
              <input
                type="email"
                placeholder="email"
                id="email"
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={credentials.email}
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="password"
                id="password"
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={credentials.password}
                autoComplete="new-password"
              />
              <button
                disabled={loading}
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Register
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerification} className="space-y-4">
              <input
                type="text"
                placeholder="Verification Code"
                onChange={handleTokenChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={verificationToken}
              />
              <button
                disabled={loading}
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Verify
              </button>
            </form>
          )}
          {validationError && (
            <p className="mt-2 text-sm text-red-600">{validationError}</p>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600">{error.message}</p>
          )}
          <div className="mt-4 text-center">
            <span className="text-gray-600">Already have an account? </span>
            <button
              className="text-blue-600 hover:underline focus:outline-none"
              onClick={handleLoginNavigation}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
