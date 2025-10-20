import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  console.log("Booking ID:", id);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      const response = await axios.get(`/api/bookings/${id}`);
      setBooking(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch booking");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (event) => {
    const newStatus = event.target.value;
    if (!newStatus) return;

    setUpdating(true);
    setUpdateSuccess(false);

    try {
      const response = await axios.put(`/api/bookings/${id}`, {
        status: newStatus,
      });

      setBooking(response.data.data);
      setUpdateSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Booking Details
      </h2>

      {booking && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                User
              </label>
              <span className="text-gray-800">
                {booking.user?.name || "N/A"} ({booking.user?.email})
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Hotel
              </label>
              <span className="text-gray-800">
                {booking.hotel?.name || "N/A"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Rooms
              </label>
              <span className="text-gray-800">
                {booking.rooms?.map((room) => room.name).join(",") || "N/A"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Stay Duration
              </label>
              <span className="text-gray-800">
                {new Date(booking.startDate).toLocaleDateString()} -{" "}
                {new Date(booking.endDate).toLocaleDateString()}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Total Price
              </label>
              <span className="text-gray-800">${booking.totalPrice}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Status
              </label>
              <span className="capitalize text-gray-800">{booking.status}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Update Status
            </label>
            <div className="flex items-center gap-4">
              <select
                onChange={updateStatus}
                disabled={updating}
                defaultValue={booking.status}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              {updating && <span className="text-gray-600">Updating...</span>}
            </div>
            {updateSuccess && (
              <div className="mt-4 bg-green-50 text-green-700 px-4 py-2 rounded-md">
                Status updated successfully!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
