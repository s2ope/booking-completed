import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { GoogleOAuthProvider } from "@react-oauth/google";

import Home from "./pages/home/Home";
import List from "./pages/list/List";
import Hotel from "./pages/hotel/Hotel";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import ResetPassword from "./pages/reset/Reset";
import EnterResetCode from "./pages/resetCode/EnterResetCode";
import NotFoundPage from "./pages/notFound/notFound";
import MyBookings from "./pages/booking/Bookings";
import BookingDetails from "./pages/bookingDetails/bookingDetails";
import MyAccount from "./pages/account/MyAccount";
import Saved from "./pages/saved/Saved";
import Destination from "./pages/destination/Destination";
import PropertyType from "./pages/propertyType/PropertyType";
import Footer from "./components/footer/Footer";
import HomePayment from "./pages/homePayment/homePayment";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<List />} />
          <Route path="/hotels/:id" element={<Hotel />} />
          <Route path="/destinations/:city" element={<Destination />} />
          <Route path="/property-types/:type" element={<PropertyType />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-bookings/:id" element={<BookingDetails />} />
          <Route
            path="/my-bookings/:id/payment-success"
            element={<BookingDetails />}
          />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/enter-reset-code" element={<EnterResetCode />} />
          <Route path="/verify-reset-code" element={<EnterResetCode />} />
          <Route path="/testroute" element={<HomePayment />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <Footer />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
