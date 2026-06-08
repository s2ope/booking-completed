import "./bookingRequests.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { showToast } from "../../helpers/ToastHelper";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Cancelled" },
];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

const formatRooms = (rooms = []) => {
  if (!rooms.length) return "N/A";

  return rooms
    .map((room) => [room.title, room.number ? `Room ${room.number}` : ""].filter(Boolean).join(" - "))
    .join(", ");
};

const getRecipientEmail = (request) => String(request.user?.email || "").trim();

const getApiMessage = (err, fallback) =>
  err.response?.data?.message || err.response?.data?.error || fallback;

const statusLabel = (status) =>
  status === "canceled" ? "cancelled" : status || "pending";

const BookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRequestId, setActiveRequestId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/booking-requests?status=all");
      setRequests(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load booking requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const upsertRequest = (booking) => {
    setRequests((prev) =>
      prev.map((request) => (request._id === booking._id ? booking : request))
    );
  };

  const handleAccept = async (bookingId) => {
    const request = requests.find((item) => item._id === bookingId);
    const visibleRecipient = request ? getRecipientEmail(request) : "";

    setActiveRequestId(bookingId);
    try {
      const response = await api.patch(`/admin/booking-requests/${bookingId}/accept`);
      const emailSentTo =
        response.data?.user?.email ||
        visibleRecipient;

      upsertRequest(response.data);
      showToast("Booking accepted. Sending confirmation email...", "info");

      try {
        const emailResponse = await api.post(
          `/admin/booking-requests/${bookingId}/accepted-email`
        );
        const sentTo =
          emailResponse.data?.emailSentTo ||
          emailResponse.data?.user?.email ||
          emailSentTo;

        if (emailResponse.data?.emailSent === false) {
          showToast(
            "Booking accepted, but the confirmation email could not be sent.",
            "warning"
          );
        } else {
          showToast(
            `Confirmation email sent${sentTo ? ` to ${sentTo}` : ""}.`,
            "success"
          );
        }
      } catch (emailErr) {
        showToast(
          getApiMessage(
            emailErr,
            "Booking accepted, but the confirmation email could not be sent."
          ),
          "warning"
        );
      }
    } catch (err) {
      showToast(getApiMessage(err, "Failed to accept booking."), "error");
    } finally {
      setActiveRequestId(null);
    }
  };

  const handleDecline = async (bookingId) => {
    setActiveRequestId(bookingId);
    try {
      const response = await api.patch(`/admin/booking-requests/${bookingId}/decline`);
      upsertRequest(response.data);
      showToast("Booking request declined.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to decline booking.", "error");
    } finally {
      setActiveRequestId(null);
    }
  };

  const statusCounts = requests.reduce(
    (counts, request) => ({
      ...counts,
      [request.status]: (counts[request.status] || 0) + 1,
    }),
    {}
  );
  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  return (
    <div className="bookingRequests">
      <Sidebar />
      <div className="bookingRequestsContainer">
        <Navbar />
        <div className="bookingRequestsContent">
          <div className="bookingRequestsHeader">
            <div>
              <h1>Bookings</h1>
              <span>Track pending, confirmed, completed, and cancelled bookings</span>
            </div>
            <button onClick={fetchRequests} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="bookingFilters" aria-label="Booking status filters">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={statusFilter === filter.value ? "active" : ""}
                onClick={() => setStatusFilter(filter.value)}
                disabled={loading}
              >
                {filter.label}
                <span>
                  {filter.value === "all"
                    ? requests.length
                    : statusCounts[filter.value] || 0}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="bookingRequestsState">Loading bookings...</div>
          ) : error ? (
            <div className="bookingRequestsState error">{error}</div>
          ) : filteredRequests.length === 0 ? (
            <div className="bookingRequestsState">
              No {statusFilter === "all" ? "" : statusLabel(statusFilter)} bookings found.
            </div>
          ) : (
            <div className="requestList">
              {filteredRequests.map((request) => {
                const busy = activeRequestId === request._id;
                const recipientEmail = getRecipientEmail(request);

                return (
                  <div className="requestRow" key={request._id}>
                    <div className="requestMain">
                      <div className="requestTitle">
                        <span>{request.hotel?.name || "Hotel unavailable"}</span>
                        <b>#{request._id?.slice(-8)}</b>
                        <em className={`statusBadge ${request.status}`}>
                          {statusLabel(request.status)}
                        </em>
                      </div>
                      <div className="requestMeta">
                        <span>{request.user?.username || "Guest"}</span>
                        <span className={recipientEmail ? "requestEmail" : "requestEmail missing"}>
                          {recipientEmail
                            ? `Email: ${recipientEmail}`
                            : "Email will be loaded from MongoDB"}
                        </span>
                        <span>
                          {formatDate(request.startDate)} to {formatDate(request.endDate)}
                        </span>
                      </div>
                      <div className="requestDetails">
                        <span>{formatRooms(request.rooms)}</span>
                        <span>${request.totalPrice}</span>
                        <span className={`paymentBadge ${request.paymentStatus || "unpaid"}`}>
                          Payment: {request.paymentStatus || "unpaid"}
                        </span>
                      </div>
                      {request.specialRequests && (
                        <p className="requestNote">{request.specialRequests}</p>
                      )}
                    </div>
                    <div className="requestActions">
                      {request.status === "pending" ? (
                        <>
                          <button
                            className="acceptButton"
                            onClick={() => handleAccept(request._id)}
                            disabled={busy}
                          >
                            {busy ? "Accepting..." : "Accept"}
                          </button>
                          <button
                            className="declineButton"
                            onClick={() => handleDecline(request._id)}
                            disabled={busy}
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className="readOnlyStatus">
                          {request.status === "confirmed"
                            ? "Accepted"
                            : statusLabel(request.status)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingRequests;
