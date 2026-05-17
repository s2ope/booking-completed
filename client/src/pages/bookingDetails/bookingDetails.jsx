import React, { useContext, useEffect, useState } from "react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/axios.js";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import { AuthContext } from "../../context/AuthContext";
import { showToast } from "../../helpers/ToastHelper";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: `/my-bookings/${id}` } });
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        const response = await api.get(`/bookings/${id}`);
        setBooking(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch booking");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id, navigate, user]);

  const handleCancel = async () => {
    setCanceling(true);
    try {
      const response = await api.patch(`/bookings/${id}/cancel`);
      setBooking(response.data);
      showToast("Booking canceled successfully!", "success");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to cancel booking",
        "error"
      );
    } finally {
      setCanceling(false);
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
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading booking...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <Header type="list" />
        <div className="max-w-3xl mx-auto mt-8 bg-red-50 text-red-600 p-4 rounded-md text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="max-w-4xl mx-auto p-4">
        <button
          onClick={() => navigate("/my-bookings")}
          className="mb-4 text-blue-600 hover:underline"
        >
          Back to My Bookings
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {booking.hotel?.name || "Booking Details"}
              </h2>
              <p className="text-gray-500 mt-1">
                Booking #{booking._id?.slice(-8)}
              </p>
            </div>
            <span
              className={`inline-flex w-fit rounded px-3 py-1 text-sm font-semibold capitalize ${statusClass(
                booking.status
              )}`}
            >
              {booking.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Check-in
              </label>
              <span className="text-gray-800">
                {format(new Date(booking.startDate), "PP")}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Check-out
              </label>
              <span className="text-gray-800">
                {format(new Date(booking.endDate), "PP")}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Hotel
              </label>
              <span className="text-gray-800">
                {booking.hotel?.name || "N/A"}
              </span>
              {(booking.hotel?.address || booking.hotel?.city) && (
                <p className="mt-1 text-sm text-gray-500">
                  {[booking.hotel?.address, booking.hotel?.city]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Total Price
              </label>
              <span className="text-gray-800">${booking.totalPrice}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">Rooms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {booking.rooms?.length ? (
                booking.rooms.map((room) => (
                  <div key={room._id || room.roomId} className="rounded-md border p-4">
                    <div className="font-medium">
                      {room.title || "Room details unavailable"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Room {room.number || "N/A"}
                    </div>
                    {room.maxPeople && (
                      <div className="text-sm text-gray-600">
                        Max people: {room.maxPeople}
                      </div>
                    )}
                    {room.price && (
                      <div className="text-sm text-gray-800 mt-2">
                        ${room.price} per night
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-md border p-4 text-gray-600">
                  Room details unavailable for this booking.
                </div>
              )}
            </div>
          </div>

          {booking.specialRequests && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-2">Special Requests</h3>
              <p className="text-gray-700">{booking.specialRequests}</p>
            </div>
          )}

          {["pending", "confirmed"].includes(booking.status) && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="bg-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                {canceling ? "Canceling..." : "Cancel Booking"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
