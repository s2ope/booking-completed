import "./newRoom.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import { roomInputs } from "../../formSource";
import useFetch from "../../hooks/useFetch";
import { api } from "../../api/axios";
import { showToast } from "../../helpers/ToastHelper";

const NewRoom = () => {
  const [info, setInfo] = useState({});
  const [hotelId, setHotelId] = useState("");
  const [rooms, setRooms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error } = useFetch("/hotels");

  const parseRoomNumbers = () =>
    rooms
      .split(/[,\n]+/)
      .map((room) => Number(room.trim()))
      .filter((room) => Number.isFinite(room))
      .map((room) => ({ number: room }));

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const validateForm = () => {
    if (!hotelId) {
      showToast("Please select a hotel", "error");
      return false;
    }

    if (!rooms) {
      showToast("Please enter room numbers", "error");
      return false;
    }

    if (!parseRoomNumbers().length) {
      showToast("Please enter at least one valid room number", "error");
      return false;
    }

    // Check if all required fields in info are filled
    for (const input of roomInputs) {
      if (input.required && !info[input.id]) {
        showToast(`Please fill in ${input.label}`, "error");
        return false;
      }
    }

    return true;
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const roomNumbers = parseRoomNumbers();

      await api.post(`/rooms/${hotelId}`, {
        ...info,
        price: Number(info.price),
        maxPeople: Number(info.maxPeople),
        roomNumbers,
      });
      showToast("Room has been created successfully", "success");

      // Reset form
      setInfo({});
      setRooms("");
      setHotelId("");

      // Reset form inputs
      const formElement = e.target.closest("form");
      if (formElement) formElement.reset();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create room";
      showToast(errorMessage, "error");
      console.error("Error creating room:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return <div className="error">Error loading hotels: {error}</div>;
  }

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Add New Room</h1>
        </div>
        <div className="bottom">
          <div className="right">
            <form>
              {roomInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>
                    {input.label}
                    {input.required && <span className="required">*</span>}
                  </label>
                  <input
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                    onChange={handleChange}
                    value={info[input.id] || ""}
                    required={input.required}
                  />
                </div>
              ))}
              <div className="formInput">
                <label>Rooms*</label>
                <textarea
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="Enter room numbers separated by commas (e.g., 101, 102, 103)"
                  required
                />
                <DriveFolderUploadOutlinedIcon className="uploadIcon" />
              </div>
              <div className="formInput">
                <label>Choose a hotel*</label>
                <select
                  id="hotelId"
                  value={hotelId}
                  onChange={(e) => setHotelId(e.target.value)}
                  required
                >
                  <option value="">Select a hotel</option>
                  {loading ? (
                    <option disabled>Loading hotels...</option>
                  ) : (
                    Array.isArray(data) &&
                    data.map((hotel) => (
                      <option key={hotel._id} value={hotel._id}>
                        {hotel.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <button
                onClick={handleClick}
                disabled={isSubmitting}
                className={isSubmitting ? "disabled" : ""}
              >
                {isSubmitting ? "Creating..." : "Create Room"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRoom;
