import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import { useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../api/axios.js";
import { showToast } from "../../helpers/ToastHelper";

const Reserve = ({ setOpen, hotelId, searchState }) => {
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data, loading, error } = useFetch(`/hotels/room/${hotelId}`);
  const { dates: contextDates } = useContext(SearchContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const getValidDateRange = () => {
    const effectiveDates = searchState?.dates?.length
      ? searchState.dates
      : contextDates;
    const start = effectiveDates?.[0]?.startDate
      ? new Date(effectiveDates[0].startDate)
      : new Date();
    const end = effectiveDates?.[0]?.endDate
      ? new Date(effectiveDates[0].endDate)
      : new Date(start);

    if (end <= start) {
      end.setDate(start.getDate() + 1);
    }

    return { startDate: start, endDate: end };
  };

  const { startDate, endDate } = getValidDateRange();
  const rooms = Array.isArray(data) ? data.filter(Boolean) : [];

  const normalizeDate = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getDatesInRange = (start, end) => {
    const current = normalizeDate(start);
    const last = normalizeDate(end);
    const range = [];

    while (current < last) {
      range.push(new Date(current).getTime());
      current.setDate(current.getDate() + 1);
    }

    return range;
  };

  const stayDates = useMemo(
    () => getDatesInRange(startDate, endDate),
    [startDate, endDate]
  );

  const isAvailable = (roomNumber) => {
    const unavailableDates = roomNumber.unavailableDates || [];
    const isFound = unavailableDates.some((date) =>
      stayDates.includes(normalizeDate(date).getTime())
    );
    return !isFound;
  };

  const handleSelect = (e) => {
    const { checked, value } = e.target;
    setSelectedRooms((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const selectedRoomDetails = selectedRooms
    .map((selectedRoomId) => {
      const room = rooms.find((item) =>
        item.roomNumbers.some(
          (roomNumber) => String(roomNumber._id) === String(selectedRoomId)
        )
      );
      const roomNumber = room?.roomNumbers.find(
        (number) => String(number._id) === String(selectedRoomId)
      );

      return room && roomNumber ? { room, roomNumber } : null;
    })
    .filter(Boolean);

  const totalPrice = selectedRoomDetails.reduce(
    (total, { room }) => total + room.price * stayDates.length,
    0
  );

  const handleClick = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (selectedRooms.length === 0) {
      showToast("Please select at least one room.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/bookings/create", {
        hotel: hotelId,
        rooms: selectedRooms,
        startDate,
        endDate,
        specialRequests,
      });

      setOpen(false);
      showToast("Booking request submitted. The hotel will review it soon.", "success");
      navigate(`/my-bookings/${response.data._id}`);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Failed to complete booking. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reserve w-full h-full bg-black bg-opacity-40 fixed top-0 left-0 flex items-center justify-center z-50 px-4">
      <div className="rContainer bg-white p-5 relative rounded-md shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <FontAwesomeIcon
          icon={faCircleXmark}
          className="rClose absolute top-3 right-3 cursor-pointer text-xl text-gray-600"
          onClick={() => setOpen(false)}
        />
        <div className="mb-5 pr-8">
          <span className="block text-xl font-semibold">Select your rooms</span>
          <span className="text-sm text-gray-600">
            {format(startDate, "PP")} to {format(endDate, "PP")} ·{" "}
            {stayDates.length} night{stayDates.length > 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading rooms...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">
            Rooms could not be loaded.
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No rooms available</div>
        ) : (
          rooms.map((item) => (
            <div
              className="rItem flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12 p-4 border-b last:border-b-0"
              key={item._id}
            >
              <div className="rItemInfo flex flex-col gap-2 flex-1">
                <div className="rTitle font-medium">{item.title}</div>
                <div className="rDesc font-light text-sm">{item.desc}</div>
                <div className="rMax text-xs">
                  Max people: <b>{item.maxPeople}</b>
                </div>
                <div className="rPrice font-medium">${item.price} per night</div>
              </div>
              <div className="rSelectRooms flex flex-wrap gap-3 text-xs text-gray-500">
                {item.roomNumbers.map((roomNumber) => {
                  const roomId = String(roomNumber._id);
                  const available = isAvailable(roomNumber);

                  return (
                    <label
                      className={`room flex flex-col items-center gap-1 rounded border px-3 py-2 ${
                        available
                          ? "cursor-pointer border-gray-200"
                          : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
                      }`}
                      key={roomId}
                    >
                      <span>{roomNumber.number}</span>
                      <input
                        type="checkbox"
                        value={roomId}
                        checked={selectedRooms.includes(roomId)}
                        onChange={handleSelect}
                        disabled={!available}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))
        )}

        <div className="mt-5 space-y-3">
          <textarea
            value={specialRequests}
            onChange={(event) => setSpecialRequests(event.target.value)}
            placeholder="Special requests"
            className="w-full min-h-20 rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-700">
              {selectedRooms.length} room{selectedRooms.length === 1 ? "" : "s"}{" "}
              selected · Total:{" "}
              <span className="font-semibold text-gray-900">${totalPrice}</span>
            </div>
            <button
              onClick={handleClick}
              disabled={submitting || selectedRooms.length === 0}
              className="rButton bg-[#0071c2] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold cursor-pointer rounded-md px-6 py-2"
            >
              {submitting ? "Sending request..." : "Request Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reserve;
