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

  const { data, loading, error } = useFetch("/api/hotels");

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const validateForm = () => {
    if (!hotelId) {
      showToast("error", "Please select a hotel");
      return false;
    }

    if (!rooms) {
      showToast("error", "Please enter room numbers");
      return false;
    }

    // Check if all required fields in info are filled
    for (const input of roomInputs) {
      if (input.required && !info[input.id]) {
        showToast("error", `Please fill in ${input.label}`);
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
      const roomNumbers = rooms
        .split(",")
        .map((room) => ({ number: room.trim() }))
        .filter((room) => room.number); // Remove empty entries

      await api.post(`/api/rooms/${hotelId}`, { ...info, roomNumbers });
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
      showToast("error", errorMessage);
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
