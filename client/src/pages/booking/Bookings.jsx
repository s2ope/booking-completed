import { api } from "../../api/axios";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import { showToast } from "../../helpers/ToastHelper";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingBookingId, setCancelingBookingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const user = localStorage.getItem("user");
        if (!user) {
          setError("Authorization token is missing.");
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(user); // Parse the user object from localStorage
        const userId = parsedUser._id; // Extract _id from the parsed user object

        // console.log("Logged in User ID:", userId); // Debug log

        const response = await api.get("/api/bookings/get", {
          headers: {
            Authorization: `Bearer ${user}`,
          },
        });

        // console.log("Bookings Response:", response.data); // Debug log

        // Filter bookings to match the logged-in user's _id in the user field
        const filteredBookings = response.data.filter((booking) => {
          const bookingUserId = booking.user; // Now directly use the `user` string field
          // console.log("Booking User ID:", bookingUserId); // Debug log
          return bookingUserId === userId; // Compare the user._id with the logged-in user._id
        });

        setBookings(filteredBookings || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError(error?.response?.data?.message || "Failed to fetch bookings");
        setLoading(false);
        setBookings([]);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    setCancelingBookingId(bookingId);
    try {
      const user = localStorage.getItem("user");
      if (!user) {
        showToast("Authorization token is missing", "error");
        return;
      }
      const response = await api.patch(
        `/api/bookings/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user}`,
          },
        }
      );

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: response.data.status }
            : booking
        )
      );
    } catch (error) {
      console.error("Error canceling booking:", error);
      alert(error?.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelingBookingId(null);
    }
  };

  const handleCancelAndNavigate = (bookingId) => {
    handleCancelBooking(bookingId);
    showToast("Booking canceled successfully!", "info");

    navigate(`/my-bookings`);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-8">Loading bookings...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!Array.isArray(bookings)) {
    return (
      <div className="text-center text-gray-500 py-8">
        {showToast("No booking data available", "info")}
        No booking data available
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
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center"
              >
                <div>
                  <h2 className="text-xl font-semibold">
                    {booking.hotel?.name || "Hotel Details Unavailable"}
                  </h2>
                  <div className="text-gray-600 mt-2">
                    <p>Check-in: {format(new Date(booking.startDate), "PP")}</p>
                    <p>Check-out: {format(new Date(booking.endDate), "PP")}</p>
                    <p>Total Price: ${booking.totalPrice}</p>
                    <p>Status: {booking.status}</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => navigate(`/my-bookings/${booking._id}`)}
                  >
                    View Details
                  </button>
                  {booking.status === "pending" && (
                    <button
                      className={`${
                        cancelingBookingId === booking._id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600"
                      } text-white px-4 py-2 rounded`}
                      onClick={() => handleCancelAndNavigate(booking._id)}
                      disabled={cancelingBookingId === booking._id}
                    >
                      {cancelingBookingId === booking._id
                        ? "Canceling..."
                        : "Cancel Booking"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
