import "./newHotel.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import { hotelInputs } from "../../formSource";
import useFetch from "../../hooks/useFetch";
import { api } from "../../api/axios";
import { showToast } from "../../helpers/ToastHelper";

const API_KEY = import.meta.env.VITE_CLOUDINARY_API_URL;

const NewHotel = () => {
  const [files, setFiles] = useState("");
  const [info, setInfo] = useState({ featured: false });
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data, loading, error } = useFetch("/api/rooms");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setInfo((prev) => ({
      ...prev,
      [id]: id === "featured" ? value === "true" : value, // Ensure boolean value for featured
    }));
  };

  const handleSelect = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setRooms(value);
  };

  const validateForm = () => {
    for (const input of hotelInputs) {
      if (input.required && !info[input.id]) {
        showToast("error", `Please fill in ${input.label}`);
        return false;
      }
    }

    if (!files || !files.length) {
      showToast("error", "Please select at least one image");
      return false;
    }

    return true;
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const list = await Promise.all(
        Object.values(files).map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", "upload");

          try {
            const uploadRes = await api.post(API_KEY, data);
            const { url } = uploadRes.data;
            return url;
          } catch (uploadErr) {
            throw new Error(`Failed to upload image: ${uploadErr.message}`);
          }
        })
      );

      showToast("Images uploaded successfully");

      const newhotel = {
        ...info,
        featured: info.featured ?? false, // Ensure featured defaults to false if not set
        rooms: rooms.length > 0 ? rooms : [],
        photos: list,
      };

      const response = await api.post("/api/hotels", newhotel);

      if (response.data) {
        showToast("Hotel has been created successfully");
        setFiles("");
        setInfo({ featured: false });
        setRooms([]);
        const formElement = e.target.closest("form");
        if (formElement) formElement.reset();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create hotel";
      showToast("error", errorMessage);
      console.error("Hotel creation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <div className="error">Error loading rooms: {error}</div>;
  }

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Add New Hotel</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                files
                  ? URL.createObjectURL(files[0])
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt="Hotel preview"
            />
          </div>
          <div className="right">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  style={{ display: "none" }}
                  accept="image/*"
                  disabled={isLoading}
                />
              </div>

              {hotelInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>
                    {input.label}
                    {input.required && <span style={{ color: "red" }}>*</span>}
                  </label>
                  <input
                    id={input.id}
                    onChange={handleChange}
                    type={input.type}
                    placeholder={input.placeholder}
                    required={input.required}
                    disabled={isLoading}
                  />
                </div>
              ))}
              <div className="formInput">
                <label>Featured</label>
                <select
                  id="featured"
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </select>
              </div>
              <div className="selectRooms">
                <label>Rooms (Optional)</label>
                <select
                  id="rooms"
                  multiple
                  onChange={handleSelect}
                  disabled={isLoading}
                >
                  {loading ? (
                    <option disabled>Loading rooms...</option>
                  ) : data && Array.isArray(data) ? (
                    data.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.title}
                      </option>
                    ))
                  ) : (
                    <option value="">No rooms available</option>
                  )}
                </select>
              </div>
              <button
                onClick={handleClick}
                disabled={isLoading}
                style={{
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "Creating..." : "Create Hotel"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHotel;
