import { createContext, useEffect, useReducer } from "react";

// Function to parse JSON safely
const parseJSON = (data) => {
  try {
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

// Initial state setup
const userFromLocalStorage = parseJSON(localStorage.getItem("user"));
const INITIAL_STATE = {
  user: userFromLocalStorage || null,
  loading: false,
  error: null,
  passwordResetStatus: null,
};

export const AuthContext = createContext(INITIAL_STATE);

// Reducer function
const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
      return {
        ...state,
        user: null,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        user: action.payload, // Keep the entire payload as user data
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
    case "REGISTER_FAILURE":
      return {
        ...state,
        user: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      localStorage.removeItem("user");
      return {
        ...state,
        user: null,
        loading: false,
        error: null,
      };
    case "FORGOT_PASSWORD_START":
      return {
        ...state,
        loading: true,
        error: null,
        passwordResetStatus: null,
      };
    case "FORGOT_PASSWORD_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
        passwordResetStatus: "Email sent successfully",
      };
    case "FORGOT_PASSWORD_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
        passwordResetStatus: "failed",
      };
    default:
      return state;
  }
};

// Auth context provider component
export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        passwordResetStatus: state.passwordResetStatus,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
