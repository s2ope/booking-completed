import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { useContext, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../api/axios.js";

import { useNavigate } from "react-router-dom";
import { showToast } from "../../helpers/ToastHelper";

const Reserve = ({ setOpen, hotelId }) => {
  const [selectedRooms, setSelectedRooms] = useState([]);
  const { data, loading, error } = useFetch(`/api/hotels/room/${hotelId}`);
  const { dates, options } = useContext(SearchContext);
  const { user } = useContext(AuthContext);

  // Default values for dates if undefined
  const defaultStartDate = new Date();
  const defaultEndDate = new Date();
  defaultEndDate.setDate(defaultEndDate.getDate() + 1);

  const startDate = dates?.[0]?.startDate || defaultStartDate;
  const endDate = dates?.[0]?.endDate || defaultEndDate;

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const date = new Date(start.getTime());

    let dates = [];

    while (date <= end) {
      dates.push(new Date(date).getTime());
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const alldates = getDatesInRange(startDate, endDate);

  const isAvailable = (roomNumber) => {
    const isFound = roomNumber.unavailableDates.some((date) =>
      alldates.includes(new Date(date).getTime())
    );
    return !isFound;
  };

  const handleSelect = (e) => {
    const checked = e.target.checked;
    const value = e.target.value;
    setSelectedRooms(
      checked
        ? [...selectedRooms, value]
        : selectedRooms.filter((item) => item !== value)
    );
  };

  const navigate = useNavigate();

  const calculateTotalPrice = () => {
    // Calculate number of nights
    const nights = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );

    // Find total price for selected rooms
    const totalRoomPrice = selectedRooms.reduce((total, selectedRoomId) => {
      const room = data.find((item) =>
        item.roomNumbers.some((roomNumber) => roomNumber._id === selectedRoomId)
      );
      return total + (room ? room.price * nights : 0);
    }, 0);

    return totalRoomPrice;
  };

  const handleClick = async () => {
    // Validate user is logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Validate room selection
    if (selectedRooms.length === 0) {
      alert("Please select at least one room");
      return;
    }

    try {
      // Update room availability
      await Promise.all(
        selectedRooms.map((roomId) =>
          api.put(`/api/rooms/availability/${roomId}`, {
            dates: alldates,
          })
        )
      );

      // Create booking record
      const bookingData = {
        user: user._id,
        hotel: hotelId,
        rooms: selectedRooms,
        startDate: startDate,
        endDate: endDate,
        totalPrice: calculateTotalPrice(),
        status: "confirmed",
      };

      // Save booking to database
      await api.post("/api/bookings/create", bookingData);

      // Close modal and navigate
      setOpen(false);
      showToast("Booking completed successfully!", "info");
      navigate("/my-bookings");
    } catch (err) {
      console.error(
        "Error details:",
        err.response ? err.response.data : err.message
      );
      showToast("Failed to complete booking. Please try again.", "error");
    }
  };

  return (
    <div className="reserve w-full h-full bg-black bg-opacity-40 fixed top-0 left-0 flex items-center justify-center">
      <div className="rContainer bg-white p-5 relative">
        <FontAwesomeIcon
          icon={faCircleXmark}
          className="rClose absolute top-0 right-0 cursor-pointer"
          onClick={() => setOpen(false)}
        />
        <span className="block mb-5 text-xl">Select your rooms:</span>

        {data.length === 0 ? (
          <div>No rooms available</div>
        ) : (
          data.map((item) => (
            <div className="rItem flex items-center gap-12 p-5" key={item._id}>
              <div className="rItemInfo flex flex-col gap-2">
                <div className="rTitle font-medium">{item.title}</div>
                <div className="rDesc font-light">{item.desc}</div>
                <div className="rMax text-xs">
                  Max people: <b>{item.maxPeople}</b>
                </div>
                <div className="rPrice font-medium">${item.price}</div>
              </div>
              <div className="rSelectRooms flex flex-wrap gap-2 text-xs text-gray-500">
                {item.roomNumbers.map((roomNumber) => (
                  <div className="room flex flex-col" key={roomNumber._id}>
                    <label>{roomNumber.number}</label>
                    <input
                      type="checkbox"
                      value={roomNumber._id}
                      onChange={handleSelect}
                      disabled={!isAvailable(roomNumber)}
                      className="mr-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <button
          onClick={handleClick}
          className="rButton bg-[#0071c2] text-white font-bold cursor-pointer rounded-md w-full mt-5 px-6 py-2"
        >
          Reserve Now!
        </button>
      </div>
    </div>
  );
};

export default Reserve;
