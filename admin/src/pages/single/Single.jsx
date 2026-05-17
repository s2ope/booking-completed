import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useParams, useLocation } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { api } from "../../api/axios";
import { useState, useEffect } from "react";
import { showToast } from "../../helpers/ToastHelper";

const fallbackImage = "https://via.placeholder.com/150";

const getEntityType = (pathname) => {
  if (pathname.includes("hotels")) return "hotels";
  if (pathname.includes("rooms")) return "rooms";
  if (pathname.includes("users")) return "users";
  return "unknown";
};

const splitList = (value = "") =>
  String(value)
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const parseRoomNumbers = (value = "") =>
  splitList(value)
    .map(Number)
    .filter((number) => Number.isFinite(number))
    .map((number) => ({ number }));

const normalizeFormData = (entityType, data = {}) => {
  if (entityType === "hotels") {
    return {
      ...data,
      rooms: (data.rooms || []).map(String),
      photosText: (data.photos || []).join("\n"),
    };
  }

  if (entityType === "rooms") {
    return {
      ...data,
      hotelId: data.hotelId ? String(data.hotelId) : "",
      roomNumbersText: (data.roomNumbers || [])
        .map((roomNumber) => roomNumber.number)
        .join(", "),
    };
  }

  if (entityType === "users") {
    return {
      ...data,
      password: "",
      isAdmin: Boolean(data.isAdmin),
    };
  }

  return { ...data };
};

const getImageSrc = (entityType, data = {}) => {
  if (entityType === "users") return data.img || fallbackImage;
  if (entityType === "hotels") return data.photos?.[0] || fallbackImage;
  return fallbackImage;
};

const formatValue = (value) => {
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not set";
  return value || "Not set";
};

