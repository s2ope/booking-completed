import { api } from "../../api/axios";
import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";
import { showToast } from "../../helpers/ToastHelper";

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

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const validateInputs = () => {
    const { username, password } = credentials;
    if (username.length < 3) {
      showToast("Username must be at least 3 characters long", "error");
      return false;
    }
    if (password.length < 8) {
      showToast("Password must be at least 8 characters long", "error");
      return false;
    }
    return true;
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await api.post("/auth/login", credentials);
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });
      localStorage.setItem("token", res.data.token);
      showToast("Login successful!", "success");
      navigate(from);
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed!", "error");
      dispatch({ type: "LOGIN_FAILURE" });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    try {
      await api.post("/auth/forgot-password", {
        email,
      });
      showToast("Reset link sent! Check your email.", "success");
      navigate("/enter-reset-code");
    } catch (err) {
      showToast("Failed to send reset link. Try again!", "error");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-[300px] flex flex-col items-center p-5 bg-white rounded-lg shadow-md">
          {!isResetMode ? (
            <form onSubmit={handleClick} className="w-full">
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
                className="w-full p-2.5 bg-blue-600 text-white rounded-md mb-2.5 hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
              <button
                type="button"
                className="w-full text-blue-600 underline cursor-pointer"
                onClick={() => setIsResetMode(true)}
              >
                Forgot Password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="w-full">
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
