import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<List />} />
        <Route path="/hotels/:id" element={<Hotel />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/my-bookings/:id" element={<BookingDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/enter-reset-code" element={<EnterResetCode />} />
        <Route path="/verify-reset-code" element={<EnterResetCode />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