const Single = () => {
  const params = useParams();
  const id = params.id || params.productId;
  const location = useLocation();
  const entityType = getEntityType(location.pathname);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateError, setUpdateError] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const { data, loading, error, reFetch } = useFetch(`/${entityType}/${id}`);

  useEffect(() => {
    if (data && data._id) {
      setFormData(normalizeFormData(entityType, data));
    }
  }, [data, entityType]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        if (entityType === "rooms") {
          const response = await api.get("/hotels");
          setHotels(response.data || []);
        }

        if (entityType === "hotels") {
          const response = await api.get("/rooms");
          setRooms(response.data || []);
        }
      } catch (err) {
        console.error("Error fetching edit options:", err);
      }
    };

    fetchOptions();
  }, [entityType]);

  const handleEditToggle = () => {
    setIsEditing((current) => !current);
    setFormData(normalizeFormData(entityType, data));
    setUpdateError(null);
  };

  const handleInputChange = (e) => {
    const { name, type, checked, value, selectedOptions, multiple } = e.target;
    const nextValue = multiple
      ? Array.from(selectedOptions, (option) => option.value)
      : type === "checkbox"
        ? checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const buildPayload = () => {
    if (entityType === "users") {
      const payload = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        img: formData.img,
        isAdmin: Boolean(formData.isAdmin),
      };

      if (formData.password?.trim()) payload.password = formData.password;
      return payload;
    }

    if (entityType === "hotels") {
      const payload = {
        name: formData.name,
        type: formData.type,
        city: formData.city,
        address: formData.address,
        distance: formData.distance,
        title: formData.title,
        desc: formData.desc,
        cheapestPrice: Number(formData.cheapestPrice),
        featured: Boolean(formData.featured),
        photos: splitList(formData.photosText),
        rooms: formData.rooms || [],
      };

      if (formData.rating !== undefined && formData.rating !== "") {
        payload.rating = Number(formData.rating);
      }

      return payload;
    }

    if (entityType === "rooms") {
      return {
        title: formData.title,
        desc: formData.desc,
        price: Number(formData.price),
        maxPeople: Number(formData.maxPeople),
        roomNumbers: parseRoomNumbers(formData.roomNumbersText),
        hotelId: formData.hotelId,
      };
    }

    return {};
  };

  const handleSave = async () => {
    try {
      if (
        entityType === "rooms" &&
        !parseRoomNumbers(formData.roomNumbersText).length
      ) {
        const message = "Please enter at least one valid room number";
        setUpdateError(message);
        showToast(message, "error");
        return;
      }

      setIsSaving(true);
      setUpdateError(null);
      const response = await api.put(`/${entityType}/${id}`, buildPayload());

      if (response.data) {
        const freshData = await reFetch();
        setFormData(normalizeFormData(entityType, freshData || response.data));
        setIsEditing(false);
        showToast("Updated successfully");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Error updating data";
      setUpdateError(message);
      showToast(message, "error");
      console.error("Update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderTextField = (label, name, type = "text", asTextarea = false) => (
    <div className="detailItem">
      <span className="itemKey">{label}:</span>
      {isEditing ? (
        asTextarea ? (
          <textarea
            name={name}
            value={formData[name] || ""}
            onChange={handleInputChange}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name] || ""}
            onChange={handleInputChange}
          />
        )
      ) : (
        <span className="itemValue">{formatValue(data[name])}</span>
      )}
    </div>
  );

  const renderCheckboxField = (label, name) => (
    <div className="detailItem">
      <span className="itemKey">{label}:</span>
      {isEditing ? (
        <input
          type="checkbox"
          name={name}
          checked={Boolean(formData[name])}
          onChange={handleInputChange}
        />
      ) : (
        <span className="itemValue">{formatValue(Boolean(data[name]))}</span>
      )}
    </div>
  );

  const renderUserFields = () => (
    <>
      {renderTextField("Image URL", "img")}
      {renderTextField("Email", "email", "email")}
      {renderTextField("Username", "username")}
      {isEditing && renderTextField("New Password", "password", "password")}
      {renderTextField("Phone", "phone", "tel")}
      {renderTextField("Country", "country")}
      {renderTextField("City", "city")}
      {renderCheckboxField("Admin Access", "isAdmin")}
    </>
  );

  const getAssignedRoomNames = () => {
    if (!data.rooms?.length) return "No rooms assigned";
    return data.rooms
      .map((roomId) => {
        const room = rooms.find((item) => String(item._id) === String(roomId));
        return room ? `${room.title} (${room._id})` : roomId;
      })
      .join(", ");
  };

  const renderHotelFields = () => (
    <>
      {renderTextField("Name", "name")}
      {renderTextField("Type", "type")}
      {renderTextField("City", "city")}
      {renderTextField("Address", "address")}
      {renderTextField("Distance from Center", "distance")}
      {renderTextField("Title", "title")}
      {renderTextField("Description", "desc", "text", true)}
      {renderTextField("Cheapest Price", "cheapestPrice", "number")}
      {renderTextField("Rating", "rating", "number")}
      {renderCheckboxField("Featured", "featured")}
      <div className="detailItem">
        <span className="itemKey">Photos:</span>
        {isEditing ? (
          <textarea
            name="photosText"
            value={formData.photosText || ""}
            placeholder="One image URL per line"
            onChange={handleInputChange}
          />
        ) : (
          <span className="itemValue">{formatValue(data.photos)}</span>
        )}
      </div>
      <div className="detailItem">
        <span className="itemKey">Rooms:</span>
        {isEditing ? (
          <select
            name="rooms"
            multiple
            value={formData.rooms || []}
            onChange={handleInputChange}
          >
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.title}
              </option>
            ))}
          </select>
        ) : (
          <span className="itemValue">{getAssignedRoomNames()}</span>
        )}
      </div>
    </>
  );

  const getHotelName = () => {
    if (data.hotel?.name) return data.hotel.name;
    const hotel = hotels.find((item) => String(item._id) === String(data.hotelId));
    return hotel?.name || "Not assigned";
  };

  const renderRoomFields = () => (
    <>
      {renderTextField("Title", "title")}
      {renderTextField("Description", "desc", "text", true)}
      {renderTextField("Price", "price", "number")}
      {renderTextField("Max People", "maxPeople", "number")}
      <div className="detailItem">
        <span className="itemKey">Room Numbers:</span>
        {isEditing ? (
          <textarea
            name="roomNumbersText"
            value={formData.roomNumbersText || ""}
            placeholder="Enter room numbers separated by commas or lines"
            onChange={handleInputChange}
          />
        ) : (
          <span className="itemValue">
            {formatValue(data.roomNumbers?.map((roomNumber) => roomNumber.number))}
          </span>
        )}
      </div>
      <div className="detailItem">
        <span className="itemKey">Hotel:</span>
        {isEditing ? (
          <select
            name="hotelId"
            value={formData.hotelId || ""}
            onChange={handleInputChange}
          >
            <option value="">Select a hotel</option>
            {hotels.map((hotel) => (
              <option key={hotel._id} value={hotel._id}>
                {hotel.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="itemValue">{getHotelName()}</span>
        )}
      </div>
    </>
  );

  const renderFields = () => {
    if (entityType === "users") return renderUserFields();
    if (entityType === "hotels") return renderHotelFields();
    if (entityType === "rooms") return renderRoomFields();
    return <div>Unknown entity type</div>;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">Error fetching data</div>;

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="top">
          <div className="left">
            {isEditing ? (
              <button
                className="saveButton"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            ) : (
              <button className="editButton" onClick={handleEditToggle}>
                Edit
              </button>
            )}
            <h1 className="title">Information</h1>
            <div className="item">
              <img
                src={getImageSrc(entityType, data)}
                alt=""
                className="itemImg"
              />
              <div className="details">{renderFields()}</div>
            </div>
            {updateError && <div className="error-message">{updateError}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Single;
