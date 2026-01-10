import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useParams, useLocation } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { api } from "../../api/axios";
import { useState, useEffect } from "react";

const Single = () => {
  const { id } = useParams();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateError, setUpdateError] = useState(null);
  const [hotels, setHotels] = useState([]);

  const entityType = location.pathname.includes("hotels")
    ? "hotels"
    : location.pathname.includes("rooms")
    ? "rooms"
    : location.pathname.includes("users")
    ? "users"
    : "unknown";

  const { data, loading, error, reFetch } = useFetch(`/${entityType}/${id}`);

  // Fetch hotels list for room creation/editing
  useEffect(() => {
    if (entityType === "rooms") {
      const fetchHotels = async () => {
        try {
          const response = await api.get("/api/hotels");
          setHotels(response.data);
        } catch (err) {
          console.error("Error fetching hotels:", err);
        }
      };
      fetchHotels();
    }
  }, [entityType]);

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    }
  }, [data]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setFormData({ ...data });
    setUpdateError(null);
  };

  const handleInputChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setUpdateError(null);
      // Use the route parameter id directly
      // FIX: Need to work on this (id giving undefined)
      const response = await api.put(`/api/${entityType}/${id}`, {
        ...formData,
        // Exclude _id from the request body to avoid MongoDB confusion
        _id: undefined,
      });

      if (response.data) {
        setIsEditing(false);
        reFetch();
      }
    } catch (err) {
      setUpdateError(err.response?.data?.message || "Error updating data");
      console.error("Update error:", err);
    }
  };

  const renderFields = () => {
    switch (entityType) {
      case "users":
        return (
          <>
            <div className="detailItem">
              <span className="itemKey">Image URL:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="image"
                  value={formData.image || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.image}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Email:</span>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.email}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Username:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.username}</span>
              )}
            </div>
            {isEditing && (
              <div className="detailItem">
                <span className="itemKey">Password:</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ""}
                  onChange={handleInputChange}
                />
              </div>
            )}
            <div className="detailItem">
              <span className="itemKey">Phone:</span>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.phone}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Country:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="country"
                  value={formData.country || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.country}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">City:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.city}</span>
              )}
            </div>
          </>
        );

      case "hotels":
        return (
          <>
            <div className="detailItem">
              <span className="itemKey">Image URL:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="image"
                  value={formData.image || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.image}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Name:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.name}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Type:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="type"
                  value={formData.type || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.type}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">City:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.city}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Address:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.address}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Distance from Center:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="distance"
                  value={formData.distance || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.distance}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Title:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.title}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Description:</span>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.description}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Price:</span>
              {isEditing ? (
                <input
                  type="number"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.price}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Featured:</span>
              {isEditing ? (
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured || false}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">
                  {data.featured ? "Yes" : "No"}
                </span>
              )}
            </div>
          </>
        );

      case "rooms":
        return (
          <>
            <div className="detailItem">
              <span className="itemKey">Title:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.title}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Description:</span>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.description}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Price:</span>
              {isEditing ? (
                <input
                  type="number"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.price}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Max People:</span>
              {isEditing ? (
                <input
                  type="number"
                  name="maxPeople"
                  value={formData.maxPeople || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.maxPeople}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Room Numbers:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="rooms"
                  value={formData.rooms || ""}
                  placeholder="Comma-separated room numbers"
                  onChange={handleInputChange}
                />
              ) : (
                <span className="itemValue">{data.rooms?.join(", ")}</span>
              )}
            </div>
            <div className="detailItem">
              <span className="itemKey">Hotel:</span>
              {isEditing ? (
                <select
                  name="hotel"
                  value={formData.hotel || ""}
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
                <span className="itemValue">{data.hotel?.name}</span>
              )}
            </div>
          </>
        );

      default:
        return <div>Unknown entity type</div>;
    }
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
              <button className="saveButton" onClick={handleSave}>
                Save
              </button>
            ) : (
              <button className="editButton" onClick={handleEditToggle}>
                Edit
              </button>
            )}
            <h1 className="title">Information</h1>
            <div className="item">
              <img
                src={data.image || "https://via.placeholder.com/150"}
                alt="profile"
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
