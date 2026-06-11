import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SearchContextProvider } from "./context/SearchContext";
import { AuthContextProvider } from "./context/AuthContext";
import { SavedHotelsContextProvider } from "./context/SavedHotelsContext";
import "../assets/global.css";
import ClarityInteractionTracker from "./components/clarity/ClarityInteractionTracker";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <SavedHotelsContextProvider>
        <SearchContextProvider>
          <ClarityInteractionTracker />
          <App />
        </SearchContextProvider>
      </SavedHotelsContextProvider>
    </AuthContextProvider>
  </React.StrictMode>,
);
