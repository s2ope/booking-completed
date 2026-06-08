import { api } from "../../api/axios.js";
import React, { useContext, useEffect, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import { showToast } from "../../helpers/ToastHelper";
import { AuthContext } from "../../context/AuthContext";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingBookingId, setCancelingBookingId] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/my-bookings" } });
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings/get");
        setBookings(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate, user]);

  const handleCancelBooking = async (bookingId) => {
    setCancelingBookingId(bookingId);
    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`);

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId ? response.data : booking
        )
      );
      showToast("Booking canceled successfully!", "success");
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to cancel booking",
        "error"
      );
    } finally {
      setCancelingBookingId(null);
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "canceled":
        return "bg-red-50 text-red-700";
      case "completed":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <Header type="list" />
        <div className="text-center text-gray-500 py-8">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <Header type="list" />
        <div className="text-center text-red-500 py-8">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="block mx-auto bg-gray-500 text-white px-4 py-2 rounded mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center text-gray-500">No bookings found</div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const bookingEmail = booking.user?.email || user?.email || "N/A";

              return (
                <div
                  key={booking._id}
                  className="bg-white shadow-md rounded-lg p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-5"
                >
                  <div>
                    <h2 className="text-xl font-semibold">
                      {booking.hotel?.name || "Hotel Details Unavailable"}
                    </h2>
                    <div className="text-gray-600 mt-2 space-y-1">
                      <p>Email: {bookingEmail}</p>
                      <p>Check-in: {format(new Date(booking.startDate), "PP")}</p>
                      <p>Check-out: {format(new Date(booking.endDate), "PP")}</p>
                      <p>
                        Rooms:{" "}
                        {booking.rooms
                          ?.map((room) => room.number || room.title)
                          .join(", ") || "N/A"}
                      </p>
                      <p>Total Price: ${booking.totalPrice}</p>
                      <p>
                        Status:{" "}
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold capitalize ${statusClass(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() => navigate(`/my-bookings/${booking._id}`)}
                    >
                      View Details
                    </button>
                    {["pending", "confirmed"].includes(booking.status) && (
                      <button
                        className={`${
                          cancelingBookingId === booking._id
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600"
                        } text-white px-4 py-2 rounded`}
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancelingBookingId === booking._id}
                      >
                        {cancelingBookingId === booking._id
                          ? "Canceling..."
                          : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
